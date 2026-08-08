import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  name: string;
  mobileNumber: string;
}

const STORAGE_KEY = 'jweb.auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<AuthUser | null>(this.readStoredUser());

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  constructor(private readonly router: Router) {}

  /**
   * Local login for now. Later this will call POST /auth/otp/request
   * then POST /auth/otp/verify against the Python API.
   */
  login(name: string, mobileNumber: string): void {
    const user: AuthUser = {
      name: name.trim(),
      mobileNumber: mobileNumber.trim(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.userSignal.set(user);
    void this.router.navigateByUrl('/home');
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.userSignal.set(null);
    void this.router.navigateByUrl('/login');
  }

  private readStoredUser(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as AuthUser;
      if (!parsed?.name || !parsed?.mobileNumber) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
