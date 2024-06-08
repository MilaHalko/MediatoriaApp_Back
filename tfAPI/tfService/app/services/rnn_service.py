from app.models.rnn_model import load_rnn_model, predict_rnn
from app.schemas.user import User
from app.schemas.movie import Movie
from typing import List

def get_rnn_recommendations(user: User, movies: List[Movie]):
    model = load_rnn_model()
    if model is None:
        return {"message": "Error loading RNN model"}
    return predict_rnn(model, user, movies)
