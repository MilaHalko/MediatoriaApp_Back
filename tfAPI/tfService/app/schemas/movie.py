from pydantic import BaseModel
from typing import List


class Genre(BaseModel):
    id: int
    name: str
    _id: str


class Movie(BaseModel):
    _id: str
    tmdbId: str
    reviewsId: List[str]
    title: str
    genres: List[Genre]
    releaseDate: str
    overview: str
    imgUrl: str
    popularity: float
    youTubeKey: str
    ratingCount: List[int]
    averageRating: float
    createdAt: str
    updatedAt: str