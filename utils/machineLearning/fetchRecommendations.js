export const fetchFilteredMovies = async (userId, moviesId) => {
    // const ncfTmdbMoviesId = await fetchNcfMovies(userId, moviesId).then(data => data.recommendations.sorted_movies_id);
    const rnnMovies = await fetchRnnMovies(userId, moviesId);
    // return ncfTmdbMoviesId;
    return moviesId;
}

export const fetchPythonTest = async (req, res) => {
    console.log('Python test')
    try {
        await fetch(process.env.PY_URL + '/');
        res.json('Python test response successfull')
    } catch (error) {
        console.error('Error fetching test:', error);
        res.json('Error fetching test:', error)
    }
}

const fetchNcfMovies = async (userId, moviesId) => {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({user_id: userId, movies_id: moviesId}),
    };

    try {
        const response = await fetch(process.env.PY_URL + '/recommend/ncf', requestOptions);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching NCF movies:', error);
        return [];
    }
};


const fetchRnnMovies = async (userId, moviesId) => {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({user_id: userId, movies_id: moviesId}),
    };

    try {
        const response = await fetch(process.env.PY_URL + `/recommend/rnn`, requestOptions);
        const data = await response.json();
        console.log('RNN data:', data)
        return data;
    } catch (error) {
        console.error('Error fetching RNN movies:', error);
        return [];
    }
};

const mixRecommendations = (ncfRecommendations, rnnRecommendations) => {
    const recommendations = new Map();
    ncfRecommendations.forEach(movie => {
        if (!recommendations.has(movie.tmdbId)) {
            recommendations.set(movie.tmdbId, {movie, score: 0});
        }
        recommendations.get(movie.tmdbId).score += 1;
    });
    rnnRecommendations.forEach(movie => {
        if (!recommendations.has(movie.tmdbId)) {
            recommendations.set(movie.tmdbId, {movie, score: 0});
        }
        recommendations.get(movie.tmdbId).score += 1;
    });
    return Array.from(recommendations.values()).sort((a, b) => b.score - a.score).map(rec => rec.movie);
};