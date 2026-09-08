import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  CornerDownLeft,
  Info,
  KeyRound,
  MessageSquare,
  Send,
  Sparkles,
  Terminal,
  Trash2,
  Volume2,
} from 'lucide-react';
import { BotLogEntry } from '../types';

interface LiveConsoleChatProps {
  logs: BotLogEntry[];
  isOnline: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onClearLogs?: () => void;
}

export function LiveConsoleChat({
  logs,
  isOnline,
  onSendMessage,
}: LiveConsoleChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Scroll ONLY the internal log container, never the window / whole page
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const msg = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);
    try {
      await onSendMessage(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickCommand = async (cmd: string) => {
    if (!isOnline) {
      setInputMessage(cmd);
      return;
    }
    await onSendMessage(cmd);
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[480px]">
      {/* Console Header */}
      <div className="bg-zinc-950 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-200">سجل الأحداث وشات اللعبة (Live Console & Chat)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
            {logs.length} حدث
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] text-zinc-400 flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-3.5 h-3.5 accent-emerald-500 rounded"
            />
            <span>تمرير تلقائي</span>
          </label>
        </div>
      </div>

      {/* Logs Feed */}
      <div
        ref={containerRef}
        className="flex-1 p-3.5 overflow-y-auto font-mono text-xs space-y-1.5 bg-zinc-950/60 selection:bg-emerald-500/30"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center text-xs">
            <Terminal className="w-8 h-8 text-zinc-600 mb-2 opacity-50" />
            <p>لا توجد سجلات حالياً.</p>
            <p className="text-[11px] text-zinc-600 mt-1">ابدأ تشغيل البوت لتظهر الأحداث وشات السيرفر هنا.</p>
          </div>
        ) : (
          logs.map((log) => {
            const isChat = log.type === 'chat';
            const isSuccess = log.type === 'success';
            const isWarn = log.type === 'warn';
            const isError = log.type === 'error';

            return (
              <div
                key={log.id}
                className={`flex items-start gap-2 py-0.5 px-1.5 rounded transition-colors ${
                  isChat
                    ? 'bg-blue-950/30 text-sky-200'
                    : isSuccess
                    ? 'bg-emerald-950/30 text-emerald-300'
                    : isWarn
                    ? 'bg-amber-950/30 text-amber-300'
                    : isError
                    ? 'bg-rose-950/40 text-rose-300'
                    : 'text-zinc-300 hover:bg-zinc-900/50'
                }`}
              >
                {/* Timestamp */}
                <span className="text-[10px] text-zinc-500 shrink-0 select-none pt-0.5 font-mono">
                  [{log.timestamp}]
                </span>

                {/* Type Icon */}
                <span className="shrink-0 pt-0.5">
                  {isChat && <MessageSquare className="w-3 h-3 text-sky-400" />}
                  {isSuccess && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                  {isWarn && <AlertCircle className="w-3 h-3 text-amber-400" />}
                  {isError && <AlertCircle className="w-3 h-3 text-rose-400" />}
                  {!isChat && !isSuccess && !isWarn && !isError && (
                    <Info className="w-3 h-3 text-zinc-500" />
                  )}
                </span>

                {/* Content */}
                <div className="flex-1 break-all leading-relaxed">
                  {log.sender && (
                    <span className="font-bold text-emerald-400 ml-1.5">
                      &lt;{log.sender}&gt;
                    </span>
                  )}
                  <span>{log.text}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Action Commands for Aternos Auth */}
      <div className="bg-zinc-950 px-3.5 py-2 border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[11px] text-zinc-500 shrink-0 flex items-center gap-1">
          <KeyRound className="w-3 h-3 text-amber-400" />
          أوامر سريعة:
        </span>

        <button
          type="button"
          onClick={() => handleQuickCommand('/register 123456 123456')}
          className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-mono border border-zinc-800 hover:border-zinc-700 whitespace-nowrap transition-colors cursor-pointer"
          title="تسجيل حساب للبوت في سيرفرات اتيرنوس التي تستخدم بلجن الحماية"
        >
          /register 123456
        </button>

        <button
          type="button"
          onClick={() => handleQuickCommand('/login 123456')}
          className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-mono border border-zinc-800 hover:border-zinc-700 whitespace-nowrap transition-colors cursor-pointer"
          title="تسجيل دخول البوت"
        >
          /login 123456
        </button>

        <button
          type="button"
          onClick={() => handleQuickCommand('/spawn')}
          className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-mono border border-zinc-800 hover:border-zinc-700 whitespace-nowrap transition-colors cursor-pointer"
        >
          /spawn
        </button>

        <button
          type="button"
          onClick={() => handleQuickCommand('/help')}
          className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-mono border border-zinc-800 hover:border-zinc-700 whitespace-nowrap transition-colors cursor-pointer"
        >
          /help
        </button>
      </div>

      {/* Input Message & Command Form */}
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-2.5 border-t border-zinc-800 flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            isOnline
              ? 'اكتب رسالة لشات اللعبة أو أمر سيرفر يبدأ بـ / (مثل /login)'
              : 'شغل البوت لتتمكن من إرسال رسائل أو أوامر بالسيرفر'
          }
          disabled={!isOnline || isSending}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!isOnline || !inputMessage.trim() || isSending}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>إرسال</span>
        </button>
      </form>
    </div>
  );
}
