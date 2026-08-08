import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from './api.config';
import { TokenService } from './token.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokens = inject(TokenService);
  const isApiCall = request.url.startsWith(API_BASE_URL);
  const isAuthCall = request.url.includes('/auth/otp/');

  if (!isApiCall || !tokens.accessToken || isAuthCall) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
    }),
  );
};
