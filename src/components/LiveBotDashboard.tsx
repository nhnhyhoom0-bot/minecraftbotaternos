import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bot,
  CheckCircle2,
  Clock,
  Compass,
  Hand,
  Heart,
  Loader2,
  Power,
  RotateCcw,
  Sparkles,
  User,
  Users,
  Utensils,
  Wifi,
} from 'lucide-react';
import { BotState } from '../types';

interface LiveBotDashboardProps {
  state: BotState;
  onStopBot: () => Promise<void>;
  onTriggerAction: (action: 'jump' | 'swing' | 'sneak' | 'toggleAntiAfk') => Promise<void>;
}

export function LiveBotDashboard({ state, onStopBot, onTriggerAction }: LiveBotDashboardProps) {
  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}س ${mins % 60}د ${secs < 10 ? '0' : ''}${secs}ث`;
    }
    return `${mins}د ${secs < 10 ? '0' : ''}${secs}ث`;
  };

  const isOnline = state.status === 'online';
  const isConnecting = state.status === 'connecting';

  return (
    <div className="space-y-4">
      {/* Status Header Banner */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 transition-all ${
          isOnline
            ? 'bg-emerald-950/20 border-emerald-500/40'
            : isConnecting
            ? 'bg-amber-950/20 border-amber-500/40'
            : 'bg-zinc-900/80 border-zinc-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                isOnline
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/20'
                  : isConnecting
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 animate-pulse'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              {isConnecting ? (
                <Loader2 className="w-6 h-6 animate-spin text-zinc-950" />
              ) : (
                <Bot className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>{state.botName}</span>
                </h3>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                    isOnline
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : isConnecting
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {isOnline ? 'متصل داخل السيرفر' : isConnecting ? 'جاري الاتصال بالسيرفر...' : state.status}
                </span>

                <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                  {state.edition === 'java' ? 'Java Edition' : 'Bedrock PE'}
                </span>
              </div>

              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                <span className="font-mono text-zinc-300">{state.host}:{state.port}</span>
                <span>•</span>
                <span className="text-zinc-400">{state.statusMessage}</span>
              </p>
            </div>
          </div>

          {/* Stop / Disconnect Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStopBot()}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Power className="w-3.5 h-3.5" />
              <span>إيقاف البوت ومغادرة السيرفر</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vital In-Game Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Health */}
        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>صحة البوت (HP)</span>
            </span>
            <span className="font-mono text-zinc-200 font-bold">{state.health} / 20</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-600 to-rose-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (state.health / 20) * 100)}%` }}
            />
          </div>
        </div>

        {/* Food / Hunger */}
        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5 text-amber-500" />
              <span>شريط الجوع</span>
            </span>
            <span className="font-mono text-zinc-200 font-bold">{state.food} / 20</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (state.food / 20) * 100)}%` }}
            />
          </div>
        </div>

        {/* Coordinates */}
        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>إحداثيات العالم</span>
            </span>
          </div>
          <div className="font-mono text-xs text-zinc-200 truncate" dir="ltr">
            {state.position ? (
              <span>
                X: {Math.round(state.position.x)}, Y: {Math.round(state.position.y)}, Z: {Math.round(state.position.z)}
              </span>
            ) : (
              <span className="text-zinc-500">جاري التحديد...</span>
            )}
          </div>
        </div>

        {/* Uptime */}
        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>مدة البقاء أونلاين</span>
            </span>
          </div>
          <div className="font-mono text-xs text-emerald-300 font-bold">
            {formatUptime(state.uptimeSeconds)}
          </div>
        </div>
      </div>

      {/* Interactive Controls & Anti-AFK Bar */}
      <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>التحكم المباشر وحركات البوت:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTriggerAction('toggleAntiAfk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                state.antiAfk
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>مانع الطرد (Anti-AFK): {state.antiAfk ? 'مفعل' : 'معطل'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => onTriggerAction('jump')}
            disabled={!isOnline}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>قفز (Jump)</span>
          </button>

          <button
            onClick={() => onTriggerAction('swing')}
            disabled={!isOnline}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Hand className="w-3.5 h-3.5 text-amber-400" />
            <span>تحريك اليد (Swing)</span>
          </button>

          <button
            onClick={() => onTriggerAction('sneak')}
            disabled={!isOnline}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5 text-teal-400" />
            <span>انحناء (Sneak)</span>
          </button>
        </div>
      </div>

      {/* Online Players List */}
      {state.players && state.players.length > 0 && (
        <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 text-xs">
          <div className="text-zinc-400 flex items-center gap-1.5 mb-2 font-medium">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>اللاعبين المتواجدين بالسيرفر ({state.players.length}):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {state.players.map((player) => (
              <span
                key={player}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-mono flex items-center gap-1 ${
                  player === state.botName
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                    : 'bg-zinc-800/80 text-zinc-300 border-zinc-700'
                }`}
              >
                <User className="w-3 h-3 text-zinc-400" />
                {player}
                {player === state.botName && ' (البوت)'}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
