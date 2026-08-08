from datetime import datetime, timedelta, timezone
from typing import Dict
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="jWeb Auth API (local stub)",
    description="Mirrors Junction Back OTP routes for local frontend work.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OtpRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=100)
    phone_number: str = Field(pattern=r"^\+[1-9]\d{7,14}$")
    recaptcha_token: str = Field(min_length=1)


class OtpRequestResponse(BaseModel):
    message: str
    expires_in_seconds: int
    session_info: str


class OtpVerifyRequest(BaseModel):
    phone_number: str = Field(pattern=r"^\+[1-9]\d{7,14}$")
    otp: str = Field(pattern=r"^\d{6}$")
    session_info: str = Field(min_length=1)


class UserSummary(BaseModel):
    id: str
    email: str | None = None
    phone_number: str | None = None
    display_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSummary


_challenges: Dict[str, dict] = {}


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/auth/otp/request", response_model=OtpRequestResponse)
def request_otp(body: OtpRequest) -> OtpRequestResponse:
    session_info = f"session-{uuid4()}"
    _challenges[session_info] = {
        "display_name": body.display_name.strip(),
        "phone_number": body.phone_number,
        "otp": "123456",
        "expires_at": datetime.now(timezone.utc) + timedelta(seconds=300),
    }
    return OtpRequestResponse(
        message="OTP sent (local stub — use 123456)",
        expires_in_seconds=300,
        session_info=session_info,
    )


@app.post("/auth/otp/verify", response_model=TokenResponse)
def verify_otp(body: OtpVerifyRequest) -> TokenResponse:
    challenge = _challenges.get(body.session_info)
    if not challenge:
        raise HTTPException(status_code=400, detail="Unknown or expired session")

    if datetime.now(timezone.utc) > challenge["expires_at"]:
        _challenges.pop(body.session_info, None)
        raise HTTPException(status_code=400, detail="OTP session expired")

    if body.phone_number != challenge["phone_number"]:
        raise HTTPException(status_code=400, detail="Phone number mismatch")

    if body.otp != challenge["otp"]:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    _challenges.pop(body.session_info, None)
    user = UserSummary(
        id=str(uuid4()),
        phone_number=challenge["phone_number"],
        display_name=challenge["display_name"],
    )
    return TokenResponse(access_token=f"stub-{uuid4()}", user=user)
