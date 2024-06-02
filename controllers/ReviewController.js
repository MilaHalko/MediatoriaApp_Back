import Review from '../models/Review.js';

export const getByMovie = async (req, res) => {
    console.log('Getting reviews by movie...')
    try {
        const { movieId } = req.params;
        const reviews = await Review.find({ movieId })
            .populate('authorId', 'username')
            .exec();
        console.log('Reviews found:', reviews.length)
        res.json(reviews);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message });
    }
};

export const getOne = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('authorId', 'username')
            .populate('movieId', 'title')
            .exec();
        if (!review) return res.status(404).json({ message: 'Review not found' });
        console.log('Review found', review)
        res.json(review);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message });
    }
};

export const create = async (req, res) => {
    console.log('Creating review...')
    const { text, rating, movieId } = req.body;
    try {
        const review = new Review({
            text,
            rating,
            authorId: req.userId,
            movieId,
        });
        let savedReview = await review.save();
        savedReview = await savedReview.populate('authorId', 'username')
        console.log('Review created', savedReview)
        res.status(201).json(savedReview);
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err.message });
    }
};

export const remove = async (req, res) => {
    console.log('Removing review...')
    try {
        const reviewId = req.params.id
        await Review.findOneAndDelete({_id: reviewId})
            .then(doc => {
                if (!doc) {
                    return res.status(404).json({message: 'No review found'})
                }
                console.log('Review deleted')
                res.json({message: 'Review deleted'})
            })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message });
    }
};

export const like = async (req, res) => {
    console.log('Liking review...')
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { likes: req.userId } }, // Add user ID to likes array
            { new: true }
        ).populate('authorId', 'username');
        console.log('Review liked', review)
        res.json(review);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message });
    }
};

export const unlike = async (req, res) => {
    console.log('Unliking review...')
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { $pull: { likes: req.userId } }, // Remove user ID from likes array
            { new: true }
        ).populate('authorId', 'username');
        console.log('Review unliked', review)
        res.json(review);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message });
    }
};