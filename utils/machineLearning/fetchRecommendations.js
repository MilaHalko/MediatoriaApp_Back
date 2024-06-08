const pyURL = 'http://tf:5001';

export const fetchFilteredMovies = async (user, movies) => {
    // const ncfMovies = await fetchNcfMovies(user, movies);
    // const rnnMovies = await fetchRnnMovies(user, movies)
    // console.log('ncfMovies:', ncfMovies)
    // return mixRecommendations(ncfMovies, rnnMovies)
    // fetchTest()
    return
}

const fetchTest = async () => {
    try {
        const response = await fetch(pyURL + '/');
        return await response.json();
    } catch (error) {
        console.error('Error fetching test:', error);
        return [];
    }
}

const fetchNcfMovies = async (user, movies) => {
    console.log('JSON.stringify({ movies }):', JSON.stringify({movies}))
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({movies}),
    };

    try {
        const response = await fetch(pyURL + '/recommend/ncf', requestOptions);
        return await response.json();
    } catch (error) {
        console.error('Error fetching NCF movies:', error);
        return [];
    }
};


const fetchRnnMovies = async (user, movies) => {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({user, movies}),
    };

    try {
        const response = await fetch(pyURL + `/recommend/rnn`, requestOptions);
        console.log('RNN response:', response)
        console.log('RNN response.json():', response.json())
        return response.json();
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