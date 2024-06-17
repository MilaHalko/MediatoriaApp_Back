import Review from '../modelsMongo/Review.js';
import Movie from "../modelsMongo/Movie.js";
import User from "../modelsMongo/User.js";
import {getValidUserMovieStatistics} from "./UserMovieStatisticsController.js";

export const getByMovie = async (req, res) => {
    console.log('Getting reviews by movie...')
    try {
        const {movieId} = req.params;
        const reviews = await Review.find({movieId})
            .populate('authorId', 'username')
            .exec();
        console.log('Reviews found:', reviews.length)
        res.json(reviews);
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err.message});
    }
};

export const getOne = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('authorId', 'username')
            .populate('movieId', 'title')
            .exec();
        if (!review) return res.status(404).json({message: 'Review not found'});
        console.log('Review found', review)
        res.json(review);
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err.message});
    }
};

export const create = async (req, res) => {
    console.log('Creating review...')
    const {text, rating, movieId} = req.body;
    try {
        const review = new Review({
            text,
            rating,
            authorId: req.userId,
            movieId,
        });
        let savedReview = await review.save();
        savedReview = await savedReview.populate('authorId', 'username')

        const movie = await Movie.findById(movieId)
        await Movie.findByIdAndUpdate(movieId, {
            $push: {reviewsId: savedReview._id},
            $set: {averageRating: (movie.averageRating * movie.ratingCount + rating) / (movie.ratingCount + 1)},
            $inc: {ratingCount: 1},
        });
        await movie.save();

        const userMovieStatistics = await getValidUserMovieStatistics(req.userId, movie.tmdbId);
        await userMovieStatistics.updateOne({$push: {ratings: rating, reviewsId: savedReview._id}});
        await userMovieStatistics.save();

        console.log('Review created', savedReview)
        res.status(201).json(savedReview);
    } catch (err) {
        console.log(err)
        res.status(400).json({message: err.message});
    }
};

export const remove = async (req, res) => {
    console.log('Removing review...')
    try {
        const reviewId = req.params.id;
        const review = await Review.findById(reviewId)
        console.log('User id:', req.userId)
        const user = await User.findById(req.userId)
        if (review.authorId !== user._id && user.role !== 'admin') {
            return res.status(403).json({message: 'Forbidden'})
        }

        const movie = await Movie.findById(review.movieId)
        await Movie.findByIdAndUpdate(review.movieId, {
            $pull: {reviewsId: reviewId},
            $set: {averageRating: (movie.averageRating * movie.ratingCount - review.rating) / (movie.ratingCount - 1)},
            $inc: {ratingCount: -1}
        })
        await movie.save();

        const userMovieStatistics = await getValidUserMovieStatistics(req.userId, movie.tmdbId);
        await userMovieStatistics.updateOne({$pull: {ratings: review.rating, reviewsId: reviewId}});
        await userMovieStatistics.save();

        await Review.findOneAndDelete({_id: reviewId})
            .then(doc => {
                if (!doc) {
                    return res.status(404).json({message: 'No review found'})
                }
                console.log('Review deleted')
                res.json({message: 'Review deleted'})
            })
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err.message});
    }
}

export const like = async (req, res) => {
    console.log('Liking review...')
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            {$addToSet: {likes: req.userId}},
            {new: true}
        ).populate('authorId', 'username');

        const movie = await Movie.findById(review.movieId)
        const userMovieStatistics = await getValidUserMovieStatistics(req.userId, movie.tmdbId);
        await userMovieStatistics.updateOne({$addToSet: {likedReviews: review._id}});
        await userMovieStatistics.save();

        console.log('Review liked', review)
        res.json(review);
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err.message});
    }
};

export const unlike = async (req, res) => {
    console.log('Unliking review...')
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            {$pull: {likes: req.userId}},
            {new: true}
        ).populate('authorId', 'username');

        const movie = await Movie.findById(review.movieId)
        const userMovieStatistics = await getValidUserMovieStatistics(req.userId, movie.tmdbId);
        await userMovieStatistics.updateOne({$pull: {likedReviews: review._id}});
        await userMovieStatistics.save();

        console.log('Review unliked', review)
        res.json(review);
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err.message});
    }
};
