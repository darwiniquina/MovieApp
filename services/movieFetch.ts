import axios from "axios";

const TMDB_BASE = "https://api.themoviedb.org/3";

const TMDB_HEADERS = {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_API_KEY}`,
};

const movieFetch = async (endpoint: string) => {
    const url = `${TMDB_BASE}${endpoint}`;
    const res = await axios.get(url, { headers: TMDB_HEADERS });

    return res.data;
};

export default movieFetch;