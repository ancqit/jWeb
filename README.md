# jWeb

Angular frontend with name + phone login, plus a Python FastAPI stub for OTP auth (to connect later).

## Structure

- `frontend/` — Angular 19 app (`http://localhost:4200`)
  - `/login` — name and 10-digit phone number
  - `/home` — next page after sign-in (route-guarded)
- `server/` — Python FastAPI stub on `http://localhost:8000`

Login currently stores a local session in the browser. The API contract below is ready for wiring.

## Run the frontend

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

## Run the Python API stub

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/health`

## OTP API contract (for later connection)

Local API base URL: `http://localhost:8000` (`frontend/src/app/core/api.config.ts`).

### `POST /auth/otp/request`

```json
{ "name": "Aarav Kumar", "mobileNumber": "9876543210", "city": "Ranchi", "locality": "Main Road" }
```

Response: `{ "challengeId": "...", "expiresInSeconds": 300 }`

Stub OTP for local verify: `123456`

### `POST /auth/otp/verify`

```json
{ "challengeId": "...", "otp": "123456" }
```

Response includes `accessToken`, `refreshToken`, `expiresInSeconds`, and `user`.

### `POST /auth/refresh`

```json
{ "refreshToken": "..." }
```

## Build frontend

```bash
cd frontend
npm run build
```
