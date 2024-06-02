import './config/config.js'
import express from 'express'
import mongoose from 'mongoose'
import fs from 'fs'
import multer from "multer";
import cors from 'cors'
import {PORT} from "./config/constants.js";
import {checkAuth} from "./middleware/index.js";
import {handleValidationErrors, fileNamePreparation} from "./utils/index.js";
import {UserController, ReviewController, MovieController} from "./controllers/index.js";
import {reviewValidation, signupValidations, updateValidations} from "./validations/index.js";

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
app.patch('/auth/me', checkAuth, updateValidations, handleValidationErrors, UserController.updateMe)
app.delete('/auth/me', checkAuth, UserController.deleteMe)

app.post('/auth/favorites/:id', checkAuth, UserController.addFavorite)
app.delete('/auth/favorites/:id', checkAuth, UserController.removeFavorite)

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
app.get('/movies/:id', checkAuth, MovieController.getMovieById);
app.get('/movies/name/:name', checkAuth, MovieController.getMovieByName);
app.get('/movies/favorites', checkAuth, MovieController.getFavoriteMovies);
app.post('/movies/request', checkAuth, MovieController.getMoviesByRequest);
app.post('/movies/like-toggle', checkAuth, MovieController.likeToggle);
app.get('/movies/:id/trailer', checkAuth, MovieController.getMovieTrailer);

app.listen(PORT, (err) => {
    if (err) return console.log(err)
    console.log(`Mediatoria server is running on port ${PORT}`)
})
