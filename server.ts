import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import dotenv from "dotenv";
import WebSocket from "ws";
import { prisma } from "./src/lib/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper functions for API Keys
const generateApiKey = () => {
  const buffer = crypto.randomBytes(32);
  return `rug_${buffer.toString('hex')}`;
};

const hashKey = (key: string) => {
  const secret = process.env.API_KEY_SECRET || 'default_secret_change_me';
  return crypto.createHmac('sha256', secret).update(key).digest('hex');
};

// Internal Alerts tracking (for Socket.IO real-time delivery)
const activeAlerts: { id: string; socketId: string; address: string; threshold: number; condition: 'above' | 'below'; triggered: boolean }[] = [];

// Helper to simulate price fetching
const getSimulatedPrice = (address: string) => {
  return Math.random() * 100;
};

async function startServer() {
  const app = express();
  app.use(express.json());

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = Number(process.env.PORT) || 3000;

  // Authentication Middleware for API Keys using Prisma
  const authMiddleware = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid API key format" });
    }

    const key = authHeader.split(' ')[1];
    const hashed = hashKey(key);
    
    try {
      const keyData = await prisma.apiKey.findFirst({
        where: { hashedKey: hashed, revoked: false },
        include: { user: true }
      });

      if (!keyData) {
        return res.status(401).json({ error: "Unauthorized: Invalid or revoked API key" });
      }

      if (keyData.usage >= keyData.limit) {
        return res.status(429).json({ error: "Too Many Requests: API key usage limit reached" });
      }

      await prisma.apiKey.update({
        where: { id: keyData.id },
        data: { 
          usage: { increment: 1 },
          lastUsed: new Date()
        }
      });
      
      req.apiKey = keyData;
      req.user = keyData.user;
      next();
    } catch (err) {
      console.error("Auth Error", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Mock data generation for the scanner
  const tokens = [
    {
      id: "1",
      name: "Solana Cat",
      symbol: "SCAT",
      address: "7xKX...123",
      age: "2m",
      liquidity: 50000,
      rugRisk: 0.15,
      sentiment: 0.85,
      recommendation: 88,
      volume: 12000,
      holders: 450,
    },
    {
      id: "2",
      name: "Moon Dog",
      symbol: "MDOG",
      address: "9aPZ...456",
      age: "5m",
      liquidity: 25000,
      rugRisk: 0.65,
      sentiment: 0.45,
      recommendation: 32,
      volume: 5000,
      holders: 120,
    }
  ];

  // API Routes for Key Management using Prisma
  app.get("/api/keys", async (req, res) => {
    try {
      const keys = await prisma.apiKey.findMany({
        orderBy: { createdAt: 'desc' }
      });
      const maskedKeys = keys.map(k => ({
        id: k.id,
        name: k.name,
        createdAt: k.createdAt,
        lastUsed: k.lastUsed,
        usage: k.usage,
        limit: k.limit,
        revoked: k.revoked,
        key: `rug_****${k.hashedKey.substring(0, 4)}`
      }));
      res.json(maskedKeys);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch keys" });
    }
  });

  app.post("/api/keys", async (req, res) => {
    const { name, email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const rawKey = generateApiKey();
    const hashedKey = hashKey(rawKey);
    
    try {
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, name: name || "User" }
      });

      const newKey = await prisma.apiKey.create({
        data: {
          hashedKey,
          name: name || "Default Key",
          userId: user.id,
          limit: 1000
        }
      });

      res.json({ ...newKey, key: rawKey });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create key" });
    }
  });

  app.delete("/api/keys/:id", async (req, res) => {
    try {
      await prisma.apiKey.update({
        where: { id: req.params.id },
        data: { revoked: true }
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to revoke key" });
    }
  });

  // Protected Public Scanner API Routes using Prisma
  app.get("/api/v1/tokens", authMiddleware, async (req, res) => {
    try {
      const tokens = await prisma.token.findMany({
        orderBy: { discoveredAt: 'desc' },
        take: 50
      });
      res.json(tokens);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch tokens" });
    }
  });

  app.get("/api/v1/tokens/:address", authMiddleware, async (req, res) => {
    try {
      const token = await prisma.token.findUnique({
        where: { address: req.params.address }
      });
      if (!token) return res.status(404).json({ error: "Token not found in intelligence database" });
      res.json(token);
    } catch (err) {
      res.status(500).json({ error: "Query failed" });
    }
  });

  // Lemon Squeezy Webhook Handler
  app.post("/api/webhooks/lemon-squeezy", async (req, res) => {
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    const body = JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', secret || '');
    const digest = Buffer.from(hmac.update(body).digest('hex'), 'utf8');
    const signature = Buffer.from(req.get('X-Signature') || '', 'utf8');

    if (secret && !crypto.timingSafeEqual(digest, signature)) {
      return res.status(401).send('Invalid signature');
    }

    const { event_name, data } = req.body;

    if (event_name === 'order_created' || event_name === 'subscription_created' || event_name === 'subscription_updated') {
      const attributes = data.attributes;
      const userEmail = attributes.user_email || attributes.email;
      const variantId = String(attributes.variant_id);

      // Map variant IDs to internal plan names
      let plan = 'free';
      if (variantId === process.env.LEMON_SQUEEZY_VAR_PRO) plan = 'pro';
      if (variantId === process.env.LEMON_SQUEEZY_VAR_WHALE) plan = 'whale';

      console.log(`Payment confirmed for ${userEmail}, upgrading plan to ${plan}...`);
      
      try {
        await prisma.user.upsert({
          where: { email: userEmail },
          update: { plan },
          create: { email: userEmail, plan }
        });
      } catch (err) {
        console.error("Failed to update user plan", err);
      }
    }

    res.status(200).send('Webhook processed');
  });

  app.get("/api/tokens/:address", (req, res) => {
    const token = tokens.find(t => t.address === req.params.address);
    if (!token) {
      return res.status(404).json({ error: "Token does not exist" });
    }
    res.json(token);
  });

  // Socket.io (Auth disabled for internal dashboard demo)
  /*
  io.use((socket, next) => {
    const key = socket.handshake.auth.token || socket.handshake.query.token;
    if (!key) {
      return next(new Error("Authentication error: Missing API key"));
    }

    const hashed = hashKey(key as string);
    const keyData = apiKeysDB.find(k => k.hashedKey === hashed && !k.revoked);

    if (!keyData) {
      return next(new Error("Authentication error: Invalid or revoked API key"));
    }

    next();
  });
  */

  io.on("connection", (socket) => {
    console.log("Client connected");
    
    // Price Alert Logic
    socket.on("create_alert", (alert: { id: string; address: string; threshold: number; condition: 'above' | 'below' }) => {
      console.log(`New alert created for ${alert.address} at ${alert.threshold}`);
      activeAlerts.push({
        ...alert,
        socketId: socket.id,
        triggered: false
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // Relay C++ Backend Data
  function connectToScanner() {
    const ws = new WebSocket("ws://localhost:3001");

    ws.on("open", () => {
      console.log("Connected to C++ Scanner Backend on port 3001");
    });

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === "new_token") {
          io.emit("new_token", message.data);
        } else if (message.type === "price_update") {
          // Check alerts for all clients
          activeAlerts.forEach(alert => {
            if (alert.address === message.data.address && !alert.triggered) {
              const currentPrice = message.data.price;
              const isTriggered = alert.condition === 'above' 
                ? currentPrice > alert.threshold 
                : currentPrice < alert.threshold;
              
              if (isTriggered) {
                alert.triggered = true;
                io.to(alert.socketId).emit("alert_triggered", {
                  alertId: alert.id,
                  address: alert.address,
                  price: currentPrice.toFixed(6)
                });
              }
            }
          });
        }
      } catch (err) {
        console.error("Failed to process message from C++ backend", err);
      }
    });

    ws.on("error", (err) => {
      console.error("Scanner WebSocket Error:", err.message);
    });

    ws.on("close", () => {
      console.warn("Scanner connection lost. Retrying in 5 seconds...");
      setTimeout(connectToScanner, 5000);
    });
  }

  // Start the relay
  if (process.env.NODE_ENV === "production") {
    connectToScanner();
  } else {
    // Keep local simulation for development if C++ backend isn't running
    setInterval(() => {
      const newToken = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Token ${Math.floor(Math.random() * 1000)}`,
        symbol: `TKN${Math.floor(Math.random() * 100)}`,
        address: `${Math.random().toString(36).substr(2, 10)}...`,
        age: "now",
        liquidity: Math.floor(Math.random() * 100000),
        rugRisk: Math.random(),
        sentiment: Math.random(),
        recommendation: Math.floor(Math.random() * 100),
        volume: Math.floor(Math.random() * 20000),
        holders: Math.floor(Math.random() * 1000),
      };
      io.emit("new_token", newToken);
    }, 10000);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
