import tensorflow as tf


def load_model(model_path):
    try:
        model = tf.keras.models.load_model(model_path)
        print(f'Model loaded from {model_path}')
        return model
    except Exception as e:
        print(f'Error loading model from {model_path}:', e)
        return None


def save_model(model, model_path):
    try:
        model.save(model_path)
        print(f'Model saved to {model_path}')
    except Exception as e:
        print(f'Error saving model to {model_path}:', e)
