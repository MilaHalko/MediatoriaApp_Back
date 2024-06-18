from keras import Input, Model
from keras.src.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from keras.src.layers import Embedding, Flatten, Concatenate, Dense, LeakyReLU, Dropout, BatchNormalization
from keras.src.optimizers import Adam
from keras.src.regularizers import L2
from keras.src.saving import register_keras_serializable
from sklearn.utils import resample
from imblearn.over_sampling import SMOTE
from app.models.ncf_personalisation import save_ncf_model
from app.services.data_preparation import get_clean_train_data
from sklearn.model_selection import train_test_split
import pandas as pd
import tensorflow as tf


@register_keras_serializable(package="Custom", name="custom_loss")
def custom_loss(y_true, y_pred):
    liked_loss = tf.keras.losses.BinaryCrossentropy()(y_true[:, 0], y_pred[:, 0])
    unlike_times_loss = tf.keras.losses.MeanSquaredError()(y_true[:, 1], y_pred[:, 1])
    watch_duration_loss = tf.keras.losses.MeanSquaredError()(y_true[:, 2], y_pred[:, 2])
    average_rating_loss = tf.keras.losses.MeanSquaredError()(y_true[:, 3], y_pred[:, 3])
    written_reviews_count_loss = tf.keras.losses.MeanSquaredError()(y_true[:, 4], y_pred[:, 4])

    summed_loss = (
        liked_loss * 0.4 +
        unlike_times_loss * 0.2 +
        watch_duration_loss * 0.2 +
        average_rating_loss * 0.1 +
        written_reviews_count_loss * 0.1
    )

    return summed_loss


def analyze_user_interactions(users_statistics):
    interaction_counts = pd.DataFrame(users_statistics)['user_id'].value_counts()
    print('User interactions count:', interaction_counts.describe())


def balance_data(data):
    liked = data[data['liked'] == 1]
    unliked = data[data['liked'] == 0]

    unliked_upsampled = resample(unliked, replace=True, n_samples=len(liked), random_state=42)
    balanced_data = pd.concat([liked, unliked_upsampled])

    return balanced_data


def balance_with_smote(x, y):
    smote = SMOTE(random_state=42)
    x_resampled, y_resampled = smote.fit_resample(x, y)
    return x_resampled, y_resampled


def get_enhanced_ncf_model(num_users, num_movies):
    user_input = Input(shape=(1,), dtype='int32', name='user_input')
    movie_input = Input(shape=(1,), dtype='int32', name='movie_input')

    user_embedding = Embedding(input_dim=num_users, output_dim=128, embeddings_regularizer=L2(0.05),
                               name='user_embedding')(user_input)
    movie_embedding = Embedding(input_dim=num_movies, output_dim=128, embeddings_regularizer=L2(0.05),
                                name='movie_embedding')(movie_input)

    user_vector = Flatten()(user_embedding)
    movie_vector = Flatten()(movie_embedding)
    concat = Concatenate()([user_vector, movie_vector])

    dense_1 = Dense(256, kernel_regularizer=L2(0.05))(concat)
    leaky_relu_1 = LeakyReLU()(dense_1)
    dropout_1 = Dropout(0.5)(leaky_relu_1)
    batch_norm_1 = BatchNormalization()(dropout_1)

    dense_2 = Dense(128, kernel_regularizer=L2(0.05))(batch_norm_1)
    leaky_relu_2 = LeakyReLU()(dense_2)
    dropout_2 = Dropout(0.5)(leaky_relu_2)
    batch_norm_2 = BatchNormalization()(dropout_2)

    dense_3 = Dense(64, kernel_regularizer=L2(0.05))(batch_norm_2)
    leaky_relu_3 = LeakyReLU()(dense_3)
    dropout_3 = Dropout(0.5)(leaky_relu_3)
    batch_norm_3 = BatchNormalization()(dropout_3)

    dense_4 = Dense(32, kernel_regularizer=L2(0.05))(batch_norm_3)
    leaky_relu_4 = LeakyReLU()(dense_4)
    dropout_4 = Dropout(0.5)(leaky_relu_4)
    batch_norm_4 = BatchNormalization()(dropout_4)

    output = Dense(5, activation='linear')(batch_norm_4)

    model = Model(inputs=[user_input, movie_input], outputs=output)
    return model


def train_ncf_model():
    movies, users_statistics = get_clean_train_data()
    print('Number of movies:', len(movies), '\tNumber of user statistics:', len(users_statistics))
    print('First movie:', movies[0])
    print('First user statistics:', users_statistics[0])

    analyze_user_interactions(users_statistics)

    movies_df = pd.DataFrame(movies)
    users_statistics_df = pd.DataFrame(users_statistics)
    users_statistics_df = balance_data(users_statistics_df)

    users_statistics_df['user_id'] = users_statistics_df['user_id'].astype('category').cat.codes
    users_statistics_df['movie_id'] = users_statistics_df['movie_id'].astype('category').cat.codes
    num_users = users_statistics_df['user_id'].nunique()
    num_movies = movies_df['movie_id'].nunique()
    print('Unique encoded users:', num_users, 'Unique encoded movies:', num_movies)

    model = get_enhanced_ncf_model(num_users, num_movies)
    model.compile(optimizer=Adam(learning_rate=1e-3), loss=custom_loss, metrics=['accuracy'])

    train, test = train_test_split(users_statistics_df, test_size=0.2, random_state=42)

    train_user_input = train['user_id'].values
    train_movie_input = train['movie_id'].values
    train_labels = train[['liked', 'unlike_times', 'watch_duration', 'average_rating', 'written_reviews_count']].values

    test_user_input = test['user_id'].values
    test_movie_input = test['movie_id'].values
    test_labels = test[['liked', 'unlike_times', 'watch_duration', 'average_rating', 'written_reviews_count']].values

    early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
    model_checkpoint = ModelCheckpoint('models/ncf_model/best_model.keras', monitor='val_loss', save_best_only=True)
    reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=5, min_lr=0.00001)

    history = model.fit(
        [train_user_input, train_movie_input],
        train_labels,
        batch_size=64,
        epochs=100,
        validation_data=([test_user_input, test_movie_input], test_labels),
        callbacks=[early_stopping, model_checkpoint, reduce_lr]
    )

    print('History:')
    for epoch, acc, val_acc, loss, val_loss in zip(history.epoch, history.history['accuracy'], history.history['val_accuracy'], history.history['loss'], history.history['val_loss']):
        print(f'Epoch {epoch + 1}: accuracy = {acc:.4f}, validation accuracy = {val_acc:.4f}, loss = {loss:.4f}, validation loss = {val_loss:.4f}')

    save_ncf_model(model)

    return history

# Epoch 60: accuracy = 0.5181, validation accuracy = 0.5091, loss = 901.7576, validation loss = 6242.2222
