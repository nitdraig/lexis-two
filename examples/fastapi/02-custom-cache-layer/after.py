from time import time

from fastapi import FastAPI

app = FastAPI()

# lexis: in-memory Map + TTL — Redis when multi-process or multi-host sharing is required
_cache: dict[str, tuple[float, dict]] = {}
TTL_SECONDS = 60


def load_user(user_id: str) -> dict:
    now = time()
    entry = _cache.get(user_id)
    if entry and now - entry[0] < TTL_SECONDS:
        return entry[1]

    user = {"id": user_id, "name": "Ada"}
    _cache[user_id] = (now, user)
    return user


@app.get("/users/{user_id}")
def read_user(user_id: str):
    return load_user(user_id)
