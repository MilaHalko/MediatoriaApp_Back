import express from 'express'
import mongoose from 'mongoose'
import fs from 'fs'
import multer from "multer";
import cors from 'cors'
import dotenv from 'dotenv'
import {MONGO_URL} from "./config/urls.js";
import {PORT} from "./config/constants.js";
import {UserController} from "./controllers/index.js";
import {checkAuth} from "./middleware/index.js";
import {handleValidationErrors, fileNamePreparation} from "./utils/index.js";
import {loginValidations, signupValidations} from "./validations/index.js";

dotenv.config()

const app = express();
const db = mongoose.connect(MONGO_URL)
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
app.post('/auth/login', loginValidations, handleValidationErrors, UserController.login)
app.get('/auth/me', checkAuth, UserController.getMe)

const upload = multer({storage: storage})
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({url: `/uploads/${req.file.originalname}`})
})

// // POSTS
// app.get('/posts', PostController.getAll)
// app.get('/posts/:id', PostController.getOne)
// app.post('/posts', checkAuth, fullPostValidation, handleValidationErrors, PostController.create)
// app.delete('/posts/:id', checkAuth, PostController.remove)
// app.patch('/posts/:id', checkAuth, fullPostValidation, handleValidationErrors, PostController.update)
//
// app.get('/tags', PostController.getLastTags)
//


app.listen(PORT, (err) => {
    if (err) return console.log(err)
    console.log(`Mediatoria server is running on port ${PORT}`)
})