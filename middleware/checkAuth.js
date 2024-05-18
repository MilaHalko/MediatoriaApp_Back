import jwt from "jsonwebtoken";

export function checkAuth(req, res, next) {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')
    if (!token) {
        return res.status(401).json({message: 'No token'})
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY)
        req.userId = decoded._id
        next()
    }
    catch (e) {
        console.log('No permission', e)
        console.log('token', token)
        return res.status(401).json({message: 'No permission'})
    }
}