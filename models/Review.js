import mongoose, {model, Schema} from "mongoose";

const ReviewSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
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
        type: String,
        required: true
    }
}, {
    timestamps: true,
});

ReviewSchema.index({ authorId: 1 });

export default model('Review', ReviewSchema);