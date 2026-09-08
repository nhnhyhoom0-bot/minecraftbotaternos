import './server/patches.js';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { botManager } from './server/botManager.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get current Bot state, stats, logs
  app.get('/api/bot/status', (_req, res) => {
    try {
      const state = botManager.getState();
      res.json(state);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Start Minecraft bot
  app.post('/api/bot/start', async (req, res) => {
    try {
      const { edition, serverAddress, port, botName, version, antiAfk, autoReconnect } = req.body;
      if (!edition || !serverAddress || !botName) {
        return res.status(400).json({
          success: false,
          message: 'يرجى إكمال جميع الحقول المطلوبة: نوع السيرفر، العنوان، واسم البوت',
        });
      }

      const result = await botManager.start({
        edition,
        serverAddress,
        port: port ? Number(port) : undefined,
        botName,
        version,
        antiAfk: antiAfk !== false,
        autoReconnect: autoReconnect !== false,
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Stop Minecraft bot
  app.post('/api/bot/stop', async (_req, res) => {
    try {
      const result = await botManager.stop();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Send Chat message or in-game command
  app.post('/api/bot/chat', (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, message: 'نص الرسالة غير صالح' });
      }
      const result = botManager.sendChat(message);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Trigger quick bot action (jump, swing, sneak, toggle-anti-afk)
  app.post('/api/bot/action', (req, res) => {
    try {
      const { action } = req.body;
      const result = botManager.triggerAction(action);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Ping Minecraft Server
  app.post('/api/server/ping', async (req, res) => {
    try {
      const { edition, serverAddress, port } = req.body;
      if (!edition || !serverAddress) {
        return res.status(400).json({ online: false, error: 'يرجى إدخال عنوان السيرفر ونوعه' });
      }
      const pingResult = await botManager.pingServer(edition, serverAddress, port ? Number(port) : undefined);
      res.json(pingResult);
    } catch (err: any) {
      res.status(500).json({ online: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
