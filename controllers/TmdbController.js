import {urlIsValid} from "../validations/url.js";
import {tmdbImageBaseUrl, tmdbRequests} from "../config/tmdbRequests.js";

export const getMovieById = async (id) => {
    console.log('Getting movie by ID:', id)
    try {
        const response = await fetch(tmdbRequests.iD(id))
        return await response.json()
    } catch (e) {
        console.log(e)
        return null;
    }
}

export const getMovieByName = async (Name) => {
    console.log('Getting movie by name:', Name)
    try {
        const res = await fetch(tmdbRequests.title(Name))
        return await res.json()
    } catch (e) {
        console.log(e)
        return null;
    }
}

export const getTrailerById = async (id) => {
    console.log('Getting trailer by ID:', id)
    try {
        const res = await fetch(tmdbRequests.trailer(id))
        const resJson = await res.json()
        return resJson.results[0].key
    } catch (e) {
        console.log(e)
        return null;
    }
}

export const getMoviesByRequest = async (query, movieCount) => {
    console.log('Getting movies by request:', query, movieCount)
    if (movieCount === undefined) movieCount = 1000
    const request = tmdbRequests.request(query)
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
    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i]
        await getValidTmdbImgUrl(movie).then(url => {
            movies[i].imgUrl = url
            delete movies[i].backdrop_path
            delete movies[i].poster_path
        })
    }
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