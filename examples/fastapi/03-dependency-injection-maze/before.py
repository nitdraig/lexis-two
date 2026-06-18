from fastapi import Depends, FastAPI

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


def get_db():
    yield object()


def get_user_repository(_db=Depends(get_db)) -> UserRepository:
    return UserRepository()


def get_notification_repository(_db=Depends(get_db)) -> NotificationRepository:
    return NotificationRepository()


def get_user_service(
    users: UserRepository = Depends(get_user_repository),
    notifications: NotificationRepository = Depends(get_notification_repository),
) -> UserService:
    return UserService(users, notifications)


@app.get("/users/{user_id}")
def read_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
):
    return user_service.profile(user_id)
