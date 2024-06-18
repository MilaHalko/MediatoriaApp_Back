import mongoose, {model, Schema} from "mongoose";

const UserMovieStatisticsTrainSchema = new Schema({
        // IDs
        userId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        movieId: {
            type: String
        },

        // Likes statistics
        liked: {
            type: Boolean,
            default: false
        },
        likeDates: {
            type: [Date],
            default: []
        },
        unlikeDates: {
            type: [Date],
            default: []
        },

        // Watching statistics
        watchDates: {
            type: [Date],
            default: []
        },
        watchDurationsSec: {
            type: [Number],
            default: []
        },

        // Review statistics
        ratings: {
            type: [Number],
            default: []
        },
        reviewsId: {
            type: [mongoose.Types.ObjectId],
            default: []
        },
        likedReviews: {
            type: [mongoose.Types.ObjectId],
            default: []
        },
    }
    , {
        timestamps: true,
    });

export default model('UserMovieStatisticsTrain', UserMovieStatisticsTrainSchema);
