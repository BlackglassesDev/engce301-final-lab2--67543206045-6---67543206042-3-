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

Option A (Frontend เรียก URL ของแต่ละ service โดยตรง)
- Frontend มีการชี้ Environment Variables (AUTH_API, TASK_API, USER_API) เพื่อยิงหน้าเว็บหาแต่ละ Microservice โดยตรง

Option B (สร้าง API Gateway บน Railway เพื่อ Route Traffic) และ Bonus
- มีการใช้ Nginx ทำหน้าที่เป็น Gateway รวมทุก Service และ Frontend เข้าด้วยกันเป็น URL เดียวลดปัญหา CORS
Bonus: เพิ่มการคอนฟิก Rate Limit ภายใน Nginx Gateway เพื่อป้องกันการสแปมและโจมตีเบื้องต้น




# วิธีทดสอบ (curl commands หรือ Postman collection)
### Register
curl -X POST https://auth-service-production-559c.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"myuser","password":"mypass","email":"my@email.com"}'

### Login → เก็บ token
TOKEN=$(curl -s -X POST https://auth-service-production-559c.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@lab.local","password":"alice123"}' | jq -r '.token')

### Create Task
curl -X POST https://task-service-production-b94a.up.railway.app/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My first cloud task"}'

### Get Profile
curl https://user-service-production-bf73.up.railway.app/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

### Test 401
curl https://task-service-production-b94a.up.railway.app/api/tasks   # ไม่ใส่ token → ต้องได้ 401





# ปัญหาที่เจอระหว่างทำ + วิธีแก้ (optional แต่ได้ bonus)
CORS Error
- Frontend เรียกข้าม Service (Auth/User/Task) บน Railway
- ตั้งค่า Middleware cors ในทุก Service ให้รองรับ URL ของ Frontend

Database Connection
- ระบบหา Hostname ของ DB ไม่เจอเมื่อรันบน Local vs Cloud
- ใช้ DATABASE_URL ที่ Railway กำหนดให้ใน Environment และคุมผ่าน .env


