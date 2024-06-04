import mongoose, {model, Schema} from "mongoose";

const UserMovieStatisticsSchema2 = new Schema({
        // IDs
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        },
        movieId: {
            type: mongoose.Types.ObjectId,
            ref: 'Movie'
        },

        // Likes statistics
        liked: {
            type: Boolean,
            default: false
        },
        // likeDates: {
        //     type: [Date],
        //     default: []
        // },
        // unlikeDates: {
        //     type: [Date],
        //     default: []
        // },

        // Watching statistics
        watchCount: {
            type: Number,
            default: 0
        },
        // watchDates: {
        //     type: [Date],
        //     default: []
        // },
        watchDuration: {
            type: [Number],
            default: []
        },
        watchProgressMinutes: {
            type: Number,
            default: 0
        },

        // Review statistics
        ratings: {
            type: [Number],
            default: []
        },
        reviews: {
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

export default model('UserMovieStatistics2', UserMovieStatisticsSchema2);