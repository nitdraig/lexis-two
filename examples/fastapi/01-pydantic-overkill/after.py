from fastapi import FastAPI
from pydantic import BaseModel, EmailStr

app = FastAPI()


# lexis: one model per endpoint — split nested DTOs when a second route reuses them
class CreateUserPayload(BaseModel):
    name: str
    email: EmailStr


@app.post("/users")
def create_user(payload: CreateUserPayload):
    return {
        "id": "u_1",
        "name": payload.name.strip(),
        "email": payload.email,
    }
