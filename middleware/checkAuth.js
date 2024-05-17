import jwt from "jsonwebtoken";
import {TOKEN_SECRET_KEY} from "../config/constants.js";

export default function checkAuth(req, res, next) {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')

    if (!token) {
        return res.status(401).json({message: 'No permission'})
    }

    try {
        const decoded = jwt.verify(token, TOKEN_SECRET_KEY)
        req.userId = decoded._id
        next()
    }
    catch (e) {
        console.log('No permission', e)
        console.log('token', token)
        return res.status(401).json({message: 'No permission'})
    }
}