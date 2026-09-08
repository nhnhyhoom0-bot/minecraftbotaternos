import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Bot,
  Coffee,
  ExternalLink,
  Info,
  Radio,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wifi,
  X,
} from 'lucide-react';
import { AternosGuideModal } from './components/AternosGuideModal';
import { BotSetupCard } from './components/BotSetupCard';
import { Header } from './components/Header';
import { LiveBotDashboard } from './components/LiveBotDashboard';
import { LiveConsoleChat } from './components/LiveConsoleChat';
import { BotState, MinecraftEdition, ServerPingResult, StartBotPayload } from './types';

export default function App() {
  const [botState, setBotState] = useState<BotState>({
    isRunning: false,
    status: 'offline',
    statusMessage: 'البوت غير متصل حالياً',
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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  };

  // Poll Bot State from server
  const fetchBotState = useCallback(async () => {
    try {
      const res = await fetch('/api/bot/status');
      if (res.ok) {
        const data: BotState = await res.json();
        setBotState(data);
      }
    } catch {
      // Backend polling error silently caught
    }
  }, []);

  useEffect(() => {
    fetchBotState();
    // Poll faster when connecting or online
    const intervalTime = botState.isRunning ? 1500 : 4000;
    const interval = setInterval(fetchBotState, intervalTime);
    return () => clearInterval(interval);
  }, [fetchBotState, botState.isRunning]);

  // Actions
  const handleStartBot = async (payload: StartBotPayload) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        showNotification('success', `تم إرسال طلب تشغيل البوت [${payload.botName}]`);
        await fetchBotState();
      } else {
        showNotification('error', result.message || 'فشل تشغيل البوت');
      }
    } catch (err: any) {
      showNotification('error', `خطأ في الاتصال بالخادم: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopBot = async () => {
    try {
      const res = await fetch('/api/bot/stop', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        showNotification('info', 'تم إيقاف البوت وفصل الاتصال');
        await fetchBotState();
      }
    } catch (err: any) {
      showNotification('error', `فشل إيقاف البوت: ${err.message}`);
    }
  };

  const handlePingServer = async (
    edition: MinecraftEdition,
    address: string,
    port?: number
  ): Promise<ServerPingResult> => {
    const res = await fetch('/api/server/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ edition, serverAddress: address, port }),
    });
    return await res.json();
  };

  const handleSendMessage = async (message: string) => {
    try {
      const res = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const result = await res.json();
      if (!result.success) {
        showNotification('error', result.message || 'فشل إرسال الرسالة');
      }
    } catch (err: any) {
      showNotification('error', `خطأ: ${err.message}`);
    }
  };

  const handleTriggerAction = async (
    action: 'jump' | 'swing' | 'sneak' | 'toggleAntiAfk'
  ) => {
    try {
      const res = await fetch('/api/bot/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const result = await res.json();
      if (result.success) {
        await fetchBotState();
      } else {
        showNotification('info', result.message);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans" dir="rtl">
      {/* App Header */}
      <Header
        status={botState.status}
        botName={botState.botName}
        serverAddress={botState.host ? `${botState.host}:${botState.port}` : undefined}
        uptimeSeconds={botState.uptimeSeconds}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 left-5 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-medium ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : notification.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-zinc-900/90 border-zinc-700 text-zinc-200'
            }`}
          >
            {notification.type === 'success' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-zinc-400 hover:text-white mr-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Aternos Info Banner */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
            <span className="text-zinc-300">
              تلميح هام لسيرفرات اتيرنوس: تأكد من تفعيل خيار <strong className="text-emerald-300">Cracked (مكرك)</strong> في صفحة خيارات اتيرنوس (Options) لكي يستطيع البوت الدخول فوراً وبدون أي أخطاء.
            </span>
          </div>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 shrink-0 cursor-pointer"
          >
            عرض شرح الخطوات بالتفصيل
          </button>
        </div>

        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Setup or Live Dashboard */}
          <div className="lg:col-span-6 space-y-6">
            {botState.isRunning ? (
              <LiveBotDashboard
                state={botState}
                onStopBot={handleStopBot}
                onTriggerAction={handleTriggerAction}
              />
            ) : (
              <BotSetupCard
                isLoading={isLoading}
                onStartBot={handleStartBot}
                onPingServer={handlePingServer}
              />
            )}
          </div>

          {/* Right Column: Live Console & Chat */}
          <div className="lg:col-span-6">
            <LiveConsoleChat
              logs={botState.logs}
              isOnline={botState.status === 'online'}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/60 py-4 px-6 text-center text-xs text-zinc-500">
        <p>
          بوت ماين كرافت مخصص لسيرفرات اتيرنوس Aternos • يدعم Java Edition و Bedrock PE • نظام Anti-AFK للحفاظ على تشغيل السيرفر 24 ساعة
        </p>
      </footer>

      {/* Aternos Setup Guide Modal */}
      <AternosGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
