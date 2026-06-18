from datetime import datetime

from fastapi import FastAPI
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

app = FastAPI()


class UserEmailField(BaseModel):
    address: EmailStr
    verified: bool = False


class UserCreateMeta(BaseModel):
    source: str = Field(default="web", pattern="^(web|api|invite)$")
    invited_by: str | None = None


class CreateUserRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: UserEmailField
    meta: UserCreateMeta = UserCreateMeta()

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        return value.strip()

    @model_validator(mode="after")
    def enforce_api_rules(self) -> "CreateUserRequest":
        if self.meta.source == "api" and not self.email.verified:
            raise ValueError("API signups require a verified email")
        return self


class CreateUserResponse(BaseModel):
    id: str
    name: str
    email: str
    source: str
    created_at: datetime


@app.post("/users", response_model=CreateUserResponse)
def create_user(payload: CreateUserRequest) -> CreateUserResponse:
    return CreateUserResponse(
        id="u_1",
        name=payload.name,
        email=payload.email.address,
        source=payload.meta.source,
        created_at=datetime.utcnow(),
    )
