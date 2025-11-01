import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  interface Movie {
    id: number;
    title: string;
    backdrop_path: string;
    genre_ids: number[];
    vote_average: number;
    release_date?: string;
    poster_path: string;
  }
  const [featured, setFeatured] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<"day" | "week">("day");

  const imgBase = "https://image.tmdb.org/t/p/w500";

  const TMDB_HEADERS = {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_API_KEY}`,
  };

  const TMDB_BASE = "https://api.themoviedb.org/3";

  const fetchFromTMDB = async (endpoint: string) => {
    const url = `${TMDB_BASE}${endpoint}`;
    const res = await axios.get(url, { headers: TMDB_HEADERS });

    return res.data.results;
  };

  const genreMap = useMemo(() => {
    const map: Record<number, string> = {};
    genres.forEach((g) => (map[g.id] = g.name));
    return map;
  }, [genres]);

  useEffect(() => {
    fetchMovies();
  }, [selectedFilter]);

  const fetchMovies = async () => {
    setLoading(true);

    try {
      const [featuredResults, trendingResults, genresResults] =
        await Promise.all([
          fetchFromTMDB(`/discover/movie?sort_by=popularity.desc`),
          fetchFromTMDB(`/trending/movie/${selectedFilter}`),
          axios
            .get(`${TMDB_BASE}/genre/movie/list?language=en`, {
              headers: TMDB_HEADERS,
            })
            .then((res) => res.data.genres),
        ]);

      setFeatured(featuredResults.slice(0, 3));
      setTrending(trendingResults.slice(0, 8));
      setGenres(genresResults);
    } catch (err) {
      console.error("TMDB fetch error:", err);
    } finally {
      setLoading(false);
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

  return (
    <ScrollView
      className="flex-1 bg-[#0F0D23] p-4 "
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-white text-3xl font-bold mb-3">Discover</Text>

      {loading ? (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-gray-300 mt-2">Fetching movies...</Text>
        </View>
      ) : (
        <>
          <Text className="text-white text-xl font-semibold mb-2">
            Featured Picks
          </Text>

          {/* Featured Picks */}
          <FlatList
            data={featured}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ marginBottom: 16 }}
            renderItem={({ item: movie }) => (
              <View className=" h-36 rounded-2xl overflow-hidden relative">
                <Image
                  source={{ uri: `${imgBase}${movie.backdrop_path}` }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/40 justify-end p-3">
                  <GenreDisplay genreIds={movie.genre_ids} />
                  {/* <View className="flex-row flex-wrap gap-1">
                    {movie.genre_ids.map((id) => (
                      <View
                        key={id}
                        className="bg-blue-700/60 px-2 py-1 rounded-full"
                      >
                        <Text className="text-white text-xs">
                          {genreMap[id]}
                        </Text>
                      </View>
                    ))}
                  </View> */}

                  <Text className="text-white text-lg font-semibold">
                    {movie.title}
                  </Text>

                  <Text className="text-gray-300 text-xs">
                    ⭐ {movie.vote_average.toFixed(1)} •{" "}
                    {movie.release_date?.slice(0, 4)}
                  </Text>
                </View>
              </View>
            )}
          />

          {/* Option part */}
          <View className="flex-row items-center justify-between mt-2 mb-4">
            <Text className="text-white text-xl font-semibold">Trending</Text>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setSelectedFilter("day")}
                className={`px-4 py-1 rounded-full ${
                  selectedFilter === "day"
                    ? "bg-[#F5C518]/20 text-[#F5C518]"
                    : "bg-gray-700"
                }`}
              >
                <Text
                  className={`text-sm ${selectedFilter === "day" ? "text-[#F5C518]" : "text-white"}`}
                >
                  Today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedFilter("week")}
                className={`px-4 py-1 rounded-full ${
                  selectedFilter === "week"
                    ? "bg-[#F5C518]/20 text-[#F5C518]"
                    : "bg-gray-700"
                }`}
              >
                <Text
                  className={`text-sm ${selectedFilter === "week" ? "text-[#F5C518]" : "text-white"}`}
                >
                  This Week
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            scrollEnabled={false}
            data={trending}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 5,
            }}
            contentContainerStyle={{}}
            renderItem={({ item: movie }) => (
              <View className="w-[48%] rounded-xl overflow-hidden bg-gray-800">
                <Image
                  source={{ uri: `${imgBase}${movie.poster_path}` }}
                  className="w-full h-52"
                  resizeMode="cover"
                />
                <View className="p-2 flex justify-end gap-2">
                  <GenreDisplay genreIds={movie.genre_ids} />

                  <Text
                    numberOfLines={1}
                    className="text-white text-base font-medium"
                  >
                    {movie.title}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {movie.release_date?.slice(0, 4)} • ⭐{" "}
                    {movie.vote_average.toFixed(1)}
                  </Text>
                </View>
              </View>
            )}
          />
        </>
      )}
    </ScrollView>
  );
}
