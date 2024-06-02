import * as TmdbController from "./TmdbController.js";
import User from "../models/User.js";

export const getMovieById = async (req, res) => {
    console.log('Get movie by id:', req.params.id)
    const {id} = req.params;
    try {
        const movie = await TmdbController.getMovieById(id);
        if (!movie) {
            return res.status(404).json({message: 'Movie not found'});
        }
        res.json(movie);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

export const getMovieByName = async (req, res) => {
    console.log('Get movie by name:', req.params.name)
    const {name} = req.params;
    try {
        const movie = await TmdbController.getMovieByName(name);
        if (!movie) {
            return res.status(404).json({message: 'Movie not found'});
        }
        res.json(movie);
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
        const movies = await Promise.all(user.favoriteMovies.map(id => TmdbController.getMovieById(id)));
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
        const movies = await TmdbController.getMoviesByRequest(query, movieCount);
        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

export const likeToggle = async (req, res) => {
    const {movieId, isLiked} = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        if (isLiked) {
            user.favoriteMovies = user.favoriteMovies.filter(id => id !== movieId.toString());
        } else {
            user.favoriteMovies.push(movieId);
        }
        await user.save();
        res.json(user.favoriteMovies);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
};

export const getMovieTrailer = async (req, res) => {
    console.log('Get movie trailer by id:', req.params.id)
    const {id} = req.params;
    try {
        const trailer = await TmdbController.getTrailerById(id);
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
