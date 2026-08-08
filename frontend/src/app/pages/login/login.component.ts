import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  name = '';
  mobileNumber = '';
  readonly error = signal('');
  readonly submitting = signal(false);

  constructor(private readonly auth: AuthService) {}

  onSubmit(): void {
    this.error.set('');
    const name = this.name.trim();
    const mobile = this.mobileNumber.trim().replace(/\s+/g, '');

    if (!name) {
      this.error.set('Please enter your name.');
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      this.error.set('Enter a valid 10-digit phone number.');
      return;
    }

    this.submitting.set(true);
    // Local session for now; later this connects to the Python OTP API.
    this.auth.login(name, mobile);
    this.submitting.set(false);
  }
}
