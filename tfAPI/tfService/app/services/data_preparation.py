from bson import ObjectId
from pymongo import MongoClient

client = MongoClient('mongodb+srv://admin:mediatoria@mediatoria.r1jt9ou.mongodb.net/db?retryWrites=true&w=majority&appName=Mediatoria')
db = client['db']
print(db.list_collection_names())
users_collection = db['users']
movies_collection = db['movies']
user_movie_statistics_collection = db['usermoviestatistics']
user_movie_statistics_train_collection = db['usermoviestatisticstrains']


def get_tmdb_ids(movies_id):
    tmdb_ids = []
    for movie_id in movies_id:
        movie = movies_collection.find_one({"_id": ObjectId(movie_id)})
        if movie is not None:
            tmdb_ids.append(movie['tmdbId'])
        else:
            print(f'Movie with id {movie_id} not found')
    return tmdb_ids


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
            "liked": 1 if user_statistics['liked'] else 0,
            "unlike_times": len(user_statistics['unlikeDates']),
            "watch_times": len(user_statistics['watchDates']),
            "watch_duration": sum(user_statistics['watchDurationsSec']),
            "average_rating": sum(user_statistics['ratings']) / len(user_statistics['ratings']) if len(user_statistics['ratings']) > 0 else 0,
            "written_reviews_count": len(user_statistics['reviewsId']),
            "liked_reviews_count": len(user_statistics['likedReviews'])
        }
        cleaned_user_statistics.append(cleaned_user_statistic)
    return cleaned_user_statistics


def get_clean_user_statistics(user_id):
    user_statistics = list(user_movie_statistics_collection.find({"userId": ObjectId(user_id)}))
    return clean_user_statistics(user_statistics)


def get_clean_train_data():
    movies = list(movies_collection.find())
    cleaned_movies = clean_movies(movies)

    users_train_statistics = list(user_movie_statistics_train_collection.find())
    cleaned_users_statistics = clean_user_statistics(users_train_statistics)

    return cleaned_movies, cleaned_users_statistics
