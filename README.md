- นายชโนดม อองกุลนะ 67543206045-6
- นางสาวจิดาภา กันทวงศ์ 67543206042-3

### Architecture Diagram

```text
Browser / Postman
│
│ HTTPS :443 (HTTP :80 redirect → HTTPS)
▼
┌─────────────────────────────────────────────────────────┐
│ 🛡️ Nginx (API Gateway + TLS Termination + Rate Limiter) │
│                                                          │
│ /api/auth/_ → auth-service:3001 (ไม่ต้องมี JWT)          │
│ /api/tasks/_ → task-service:3002 [JWT required]          │
│ /api/logs/\* → log-service:3003 [JWT required]           │
│ / → frontend:80 (Static HTML)                            │
└───────┬────────────────┬──────────────────┬───────────────
        │                │                  │
        ▼                ▼                  ▼
┌──────────────┐ ┌───────────────┐ ┌──────────────────┐
│ 🔑 Auth Svc │ │ 📋 Task Svc   │ │ 📝 Log Service   │
│     :3001    │ │     :3002     │ │      :3003       │
│              │ │               │ │                  │
│ • Login      │ │ • CRUD Tasks  │ │ • POST /api/logs │
│ • /verify    │ │ • JWT Guard   │ │ • GET /api/logs  │
│ • /me        │ │ • Log events  │ │ • เก็บลง DB       │
└──────┬───────┘ └───────┬───────┘ └──────────────────┘
       │                 │
       └────────┬────────┘
                ▼
    ┌─────────────────────┐
    │ 🗄️ PostgreSQL      │      
    │ (1 shared DB)       │
    │ • users table       │
    │ • tasks table       │
    │ • logs table        │
    └─────────────────────┘
```

### วิธีรัน: ./scripts/gen-certs.sh → cp .env.example .env → docker compose up --build

1. สร้าง SSL Certificate: สำหรับการใช้งาน HTTPS ในระดับ Development
    chmod +x scripts/gen-certs.sh
    ./scripts/gen-certs.sh

2. เตรียมไฟล์ Environment:
    cp .env.example .env

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


