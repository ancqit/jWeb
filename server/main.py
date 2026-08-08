from datetime import datetime, timedelta, timezone
from typing import Dict
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="jWeb Auth API",
    description="OTP auth stub for the Angular frontend. Connect the UI when ready.",
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
    name: str = Field(min_length=1)
    mobileNumber: str = Field(min_length=10, max_length=15)
    city: str = "Ranchi"
    locality: str = "Main Road"


class OtpRequestResponse(BaseModel):
    challengeId: str
    expiresInSeconds: int


class OtpVerifyRequest(BaseModel):
    challengeId: str
    otp: str


class AuthUser(BaseModel):
    id: str
    name: str
    mobileNumber: str
    city: str
    locality: str


class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: str
    expiresInSeconds: int
    user: AuthUser | None = None


class RefreshRequest(BaseModel):
    refreshToken: str


# In-memory stub store — replace with real persistence later.
_challenges: Dict[str, dict] = {}
_refresh_tokens: Dict[str, dict] = {}


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/auth/otp/request", response_model=OtpRequestResponse)
def request_otp(body: OtpRequest) -> OtpRequestResponse:
    challenge_id = f"otp-{uuid4()}"
    _challenges[challenge_id] = {
        "name": body.name.strip(),
        "mobileNumber": body.mobileNumber.strip(),
        "city": body.city,
        "locality": body.locality,
        "otp": "123456",  # stub OTP for local development
        "expires_at": datetime.now(timezone.utc) + timedelta(seconds=300),
    }
    return OtpRequestResponse(challengeId=challenge_id, expiresInSeconds=300)


@app.post("/auth/otp/verify", response_model=TokenResponse)
def verify_otp(body: OtpVerifyRequest) -> TokenResponse:
    challenge = _challenges.get(body.challengeId)
    if not challenge:
        raise HTTPException(status_code=400, detail="Unknown or expired challenge")

    if datetime.now(timezone.utc) > challenge["expires_at"]:
        _challenges.pop(body.challengeId, None)
        raise HTTPException(status_code=400, detail="Challenge expired")

    if body.otp != challenge["otp"]:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    _challenges.pop(body.challengeId, None)

    user = AuthUser(
        id=str(uuid4()),
        name=challenge["name"],
        mobileNumber=challenge["mobileNumber"],
        city=challenge["city"],
        locality=challenge["locality"],
    )
    access_token = f"access-{uuid4()}"
    refresh_token = f"refresh-{uuid4()}"
    _refresh_tokens[refresh_token] = {"user": user.model_dump()}

    return TokenResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        expiresInSeconds=3600,
        user=user,
    )


@app.post("/auth/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest) -> TokenResponse:
    stored = _refresh_tokens.get(body.refreshToken)
    if not stored:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    access_token = f"access-{uuid4()}"
    refresh_token = f"refresh-{uuid4()}"
    user = AuthUser(**stored["user"])
    _refresh_tokens.pop(body.refreshToken, None)
    _refresh_tokens[refresh_token] = {"user": user.model_dump()}

    return TokenResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        expiresInSeconds=3600,
        user=user,
    )
