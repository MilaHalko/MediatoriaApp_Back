import * as TmdbController from "./TmdbController.js";
import User from "../modelsMongo/User.js";
import Movie from "../modelsMongo/Movie.js";
import {fetchFilteredMovies} from "../utils/machineLearning/fetchRecommendations.js";
import {getValidUserMovieStatistics} from "./UserMovieStatisticsController.js";

const createMovieFromTmdb = async (tmdbId) => {
    const tmdbMovie = await TmdbController.getMovieById(tmdbId);
    const youTubeKey = await TmdbController.getTrailerById(tmdbId);
    try {
        const movie = new Movie({
            tmdbId: tmdbId,
            title: tmdbMovie.title,
            genres: tmdbMovie.genres,
            releaseDate: tmdbMovie.release_date,
            overview: tmdbMovie.overview,
            imgUrl: tmdbMovie.imgUrl,
            popularity: tmdbMovie.popularity,
            youTubeKey: youTubeKey,
            ratingCount: tmdbMovie.vote_count,
            averageRating: tmdbMovie.vote_average
        });
        return await movie.save();
    } catch (error) {
        console.error('Error creating movie from TMDB id:', tmdbId, 'TmdbMovie:', tmdbMovie, error);
        return null;
    }
};


export const getMovieById = async (req, res) => {
    console.log('Get movie by id:', req.params.id)
    const {id} = req.params;
    try {
        const movie = await Movie.findById(id);
        if (!movie) {
            return res.status(404).json({message: 'Movie not found'});
        }
        res.json(movie);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

export const getMoviesByName = async (req, res) => {
    console.log('Get movies by name:', req.params.name, req.params.count)
    const {name, count} = req.params;
    try {
        console.time('Movies by name loaded')
        const tmdbMovies = await TmdbController.getMoviesByName(name, count)
        console.timeEnd('Movies by name loaded')
        console.time('Movies by name Mongo create')
        const movies = await Promise.all(tmdbMovies.map(async (tmdbMovie) => {
            let movie = await Movie.findOne({tmdbId: tmdbMovie.id})
            if (!movie) {
                movie = await createMovieFromTmdb(tmdbMovie.id);
            }
            return movie;
        }))
        console.timeEnd('Movies by name Mongo create')
        const sortedMovies = await getFilteredMovies(movies, req.userId);
        console.log('Movies by name loaded')
        res.json(sortedMovies);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

export const getFavoriteMovies = async (req, res) => {
    console.log('Get favorite movies of:', req.userId)
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        const movies = await Promise.all(user.favoriteMovies.map(async id => {
            return await Movie.findOne({tmdbId: id}) || await createMovieFromTmdb(id);
        }));
        res.json(movies.filter(movie => movie !== null));
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

export const getMoviesByRequest = async (req, res) => {
    console.log('Get movies by request:', req.body.query, req.body.movieCount)
    const {query, movieCount} = req.body;
    try {
        const tmdbMovies = await TmdbController.getMoviesByRequest(query, movieCount);

        let movies = await Promise.all(tmdbMovies.map(async tmdbMovie => {
            let movie = await Movie.findOne({ tmdbId: tmdbMovie.id });
            if (!movie) {
                console.log('No movie found with id:', tmdbMovie.id);
                movie = await createMovieFromTmdb(tmdbMovie.id);
            }
            return movie;
        }));
        if (movies.includes(null)) {
            movies = movies.filter(movie => movie !== null);
        }

        const sortedMovies = await getFilteredMovies(movies, req.userId);
        console.log('Sorted movies:', sortedMovies.map(movie => movie.tmdbId))
        console.log('Movies by request loaded:', sortedMovies.length)
        res.json(sortedMovies);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};


const getFilteredMovies = async (movies, userId) => {
    console.log('User id:', userId)
    const moviesId = movies.map(movie => movie._id);
    const filteredTmdbMoviesIds = await fetchFilteredMovies(userId, moviesId);
    return [...movies].sort((a, b) =>
        filteredTmdbMoviesIds.indexOf(a.tmdbId.toString()) - filteredTmdbMoviesIds.indexOf(b.tmdbId.toString())
    );
}


export const likeToggle = async (req, res) => {
    const {tmdbMovieId, isLiked} = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        const userMovieStatistics = await getValidUserMovieStatistics(user._id, tmdbMovieId)
        if (isLiked) {
            user.favoriteMovies = user.favoriteMovies.filter(id => id !== tmdbMovieId.toString());
            userMovieStatistics.liked = false;
            userMovieStatistics.unlikeDates.push(new Date());
        } else {
            if (user.favoriteMovies.includes(tmdbMovieId.toString())) {
                return res.status(400).json({message: 'Movie already liked'});
            }
            user.favoriteMovies.push(tmdbMovieId.toString());
            userMovieStatistics.liked = true;
            userMovieStatistics.likeDates.push(new Date());
        }
        await user.save();
        await userMovieStatistics.save();
        await getFavoriteMovies(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

export const getMovieTrailer = async (req, res) => {
    console.log('Get movie trailer by id:', req.params.tmdbId)
    const {tmdbId} = req.params;
    try {
        const trailer = await TmdbController.getTrailerById(tmdbId);
        if (!trailer) {
            return res.status(404).json({message: 'Trailer not found'});
        }
        console.log('Trailer:', trailer)
        res.json(trailer);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};
