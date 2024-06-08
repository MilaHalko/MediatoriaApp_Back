from typing import List
from pydantic import BaseModel
from app.schemas.movie import Movie
from app.schemas.user import User


class RequestNCF(BaseModel):
    user: User
    movies: List[Movie]


class RequestRNN(BaseModel):
    user: User
    movies: List[Movie]