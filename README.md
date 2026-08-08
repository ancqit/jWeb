# jWeb

Angular frontend with OTP login against **[junctionBack](https://github.com/ancqit/junctionBack)**.

## Structure

- `frontend/` — Angular 19 app (`http://localhost:4200`)
  - `/login` — name + phone → OTP verify
  - `/home` — post-login page (route-guarded)

Backend repo: https://github.com/ancqit/junctionBack  
Deployed API: `https://junctionback.onrender.com`  
Docs: https://junctionback.onrender.com/docs

## Run the frontend

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

## Run the backend (junctionBack)

```bash
git clone https://github.com/ancqit/junctionBack.git
cd junctionBack
# follow that repo’s README / README.txt.md for env + startup
```

For local API work, point `API_BASE_URL` in `frontend/src/app/core/api.config.ts` at `http://localhost:8000`.

## OTP login API (from junctionBack)

Configured in `frontend/src/app/core/api.config.ts` → `https://junctionback.onrender.com`.

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

> junctionBack needs `GCP_IDENTITY_PLATFORM_API_KEY` set for OTP delivery. The UI currently sends a placeholder `recaptcha_token` until Google reCAPTCHA is integrated.

## Build frontend

```bash
cd frontend
npm run build
```

Static output (what Vercel must publish): `frontend/dist/frontend/browser`

## Deploy on Vercel

This repo has a root `vercel.json` that installs/builds `frontend/` and publishes `frontend/dist/frontend/browser`.

In the Vercel project:

1. **Root Directory** = repository root (`.`), not a random subfolder without config
2. Or set **Root Directory** to `frontend` and use the same output path relative to that folder: `dist/frontend/browser`
3. Redeploy after pushing `vercel.json`

Angular routes (`/login`, `/home`) are rewritten to `index.html` so deep links do not 404.
