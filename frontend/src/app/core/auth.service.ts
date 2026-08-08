import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { API_BASE_URL } from './api.config';
import {
  AuthUser,
  OtpRequestPayload,
  OtpRequestResponse,
  OtpVerifyPayload,
  TokenResponse,
} from './auth.models';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokens = inject(TokenService);
  private readonly router = inject(Router);

  private readonly userSignal = signal<AuthUser | null>(this.tokens.user);

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(
    () => this.tokens.isAuthenticated && this.userSignal() !== null,
  );

  requestOtp(payload: OtpRequestPayload): Observable<OtpRequestResponse> {
    return this.http
      .post<OtpRequestResponse>(`${API_BASE_URL}/auth/otp/request`, payload)
      .pipe(catchError((error) => throwError(() => this.toError(error))));
  }

  verifyOtp(payload: OtpVerifyPayload): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${API_BASE_URL}/auth/otp/verify`, payload)
      .pipe(
        tap((response) => this.acceptSession(response)),
        catchError((error) => throwError(() => this.toError(error))),
      );
  }

  logout(): void {
    this.tokens.clear();
    this.userSignal.set(null);
    void this.router.navigateByUrl('/login');
  }

  private acceptSession(response: TokenResponse): void {
    this.tokens.saveSession(response.access_token, response.user);
    this.userSignal.set(response.user);
  }

  private toError(error: unknown): Error {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;
      if (typeof detail === 'string' && detail.trim()) {
        return new Error(detail);
      }
      if (Array.isArray(detail) && detail[0]?.msg) {
        return new Error(detail[0].msg);
      }
      if (error.status === 0) {
        return new Error('Unable to reach the Junction API. Check your network.');
      }
      return new Error(`Request failed (${error.status}). Please try again.`);
    }
    return error instanceof Error ? error : new Error('Something went wrong.');
  }
}
