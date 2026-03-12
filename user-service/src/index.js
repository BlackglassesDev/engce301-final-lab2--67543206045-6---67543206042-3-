require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initDB } = require('./db/db');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3004;

// ── Middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Morgan log (compatible with Loki / Docker logs)
morgan.token('body-size', (req) => {
  return req.body ? JSON.stringify(req.body).length + 'b' : '0b';
});

app.use(
  morgan(':method :url :status :response-time ms - body::body-size', {
    stream: {
      write: (msg) => console.log(msg.trim())
    }
  })
);

// ── Routes ─────────────────────────────────────────────
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({
    error: 'Internal Server Error'
  });
});

// ── Start Server ───────────────────────────────────────
async function start() {
  let retries = 10;

  while (retries > 0) {
    try {
      await initDB();
      break;
    } catch (err) {
      console.log(`[user-service] Waiting for DB... (${retries} retries left)`);
      retries--;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  app.listen(PORT, () => {
    console.log(`[user-service] Running on port ${PORT}`);
  });
}

start();