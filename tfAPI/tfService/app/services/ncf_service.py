from app.models.ncf_model import load_ncf_model, get_ncf_model, save_ncf_model
from app.services.data_preparation import get_clean_train_data, get_clean_user_statistics, get_clean_movies
import pandas as pd


def get_ncf_recommendations(user_id, movies_id):
    model = load_ncf_model()
    if model is None:
        return {"message": "Error loading NCF model"}

    clean_user_statistics = get_clean_user_statistics(user_id)
    user_statistics_df = pd.DataFrame(clean_user_statistics)

    predictions = []
    for movie_id in movies_id:
        prediction = model.predict([user_statistics_df['user_id'].values, [movie_id] * len(user_statistics_df)])
        predictions.append((movie_id, prediction.mean()))

    sorted_predictions = sorted(predictions, key=lambda x: x[1], reverse=True)
    sorted_movies_id = [movie[0] for movie in sorted_predictions]
    return sorted_movies_id


def train_ncf_model():
    movies, users_statistics = get_clean_train_data()
    movies_df = pd.DataFrame(movies)
    users_statistics_df = pd.DataFrame(users_statistics)

    num_users = users_statistics_df['user_id'].nunique()
    num_movies = movies_df['movie_id'].nunique()

    model = get_ncf_model(num_users, num_movies)
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    train, test = train_test_split(df_users, test_size=0.2, random_state=42)

    train_user_input = train['user_id'].values
    train_movie_input = train['movie_id'].values
    train_labels = train['liked'].values

    test_user_input = test['user_id'].values
    test_movie_input = test['movie_id'].values
    test_labels = test['liked'].values

    model.fit(
        [train_user_input, train_movie_input],
        train_labels,
        batch_size=32,
        epochs=5,
        validation_data=([test_user_input, test_movie_input], test_labels)
    )

    save_ncf_model(model)


