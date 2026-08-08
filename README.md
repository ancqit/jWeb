# jWeb

Angular frontend with OTP login against Junction Back.

## Structure

- `frontend/` — Angular 19 app (`http://localhost:4200`)
  - `/login` — name + phone → OTP verify
  - `/home` — post-login page (route-guarded)
- `server/` — optional local FastAPI stub matching the same OTP contract

Production API: `https://junctionback.onrender.com`  
Docs: https://junctionback.onrender.com/docs

## Run the frontend

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

## OTP login API

Configured in `frontend/src/app/core/api.config.ts`.

### `POST /auth/otp/request`

```json
{
  "display_name": "Aarav Kumar",
  "phone_number": "+919876543210",
  "recaptcha_token": "test-token"
}
```

Response:

```json
{
  "message": "OTP sent by GCP Identity Platform",
  "expires_in_seconds": 300,
  "session_info": "..."
}
```

### `POST /auth/otp/verify`

```json
{
  "phone_number": "+919876543210",
  "otp": "123456",
  "session_info": "..."
}
```

Response:

```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "email": null,
    "phone_number": "+919876543210",
    "display_name": "Aarav Kumar"
  }
}
```

> The live backend needs `GCP_IDENTITY_PLATFORM_API_KEY` set for OTP delivery. The UI currently sends a placeholder `recaptcha_token` until Google reCAPTCHA is integrated.

## Optional local API stub

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Stub OTP: `123456`. Point `API_BASE_URL` at `http://localhost:8000` to use it.

## Build frontend

```bash
cd frontend
npm run build
```
