import uvicorn
from fastapi import FastAPI
from pymongo import MongoClient
from app.schemas.request_data import RequestNCF, RequestRNN
from app.services.ncf_service import get_ncf_recommendations
from app.services.rnn_service import get_rnn_recommendations
from app.schemas.user import User

app = FastAPI()
client = MongoClient('mongodb+srv://admin:mediatoria@mediatoria.r1jt9ou.mongodb.net/db?retryWrites=true&w=majority&appName=Mediatoria')
db = client['db']
users_collection = db['users']

def get_all_users():
    users = users_collection.find()
    return [User(**user) for user in users]

# test app
@app.get("/")
async def root():
    print("Hello Python")
    return {"message": "Hello Python"}

@app.post("/recommend/ncf")
async def recommend_ncf(data: RequestNCF):
    user = data.user
    movies = data.movies
    users = get_all_users()
    if user not in users:
        return {"message": "User not found"}
    recommendations = get_ncf_recommendations(user, movies)
    return recommendations

@app.post("/recommend/rnn")
async def recommend_rnn(data: RequestRNN):
    user = data.user
    movies = data.movies
    recommendations = get_rnn_recommendations(user, movies)
    return recommendations

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
