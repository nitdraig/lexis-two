import json
from functools import wraps

import redis
from fastapi import FastAPI

app = FastAPI()


class RedisCache:
    def __init__(self, url: str, namespace: str) -> None:
        self.client = redis.Redis.from_url(url, decode_responses=True)
        self.namespace = namespace

    def key(self, *parts: str) -> str:
        return ":".join([self.namespace, *parts])

    def get(self, key: str) -> dict | None:
        raw = self.client.get(key)
        return json.loads(raw) if raw else None

    def set(self, key: str, value: dict, ttl_seconds: int = 300) -> None:
        self.client.setex(key, ttl_seconds, json.dumps(value))

    def cached(self, ttl_seconds: int = 300):
        def decorator(fn):
            @wraps(fn)
            def wrapper(*args, **kwargs):
                cache_key = self.key(fn.__name__, str(args), str(sorted(kwargs.items())))
                hit = self.get(cache_key)
                if hit is not None:
                    return hit
                result = fn(*args, **kwargs)
                self.set(cache_key, result, ttl_seconds)
                return result

            return wrapper

        return decorator


cache = RedisCache(url="redis://localhost:6379/0", namespace="users")


@cache.cached(ttl_seconds=60)
def load_user(user_id: str) -> dict:
    return {"id": user_id, "name": "Ada"}


@app.get("/users/{user_id}")
def read_user(user_id: str):
    return load_user(user_id)
