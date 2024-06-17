from bson import ObjectId
from pymongo import MongoClient

client = MongoClient('mongodb+srv://admin:mediatoria@mediatoria.r1jt9ou.mongodb.net/db?retryWrites=true&w=majority&appName=Mediatoria')
db = client['db']
users_collection = db['users']
movies_collection = db['movies']
user_movie_statistics_collection = db['usermoviestatistics']

def clean_movies(movies):
    cleaned_movies = []
    for movie in movies:
        cleaned_movie = {
            "movie_id": str(movie['tmdbId']),
            "reviews_count": len(movie['reviewsId']),
            "genres": [genre['name'] for genre in movie['genres']],
            "popularity": movie['popularity'],
            "rating_count": movie['ratingCount'],
            "average_rating": movie['averageRating']
        }
        cleaned_movies.append(cleaned_movie)
    return cleaned_movies


def get_clean_movies(movies_ids):
    movies = []
    for movie_id in movies_ids:
        movie = movies_collection.find_one({"_id": ObjectId(movie_id)})
        if movie is not None:
            movies.append(movie)
        else:
            print(f'Movie with id {movie_id} not found')
    return clean_movies(movies)


def clean_user_statistics(users_statistics):
    cleaned_user_statistics = []
    for user_statistics in users_statistics:
        cleaned_user_statistic = {
            "id": str(user_statistics['_id']),
            "user_id": str(user_statistics['userId']),
            "movie_id": user_statistics['movieId'],
            "liked": user_statistics['liked'],
            "unlike_times": len(user_statistics['unlikeDates']),
            "watch_times": len(user_statistics['watchDates']),
            "watch_duration": sum(user_statistics['watchDurationsSec']),
            "average_rating": sum(user_statistics['ratings']) / len(user_statistics['ratings']) if len(user_statistics['ratings']) > 0 else 0,
            "written_reviews_count": len(user_statistics['reviewsId']),
            "liked_reviews_count": len(user_statistics['likedReviews'])
        }
        cleaned_user_statistic['liked'] = 1 if cleaned_user_statistic['liked'] else 0
        cleaned_user_statistics.append(cleaned_user_statistic)
    return cleaned_user_statistics


def get_clean_user_statistics(user_id):
    user_statistics = list(user_movie_statistics_collection.find({"userId": ObjectId(user_id)}))
    return clean_user_statistics(user_statistics)


def get_clean_train_data():
    movies = list(movies_collection.find())
    cleaned_movies = clean_movies(movies)

    cleaned_users_statistics = []
    for user in users_collection.find():
        user_statistics = list(user_movie_statistics_collection.find({"userId": user['_id']}))
        if len(user_statistics) > 0:
            cleaned_users_statistics.append(clean_user_statistics(user_statistics))

    return cleaned_movies, cleaned_users_statistics