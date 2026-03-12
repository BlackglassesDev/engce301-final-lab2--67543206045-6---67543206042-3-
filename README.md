- นายชโนดม อองกุลนะ 67543206045-6
- นางสาวจิดาภา กันทวงศ์ 67543206042-3

# URL จริงของทุก Service บน Railway
- Auth Service: https://auth-service-production-559c.up.railway.app
- Task Service: https://task-service-production-b94a.up.railway.app
- User Service: https://user-service-production-bf73.up.railway.app
- Frontend URL: https://frontend-production-ad4c.up.railway.app

# Architecture diagram (Cloud version)

```text
Internet
    │
    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│   🌐 Railway Cloud Platform                                              │
│                                                                          │
│  ┌───────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │  🔑 Auth Service  │  │  📋 Task Service      │  │  👤 User Service  │  │
│  │  auth.up.rlwy.net │  │  task.up.rlwy.net    │  │  user.up.rlwy.net │  │
│  │  PORT: 3001       │  │  PORT: 3002          │  │  PORT: 3003       │  │
│  └────────┬──────────┘  └──────────┬───────────┘  └────────┬──────────┘  │
│           │                        │                       │             │
│           ▼                        ▼                       ▼             │
│  ┌────────────────┐   ┌─────────────────────┐  ┌──────────────────────┐  │
│  │  🗄️ auth-db    │   │  🗄️ task-db          │  │  🗄️ user-db          │  │
│  │  PostgreSQL    │   │  PostgreSQL         │  │  PostgreSQL          │  │
│  │  users table   │   │  tasks table        │  │  user_profiles table │  │
│  │  logs table    │   │  logs table         │  │  logs table          │  │
│  └────────────────┘   └─────────────────────┘  └──────────────────────┘  │
│                                                                          │
│  JWT_SECRET ใช้ร่วมกันทุก service (ผ่าน Railway Environment Variables)        │
└──────────────────────────────────────────────────────────────────────────┘

```

# Gateway Strategy ที่เลือก + เหตุผล

1. Option A (Frontend เรียก URL ของแต่ละ service โดยตรง)
Frontend มีการชี้ Environment Variables (AUTH_API, TASK_API, USER_API) เพื่อยิงหน้าเว็บหาแต่ละ Microservice โดยตรง

2. Option B (สร้าง API Gateway บน Railway เพื่อ Route Traffic) และ Bonus
มีการใช้ Nginx ทำหน้าที่เป็น Gateway รวมทุก Service และ Frontend เข้าด้วยกันเป็น URL เดียวลดปัญหา CORS
Bonus: เพิ่มการคอนฟิก Rate Limit ภายใน Nginx Gateway เพื่อป้องกันการสแปมและโจมตีเบื้องต้น

3. รันระบบผ่าน Docker Compose:
    docker compose up --build


### Seed Users Table

Username,      Email,Password (Plain-text),         Role
alice,         alice@lab.local,alice123,            member
bob,           bob@lab.local,bob456,                member
admin,         admin@lab.local,adminpass,           admin


### อธิบายสั้น ๆ ว่า HTTPS ทำงานอย่างไรในระบบนี้
ระบบนี้ใช้ Nginx เป็นตัวจัดการความปลอดภัยที่ด่านหน้า (API Gateway):

HTTPS Redirect: เมื่อมีการเข้าผ่านพอร์ต 80 (HTTP) Nginx จะสั่ง Redirect ไปที่พอร์ต 443 (HTTPS) ทันที

TLS Termination: Nginx จะทำหน้าที่ถอดรหัส (Decrypt) ข้อมูล HTTPS ที่ส่งมาจาก Browser โดยใช้ไฟล์ Certificate (cert.pem, key.pem) ที่เราสร้างขึ้น

Internal Communication: หลังจาก Nginx ตรวจสอบความถูกต้องแล้ว จะส่งข้อมูลต่อไปยัง Service ภายใน (Auth, Task, Log) ผ่าน Docker Network ซึ่งช่วยลดภาระของ Microservices ไม่ต้องจัดการ SSL เองทุกตัว

Security Headers: มีการเพิ่ม Header เช่น HSTS, X-Frame-Options และ X-XSS-Protection เพื่อป้องกันการโจมตีจากภายนอก


