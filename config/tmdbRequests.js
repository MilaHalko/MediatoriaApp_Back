const API_KEY = process.env.TMDB_API_KEY
export const tmdbImageBaseUrl = 'https://image.tmdb.org/t/p/original'

export const tmdbRequests = {
    request: (request) => `https://api.themoviedb.org/3/movie/${request}?api_key=${API_KEY}&language=en-US`,
    iD: (id) => `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`,
    title: (title) => `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${title}`,
    trailer: (id) => `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=en-US`,
    genres: `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`,
    movies: (year, genre) => {
        let request = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}`
        // if (language !== "") request += `&language=${language}`
        request += `&sort_by=popularity.desc`
        if (year !== "") request += `&primary_release_year=${year}`
        if (genre !== "") request += `&with_genres=${genre}`
        return request
        // return `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}
        // &language=${language}
        // &sort_by=popularity.desc
        // &primary_release_year=${year}
        // &with_genres=${genre}`;
    },
};
