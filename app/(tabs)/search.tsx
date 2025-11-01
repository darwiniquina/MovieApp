import MovieCardDisplay from "@/components/MovieCardDisplay";
import { icons } from "@/constants/icons";
import aiFetch from "@/services/aiFetch";
import movieFetch from "@/services/movieFetch";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
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
  const [mode, setMode] = useState<"keyword" | "ai">("keyword");
  const [keywordQuery, setKeywordQuery] = useState("");
  const [aiQuery, setAIQuery] = useState("");

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
      const data = await movieFetch(`/genre/movie/list?language=en`);
      setGenres(data.genres);
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
      const data = await movieFetch(
        `/search/movie?query=${encodeURIComponent(searchQuery)}&sort_by=popularity.desc&page=1`
      );
      setResults(data.results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAI = async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const limit = 4;

      const messages = [
        {
          role: "system",
          content: `
          You are a helpful assistant that returns only movie titles in JSON format.
          Remove any years, subtitles, or extra text — keep only the clean, main title.
          Do not include descriptions or metadata. 
          Return an array of distinct movie titles that best match the user's description.
          
          Example:
          Input: "funny animated movies about animals"
          Output: ["Zootopia", "Madagascar", "The Secret Life of Pets", "Sing", "Kung Fu Panda"]
        `,
        },
        {
          role: "user",
          content: `List up to ${limit} movies that match this description: "${searchQuery}". 
Return a JSON array of clean titles only, like:
["Title 1", "Title 2", "Title 3"]`,
        },
      ];

      const aiTitles = await aiFetch(messages); // e.g. ["Shrek", "Zootopia", "Madagascar"]

      // Sequentially or in parallel — we will do parallel for faster results
      const moviePromises = aiTitles.map(async (title) => {
        try {
          const data = await movieFetch(
            `/search/movie?query=${encodeURIComponent(title)}&sort_by=popularity.desc&page=1`
          );

          // Get first, at most popular result (if available), this part sucks, but anyway I'm just using someones api
          // This would be better if there's like "searchMovies=[..., ..., ...]" or something but anyway
          if (data.results?.length > 0) {
            return data.results[0];
          }
          return null;
        } catch (err) {
          console.error(`Error fetching movie for ${title}:`, err);
          return null;
        }
      });

      const fetchedMovies = await Promise.all(moviePromises);

      const validMovies = fetchedMovies.filter(Boolean);

      setResults(validMovies);
    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();

    if (mode === "keyword") {
      const handler = setTimeout(() => fetchMovies(keywordQuery), 500);
      return () => clearTimeout(handler);
    }

    if (mode === "ai") {
      const handler = setTimeout(() => fetchAI(aiQuery), 500);
      return () => clearTimeout(handler);
    }
  }, [keywordQuery, aiQuery, mode]);

  const ToggleMode = () => {
    return (
      <View className="flex flex-row items-center ">
        <View className="w-28 flex items-center justify-center ">
          <Text className="text-white text-sm">Search Mode</Text>
        </View>

        <View className="flex-row bg-slate-800 rounded-full p-1 w-56">
          <TouchableOpacity
            onPress={() => setMode("keyword")}
            className={`flex flex-1 gap-2 items-center justify-center flex-row py-2 rounded-full  ${mode === "keyword" ? "bg-[#F5C518]/20" : ""}`}
          >
            <Image
              source={icons.search}
              className="w-5 h-5 "
              resizeMode="contain"
              tintColor={mode === "keyword" ? "#F5C518" : "gray"}
            />
            <Text
              className={`text-xs font-semibold ${mode === "keyword" ? "text-[#F5C518]" : "text-gray-400"}`}
            >
              Keyword
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode("ai")}
            className={`flex flex-1 items-center justify-center flex-row py-2 rounded-full ${mode === "ai" ? "bg-[#F5C518]/20" : ""}`}
          >
            <Image
              source={icons.sparkles}
              className="w-5 h-5 mr-2"
              resizeMode="contain"
              tintColor={mode === "ai" ? "#F5C518" : "gray"}
            />

            <Text
              className={`text-xs font-semibold ${mode === "ai" ? "text-[#F5C518]" : "text-gray-400"}`}
            >
              AI
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderInput = () => {
    if (mode === "keyword") {
      return (
        <View className="my-4 flex-row items-center bg-white rounded-md px-4 py-1 shadow">
          <Image
            source={icons.search}
            className="w-5 h-5 mr-2"
            resizeMode="contain"
            tintColor="gray"
          />
          <TextInput
            placeholder="Search movies..."
            value={keywordQuery}
            onChangeText={setKeywordQuery}
            placeholderTextColor="#A8B5DB"
            className="flex-1 text-base text-black"
          />
        </View>
      );
    } else {
      return (
        <View className=" my-4 flex-row items-center bg-white rounded-md px-4 py-1 shadow">
          <Image
            source={icons.sparkles}
            className="w-5 h-5 mr-2"
            resizeMode="contain"
            tintColor="#F5C518"
          />

          <TextInput
            placeholder="Describe the movie you are looking for..."
            value={aiQuery}
            onChangeText={setAIQuery}
            placeholderTextColor="#A8B5DB"
            className="flex-1 text-base text-black"
          />
        </View>
      );
    }
  };

  return (
    <ScrollView
      className="flex bg-[#0F0D23] p-6"
      contentContainerStyle={{ paddingBottom: 50, paddingTop: 60 }}
      showsVerticalScrollIndicator={false}
    >
      <ToggleMode />

      {renderInput()}

      {loading && (
        <ActivityIndicator size="large" color="#0000ff" className="my-4" />
      )}

      <FlatList
        data={results}
        scrollEnabled={false}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{
          justifyContent: "space-between",
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
