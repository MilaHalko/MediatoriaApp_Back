import User from "../modelsMongo/User.js";

export async function checkIsAdmin(req, res, next) {
    console.log('CheckIsAdmin:', req.userId)
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({message: 'No permission'});
        }
        next();
    } catch (e) {
        console.log('No permission', e);
        res.status(500).json({message: 'No permission'});
    }
}