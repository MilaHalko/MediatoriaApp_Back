import tensorflow as tf

MODEL_PATH = 'models/ncf_model/'

def train_ncf_model(user_features, movie_features, labels):
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu', input_shape=(user_features.shape[1] + movie_features.shape[1],)),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    input_data = tf.concat([user_features, movie_features], axis=1)
    model.fit(input_data, labels, epochs=10, batch_size=32, validation_split=0.2)
    save_ncf_model(model)
    return model

def predict_ncf(model, user, movies):
    user_features = get_user_features(user)
    movie_features = get_movie_features(movies)
    input_data = tf.concat([tf.tile(user_features, [len(movies), 1]), movie_features], axis=1)
    predictions = model.predict(input_data)
    return [{"movie": movies[i], "score": predictions[i]} for i in range(len(movies))]

def get_user_features(user):
    return tf.convert_to_tensor([[user.watchCount, len(user.likeDates), user.watchProgressMinutes]])

def get_movie_features(movies):
    return tf.convert_to_tensor([[movie.popularity, movie.averageRating, len(movie.genres)] for movie in movies])

def load_ncf_model():
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print('NCF model loaded successfully')
        return model
    except Exception as e:
        print('Error loading NCF model:', e)
        return None

def save_ncf_model(model):
    try:
        model.save(MODEL_PATH)
        print('NCF model saved successfully')
    except Exception as e:
        print('Error saving NCF model:', e)
