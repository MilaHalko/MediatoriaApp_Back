import bcrypt from "bcrypt";
import User from "../modelsMongo/User.js";
import jwt from "jsonwebtoken";
import {SALT_ROUNDS, TOKEN_EXPIRES_IN} from "../config/constants.js";

const generateToken = (userId) => {
    return jwt.sign({_id: userId}, process.env.TOKEN_SECRET_KEY, {expiresIn: TOKEN_EXPIRES_IN})
}


const getHashedPassword = async (password) => {
    console.log('Salt rounds:', SALT_ROUNDS, 'Password:', password)
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    return await bcrypt.hash(password, salt)
}

export const signup = async (req, res) => {
    try {
        console.log('Signup:', req.body)
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

        console.log('User created:', req.body.password, 'Hash:', user.passwordHash)
        res.json({...userData, token})

    } catch (e) {
        res.status(500).json({
            message: e.message,
        })
    }
}

export const login = async (req, res) => {
    console.log('Login:', req.body)
    try {
        const user = await User.findOne({email: req.body.email})
        if (!user || !await bcrypt.compare(req.body.password, user.passwordHash)) {
            return res.status(400).json({message: 'Invalid email or password'})
        }
        const token = generateToken(user._id)
        const refreshToken = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET_KEY, { expiresIn: '7d' });
        user.refreshToken = refreshToken;
        await user.save();
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
    console.log('UpdateMe:', req.body)
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
        ).then(doc => doc)

        const {passwordHash, ...data} = userData._doc
        console.log('Updated user:', data)
        res.json({...data})

    } catch
        (e) {
        console.log('Update failed', e)
        res.status(500).json({
            message: 'Update failed',
        })
    }
}

export const getMe = async (req, res) => {
    console.log('GetMe:', req.userId)
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = generateToken(user._id);
        const { passwordHash, ...userData } = user._doc;
        return res.json({ ...userData, token });

    } catch (e) {
        console.log('No permission', e);
        return res.status(500).json({
            message: 'No permission',
        });
    }
}

export const isAdmin = async (req, res) => {
    console.log('IsAdmin:', req.userId)
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isAdmin = user.role === 'admin';
        res.json({isAdmin});
    } catch (e) {
        console.log('No permission', e);
        res.status(500).json({
            message: 'No permission',
        });
    }
};


export const refreshToken = async (req, res) => {
    console.log('Refresh token:', req.body.token)
    const { token: refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ message: 'No refresh token provided' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.TOKEN_SECRET_KEY);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const newToken = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET_KEY, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET_KEY, { expiresIn: '7d' });

        res.json({ token: newToken, refreshToken: newRefreshToken });
    } catch (e) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
};



export const deleteMe = async (req, res) => {
    console.log('DeleteMe:', req.userId)
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

export const addFavorite = async (req, res) => {
    console.log()
    const userId = req.userId
    const postId = req.params.id
    await User.findByIdAndUpdate(
        userId,
        {$addToSet: {favoriteMovies: postId}},
        {new: true}
    ).then(doc => {
        if (!doc) {
            return res.status(404).json({message: 'User not found'})
        }
        const {passwordHash, ...data} = doc._doc
        console.log('Add favorite:', data)
        res.json(data)
    }).catch(e => {
        console.log(e)
        res.status(500).json({message: 'Add favorite error'})
    })
}

export const removeFavorite = async (req, res) => {
    const userId = req.userId
    const postId = req.params.id
    await User.findByIdAndUpdate(
        userId,
        {$pull: {favoriteMovies: postId}},
        {new: true}
    ).then(doc => {
        if (!doc) {
            return res.status(404).json({message: 'User not found'})
        }
        console.log('MovieId:', req.params.id)
        const {passwordHash, ...data} = doc._doc
        console.log('Remove favorite:', data)
        res.json(data)
    }).catch(e => {
        console.log(e)
        res.status(500).json({message: 'Remove favorite error'})
    })
}