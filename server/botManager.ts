import './patches.js';
import mineflayer, { Bot } from 'mineflayer';
import bedrock from 'bedrock-protocol';
import net from 'net';
import {
  BotConnectionStatus,
  BotLogEntry,
  BotState,
  MinecraftEdition,
  ServerPingResult,
  StartBotPayload,
} from '../src/types.js';

class MinecraftBotManager {
  private javaBot: Bot | null = null;
  private bedrockClient: any = null;
  private antiAfkTimer: NodeJS.Timeout | null = null;
  private uptimeTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  private currentConfig: StartBotPayload | null = null;
  private state: BotState = {
    isRunning: false,
    status: 'offline',
    statusMessage: 'البوت متوقف حالياً',
    edition: 'java',
    host: '',
    port: 25565,
    botName: '',
    version: 'auto',
    antiAfk: true,
    autoReconnect: true,
    health: 20,
    food: 20,
    ping: 0,
    position: null,
    players: [],
    uptimeSeconds: 0,
    connectedAt: null,
    logs: [],
  };

  private maxLogs = 300;

  constructor() {
    this.addLog('info', 'نظام إدارة بوت اتيرنوس جاهز للعمل');
  }

  public getState(): BotState {
    return {
      ...this.state,
      // clone arrays to prevent mutation issues
      players: [...this.state.players],
      logs: [...this.state.logs],
    };
  }

  private addLog(
    type: BotLogEntry['type'],
    text: string,
    sender?: string
  ) {
    const entry: BotLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('ar-EG', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      type,
      sender,
      text,
    };

    this.state.logs.push(entry);
    if (this.state.logs.length > this.maxLogs) {
      this.state.logs.shift();
    }
  }

