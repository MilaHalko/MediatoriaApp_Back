import {Schema, model} from "mongoose";

const UserSchema = new Schema({
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        passwordHash: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: 'user',
            enum: ['user', 'admin']
        },
        favoriteMovies: {
            type: [String],
            ref: 'Movie',
            default: []
        },
        refreshToken: {
            type: String
        },
    }, {
        timestamps: true,
    },
)

export default model('User', UserSchema)