import { Bot, Radio, Server, Sparkles } from 'lucide-react';
import { BotConnectionStatus } from '../types';

interface HeaderProps {
  status: BotConnectionStatus;
  botName?: string;
  serverAddress?: string;
  uptimeSeconds?: number;
  onOpenGuide: () => void;
}

export function Header({
  status,
  botName,
  serverAddress,
  uptimeSeconds = 0,
  onOpenGuide,
}: HeaderProps) {
  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}س ${mins % 60}د ${secs}ث`;
    }
    return `${mins}د ${secs}ث`;
  };

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              {status === 'online' && (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-zinc-950"></span>
                </>
              )}
              {status === 'connecting' && (
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border-2 border-zinc-950 animate-pulse"></span>
              )}
              {status === 'offline' && (
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-zinc-600 border-2 border-zinc-950"></span>
              )}
              {status === 'kicked' || status === 'error' ? (
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-zinc-950"></span>
              ) : null}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                بوت ماين كرافت اتيرنوس
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-normal">
                  Aternos 24/7
                </span>
              </h1>
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span>دخول حقيقي لسيرفرات الجافا والبيدروك مع مانع الطرد AFK</span>
            </p>
          </div>
        </div>

        {/* Live Status Indicators & Guide button */}
        <div className="flex items-center gap-3">
          {status === 'online' && (
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-emerald-500/30 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                متصل: <span className="text-white font-semibold">{botName}</span>
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400 font-mono text-[11px]">{serverAddress}</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-300 font-mono text-[11px]">{formatUptime(uptimeSeconds)}</span>
            </div>
          )}

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs transition-colors cursor-pointer"
            title="طريقة تشغيل وضبط سيرفر اتيرنوس"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>دليل اتيرنوس</span>
          </button>
        </div>
      </div>
    </header>
  );
}
