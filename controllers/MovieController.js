import * as TmdbController from "./TmdbController.js";
import User from "../modelsMongo/User.js";
import Movie from "../modelsMongo/Movie.js";
import mongoose from "mongoose";

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
        throw error;
    }
};

export const getMovieById = async (req, res) => {
    console.log('Get movie by id:', req.params.id)
    const {id} = req.params;
    try {
        const movie = await Movie.findById(id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json(movie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMovieByName = async (req, res) => {
    console.log('Get movie by name:', req.params.name)
    const {name} = req.params;
    try {
        let movie = await Movie.findOne({ title: name });
        if (!movie) {
            const tmdbMovie = await TmdbController.getMovieByName(name);
            const tmdbId = tmdbMovie.id;
            movie = await createMovieFromTmdb(tmdbId);
        }
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json(movie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getFavoriteMovies = async (req, res) => {
    console.log('Get favorite movies of:', req.userId)
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const movies = await Promise.all(user.favoriteMovies.map(async id => {
            return await Movie.findOne({tmdbId: id}) || await createMovieFromTmdb(id);
        }));
        res.json(movies.filter(movie => movie !== null));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMoviesByRequest = async (req, res) => {
    console.log('Get movies by request:', req.body.query, req.body.movieCount)
    const {query, movieCount} = req.body;
    try {
        const tmdbMovies = await TmdbController.getMoviesByRequest(query, movieCount);
        const movies = await Promise.all(tmdbMovies.map(async tmdbMovie => {
            let movie = await Movie.findOne({ tmdbId: tmdbMovie.id })
            if (!movie) {
                console.log('No movie found with id:', tmdbMovie.id);
                movie = await createMovieFromTmdb(tmdbMovie.id);
            }
            return movie;
        }));
        // const user = await User.findById(req.userId);
        // const recommendations = await recommendMovies({user, movies});
        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const likeToggle = async (req, res) => {
    const {tmdbMovieId, isLiked} = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        if (isLiked) {
            user.favoriteMovies = user.favoriteMovies.filter(id => id !== tmdbMovieId.toString());
        } else {
            user.favoriteMovies.push(tmdbMovieId.toString());
        }
        await user.save();
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
