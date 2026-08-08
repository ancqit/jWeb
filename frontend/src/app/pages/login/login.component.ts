import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { RECAPTCHA_TOKEN_PLACEHOLDER } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  displayName = '';
  phoneNumber = '';
  otp = '';

  readonly step = signal<'details' | 'otp'>('details');
  readonly error = signal('');
  readonly submitting = signal(false);
  readonly sessionInfo = signal('');
  readonly expiresInSeconds = signal(300);
  readonly debugOtp = signal('');

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  get e164Phone(): string {
    return `+91${this.phoneNumber.trim().replace(/\s+/g, '')}`;
  }

  sendOtp(): void {
    this.error.set('');
    this.debugOtp.set('');
    const displayName = this.displayName.trim();
    const phone = this.phoneNumber.trim().replace(/\s+/g, '');

    if (!displayName) {
      this.error.set('Please enter your name.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      this.error.set('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    this.submitting.set(true);
    this.auth
      .requestOtp({
        display_name: displayName,
        phone_number: `+91${phone}`,
        recaptcha_token: RECAPTCHA_TOKEN_PLACEHOLDER,
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (response) => {
          this.sessionInfo.set(response.session_info);
          this.expiresInSeconds.set(response.expires_in_seconds);
          this.debugOtp.set(response.debug_otp?.trim() ?? '');
          this.otp = response.debug_otp?.trim() ?? '';
          this.step.set('otp');
        },
        error: (err: Error) => this.error.set(err.message),
      });
  }

  verifyOtp(): void {
    this.error.set('');
    const code = this.otp.trim();

    if (!/^\d{6}$/.test(code)) {
      this.error.set('Enter the 6-digit OTP.');
      return;
    }

    this.submitting.set(true);
    this.auth
      .verifyOtp({
        phone_number: this.e164Phone,
        otp: code,
        session_info: this.sessionInfo(),
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/home'),
        error: (err: Error) => this.error.set(err.message),
      });
  }

  editDetails(): void {
    this.otp = '';
    this.sessionInfo.set('');
    this.step.set('details');
    this.error.set('');
  }
}
