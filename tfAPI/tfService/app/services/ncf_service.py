from app.models.ncf_model import load_ncf_model, predict_ncf
from app.schemas.user import User
from app.schemas.movie import Movie
from typing import List

def get_ncf_recommendations(user: User, movies: List[Movie]):
    model = load_ncf_model()
    if model is None:
        return {"message": "Error loading NCF model"}
    return predict_ncf(model, user, movies)
