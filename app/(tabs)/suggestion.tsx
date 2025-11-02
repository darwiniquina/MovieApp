import { icons } from "@/constants/icons";
import { Movie } from "@/interfaces/interfaces";
import movieFetch from "@/services/movieFetch";
import axios from "axios";
import { useRouter } from "expo-router";
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

const imgBase = "https://image.tmdb.org/t/p/w500";

const Suggestion = () => {
  const router = useRouter();
  const [aiQuery, setAIQuery] = useState("");

  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<any[]>([]);
  const abortControllerRef = React.useRef<AbortController | null>(null);

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

  function GenreDisplay({ genreIds }: { genreIds: number[] }) {
    return (
      <View className="flex-row flex-wrap gap-1">
        {genreIds.map((id) => (
          <View key={id} className="bg-[#F5C518]/20 rounded-full px-2 py-1">
            <Text className="text-[#F5C518] text-xs font-medium">
              {genreMap[id]}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  const fetchAI = async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const limit = 6;

      const messages = [
        {
          role: "system",
          content: `
    You are a passionate movie recommendation assistant.
    Your goal is to convince the user to watch certain movies — not just describe them.
    For each suggestion, give a short, engaging explanation that connects directly to the user's input and viewing taste.

    Return a JSON array in this format:
    [
      { "title": "Movie Title", "explanation": "A short persuasive reason why this movie is a great pick based on the user's request." }
    ]

    Keep explanations conversational, natural, and specific — like:
    "If you love emotionally rich sci-fi like Interstellar, this will hit the same notes."
    or
    "Perfect if you're into fast-paced thrillers with clever twists."

    Do NOT summarize the plot. Focus on *why the user would enjoy it*.
    `,
        },
        {
          role: "user",
          content: `List up to ${limit} movies that match this description: "${searchQuery}".`,
        },
      ];

      const response = await axios.post(
        "https://llm-gateway.assemblyai.com/v1/chat/completions",
        {
          model: "gpt-4.1",
          messages,
          temperature: 0.5,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: process.env.EXPO_PUBLIC_AI_KEY,
            "Content-Type": "application/json",
          },
          signal: controller.signal, // attach abort signal here!
        }
      );

      const result = response.data.choices?.[0]?.message?.content;
      const parsed = JSON.parse(result);

      const moviePromises = parsed.map(
        async (item: { title: string; explanation: string }) => {
          try {
            const data = await movieFetch(
              `/search/movie?query=${encodeURIComponent(item.title)}&sort_by=popularity.desc&page=1`
            );
            return data.results?.[0] || null;
          } catch (err) {
            if (axios.isCancel(err)) {
              console.log("Cancelled TMDB fetch:", item.title);
            }
            return null;
          }
        }
      );

      const fetchedMovies = await Promise.all(moviePromises);

      const validMovies = fetchedMovies
        .map((movie, index) => {
          if (!movie) return null;
          return { ...movie, explanation: parsed[index]?.explanation || "" };
        })
        .filter(Boolean);

      if (!controller.signal.aborted) {
        setResults(validMovies);
      }

      // Only update state if request wasn’t aborted
      if (!controller.signal.aborted) {
        setResults(validMovies);
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("Previous AI request aborted");
      } else {
        console.error("AI Search Error:", error);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchGenres();

    const handler = setTimeout(() => fetchAI(aiQuery), 800);

    return () => {
      clearTimeout(handler);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort(); // cancel old API call
      }
    };
  }, [aiQuery]);

  const renderInput = () => {
    return (
      <View className="rounded-2xl mx-4 my-4 flex-row items-center bg-white  px-4 py-1 shadow">
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
          className="flex-1 text-base text-black h-16"
          multiline
          numberOfLines={4}
        />
      </View>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-[#0F0D23]"
      contentContainerStyle={{ paddingTop: 60, paddingBottom: 70 }}
      showsVerticalScrollIndicator={false}
    >
      {renderInput()}

      {!results.length && !loading && (
        <View className="flex-row items-start mx-6 mb-5">
          <Image
            source={icons.lightbulb}
            className="w-5 h-5 mt-0.5 mr-2"
            resizeMode="contain"
            tintColor="#F5C518"
          />
          <Text className="text-[#C5C7D0] text-sm leading-5 flex-1">
            Try something like: “I want a slow-burn mystery set in space with
            emotional depth.”
          </Text>
        </View>
      )}

      {loading && (
        <ActivityIndicator size="large" color="#F5C518" className="my-6" />
      )}

      <FlatList
        data={results}
        scrollEnabled={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
        renderItem={({ item: movie }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/movie/[id]",
                params: { id: movie.id.toString() },
              })
            }
            className="rounded-2xl overflow-hidden relative"
          >
            <Image
              source={{ uri: `${imgBase}${movie.backdrop_path}` }}
              className="w-full h-40"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/50 justify-end p-3">
              <GenreDisplay genreIds={movie.genre_ids} />
              <Text className="text-white text-lg font-semibold mt-1">
                {movie.title}
              </Text>
              {movie.explanation ? (
                <Text
                  className="text-gray-200 text-xs italic mt-0.5"
                  numberOfLines={3}
                >
                  {movie.explanation}
                </Text>
              ) : null}
              <Text className="text-gray-300 text-xs mt-1">
                ⭐ {movie.vote_average.toFixed(1)} •{" "}
                {movie.release_date?.slice(0, 4)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
};

export default Suggestion;
