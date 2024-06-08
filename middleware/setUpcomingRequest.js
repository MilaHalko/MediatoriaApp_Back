export function setUpcomingRequest(req, res, next) {
    console.log('Set upcoming request')
    req.body.query = 'upcoming';
    next();
}