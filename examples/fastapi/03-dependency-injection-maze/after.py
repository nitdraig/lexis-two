from fastapi import FastAPI

app = FastAPI()


class UserRepository:
    def get(self, user_id: str) -> dict:
        return {"id": user_id, "name": "Ada"}


class NotificationRepository:
    def unread_count(self, user_id: str) -> int:
        return 2


class UserService:
    def __init__(self, users: UserRepository, notifications: NotificationRepository) -> None:
        self.users = users
        self.notifications = notifications

    def profile(self, user_id: str) -> dict:
        user = self.users.get(user_id)
        return {**user, "unread": self.notifications.unread_count(user_id)}


# lexis: plain wiring — Depends chains for two repos is ceremony without a third consumer
user_service = UserService(UserRepository(), NotificationRepository())


@app.get("/users/{user_id}")
def read_user(user_id: str):
    return user_service.profile(user_id)
