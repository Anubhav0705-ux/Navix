from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=3, max_length=100, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(..., min_length=8, max_length=128)
    hp_field: Optional[str] = None  # Lightweight anti-bot honeypot


class UserLoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=1, max_length=128)
    hp_field: Optional[str] = None  # Lightweight anti-bot honeypot


class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    must_change_password: bool = False


class ForgotPasswordRequest(BaseModel):
    identifier: str = Field(..., min_length=3, max_length=100, description="Email or Username")
    hp_field: Optional[str] = None  # Lightweight anti-bot honeypot


class SetNewPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)


class DeleteAccountRequest(BaseModel):
    password: str = Field(..., min_length=1)
    confirmation_text: str = Field(..., description="Must type 'DELETE' in uppercase")


class GenericMessageResponse(BaseModel):
    message: str


class PasswordResetAdminView(BaseModel):
    request_id: str
    user_id: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    requested_at: str
    status: str
    reviewed_at: Optional[str] = None
    reviewed_by_admin_id: Optional[str] = None
    temporary_password_expires_at: Optional[str] = None
    completed_at: Optional[str] = None


class ApproveResetResponse(BaseModel):
    request_id: str
    status: str
    temporary_password: str
    expires_at: str
    message: str
