import mongoose, {model, Schema} from "mongoose";

const ReviewSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    likes: {
        type: [mongoose.Types.ObjectId],
        ref: 'User',
        default: []
    },
    authorId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movieId: {
        type: mongoose.Types.ObjectId,
        ref: 'Movie',
        required: true
    }
}, {
    timestamps: true,
});

ReviewSchema.index({ authorId: 1 });

export default model('Review', ReviewSchema);
