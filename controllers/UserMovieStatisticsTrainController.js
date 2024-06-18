import mongoose from "mongoose";
import UserMovieStatisticsTrain from "../modelsMongo/UserMovieStatisticsTrain.js";
import Movie from "../modelsMongo/Movie.js";

const NUMBER_OF_USERS = 100;
const AVERAGE_NUMBER_OF_STATISTICS = 50;

export const generateUserMovieStatisticsTrain = async (req, res) => {
    const movies = await Movie.find();
    const moviesIds = movies.map(movie => movie.tmdbId);
    let promises = [];
    for (let i = 0; i < NUMBER_OF_USERS; i++) {
        promises.push(generateCurrentUserMovieStatisticsTrain(new mongoose.Types.ObjectId(), moviesIds, i));
    }
    try {
        await Promise.all(promises);
        res.json({message: 'User movie statistics train generated'});
    } catch (error) {
        console.error('Error creating user movie statistics:', error);
        res.status(500).json({message: 'Error creating user movie statistics'});
    }
}


const generateCurrentUserMovieStatisticsTrain = async (userId, moviesId, index) => {
    const numberOfStatistics = Math.floor(Math.random() * AVERAGE_NUMBER_OF_STATISTICS) + 1;
    console.log(index + 1, 'Generating statistics:', numberOfStatistics)

    let selectedMovies = [];
    for (let i = 0; i < numberOfStatistics; i++) {
        const selectedMovieId = moviesId[Math.floor(Math.random() * moviesId.length)];
        selectedMovies.push(selectedMovieId);
    }
    let promises = [];
    for (let i = 0; i < numberOfStatistics; i++) {
        promises.push(createUserMovieStatisticsTrain(userId, selectedMovies[i]));
    }
    try {
        await Promise.all(promises);
    } catch (error) {
        console.error('Error creating user movie statistics:', error);
        throw error;
    }
}

const createUserMovieStatisticsTrain = async (userId, movieId) => {
    const liked = Math.random() > 0.3;
    const likeWasPressedAnyTime = liked || Math.random() > 0.5;
    let likeDatesNumber = 0;
    let unlikeDatesNumber = 0;
    if (likeWasPressedAnyTime) {
        likeDatesNumber = Math.floor(Math.random() * 5) + 1;
        unlikeDatesNumber = liked ? likeDatesNumber - 1 : likeDatesNumber;
    }

    const watchedAnyTime = Math.random() > 0.5;
    const watchTimesNumber = watchedAnyTime ? Math.floor(Math.random() * 5) + 1 : 0;

    const reviewedAnyTime = Math.random() > 0.5;
    const reviewsNumber = reviewedAnyTime ? Math.floor(Math.random() * 3) + 1 : 0;
    const averageRating = Math.floor(Math.random() * 9) + 1;

    const likedReviewsAnyTime = Math.random() > 0.5;
    const likedReviewsNumber = likedReviewsAnyTime ? Math.floor(Math.random() * 3) + 1 : 0;

    try {
        const userMovieStatisticsTrain = new UserMovieStatisticsTrain({
            userId,
            movieId,
            liked,
            likeDates: Array.from({length: likeDatesNumber}, () => new Date()),
            unlikeDates: Array.from({length: unlikeDatesNumber}, () => new Date()),
            watchDates: Array.from({length: watchTimesNumber}, () => new Date()),
            watchDurationsSec: Array.from({length: watchTimesNumber}, () => Math.floor(Math.random() * 200)),
            ratings: Array.from({length: reviewsNumber}, () => averageRating + Math.floor(Math.random() * 2) - 1),
            reviewsId: Array.from({length: reviewsNumber}, () => new mongoose.Types.ObjectId()),
            likedReviews: Array.from({length: likedReviewsNumber}, () => new mongoose.Types.ObjectId()),
        })
        await userMovieStatisticsTrain.save();
        return {message: 'User movie statistics train created'};

    } catch (error) {
        console.error('Error creating user movie statistics:', error);
        return null;
    }
}


export const trainNcfModel = async (req, res) => {
    console.log('Train NCF model')
    try {
        await fetch(process.env.PY_URL + '/train/ncf');
        res.json('NCF model trained')
    } catch (error) {
        console.error('Error training model:', error);
        return [];
    }
}