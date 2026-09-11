# CoachSheets

Applicazione web per la gestione collaborativa di schede di allenamento tra Coach e Atleti.

**Stack:**
- **Backend**: Java 17 + Spring Boot 3 + JPA + MySQL/H2 + WebSocket + JWT
- **Frontend**: React + Tailwind CSS + Shadcn UI (da aggiungere in `/frontend`)
- **Database**: MySQL (Aiven)
- **Deploy**: Render (backend) + Vercel (frontend)

## 📁 Struttura del Repo

```
coachsheets/
├── backend/          # Spring Boot API
│   ├── pom.xml
│   ├── mvnw          # Maven Wrapper (Unix)
│   ├── mvnw.cmd      # Maven Wrapper (Windows)
│   ├── src/
│   └── README.md     # Documentazione backend
├── frontend/         # React app (da aggiungere)
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Backend (Sviluppo Locale)

```bash
cd backend
./mvnw spring-boot:run     # Mac/Linux
mvnw.cmd spring-boot:run   # Windows
```

Il backend parte su http://localhost:8001 con H2 in-memory (default profile: `dev`).

Per usare MySQL:
```bash
export SPRING_PROFILE=prod
export DB_URL="jdbc:mysql://..."
export DB_USERNAME=...
export DB_PASSWORD=...
export JWT_SECRET=...
./mvnw spring-boot:run
```

Vedi `backend/README.md` per dettagli completi.

### Frontend

```bash
cd frontend
yarn install
yarn start
```

Frontend su http://localhost:3000.

## 🌐 Deploy in Produzione

### Backend su Render

1. Vai su https://render.com → **New Web Service**
2. Collega il repo GitHub
3. Configura:
   - **Root Directory**: `backend`
   - **Runtime**: `Java`
   - **Build Command**: `chmod +x ./mvnw && ./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/coachsheets-backend.jar`
4. Aggiungi Environment Variables (vedi `.env.example`)

### Frontend su Vercel

1. Vai su https://vercel.com → **Add New Project**
2. Collega il repo GitHub
3. Configura:
   - **Root Directory**: `frontend`
   - **Framework**: Create React App
4. Aggiungi Environment Variables:
   - `REACT_APP_BACKEND_URL=https://TUO-BACKEND.onrender.com`

## 📄 License

MIT
