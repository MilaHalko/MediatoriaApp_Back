// Server Constants
export const PORT= 5000

// Auth Constants
export const TOKEN_EXPIRES_IN= '1d'
export const SALT_ROUNDS = 10
export const VALIDATION_PARAMS = {
    username: {
        minLength: 4,
        maxLength: 20
    },
    password: {
        minLength: 6,
        maxLength: 20
    },
    review: {
        text: {
            minLength: 3
        },
        rating: {
            min: 1,
            max: 10
        }
    }
}


// Image Constants
export const ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif']
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']
export const ALLOWED_IMAGE_SIZE_MB = 5