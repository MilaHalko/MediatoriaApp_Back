import {urlIsValid} from "../validations/url.js";
import {tmdbImageBaseUrl, tmdbRequests} from "../config/tmdbRequests.js";

export const getTmdbGenres = async (req, res) => {
    console.log('Getting genres...')
    try {
        const genres = await fetch(tmdbRequests.genres).then(async res => await res.json()).then(data => data.genres)
        return res.json(genres)
    } catch (e) {
        console.log(e)
        return []
    }
}

export const getMovieById = async (id) => {
    try {
        const resJson = await fetch(tmdbRequests.iD(id)).then(async res => await res.json())
        return await setMoviesImgUrl(resJson)
    } catch (e) {
        console.log(e)
        return null;
    }
}

export const getMoviesByRequest = async (query, movieCount) => {
    const request = tmdbRequests.request(query)
    return await getTmdbPages(request, movieCount)
}

export const getMoviesByName = async (name, maxMoviesCount) => {
    const request = tmdbRequests.title(name.toString())
    console.log('Request:', request)
    return await getTmdbPages(request, maxMoviesCount)
}

export const getTrailerById = async (id) => {
    try {
        const resJson = await fetch(tmdbRequests.trailer(id)).then(async res => await res.json())
        if (!resJson.results?.length) return null
        return resJson.results[0].key
    } catch (e) {
        console.log('Get trailer error:', id, e)
        return null;
    }
}

const getTmdbPages = async (request, movieCount) => {
    if (movieCount === undefined) movieCount = 100
    const steps = Math.ceil(movieCount / 20.0)
    let movies = []
    try {
        for (let i = 1; i <= steps; i++) {
            const res = await fetch(request + `&page=${i + 1}`)
            let newMovies = await res.json().then(data => data.results)
            newMovies = await setMoviesImgUrl(newMovies)
            movies.push(...newMovies)
            if (newMovies < 20) {
                return movies
            }
        }
    } catch (e) {
        console.log(e)
        return []
    }
    return movies.slice(0, movieCount)
}

const setMoviesImgUrl = async (movies) => {
    if (!movies.length) movies = [movies]
    for (const movie of movies) {
        await getValidTmdbImgUrl(movie).then(url => {
            movie.imgUrl = url
            delete movie.backdrop_path
            delete movie.poster_path
        })
    }
    if (movies.length === 1) return movies[0]
    return movies
}

const getValidTmdbImgUrl = async (movie) => {
    if (movie?.backdrop_path && await urlIsValid(tmdbImageBaseUrl + movie?.backdrop_path)) {
        return tmdbImageBaseUrl + movie?.backdrop_path
    }
    if (movie?.poster_path && await urlIsValid(tmdbImageBaseUrl + movie?.poster_path)) {
        return tmdbImageBaseUrl + movie?.poster_path
    }
    return null
}
