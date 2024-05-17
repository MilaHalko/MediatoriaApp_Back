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
        avatarUrl: {
            type: String
        },
        role: {
            type: String,
            default: 'user',
            enum: ['user', 'admin']
        },
        favoriteMovies: {
            type: Array,
            default: []
        }
    }, {
        timestamps: true,
    },
)

export default model('User', UserSchema)