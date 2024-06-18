import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from app.models.ncf_personalisation import get_ncf_recommendations
from app.models.rnn_personalisation import train_rnn_model
from app.services.ncf_train import train_ncf_model
from app.services.rnn_train import get_rnn_recommendations
app = FastAPI()


@app.get("/")
async def root():
    print("Hello Python")
    return {"message": "Hello Python"}


class Request(BaseModel):
    user_id: str
    movies_id: list


@app.post("/recommend/ncf")
async def recommend_ncf(request: Request):
    recommendations = get_ncf_recommendations(request.user_id, request.movies_id)
    return {"recommendations": recommendations}

@app.post("/recommend/rnn")
async def recommend_rnn(request: Request):
    recommendations = get_rnn_recommendations(request.user_id, request.movies_id)
    # return recommendations
    return {"message": "Recommend rnn"}

@app.get("/train/ncf")
async def train():
    print("Training ncf model")
    train_ncf_model()
    return {"message": "Training completed"}


@app.get("/train/rnn")
async def train():
    train_rnn_model()
    return {"message": "Training completed"}


if __name__ == "__main__":
    uvicorn.run(app, host="192.168.1.127", port=5001)
