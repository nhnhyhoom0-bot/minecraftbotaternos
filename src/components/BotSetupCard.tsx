import React, { useState } from 'react';
import {
  Activity,
  Bot,
  CheckCircle2,
  ChevronDown,
  Coffee,
  Globe,
  HelpCircle,
  Loader2,
  Play,
  RotateCw,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wifi,
  XCircle,
} from 'lucide-react';
import { MinecraftEdition, ServerPingResult, StartBotPayload } from '../types';

interface BotSetupCardProps {
  isLoading: boolean;
  onStartBot: (payload: StartBotPayload) => Promise<void>;
  onPingServer: (edition: MinecraftEdition, address: string, port?: number) => Promise<ServerPingResult>;
}

const RANDOM_NAMES = [
  'Aternos_AFK_Bot',
  'Server_Keeper',
  'Bot_24Seven',
  'StayOnline_Bot',
  'Mine_Worker',
  'Guard_Bot',
  'AternosHero',
  'CraftMaster_Bot',
];

export function BotSetupCard({ isLoading, onStartBot, onPingServer }: BotSetupCardProps) {
  const [edition, setEdition] = useState<MinecraftEdition>('java');
  const [serverAddress, setServerAddress] = useState('mc-test.aternos.me');
  const [customPort, setCustomPort] = useState('');
  const [botName, setBotName] = useState('Aternos_Bot_24');
  const [antiAfk, setAntiAfk] = useState(true);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [version, setVersion] = useState('auto');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Ping state
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<ServerPingResult | null>(null);

  const handleRandomName = () => {
    const random = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const suffix = Math.floor(100 + Math.random() * 900);
    setBotName(`${random}_${suffix}`);
  };

  const handlePing = async () => {
    if (!serverAddress.trim()) return;
    setIsPinging(true);
    setPingResult(null);
    try {
      const portNum = customPort ? parseInt(customPort, 10) : undefined;
      const res = await onPingServer(edition, serverAddress.trim(), portNum);
      setPingResult(res);
    } catch {
      setPingResult({
        online: false,
        edition,
        host: serverAddress,
        port: edition === 'java' ? 25565 : 19132,
        error: 'فشل فحص الخادم، تأكد من الاتصال بالإنترنت',
      });
    } finally {
      setIsPinging(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverAddress.trim() || !botName.trim()) return;

    let targetPort: number | undefined;
    if (customPort.trim()) {
      targetPort = parseInt(customPort.trim(), 10);
    }

    await onStartBot({
      edition,
      serverAddress: serverAddress.trim(),
      port: targetPort,
      botName: botName.trim(),
      version: version === 'auto' ? undefined : version,
      antiAfk,
      autoReconnect,
    });
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/90 rounded-2xl p-5 sm:p-7 shadow-xl shadow-black/40">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Edition Selection */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                1
              </span>
              اختر نوع سيرفر ماين كرافت:
            </label>
            <span className="text-xs text-zinc-400">
              {edition === 'java' ? 'إصدار الكمبيوتر PC' : 'إصدار الجوال والويندوز Bedrock'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Java Button */}
            <button
              type="button"
              onClick={() => {
                setEdition('java');
                setPingResult(null);
              }}
              className={`flex items-start gap-3.5 p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                edition === 'java'
                  ? 'bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/40'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950/90'
              }`}
            >
              <div
                className={`p-2.5 rounded-lg shrink-0 ${
                  edition === 'java'
                    ? 'bg-emerald-500 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                <Coffee className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-zinc-100">سيرفر جافا (Java Edition)</span>
                  {edition === 'java' && (
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                      محدد
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  للكمبيوتر (PC) - يدعم جميع إصدارات ماين كرافت ومودات وبلجنات اتيرنوس.
                </p>
                <span className="inline-block mt-2 font-mono text-[11px] text-zinc-500">
                  البورت الافتراضي: 25565
                </span>
              </div>
            </button>

            {/* Bedrock Button */}
            <button
              type="button"
              onClick={() => {
                setEdition('bedrock');
                setPingResult(null);
              }}
              className={`flex items-start gap-3.5 p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                edition === 'bedrock'
                  ? 'bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/40'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950/90'
              }`}
            >
              <div
                className={`p-2.5 rounded-lg shrink-0 ${
                  edition === 'bedrock'
                    ? 'bg-emerald-500 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-zinc-100">سيرفر بيدروك (Bedrock / PE)</span>
                  {edition === 'bedrock' && (
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                      محدد
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  للجوال Pocket Edition، كونسول، وويندوز 10/11 مع بروتوكول RakNet.
                </p>
                <span className="inline-block mt-2 font-mono text-[11px] text-zinc-500">
                  البورت الافتراضي: 19132
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Server IP & Address */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                2
              </span>
              عنوان وخادم اتيرنوس (Server IP / Address):
            </label>
            <span className="text-xs text-zinc-400">مثال: yourname.aternos.me:12345</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-8 relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-500">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={serverAddress}
                onChange={(e) => {
                  setServerAddress(e.target.value);
                  setPingResult(null);
                }}
                placeholder="مثال: myserver.aternos.me:34123"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-10 pl-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-colors"
                dir="ltr"
              />
            </div>

            <div className="sm:col-span-4 flex gap-2">
              <input
                type="number"
                value={customPort}
                onChange={(e) => {
                  setCustomPort(e.target.value);
                  setPingResult(null);
                }}
                placeholder={edition === 'java' ? 'بورت (25565)' : 'بورت (19132)'}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono text-center transition-colors"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handlePing}
                disabled={isPinging || !serverAddress.trim()}
                title="فحص هل السيرفر شغال في اتيرنوس"
                className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium flex items-center justify-center gap-1.5 shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isPinging ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                ) : (
                  <Wifi className="w-4 h-4 text-emerald-400" />
                )}
                <span className="hidden md:inline">فحص Ping</span>
              </button>
            </div>
          </div>

          {/* Ping Result Feedback */}
          {pingResult && (
            <div
              className={`mt-2.5 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                pingResult.online
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              {pingResult.online ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                {pingResult.online ? (
                  <div>
                    <div className="font-semibold text-emerald-300 flex items-center gap-2">
                      <span>السيرفر شغال ومتصل (Online)!</span>
                      <span className="text-[11px] font-mono px-1.5 py-0.2 bg-emerald-500/20 rounded text-emerald-300">
                        {pingResult.latency}ms
                      </span>
                    </div>
                    <div className="text-zinc-300 text-[11px] mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      {pingResult.version && <span>الإصدار: {pingResult.version}</span>}
                      {pingResult.playersOnline !== undefined && (
                        <span>اللاعبين: {pingResult.playersOnline} / {pingResult.playersMax ?? 20}</span>
                      )}
                      {pingResult.motd && <span className="text-zinc-400 line-clamp-1">{pingResult.motd}</span>}
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="font-semibold text-rose-300">السيرفر غير متاح أو متوقف حالياً:</span>
                    <p className="text-[11px] text-zinc-300 mt-0.5">
                      {pingResult.error || 'تأكد من تشغيل السيرفر في موقع aternos.org والتحقق من الآيبي والبورت.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Bot Name */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                3
              </span>
              اسم البوت في السيرفر (Bot Username):
            </label>
            <button
              type="button"
              onClick={handleRandomName}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCw className="w-3 h-3" />
              <span>اسم عشوائي</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-zinc-500">
              <Bot className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="مثال: Bot_Aternos_24"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-10 pl-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium transition-colors"
              dir="ltr"
            />
          </div>
          <p className="text-[11px] text-zinc-500 mt-1.5">
            الاسم الذي سيظهر للاعبين في قائمة التاب وشات اللعبة.
          </p>
        </div>

        {/* Step 4: Minecraft Version Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                4
              </span>
              إصدار اللعبة (Minecraft Version):
            </label>
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              يدعم 26.2 تلقائياً
            </span>
          </div>

          <div className="relative">
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium transition-colors cursor-pointer appearance-none"
            >
              <option value="auto">⚡ كشف تلقائي (Auto Detect - مستحسن لجميع السيرفرات)</option>
              {edition === 'java' ? (
                <>
                  <option value="26.2">Minecraft 26.2 (Spigot / Paper 26.2 الأحدث)</option>
                  <option value="1.21.4">Minecraft 1.21.4</option>
                  <option value="1.21.1">Minecraft 1.21.1 / 1.21</option>
                  <option value="1.20.4">Minecraft 1.20.4</option>
                  <option value="1.20.1">Minecraft 1.20.1</option>
                  <option value="1.19.4">Minecraft 1.19.4</option>
                  <option value="1.18.2">Minecraft 1.18.2</option>
                  <option value="1.16.5">Minecraft 1.16.5</option>
                  <option value="1.12.2">Minecraft 1.12.2</option>
                </>
              ) : (
                <>
                  <option value="auto">Bedrock تلقائي (يدعم حتى 1.26+)</option>
                </>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3.5 text-zinc-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1.5">
            الوضع التلقائي يكتشف إصدار سيرفر اتيرنوس فورياً ويقوم بالمطابقة والاتصال دون الحاجة لتحديده يدوياً.
          </p>
        </div>

        {/* Anti-AFK & Automation Features */}
        <div className="pt-2 border-t border-zinc-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Anti AFK Toggle */}
            <div
              onClick={() => setAntiAfk(!antiAfk)}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                antiAfk ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-zinc-950/40 border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    antiAfk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">مانع الطرد والتوقف (Anti-AFK)</div>
                  <div className="text-[11px] text-zinc-400">حركات خفيفة لمنع إغلاق سيرفر اتيرنوس</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={antiAfk}
                onChange={() => {}}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Auto Reconnect Toggle */}
            <div
              onClick={() => setAutoReconnect(!autoReconnect)}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                autoReconnect ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-zinc-950/40 border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    autoReconnect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <RotateCw className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">إعادة الاتصال التلقائي</div>
                  <div className="text-[11px] text-zinc-400">إعادة الدخول عند انقطاع السيرفر مؤقتاً</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoReconnect}
                onChange={() => {}}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Big Start Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !serverAddress.trim() || !botName.trim()}
            className="w-full group relative overflow-hidden flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-950/60 border border-emerald-400/30 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>جاري إرسال البوت والاتصال بالسيرفر...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white text-white transition-transform group-hover:scale-110" />
                <span>تشغيل البوت ودخول السيرفر</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-zinc-500 mt-2 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>يعمل بنظام Offline المباشر المتوافق مع خيار Cracked بسيرفرات Aternos</span>
          </p>
        </div>
      </form>
    </div>
  );
}