  private parseAddress(rawAddress: string, defaultPort: number): { host: string; port: number } {
    const trimmed = rawAddress.trim().replace(/^https?:\/\//i, '');
    if (trimmed.includes(':')) {
      const parts = trimmed.split(':');
      const host = parts[0].trim();
      const portNum = parseInt(parts[1].trim(), 10);
      return {
        host,
        port: isNaN(portNum) ? defaultPort : portNum,
      };
    }
    return {
      host: trimmed,
      port: defaultPort,
    };
  }

  public async start(config: StartBotPayload): Promise<{ success: boolean; message: string }> {
    if (this.state.isRunning) {
      await this.stop();
    }

    const defaultPort = config.edition === 'java' ? 25565 : 19132;
    const { host, port } = this.parseAddress(config.serverAddress, config.port || defaultPort);

    if (!host) {
      return { success: false, message: 'يرجى إدخال عنوان خادم صحيح' };
    }

    const cleanBotName = (config.botName || 'AternosBot').trim().replace(/\s+/g, '_');
    if (!cleanBotName) {
      return { success: false, message: 'يرجى إدخال اسم البوت' };
    }

    this.currentConfig = {
      ...config,
      serverAddress: host,
      port,
      botName: cleanBotName,
      antiAfk: config.antiAfk ?? true,
      autoReconnect: config.autoReconnect ?? true,
    };

    this.state.isRunning = true;
    this.state.status = 'connecting';
    this.state.statusMessage = `جاري الاتصال بسيرفر ${host}:${port} (${config.edition === 'java' ? 'جافا' : 'بيدروك'})...`;
    this.state.edition = config.edition;
    this.state.host = host;
    this.state.port = port;
    this.state.botName = cleanBotName;
    this.state.version = config.version || 'auto';
    this.state.antiAfk = this.currentConfig.antiAfk;
    this.state.autoReconnect = this.currentConfig.autoReconnect;
    this.state.uptimeSeconds = 0;
    this.state.connectedAt = null;
    this.state.players = [];

    this.addLog('info', `بدء تشغيل البوت [${cleanBotName}] للاتصال بـ ${host}:${port} (نظام ${config.edition === 'java' ? 'جافا' : 'بيدروك'})`);

    if (config.edition === 'java') {
      this.initJavaBot(host, port, cleanBotName, config.version);
    } else {
      this.initBedrockBot(host, port, cleanBotName);
    }

    return { success: true, message: 'بدأ الاتصال بالسيرفر' };
  }

  private initJavaBot(host: string, port: number, botName: string, version?: string) {
    try {
      const botOptions: any = {
        host,
        port,
        username: botName,
        auth: 'offline', // Essential for cracked Aternos servers
        hideErrors: false,
        checkTimeoutInterval: 45000,
      };

      if (version && version !== 'auto') {
        botOptions.version = version;
      }

      this.addLog('info', `جاري إرسال حزمة المصافحة (Handshake) للسيرفر...`);
      const bot = mineflayer.createBot(botOptions);
      this.javaBot = bot;

      bot.on('login', () => {
        this.addLog('success', `تم تسجيل الدخول بنجاح! اسم البوت: ${bot.username}`);
        this.state.statusMessage = 'تم تسجيل الدخول، بانتظار التحميل في العالم (Spawning)...';
      });

      bot.on('spawn', () => {
        this.state.status = 'online';
        this.state.statusMessage = 'البوت متصل وداخل السيرفر بنجاح!';
        this.state.connectedAt = new Date().toISOString();
        this.addLog('success', `دخل البوت عالم اللعبة بنجاح! الإحداثيات: X: ${Math.round(bot.entity?.position?.x || 0)}, Y: ${Math.round(bot.entity?.position?.y || 0)}, Z: ${Math.round(bot.entity?.position?.z || 0)}`);

        this.startUptimeTracker();
        if (this.state.antiAfk) {
          this.startAntiAfk();
        }

        // Update player list
        this.updateJavaPlayerList();
      });

      bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        this.addLog('chat', message, username);
      });

      bot.on('messagestr', (message) => {
        if (!message || message.trim().length === 0) return;
        // Avoid duplicate logging if handled by chat
        const trimmed = message.trim();
        if (!trimmed.includes(bot.username) && !trimmed.startsWith('<')) {
          this.addLog('info', trimmed);
        }
      });

      bot.on('health', () => {
        this.state.health = Math.round(bot.health);
        this.state.food = Math.round(bot.food);
      });

      bot.on('move', () => {
        if (bot.entity && bot.entity.position) {
          this.state.position = {
            x: Number(bot.entity.position.x.toFixed(1)),
            y: Number(bot.entity.position.y.toFixed(1)),
            z: Number(bot.entity.position.z.toFixed(1)),
            yaw: Number(bot.entity.yaw?.toFixed(2) || 0),
            pitch: Number(bot.entity.pitch?.toFixed(2) || 0),
          };
        }
      });

      bot.on('playerJoined', (player) => {
        if (player.username && !this.state.players.includes(player.username)) {
          this.state.players.push(player.username);
          this.addLog('info', `دخل اللاعب [${player.username}] إلى السيرفر`);
        }
      });

      bot.on('playerLeft', (player) => {
        if (player.username) {
          this.state.players = this.state.players.filter((p) => p !== player.username);
          this.addLog('info', `غادر اللاعب [${player.username}] السيرفر`);
        }
      });

      bot.on('kicked', (reason) => {
        const reasonText = typeof reason === 'string' ? reason : JSON.stringify(reason);
        this.state.status = 'kicked';
        this.state.statusMessage = `تم طرد البوت من السيرفر: ${reasonText}`;
        this.addLog('warn', `تم طرد البوت من السيرفر: ${reasonText}`);
        this.handleDisconnect();
      });

      bot.on('error', (err) => {
        const errorMsg = err.message || 'حدث خطأ في الاتصال';
        this.state.status = 'error';
        this.state.statusMessage = `خطأ في الاتصال: ${errorMsg}`;
        this.addLog('error', `خطأ: ${errorMsg}`);
        if (errorMsg.includes('ECONNREFUSED')) {
          this.addLog('warn', 'تأكد أن سيرفر اتيرنوس شغال أونلاين وأن رقم البورت صحيح.');
        }
        if (errorMsg.includes('Invalid credentials') || errorMsg.includes('unauthenticated')) {
          this.addLog('warn', 'تأكد من تفعيل خيار (Cracked / مكرك) في إعدادات خادم اتيرنوس!');
        }
      });

      bot.on('end', (reason) => {
        this.addLog('warn', `انقطع الاتصال بالسيرفر (${reason || 'End of stream'})`);
        this.handleDisconnect();
      });

    } catch (err: any) {
      this.state.status = 'error';
      this.state.statusMessage = `فشل تشغيل البوت: ${err.message}`;
      this.addLog('error', `فشل التهيئة: ${err.message}`);
    }
  }

  private updateJavaPlayerList() {
    if (!this.javaBot) return;
    try {
      const players = Object.keys(this.javaBot.players || {});
      this.state.players = players;
    } catch {
      // ignore
    }
  }

  private initBedrockBot(host: string, port: number, botName: string) {
    try {
      this.addLog('info', `جاري إرسال حزم اتصال بيدروك (RakNet UDP) لـ ${host}:${port}...`);

      const client = bedrock.createClient({
        host,
        port,
        username: botName,
        offline: true,
        skipPing: true,
      });

      this.bedrockClient = client;

      client.on('join', () => {
        this.addLog('success', `تم الانضمام لسيرفر البيدروك بنجاح!`);
        this.state.statusMessage = 'تم الانضمام بنجاح، جاري التحميل...';
      });

      client.on('spawn', () => {
        this.state.status = 'online';
        this.state.statusMessage = 'البوت متصل وداخل سيرفر البيدروك!';
        this.state.connectedAt = new Date().toISOString();
        this.addLog('success', `دخل البوت عالم البيدروك بنجاح! [${botName}]`);

        this.startUptimeTracker();
        if (this.state.antiAfk) {
          this.startAntiAfk();
        }
      });

      client.on('text', (packet: any) => {
        const message = packet.message || packet.parameters?.[0] || '';
        const sender = packet.source_name || packet.xuid || 'Server';
        if (message) {
          this.addLog('chat', message, sender);
        }
      });

      client.on('kick', (packet: any) => {
        const reason = packet.message || 'تم الطرد من قبل السيرفر';
        this.state.status = 'kicked';
        this.state.statusMessage = `تم طرد البوت: ${reason}`;
        this.addLog('warn', `تم طرد البوت: ${reason}`);
        this.handleDisconnect();
      });

      client.on('close', () => {
        this.addLog('warn', `أغلق سيرفر البيدروك الاتصال`);
        this.handleDisconnect();
      });

      client.on('error', (err: any) => {
        const errorMsg = err.message || 'خطأ في اتصال البيدروك';
        this.state.status = 'error';
        this.state.statusMessage = `خطأ: ${errorMsg}`;
        this.addLog('error', `خطأ في اتصال بيدروك: ${errorMsg}`);
        this.addLog('info', 'تأكد من كتابة بورت البيدروك المخصص لسيرفرك في اتيرنوس (مثل 19132 أو بورت مخصص).');
      });

    } catch (err: any) {
      this.state.status = 'error';
      this.state.statusMessage = `فشل إنشاء عميل البيدروك: ${err.message}`;
      this.addLog('error', `فشل الاتصال: ${err.message}`);
    }
  }

  private startAntiAfk() {
    this.stopAntiAfk();
    this.addLog('info', 'تم تفعيل نظام منع الطرد (Anti-AFK) التلقائي لتجنب إغلاق سيرفر اتيرنوس');

    let step = 0;
    this.antiAfkTimer = setInterval(() => {
      if (!this.state.isRunning || this.state.status !== 'online') return;

      step = (step + 1) % 4;

      if (this.javaBot && this.javaBot.entity) {
        try {
          if (step === 0) {
            // Slight look change
            const currentYaw = this.javaBot.entity.yaw || 0;
            const currentPitch = this.javaBot.entity.pitch || 0;
            const deltaYaw = (Math.random() - 0.5) * 0.4;
            this.javaBot.look(currentYaw + deltaYaw, currentPitch, true).catch(() => {});
          } else if (step === 1) {
            // Jump
            this.javaBot.setControlState('jump', true);
            setTimeout(() => {
              this.javaBot?.setControlState('jump', false);
            }, 300);
          } else if (step === 2) {
            // Swing arm
            this.javaBot.swingArm('right');
          } else if (step === 3) {
            // Sneak and unsneak
            this.javaBot.setControlState('sneak', true);
            setTimeout(() => {
              this.javaBot?.setControlState('sneak', false);
            }, 400);
          }
        } catch {
          // ignore anti-afk action failure
        }
      } else if (this.bedrockClient) {
        // Bedrock ping / keepalive
        try {
          this.bedrockClient.queue?.('player_action', {
            runtime_entity_id: 1,
            action: 'jump',
            position: { x: 0, y: 0, z: 0 },
            result_position: { x: 0, y: 0, z: 0 },
            face: 0,
          });
        } catch {
          // ignore
        }
      }
    }, 6000);
  }

  private stopAntiAfk() {
    if (this.antiAfkTimer) {
      clearInterval(this.antiAfkTimer);
      this.antiAfkTimer = null;
    }
  }

  private startUptimeTracker() {
    this.stopUptimeTracker();
    this.uptimeTimer = setInterval(() => {
      if (this.state.status === 'online') {
        this.state.uptimeSeconds += 1;
        if (this.javaBot) {
          this.updateJavaPlayerList();
        }
      }
    }, 1000);
  }

  private stopUptimeTracker() {
    if (this.uptimeTimer) {
      clearInterval(this.uptimeTimer);
      this.uptimeTimer = null;
    }
  }

  private handleDisconnect() {
    this.stopAntiAfk();
    this.stopUptimeTracker();

    if (this.javaBot) {
      try {
        this.javaBot.removeAllListeners();
      } catch {}
      this.javaBot = null;
    }

    if (this.bedrockClient) {
      try {
        this.bedrockClient.removeAllListeners();
      } catch {}
      this.bedrockClient = null;
    }

    if (this.state.status !== 'kicked' && this.state.status !== 'error') {
      this.state.status = 'offline';
      this.state.statusMessage = 'تم فصل الاتصال';
    }

    // Auto reconnect if enabled
    if (this.currentConfig && this.state.autoReconnect && this.state.isRunning) {
      this.addLog('info', 'محاولة إعادة الاتصال التلقائي بعد 15 ثانية...');
      this.reconnectTimer = setTimeout(() => {
        if (this.currentConfig && this.state.isRunning) {
          this.addLog('info', 'جاري تنفيذ إعادة الاتصال التلقائي...');
          this.start(this.currentConfig);
        }
      }, 15000);
    } else {
      this.state.isRunning = false;
    }
  }

  public async stop(): Promise<{ success: boolean; message: string }> {
    this.state.isRunning = false;
    this.state.status = 'offline';
    this.state.statusMessage = 'تم إيقاف البوت يدوياً';

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopAntiAfk();
    this.stopUptimeTracker();

    if (this.javaBot) {
      try {
        this.addLog('info', 'جاري قطع اتصال البوت ومغادرة السيرفر...');
        this.javaBot.quit('Disconnected by user');
      } catch {}
      this.javaBot = null;
    }

    if (this.bedrockClient) {
      try {
        this.bedrockClient.disconnect?.();
        this.bedrockClient.close?.();
      } catch {}
      this.bedrockClient = null;
    }

    this.addLog('info', 'تم إيقاف البوت بنجاح');
    return { success: true, message: 'تم إيقاف البوت' };
  }

  public sendChat(message: string): { success: boolean; message: string } {
    const trimmed = message.trim();
    if (!trimmed) {
      return { success: false, message: 'الرسالة فارغة' };
    }

    if (!this.state.isRunning || this.state.status !== 'online') {
      return { success: false, message: 'البوت غير متصل بالسيرفر حالياً' };
    }

    if (this.javaBot) {
      try {
        this.javaBot.chat(trimmed);
        this.addLog('chat', trimmed, this.state.botName + ' (أنت)');
        return { success: true, message: 'تم إرسال الرسالة' };
      } catch (err: any) {
        return { success: false, message: `فشل الإرسال: ${err.message}` };
      }
    }

    if (this.bedrockClient) {
      try {
        this.bedrockClient.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: this.state.botName,
          xuid: '',
          platform_chat_id: '',
          message: trimmed,
        });
        this.addLog('chat', trimmed, this.state.botName + ' (أنت)');
        return { success: true, message: 'تم إرسال الرسالة' };
      } catch (err: any) {
        return { success: false, message: `فشل الإرسال: ${err.message}` };
      }
    }

    return { success: false, message: 'لا يوجد عميل نشط' };
  }

  public triggerAction(action: 'jump' | 'swing' | 'sneak' | 'toggleAntiAfk'): { success: boolean; message: string } {
    if (action === 'toggleAntiAfk') {
      this.state.antiAfk = !this.state.antiAfk;
      if (this.state.antiAfk) {
        this.startAntiAfk();
        return { success: true, message: 'تم تفعيل Anti-AFK' };
      } else {
        this.stopAntiAfk();
        this.addLog('info', 'تم تعطيل Anti-AFK');
        return { success: true, message: 'تم تعطيل Anti-AFK' };
      }
    }

    if (!this.javaBot || this.state.status !== 'online') {
      return { success: false, message: 'البوت غير متصل في العالم حالياً' };
    }

    try {
      if (action === 'jump') {
        this.javaBot.setControlState('jump', true);
        setTimeout(() => this.javaBot?.setControlState('jump', false), 350);
        this.addLog('info', 'قام البوت بالقفز');
        return { success: true, message: 'قفز البوت' };
      }

      if (action === 'swing') {
        this.javaBot.swingArm('right');
        this.addLog('info', 'حرك البوت يده');
        return { success: true, message: 'تم تحريك اليد' };
      }

      if (action === 'sneak') {
        this.javaBot.setControlState('sneak', true);
        setTimeout(() => this.javaBot?.setControlState('sneak', false), 600);
        this.addLog('info', 'قام البوت بالانحناء');
        return { success: true, message: 'انحنى البوت' };
      }
    } catch (err: any) {
      return { success: false, message: err.message };
    }

    return { success: false, message: 'إجراء غير معروف' };
  }

  public async pingServer(edition: MinecraftEdition, address: string, portInput?: number): Promise<ServerPingResult> {
    const defaultPort = edition === 'java' ? 25565 : 19132;
    const { host, port } = this.parseAddress(address, portInput || defaultPort);

    if (edition === 'bedrock') {
      try {
        const startTime = Date.now();
        const pingData: any = await bedrock.ping({ host, port });
        const latency = Date.now() - startTime;
        return {
          online: true,
          edition: 'bedrock',
          host,
          port,
          latency,
          version: pingData.version || pingData.protocolVersion?.toString(),
          motd: pingData.motd || pingData.name,
          playersOnline: pingData.playersOnline,
          playersMax: pingData.playersMax,
        };
      } catch (err: any) {
        return {
          online: false,
          edition: 'bedrock',
          host,
          port,
          error: err.message || 'فشل الاتصال بسيرفر البيدروك',
        };
      }
    }

    // Java Edition Ping via native Node.js TCP socket Handshake packet
    return new Promise((resolve) => {
      const startTime = Date.now();
      const socket = new net.Socket();
      socket.setTimeout(6000);

      let buffer = Buffer.alloc(0);

      socket.connect(port, host, () => {
        const latency = Date.now() - startTime;

        // Construct Minecraft Handshake Packet (Protocol 47 = 1.8+, or 765 for modern)
        const hostBuf = Buffer.from(host, 'utf8');
        const portBuf = Buffer.alloc(2);
        portBuf.writeUInt16BE(port, 0);

        // Handshake packet ID: 0x00, Next state: 1 (status)
        const handshakePacket = Buffer.concat([
          Buffer.from([0x00]), // Packet ID
          encodeVarInt(47),    // Protocol version
          encodeVarInt(hostBuf.length),
          hostBuf,
          portBuf,
          Buffer.from([0x01]), // Next State: Status
        ]);

        const lengthBuf = encodeVarInt(handshakePacket.length);
        socket.write(Buffer.concat([lengthBuf, handshakePacket]));

        // Status Request packet ID: 0x00, empty payload
        socket.write(Buffer.concat([encodeVarInt(1), Buffer.from([0x00])]));
      });

      socket.on('data', (data) => {
        buffer = Buffer.concat([buffer, data]);
        try {
          const parsed = parseJavaPingResponse(buffer);
          if (parsed) {
            socket.destroy();
            resolve({
              online: true,
              edition: 'java',
              host,
              port,
              latency: Date.now() - startTime,
              version: parsed.version?.name,
              motd: typeof parsed.description === 'string' ? parsed.description : parsed.description?.text,
              playersOnline: parsed.players?.online,
              playersMax: parsed.players?.max,
            });
          }
        } catch {
          // waiting for full packet
        }
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          online: false,
          edition: 'java',
          host,
          port,
          error: 'انتهت مهلة الاتصال (تأكد أن السيرفر شغال في اتيرنوس)',
        });
      });

      socket.on('error', (err) => {
        socket.destroy();
        resolve({
          online: false,
          edition: 'java',
          host,
          port,
          error: err.message.includes('ECONNREFUSED')
            ? 'الاتصال مرفوض. السيرفر متوقف في اتيرنوس أو البورت غير صحيح.'
            : err.message,
        });
      });
    });
  }
}

