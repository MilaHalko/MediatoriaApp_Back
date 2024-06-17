import tensorflow as tf

MODEL_PATH = 'models/ncf_model/'


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


def get_ncf_model(user_statistics, movies):
    # TODO: Implement NCF model
    return model
