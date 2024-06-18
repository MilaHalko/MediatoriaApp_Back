import './config/config.js'
import express from 'express'
import mongoose from 'mongoose'
import fs from 'fs'
import multer from "multer";
import cors from 'cors'
import {PORT} from "./config/constants.js";
import {checkAuth} from "./middleware/index.js";
import {handleValidationErrors, fileNamePreparation} from "./utils/index.js";
import {UserController, ReviewController, MovieController, TmdbController, UserMovieStatisticsController, UserMovieStatisticsTrainController} from "./controllers/index.js";
import {reviewValidation, signupValidations, updateValidations} from "./validations/index.js";
import {setUpcomingRequest} from "./middleware/setUpcomingRequest.js";
import {checkIsAdmin} from "./middleware/checkIsAdmin.js";
import {fetchPythonTest} from "./utils/machineLearning/fetchRecommendations.js";


const app = express();
const db = mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to Mediatoria MongoDB'))
    .catch((err) => console.log(err))

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        const fileName = fileNamePreparation(file.originalname)
        cb(null, fileName)
    }
})

app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use(cors())
app.get('/', (req, res) => {
    res.send('Hello, from Mediatoria server')
})


// AUTH
app.post('/auth/signup', signupValidations, handleValidationErrors, UserController.signup)
app.post('/auth/login', UserController.login)
app.post('/refresh-token', UserController.refreshToken);
app.get('/auth/me', checkAuth, UserController.getMe)
app.get('/auth/is-admin', checkAuth, UserController.isAdmin);
app.patch('/auth/me', checkAuth, updateValidations, handleValidationErrors, UserController.updateMe)
app.delete('/auth/me', checkAuth, UserController.deleteMe)

app.post('/auth/favorites/:id', checkAuth, UserController.addFavorite)
app.delete('/auth/favorites/:id', checkAuth, UserController.removeFavorite)

// AUTH ADMIN
app.get('/users', checkAuth, checkIsAdmin, UserController.getUsers)
app.delete('/user/:id', checkAuth, checkIsAdmin, UserController.deleteUser)

const upload = multer({storage: storage})
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({url: `/uploads/${req.file.originalname}`})
})


// REVIEWS
app.get('/reviews/movie/:movieId', ReviewController.getByMovie);
app.get('/review/:id', ReviewController.getOne);
app.post('/review', checkAuth, reviewValidation, handleValidationErrors, ReviewController.create);
app.delete('/review/:id', checkAuth, ReviewController.remove);
app.post('/review/:id/like', checkAuth, ReviewController.like);
app.post('/review/:id/unlike', checkAuth, ReviewController.unlike);


// MOVIES
app.get('/movies/:id', MovieController.getMovieById);
app.post('/movies/request', checkAuth, MovieController.getMoviesByRequest);
app.post('/movies/upcoming', checkAuth, setUpcomingRequest, MovieController.getMoviesByRequest);
app.get('/movies/name/:name/:count', checkAuth, MovieController.getMoviesByName);
app.get('/movies/user/favorites', checkAuth, MovieController.getFavoriteMovies);
app.post('/movies/like-toggle', checkAuth, MovieController.likeToggle);


// TMDB
app.get('/tmdb/genres', checkAuth, TmdbController.getTmdbGenres);
app.get('/movies/:tmdbId/trailer', MovieController.getMovieTrailer);


// USER-MOVIE-STATISTICS
app.post('/user-movie-statistics/update-watch-duration', checkAuth, UserMovieStatisticsController.UpdateWatch);
app.get('/user-movie-statistics/:tmdbMovieId', checkAuth, UserMovieStatisticsController.getUserMovieStatistics);


// USER-MOVIE-STATISTICS-TRAIN
app.get('/user-movie-statistics-train-data-generation', UserMovieStatisticsTrainController.generateUserMovieStatisticsTrain);
app.get('/user-movie-statistics-train-ncf-model', UserMovieStatisticsTrainController.trainNcfModel);


// PYTHON
app.get('/check-python', fetchPythonTest)

app.listen(PORT, (err) => {
    if (err) return console.log(err)
    console.log(`Mediatoria server is running on port ${PORT}`)
})