// Helpers for Minecraft protocol varints
function encodeVarInt(val: number): Buffer {
  const bytes: number[] = [];
  let current = val;
  while (true) {
    if ((current & ~0x7f) === 0) {
      bytes.push(current);
      break;
    }
    bytes.push((current & 0x7f) | 0x80);
    current >>>= 7;
  }
  return Buffer.from(bytes);
}

function parseJavaPingResponse(buffer: Buffer): any {
  if (buffer.length < 5) return null;
  let offset = 0;

  // Read packet length varint
  const { value: packetLen, bytesRead: lenBytes } = readVarInt(buffer, offset);
  offset += lenBytes;

  if (buffer.length < offset + 1) return null;
  // Read packet id
  const { value: packetId, bytesRead: idBytes } = readVarInt(buffer, offset);
  offset += idBytes;

  if (packetId !== 0x00) return null;

  // Read string length
  const { value: strLen, bytesRead: strLenBytes } = readVarInt(buffer, offset);
  offset += strLenBytes;

  if (buffer.length < offset + strLen) return null;
  const jsonString = buffer.toString('utf8', offset, offset + strLen);
  return JSON.parse(jsonString);
}

function readVarInt(buffer: Buffer, startOffset = 0): { value: number; bytesRead: number } {
  let numRead = 0;
  let result = 0;
  let read: number;
  do {
    if (startOffset + numRead >= buffer.length) {
      throw new Error('Buffer underflow');
    }
    read = buffer[startOffset + numRead];
    const value = read & 0x7f;
    result |= value << (7 * numRead);
    numRead++;
    if (numRead > 5) {
      throw new Error('VarInt is too big');
    }
  } while ((read & 0x80) !== 0);

  return { value: result, bytesRead: numRead };
}

export const botManager = new MinecraftBotManager();
