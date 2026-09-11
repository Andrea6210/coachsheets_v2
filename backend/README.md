# CoachSheets Backend - Spring Boot + MySQL

Backend API per **CoachSheets** - gestione collaborativa di schede di allenamento tra coach e atleti, con **modifica real-time**, tracking progressi, statistiche complete e chat integrata.

**Stack:** Spring Boot 3 · Spring Data JPA · MySQL (prod) · H2 (dev) · JWT · WebSocket · Hibernate 6

---

## 🎯 Features

### Core
- Registrazione/Login Coach e Atleta (JWT)
- **Schede multi-atleta** — una scheda condivisa tra più atleti
- Modifica **real-time** via WebSocket con visualizzazione "Ultimo modificato da"
- Chat integrata coach-atleta

### Esercizi
- Campo libero (nessun database esercizi obbligatorio)
- **Video URL** per link YouTube/spiegazioni
- **Note separate** coach e atleta per ogni esercizio
- Log settimanali per tracciare progressi

### Statistiche Atleta (opzionali)
- Peso, altezza, età, esperienza
- **Personal Records** con calcolo automatico **1RM** (Epley)
- Body composition, storico misurazioni corporee
- Goals, note mediche, infortuni

### Chicche Extra
- Sistema **Achievements/Badges** automatico
- **Progressione PR** per esercizio
- Programmi con settimana progressiva
- Archivio schede + snapshot storici
- **1RM Calculator** endpoint dedicato

---

## 🚀 Setup Rapido (H2 - senza installazioni)

Il progetto usa **H2 in-memory** come default: non serve installare nessun database!

