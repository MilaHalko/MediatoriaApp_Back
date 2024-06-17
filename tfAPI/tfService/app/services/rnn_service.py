from app.models.rnn_model import load_rnn_model, predict_rnn
from typing import List


def get_rnn_recommendations(user_id: str, movies_id: List[str]):
    model = load_rnn_model()
    if model is None:
        return {"message": "Error loading RNN model"}
    return {"message": "Recommendations rnn not implemented yet"}
