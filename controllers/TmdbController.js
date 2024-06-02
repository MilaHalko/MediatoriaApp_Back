import {urlIsValid} from "../validations/url.js";
import {tmdbImageBaseUrl, tmdbRequests} from "../config/tmdbRequests.js";

export const getMovieById = async (id) => {
    try {
        const resJson = await fetch(tmdbRequests.iD(id)).then(async res => await res.json())
        return await setMoviesImgUrl([resJson])
    } catch (e) {
        console.log(e)
        return null;
    }
}

export const getMovieByName = async (Name) => {
    try {
        const resJson = await fetch(tmdbRequests.title(Name)).then(async res => await res.json())
        return await setMoviesImgUrl([resJson])
    } catch (e) {
        console.log(e)
        return null;
    }
}

export const getTrailerById = async (id) => {
    try {
        const resJson = await fetch(tmdbRequests.trailer(id)).then(async res => await res.json())
        return resJson.results[0].key
    } catch (e) {
        console.log(e)
        return null;
    }
}

export const getMoviesByRequest = async (query, movieCount) => {
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