### Prerequisiti
- **Java 17+** ([download Adoptium](https://adoptium.net/))
- **Maven 3.8+** ([download](https://maven.apache.org/download.cgi))

### Comandi

```bash
# 1. Estrai/clona
cd coachsheets-springboot

# 2. Compila
mvn clean install

# 3. Avvia (dev mode, H2 in-memory)
mvn spring-boot:run
```

Il server sarà su **http://localhost:8001**

**H2 Console** disponibile su: http://localhost:8001/h2-console
- JDBC URL: `jdbc:h2:mem:coachsheets`
- User: `sa`
- Password: (vuota)

> ⚠️ **H2 è in-memory**: i dati si perdono al riavvio. Perfetto per test veloci. Per produzione usa MySQL.

---

## 🗄️ Setup Produzione con MySQL

### 1. Installa MySQL

- **Windows/Mac**: [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
- **Docker (consigliato)**: 
  ```bash
  docker run -d --name coachsheets-mysql \
    -e MYSQL_ROOT_PASSWORD=rootpass \
    -e MYSQL_DATABASE=coachsheets \
    -p 3306:3306 \
    mysql:8
  ```

### 2. Imposta variabili d'ambiente

**Windows (CMD):**
```cmd
set SPRING_PROFILE=prod
set DB_URL=jdbc:mysql://localhost:3306/coachsheets?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
set DB_USERNAME=root
set DB_PASSWORD=rootpass
set JWT_SECRET=chiave-segreta-molto-lunga-almeno-32-caratteri-abc
set CORS_ORIGINS=http://localhost:3000
```

**Mac/Linux:**
```bash
export SPRING_PROFILE=prod
export DB_URL="jdbc:mysql://localhost:3306/coachsheets?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC"
export DB_USERNAME=root
export DB_PASSWORD=rootpass
export JWT_SECRET=chiave-segreta-molto-lunga-almeno-32-caratteri-abc
export CORS_ORIGINS=http://localhost:3000
```

### 3. Avvia

```bash
mvn spring-boot:run
```

Hibernate creerà automaticamente le tabelle al primo avvio (`ddl-auto=update`).

---

## 🌐 Alternative Gratuite per MySQL Cloud

| Servizio | Free Tier | Note |
|----------|-----------|------|
| **[PlanetScale](https://planetscale.com)** | Sì | MySQL serverless (2026 requires plan) |
| **[Aiven](https://aiven.io)** | 30 giorni trial | MySQL managed |
| **[Railway](https://railway.app)** | 5$/mese crediti | MySQL veloce da setup |
| **[Clever Cloud](https://clever-cloud.com)** | Piano free | MySQL EU |
| **[FreeSQLDatabase](https://www.freesqldatabase.com)** | Gratis limitato | Semplice ma con limiti |

---

## 📊 Schema Database

### Tabelle principali (relazionali)

**`users`**
| Colonna | Tipo | Note |
|---------|------|------|
| id | VARCHAR(36) PK | UUID |
| email | VARCHAR UNIQUE | |
| password | VARCHAR | BCrypt hash |
| name | VARCHAR | |
| role | VARCHAR(20) | 'coach' o 'athlete' |
| coach_id | VARCHAR(36) FK | Solo per atleti |
| created_at | VARCHAR | ISO timestamp |

**`workout_sheets`**
| Colonna | Tipo | Note |
|---------|------|------|
| id | VARCHAR(36) PK | |
| title | VARCHAR | |
| coach_id | VARCHAR(36) | |
| athlete_ids | **JSON** | Array UUID atleti |
| days | **JSON** | Array giorni + esercizi + log |
| last_modified_by | VARCHAR(36) | |
| last_modified_by_name | VARCHAR | |
| archived | BOOLEAN | |
| ...  | | |

**`messages`**
Standard con index su sender_id e receiver_id.

**`athlete_stats`**
Statistiche atleta con **JSON** per PR, achievements, misurazioni.

**`sheet_history`**
Snapshot storici con **JSON** per days_snapshot.

### Perché JSON per le liste innestate?

MySQL 5.7+ e H2 supportano nativamente il tipo **JSON** con indici e query dedicate. Questa scelta:
- ✅ Preserva la struttura logica del dominio (una scheda ha giorni, un giorno ha esercizi)
- ✅ Riduce join complessi (le liste sono sempre lette insieme al parent)
- ✅ Semplifica il codice (nessuna gestione cascade)
- ✅ Query performanti con `JSON_CONTAINS`, `JSON_EXTRACT`, ecc.

Se preferisci **puramente relazionale** (tabelle separate per days/exercises/logs), è possibile ma richiede refactoring corposo con `@OneToMany`.

---

## 📚 API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Atleti (Coach only)
- `POST /api/athletes`
- `GET /api/athletes`
- `DELETE /api/athletes/{id}`

### Schede
- `POST /api/sheets` — multi-atleta
- `GET /api/sheets`
- `GET /api/sheets/archived`
- `GET /api/sheets/{id}`
- `PUT /api/sheets/{id}`
- `DELETE /api/sheets/{id}`
- `POST /api/sheets/{id}/duplicate`

### Statistiche
- `GET /api/athletes/{id}/stats`
- `PUT /api/athletes/{id}/stats`
- `POST /api/athletes/{id}/stats/records`
- `DELETE /api/athletes/{id}/stats/records/{prId}`
- `GET /api/athletes/{id}/stats/records/{exercise}/progression`
- `POST /api/athletes/{id}/stats/measurements`
- `GET /api/athletes/{id}/stats/one-rep-max?weight=X&reps=Y`

### Cronologia
- `GET /api/history`
- `GET /api/history/athlete/{id}`
- `GET /api/history/sheet/{id}`

### Messaggi
- `POST /api/messages`
- `GET /api/messages/{userId}`

### WebSocket
- `ws://localhost:8001/ws/sheet/{sheetId}?token=JWT`
- `ws://localhost:8001/ws/chat/{userId}?token=JWT`

---

## 🔧 Variabili d'Ambiente

| Variabile | Default | Descrizione |
|-----------|---------|-------------|
| `SPRING_PROFILE` | `dev` | `dev` (H2) o `prod` (MySQL) |
| `JWT_SECRET` | fallback insicuro | **Cambia sempre in prod** (≥32 chars) |
| `CORS_ORIGINS` | `http://localhost:3000` | URL frontend separati da virgola |
| `DB_URL` | — | JDBC URL MySQL (solo prod) |
| `DB_USERNAME` | — | User MySQL |
| `DB_PASSWORD` | — | Password MySQL |

---

## 🐛 Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| `mvn command not found` | Installa Maven e aggiungi al PATH |
| `Communications link failure` (MySQL) | Verifica che MySQL sia in esecuzione |
| `Access denied for user` | Controlla DB_USERNAME/DB_PASSWORD |
| `JWT signing key too short` | JWT_SECRET deve essere ≥32 caratteri |
| `Port 8001 in use` | Cambia `server.port` in `application.properties` |
| Tabelle non create | Verifica `spring.jpa.hibernate.ddl-auto=update` |

---

## 📖 Struttura Progetto

```
src/main/java/com/coachsheets/
├── CoachSheetsApplication.java
├── config/          # Spring Security, WebSocket, JWT filter, Jackson
├── model/           # JPA @Entity + POJO nested (JSON)
├── repository/      # Spring Data JPA repositories
├── service/         # Business logic
├── controller/      # REST endpoints
├── dto/             # Request/Response
└── websocket/       # WS handlers (real-time sync)

src/main/resources/
├── application.properties          # Config comune
├── application-dev.properties      # H2 in-memory
└── application-prod.properties     # MySQL
```

---

## 📄 License

MIT
