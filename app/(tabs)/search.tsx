import MovieCardDisplay from "@/components/MovieCardDisplay";
import { icons } from "@/constants/icons";
import movieFetch from "@/services/movieFetch";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  TextInput,
  View,
} from "react-native";

interface Movie {
  id: number;
  title: string;
  backdrop_path: string;
  genre_ids: number[];
  vote_average: number;
  release_date?: string;
  poster_path: string;
}

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<any[]>([]);

  const genreMap = useMemo(() => {
    const map: Record<number, string> = {};
    genres.forEach((g) => (map[g.id] = g.name));
    return map;
  }, [genres]);

  const fetchGenres = async () => {
    try {
      const genres = await movieFetch(`/genre/movie/list?language=en`);
      setGenres(genres.genres);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMovies = async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const searchResults = await movieFetch(
        `/search/movie?query=${encodeURIComponent(searchQuery)}&page=1`
      );
      setResults(searchResults.results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();

    const delayDebounce = setTimeout(() => {
      fetchMovies(query);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <ScrollView
      className="flex  bg-[#0F0D23] p-4 "
      contentContainerStyle={{ paddingBottom: 100, paddingTop: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row gap-3 items-center bg-white m-4 rounded-full px-4 py-1">
        <Image
          source={icons.search}
          className="w-5 h-5"
          resizeMode="contain"
          tintColor="gray"
        />
        <TextInput
          placeholder="Search movies..."
          value={query}
          onChangeText={setQuery}
          className=""
          placeholderTextColor="#A8B5DB"
        />
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      <FlatList
        data={results}
        scrollEnabled={false}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 5,
        }}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item: movie }) => (
          <MovieCardDisplay movie={movie} genreMap={genreMap} />
        )}
      />
    </ScrollView>
  );
};

export default Search;
