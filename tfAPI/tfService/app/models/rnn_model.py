import tensorflow as tf

MODEL_PATH = 'models/rnn_model/'

def load_rnn_model():
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print('RNN model loaded successfully')
        return model
    except Exception as e:
        print('Error loading RNN model:', e)
        return None

def save_rnn_model(model):
    try:
        model.save(MODEL_PATH)
        print('RNN model saved successfully')
    except Exception as e:
        print('Error saving model:', e)

def train_rnn_model(sequential_data):
    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(64, return_sequences=False, input_shape=(sequential_data.inputs.shape[1], sequential_data.inputs.shape[2])),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    model.fit(sequential_data.inputs, sequential_data.labels, epochs=10, batch_size=32, validation_split=0.2)
    save_rnn_model(model)
    return model

def predict_rnn(model, user, movies):
    sequential_data = get_sequential_data(user)
    predictions = model.predict(sequential_data.inputs)
    return [{"movie": movies[i], "score": predictions[i]} for i in range(len(movies))]

def get_sequential_data(user):
    # Placeholder implementation
    return {
        "inputs": tf.convert_to_tensor([[[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]]),
        "labels": tf.convert_to_tensor([1])
    }
