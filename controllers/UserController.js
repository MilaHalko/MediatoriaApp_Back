import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {SALT_ROUNDS, TOKEN_EXPIRES_IN} from "../config/constants.js";

const generateToken = (userId) => {
    return jwt.sign({_id: userId}, process.env.TOKEN_SECRET_KEY, {expiresIn: TOKEN_EXPIRES_IN})
}

const getHashedPassword = async (password) => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    return await bcrypt.hash(password, salt)
}

export const signup = async (req, res) => {
    try {
        console.log(req.body)
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({message: 'Passwords do not match'})
        }

        const userExists = await User.findOne({email: req.body.email})
        if (userExists) {
            return res.status(400).json({message: 'Email already in use'})
        }

        const userDoc = new User({
            username: req.body.username,
            email: req.body.email,
            passwordHash: await getHashedPassword(req.body.password),
            avatarUrl: req.body.avatarUrl
        })
        const user = await userDoc.save()
        const token = generateToken(user._id)
        const {passwordHash, ...userData} = user._doc

        res.json({...userData, token})

    } catch (e) {
        res.status(500).json({
            message: e.message,
        })
    }
}

export const login = async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email})
        if (!user || !await bcrypt.compare(req.body.password, user.passwordHash)) {
            return res.status(400).json({message: 'Invalid email or password'})
        }

        const token = generateToken(user._id)
        const {passwordHash, ...userData} = user._doc
        res.json({...userData, token})

    } catch (e) {
        console.log('Login failed', e)
        res.status(500).json({
            message: 'Login failed',
        })
    }
}

export const updateMe = async (req, res) => {
    try {
        console.log('UpdateMe:', req.body)
        if (req.body.newPassword && req.body.confirmPassword
            && req.body.newPassword !== req.body.confirmPassword) {
            return res.status(400).json({message: 'Passwords do not match'})
        }

        const updatedData = {}
        if (req.body.username) updatedData.username = req.body.username
        if (req.body.avatarUrl) updatedData.avatarUrl = req.body.avatarUrl
        if (req.body.oldPassword) updatedData.oldPasswordHash = await getHashedPassword(req.body.oldPassword)
        if (req.body.newPassword) updatedData.passwordHash = await getHashedPassword(req.body.newPassword)

        console.log('Old password:', req.body.oldPassword)
        console.log('New password:', req.body.newPassword)
        console.log('Updated data:', updatedData)
        const user = await User.findOne({email: req.body.email})
        if (!user || (req.body.oldPassword && !await bcrypt.compare(req.body.oldPassword, user.passwordHash))) {
            return res.status(400).json({message: 'Invalid old password'})
        }

        const userData = await User.findOneAndUpdate(
            {email: req.body.email},
            updatedData,
            {new: true}
        ).then(doc => doc._doc)

        console.log('Updated user:', userData)
        res.json({...userData})

    } catch
        (e) {
        console.log('Update failed', e)
        res.status(500).json({
            message: 'Update failed',
        })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            res.status(404).json({message: 'User not found'})
        }

        const token = generateToken(user._id)
        const {passwordHash, ...userData} = user._doc
        res.json({...userData, token})

    } catch (e) {
        console.log('No permission', e)
        res.status(500).json({
            message: 'No permission',
        })
    }
}

export const deleteMe = async (req, res) => {
    try {
        console.log('DeleteMe:', req.userId)
        const user = await User.findByIdAndDelete(req.userId)
        if (!user) {
            res.status(404).json({message: 'User not found'})
        } else {
        res.json({message: 'User deleted'})
        }
    } catch (e) {
        console.log('Delete failed', e)
        res.status(500).json({
            message: 'Delete failed',
        })
    }
}