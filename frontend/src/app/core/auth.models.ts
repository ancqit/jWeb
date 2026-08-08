export interface OtpRequestPayload {
  display_name: string;
  phone_number: string;
  recaptcha_token: string;
}

export interface OtpRequestResponse {
  message: string;
  expires_in_seconds: number;
  session_info: string;
}

export interface OtpVerifyPayload {
  phone_number: string;
  otp: string;
  session_info: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  phone_number: string | null;
  display_name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}
