CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(10) NOT NULL,
  event VARCHAR(100) NOT NULL,
  user_id INTEGER,
  message TEXT,
  meta JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);


INSERT INTO users (username, email, password_hash, role) VALUES
  (
    'alice',
    'alice@lab.local',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    -- plain-text password: alice123
    'member'
  ),
  (
    'bob',
    'bob@lab.local',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
    -- plain-text password: bob456
    'member'
  ),
  (
    'admin',
    'admin@lab.local',
    '$2a$10$TbAyBo.OirXRwMvBVMGgXeuHfzaOGicB5K3jZ1WZUD/pDYdm6GS7C',
    -- plain-text password: adminpass
    'admin'
  )
ON CONFLICT DO NOTHING;

-- Seed tasks (optional — ให้มีข้อมูลตั้งต้น)
INSERT INTO tasks (user_id, title, description, status, priority)
SELECT u.id, 'ออกแบบ UI หน้า Login', 'ใช้ Figma ออกแบบ mockup', 'TODO', 'high'
FROM users u WHERE u.username = 'alice'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (user_id, title, description, status, priority)
SELECT u.id, 'เขียน API สำหรับ Task CRUD', 'Express.js + PostgreSQL', 'IN_PROGRESS', 'high'
FROM users u WHERE u.username = 'alice'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (user_id, title, description, status, priority)
SELECT u.id, 'ทดสอบ JWT Authentication', 'ใช้ Postman ทดสอบทุก endpoint', 'TODO', 'medium'
FROM users u WHERE u.username = 'bob'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (user_id, title, description, status, priority)
SELECT u.id, 'Deploy บน Railway', 'ทำ Final Lab ชุดที่ 2', 'TODO', 'medium'
FROM users u WHERE u.username = 'admin'
ON CONFLICT DO NOTHING;