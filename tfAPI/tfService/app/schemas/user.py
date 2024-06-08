from pydantic import BaseModel
from typing import List


class User(BaseModel):
    _id: str
    username: str
    email: str
    passwordHash: str
    role: str
    favoriteMovies: List[str]
    createdAt: str
    updatedAt: str
    refreshToken: str
