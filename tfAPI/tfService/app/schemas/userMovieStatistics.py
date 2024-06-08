from typing import List

from pydantic import BaseModel


class UserMovieStatistics(BaseModel):
    userId: str
    movieId: str
    liked: bool
    likeDates: List[str]
    unlikeDates: List[str]
    watchCount: int
    watchDates: List[str]
    watchDuration: List[int]
    watchProgressMinutes: int
    ratings: List[int]
    reviews: List[str]
    likedReviews: List[str]
