import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock Database for API Keys (In-memory for demo)
// In production, this would be a database like Prisma/PostgreSQL
const apiKeysDB: { id: string; hashedKey: string; name: string; createdAt: string; lastUsed?: string; usage: number; limit: number; revoked: boolean }[] = [];

// Helper functions for API Keys
const generateApiKey = () => {
  const buffer = crypto.randomBytes(32);
  return `rug_${buffer.toString('hex')}`;
};

const hashKey = (key: string) => {
  const secret = process.env.API_KEY_SECRET || 'default_secret_change_me';
  return crypto.createHmac('sha256', secret).update(key).digest('hex');
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

  const PORT = process.env.PORT || 3000;

  // Authentication Middleware for API Keys
  const authMiddleware = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid API key format" });
    }

    const key = authHeader.split(' ')[1];
    const hashed = hashKey(key);
    const keyData = apiKeysDB.find(k => k.hashedKey === hashed && !k.revoked);

    if (!keyData) {
      return res.status(401).json({ error: "Unauthorized: Invalid or revoked API key" });
    }

    // Basic Rate Limiting
    if (keyData.usage >= keyData.limit) {
      return res.status(429).json({ error: "Too Many Requests: API key usage limit reached" });
    }

    // Update usage and last used
    keyData.usage += 1;
    keyData.lastUsed = new Date().toISOString();
    
    req.apiKey = keyData;
    next();
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

  // API Routes for Key Management (Internal/Dashboard)
  app.get("/api/keys", (req, res) => {
    // In a real app, you'd filter by user ID
    const maskedKeys = apiKeysDB.map(k => ({
      id: k.id,
      name: k.name,
      createdAt: k.createdAt,
      lastUsed: k.lastUsed,
      usage: k.usage,
      limit: k.limit,
      revoked: k.revoked,
      // Masked version for UI
      key: `rug_****${k.hashedKey.substring(0, 4)}`
    }));
    res.json(maskedKeys);
  });

  app.post("/api/keys", (req, res) => {
    const { name } = req.body;
    const rawKey = generateApiKey();
    const hashedKey = hashKey(rawKey);
    
    const newKey = {
      id: Math.random().toString(36).substr(2, 9),
      hashedKey,
      name: name || "Default Key",
      createdAt: new Date().toISOString(),
      usage: 0,
      limit: 1000, // Default limit
      revoked: false
    };

    apiKeysDB.push(newKey);
    
    // Return the raw key ONLY ONCE
    res.json({ ...newKey, key: rawKey });
  });

  app.delete("/api/keys/:id", (req, res) => {
    const key = apiKeysDB.find(k => k.id === req.params.id);
    if (key) {
      key.revoked = true;
    }
    res.json({ success: true });
  });

  // Protected Public Scanner API Routes (v1)
  app.get("/api/v1/tokens", authMiddleware, (req, res) => {
    res.json(tokens);
  });

  app.get("/api/v1/tokens/:address", authMiddleware, (req, res) => {
    const token = tokens.find(t => t.address === req.params.address);
    if (!token) {
      return res.status(404).json({ error: "Token does not exist" });
    }
    res.json(token);
  });

  // Internal Dashboard Routes (Unprotected for UI demo)
  app.get("/api/tokens", (req, res) => {
    res.json(tokens);
  });

  app.get("/api/tokens/:address", (req, res) => {
    const token = tokens.find(t => t.address === req.params.address);
    if (!token) {
      return res.status(404).json({ error: "Token does not exist" });
    }
    res.json(token);
  });

  // Socket.io for real-time updates with Handshake Validation
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

  io.on("connection", (socket) => {
    console.log("Client connected with valid API key");
    
    // Simulate real-time token launches
    const interval = setInterval(() => {
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
      socket.emit("new_token", newToken);
    }, 5000);

    socket.on("disconnect", () => {
      clearInterval(interval);
    });
  });

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
