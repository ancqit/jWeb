/**
 * Same-origin `/api` is rewritten:
 * - Vercel → https://junctionback.onrender.com
 * - Local ng serve → proxy.conf.json
 *
 * Backend: https://github.com/ancqit/junctionBack
 */
export const API_BASE_URL = '/api';

/**
 * Placeholder until Google reCAPTCHA is integrated.
 * junctionBack forwards this to GCP Identity Platform.
 */
export const RECAPTCHA_TOKEN_PLACEHOLDER = 'test-token';
