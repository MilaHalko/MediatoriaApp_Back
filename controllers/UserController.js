import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {SALT_ROUNDS, TOKEN_EXPIRES_IN, TOKEN_SECRET_KEY} from "../config/constants.js";

export const signup = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const userDoc = new User({
            username: req.body.username,
            email: req.body.email,
            passwordHash: hashedPassword,
            avatarUrl: req.body.avatarUrl
        })
        const user = await userDoc.save()

        const token = jwt.sign({
            _id: user._id

        }, TOKEN_SECRET_KEY, {expiresIn: TOKEN_EXPIRES_IN})

        const {passwordHash, ...userData} = user._doc
        res.json({
            message: 'Signup Success',
            user: userData,
            token
        })

    } catch (e) {
        res.status(500).json({
            message: 'Signup failed',
        })
    }
}

export const login = async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email})

        if (!user || !await bcrypt.compare(req.body.password, user.passwordHash)) {
            return res.status(400).send('Email or password is wrong')
        }

        const token = jwt.sign({_id: user._id}, TOKEN_SECRET_KEY, {expiresIn: TOKEN_EXPIRES_IN})
        const {passwordHash, ...userData} = user._doc

        res.json({...userData, token})
    } catch
        (e) {
        console.log('Login failed', e)
        res.status(500).json({
            message: 'Login failed',
        })
    }
}

export const getMe = async (req, res) => {

    try {
        const user = await User.findById(req.userId)

        if(!user) res.status(404).json({message: 'User not found'})

        const {passwordHash, ...userData} = user._doc
        res.json(userData)

    } catch (e) {
        console.log('No permission', e)
        res.status(500).json({
            message: 'No permission',
        })
    }
}