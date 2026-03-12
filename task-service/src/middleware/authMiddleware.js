const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

module.exports = function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // payload จาก auth-service
    // { sub, email, role, username }
    req.user = decoded;

    next();

  } catch (err) {

    // ส่ง log ไป log-service (ไม่ให้ระบบพัง)
    fetch('http://log-service:3003/api/logs/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'task-service',
        level: 'ERROR',
        event: 'JWT_INVALID',
        ip_address: req.headers['x-real-ip'] || req.ip,
        message: 'Invalid JWT token: ' + err.message,
        meta: { error: err.message }
      })
    }).catch(() => {});

    return res.status(401).json({
      error: 'Unauthorized: Invalid or expired token'
    });
  }
};