import Review from '../models/Review.js';

export const getByMovie = async (req, res) => {
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
    const { text, rating, movieId } = req.body;
    try {
        const review = new Review({
            text,
            rating,
            authorId: req.userId,
            movieId,
        });
        const savedReview = await review.save();
        console.log('Review created', savedReview)
        res.status(201).json(savedReview);
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err.message });
    }
};

export const remove = async (req, res) => {
    try {
        const postId = req.params.id
        await Review.findOneAndDelete({_id: postId})
            .then(doc => {
                if (!doc) {
                    return res.status(404).json({message: 'No post found'})
                }
                console.log('Post deleted')
                res.json({message: 'Post deleted'})
            })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message });
    }
};

export const like = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { likes: req.userId } }, // Add user ID to likes array
            { new: true }
        ).populate('authorId', 'username');
        res.json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const unlike = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { $pull: { likes: req.userId } }, // Remove user ID from likes array
            { new: true }
        ).populate('authorId', 'username');
        res.json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
