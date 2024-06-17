import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel

from app.services.ncf_service import get_ncf_recommendations
from app.services.rnn_service import get_rnn_recommendations
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
    user_id = request.user_id
    movies_id = request.movies_id
    recommendations = get_ncf_recommendations(user_id, movies_id)
    print("Recommendations:", recommendations)
    return {"recommendations": recommendations}


@app.post("/recommend/rnn")
async def recommend_rnn(request: Request):
    user_id = request.user_id
    movies_id = request.movies_id
    recommendations = get_rnn_recommendations(user_id, movies_id)
    return recommendations

if __name__ == "__main__":
    uvicorn.run(app, host="192.168.1.127", port=5001)
