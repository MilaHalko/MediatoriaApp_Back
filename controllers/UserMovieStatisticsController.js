import UserMovieStatistics from "../modelsMongo/UserMovieStatistics.js";

export const createUserMovieStatistics = async (userId, movieId) => {
    console.log('Creating user movie statistics:', userId, movieId)
    try {
        const userMovieStatistics = new UserMovieStatistics({
            userId,
            movieId
        });
        return await userMovieStatistics.save();
    } catch (error) {
        console.error('Error creating user movie statistics:', userId, movieId, error);
        return null;
    }

}

export const getValidUserMovieStatistics = async (userId, movieId) => {
    console.log('Get user movie statistics:', userId, movieId)
    try {
        let userMovieStatistics = await UserMovieStatistics.findOne({userId, movieId});
        if (!userMovieStatistics) {
            userMovieStatistics = await createUserMovieStatistics(userId, movieId);
        }
        return userMovieStatistics;
    } catch (error) {
        console.error('Error getting user movie statistics:', userId, movieId, error);
        return null;
    }
}


export const UpdateWatch = async (req, res) => {
    const userId = req.userId
    const {tmdbMovieId, watchDurationSec, currentPlayerTime} = req.body
    console.log('Update watch duration:', tmdbMovieId, watchDurationSec, currentPlayerTime)

    try {
        const userMovieStatistics = await getValidUserMovieStatistics(userId, tmdbMovieId)
        userMovieStatistics.watchDurationsSec.push(watchDurationSec)
        userMovieStatistics.watchDates.push(new Date())
        userMovieStatistics.watchProgressSec = currentPlayerTime
        userMovieStatistics.save()

        console.log('Watch duration updated:', userMovieStatistics)

        res.json({message: 'Watch duration updated'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
}


export const getUserMovieStatistics = async (req, res) => {
    const userId = req.userId
    const tmdbMovieId = req.params.tmdbMovieId
    console.log('Get user movie statistics:', userId, tmdbMovieId)
    try {
        const userMovieStatistics = await getValidUserMovieStatistics(userId, tmdbMovieId)
        res.json(userMovieStatistics);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
}
