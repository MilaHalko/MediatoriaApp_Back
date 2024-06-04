import mongoose, {model, Schema} from "mongoose";

const MovieSchema = new Schema({
    tmdbId: {
        type: String,
        required: true
    },
    reviewsId: {
        type: [mongoose.Types.ObjectId],
        ref: 'Review',
        default: []
    },

    title: {
        type: String,
        required: true
    },
    genres: {
        type: [{'id': Number, 'name': String}],
        required: true
    },
    releaseDate: {
        type: Date,
        required: true
    },
    overview: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: true
    },
    popularity: {
        type: Number,
        required: true
    },
    youTubeKey: {
        type: String,
    },

    ratingCount: {
        type: [Number],
        required: true
    },
    averageRating: {
        type: Number,
        required: true
    },
}, {
    timestamps: true,
});

export default model('Movie', MovieSchema);