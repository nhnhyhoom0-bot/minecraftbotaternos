export type MinecraftEdition = 'java' | 'bedrock';

export type BotConnectionStatus = 'offline' | 'connecting' | 'online' | 'kicked' | 'error';

export interface BotLogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'chat' | 'warn' | 'error' | 'success';
  sender?: string;
  text: string;
}

export interface BotPosition {
  x: number;
  y: number;
  z: number;
  yaw?: number;
  pitch?: number;
}

export interface BotState {
  isRunning: boolean;
  status: BotConnectionStatus;
  statusMessage?: string;
  edition: MinecraftEdition;
  host: string;
  port: number;
  botName: string;
  version?: string;
  antiAfk: boolean;
  autoReconnect: boolean;
  health: number; // 0-20
  food: number; // 0-20
  ping: number;
  position: BotPosition | null;
  players: string[];
  uptimeSeconds: number;
  connectedAt: string | null;
  logs: BotLogEntry[];
}

export interface ServerPingResult {
  online: boolean;
  edition: MinecraftEdition;
  host: string;
  port: number;
  latency?: number;
  version?: string;
  motd?: string;
  playersOnline?: number;
  playersMax?: number;
  error?: string;
}

export interface StartBotPayload {
  edition: MinecraftEdition;
  serverAddress: string; // can be "myhost.aternos.me:12345" or "myhost.aternos.me"
  port?: number;
  botName: string;
  version?: string;
  antiAfk?: boolean;
  autoReconnect?: boolean;
}
