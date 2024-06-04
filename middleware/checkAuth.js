import jwt from "jsonwebtoken";

export function checkAuth(req, res, next) {
    console.log('Check auth...')
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        req.userId = decoded._id;
        next();
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        console.log('No permission', e);
        return res.status(401).json({ message: 'Invalid token' });
    }
}
