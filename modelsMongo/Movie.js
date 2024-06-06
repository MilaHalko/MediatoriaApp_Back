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
    },
    overview: {
        type: String,
    },
    imgUrl: {
        type: String,
    },
    popularity: {
        type: Number,
        required: true
    },
    youTubeKey: {
        type: String,
    },

    ratingCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true,
});

export default model('Movie', MovieSchema);