import tensorflow as tf
import pandas as pd
import numpy as np
from app.services.data_preparation import get_clean_user_statistics, get_tmdb_ids, get_clean_movies

MODEL_PATH = 'models/ncf_model/'


def get_ncf_recommendations(user_id, MDB_movies_id):
    print('User:', user_id)
    model = load_ncf_model()
    if model is None:
        return {"message": "Error loading NCF model"}

    clean_user_statistics = get_clean_user_statistics(user_id)
    clean_movies = get_clean_movies(MDB_movies_id)

    print("Clean user statistics for user {}: {}".format(user_id, clean_user_statistics))
    print("Clean movies for user {}: {}".format(user_id, clean_movies))

    users_df = pd.DataFrame(clean_user_statistics)
    movies_df = pd.DataFrame(clean_movies)

    users_df['user_id'] = users_df['user_id'].astype('category').cat.codes
    print('Encoded Users DataFrame:', users_df)

    original_movie_ids = movies_df['movie_id']
    movies_df['movie_id'] = movies_df['movie_id'].astype('category').cat.codes
    print('Encoded Movies DataFrame:', movies_df)

    user_id_encoded = users_df['user_id'].unique()[0]
    movie_ids_encoded = movies_df['movie_id'].values
    print('Encoded User ID:', user_id_encoded)
    print('Encoded Movie IDs:', movie_ids_encoded)

    user_ids_encoded = np.array([user_id_encoded] * len(movie_ids_encoded), dtype=np.int32)
    predictions = model.predict([user_ids_encoded, movie_ids_encoded])
    summed_scores = predictions.sum(axis=1)
    movie_scores = list(zip(original_movie_ids.tolist(), summed_scores.tolist()))
    print('Raw Predictions:', predictions)
    print('Summed Predictions:', movie_scores)

    sorted_predictions = sorted(movie_scores, key=lambda x: x[1], reverse=True)
    sorted_movies_id = [movie[0] for movie in sorted_predictions]
    print('Sorted Movie IDs:', sorted_movies_id)

    recommendations = {
        'sorted_movies_id': sorted_movies_id,
        'predictions': [(movie[0], float(movie[1])) for movie in sorted_predictions],  # Convert to float
        'initial_movies_id': original_movie_ids.tolist(),
    }

    return recommendations


def load_ncf_model():
    try:
        model = tf.keras.models.load_model(f"{MODEL_PATH}.keras")
        print('NCF model loaded successfully')
        return model
    except Exception as e:
        print('Error loading NCF model:', e)
        return None


def save_ncf_model(model):
    try:
        model.save(f"{MODEL_PATH}.keras")
        print('NCF model saved successfully')
    except Exception as e:
        print('Error saving NCF model:', e)

