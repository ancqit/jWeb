# Apply junctionBack OTP + CORS fix

This agent can push to **jWeb** only. `cursor[bot]` gets **403** on `ancqit/junctionBack`.

## Grant write access (required)

1. Open https://github.com/apps/cursor and ensure **junctionBack** is included for the Cursor GitHub App (or grant the app access to all `ancqit` repos).
2. Re-run / continue the cloud agent so it can push to `junctionBack` `main`.

Until then, apply this patch yourself:

```bash
cd /path/to/junctionBack
git apply /path/to/jWeb/patches/junctionBack-otp-debug-cors.patch
# or copy files from patches/junctionBack-files/
git add app/main.py app/login.py .env.example
git commit -m "Enable OTP debug fallback and allow Vercel CORS"
git push origin main
```

## Render env (after deploy)

On the junctionBack Render service, either:

- leave `GCP_IDENTITY_PLATFORM_API_KEY` empty **and** set `OTP_DEBUG=true` (uses OTP `123456`), or
- set a real `GCP_IDENTITY_PLATFORM_API_KEY` for SMS OTP

Also ensure `JWT_SECRET` is at least 32 characters.
