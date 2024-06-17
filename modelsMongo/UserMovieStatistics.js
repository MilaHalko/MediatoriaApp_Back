import mongoose, {model, Schema} from "mongoose";

const UserMovieStatisticsSchema = new Schema({
        // IDs
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        },
        movieId: {
            type: String,
            ref: 'Movie'
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
        watchProgressSec: {
            type: Number,
            default: 0
        },

        // Review statistics
        ratings: {
            type: [Number],
            default: []
        },
        reviewsId: {
            type: [mongoose.Types.ObjectId],
            ref: 'Review',
            default: []
        },
        likedReviews: {
            type: [mongoose.Types.ObjectId],
            ref: 'Review',
            default: []
        },
    }
    , {
        timestamps: true,
    });

export default model('UserMovieStatistics', UserMovieStatisticsSchema);
