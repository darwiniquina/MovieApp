export interface Movie {
  id: number;
  title: string;
  runtime: number;
  overview: string;
  backdrop_path: string;
  genre_ids: number[];
  vote_average: number;
  release_date?: string;
  poster_path: string;
  explanation?: string;
  genres: Array<{ id: number; name: string }>;
}

export interface Credit {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

export interface Genre {
  id: number;
  name: string;
}
