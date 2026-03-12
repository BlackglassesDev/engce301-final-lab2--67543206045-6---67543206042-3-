require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3002;

// ── Middleware ─────────────────────────
app.use(cors());
app.use(express.json());

// log request (ให้ Docker log driver อ่านได้)
app.use(
  morgan('combined', {
    stream: {
      write: (msg) => console.log(msg.trim())
    }
  })
);

// ── Routes ─────────────────────────
app.use('/api/tasks', taskRoutes);

// health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'task-service',
    time: new Date()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// ── Start Server ─────────────────────────
app.listen(PORT, () => {
  console.log(`[task-service] Running on port ${PORT}`);
});