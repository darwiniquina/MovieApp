import MovieCardDisplay from "@/components/MovieCardDisplay";
import { icons } from "@/constants/icons";
import { Credit, Movie } from "@/interfaces/interfaces";
import movieFetch from "@/services/movieFetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function MovieDetails() {
  const router = useRouter();

  const imgBase = "https://image.tmdb.org/t/p/w500";
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<Movie | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const fetchMovies = async () => {
    setLoading(true);

    try {
      const [detailsResult, creditsResult, similarResult, genreResult] =
        await Promise.all([
          movieFetch(`/movie/${id}?language=en-US`),
          movieFetch(`/movie/${id}/credits?language=en-US`),
          movieFetch(`/movie/${id}/similar?language=en-US&page=1`),
          movieFetch(`/genre/movie/list?language=en`),
        ]);

      setDetails(detailsResult);
      setCredits(creditsResult.cast);
      setSimilar(similarResult.results.slice(0, 6));
      setGenres(genreResult.genres);

      await checkIfSaved(detailsResult.id);
    } catch (err) {
      console.error("TMDB fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async (movieId: number) => {
    try {
      const stored = await AsyncStorage.getItem("savedMovies");
      const savedMovies = stored ? JSON.parse(stored) : [];
      setIsSaved(savedMovies.some((m: any) => m.id === movieId));
    } catch (error) {
      console.error("Failed to check saved movie", error);
    }
  };

  const toggleSaveMovie = async () => {
    if (!details) return;

    try {
      const stored = await AsyncStorage.getItem("savedMovies");
      const savedMovies = stored ? JSON.parse(stored) : [];

      const alreadySaved = savedMovies.some((m: any) => m.id === details.id);
      let updatedMovies;

      if (alreadySaved) {
        updatedMovies = savedMovies.filter((m: any) => m.id !== details.id);
        setIsSaved(false);
        console.log("Movie removed!");
      } else {
        updatedMovies = [...savedMovies, details];
        setIsSaved(true);
        console.log("Movie saved!");
      }

      await AsyncStorage.setItem("savedMovies", JSON.stringify(updatedMovies));
    } catch (error) {
      console.error("Failed to toggle save", error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [id]);

  function HeaderMetaData({ icon, text }: { icon: any; text: any }) {
    return (
      <View className="flex flex-row items-center gap-1">
        <Image source={icon} tintColor="#fad13e" className="w-4 h-4" />
        <Text className=" text-gray-300 text-md">{text}</Text>
      </View>
    );
  }

  const genreMap = useMemo(() => {
    const map: Record<number, string> = {};
    genres.forEach((g: any) => (map[g.id] = g.name));
    return map;
  }, [genres]);

  return (
    <View className="flex-1 bg-[#0F0D23] ">
      {loading ? (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-gray-300 mt-2">Fetching movie...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 bg-[#0F0D23]"
          contentContainerStyle={{ paddingBottom: 10, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER IMAGE + BUTTONS */}
          <View className="h-96 overflow-hidden relative ">
            <Image
              source={{ uri: `${imgBase}${details?.backdrop_path}` }}
              className="w-full h-full"
              resizeMode="cover"
            />

            <View className="p-4 absolute inset-0 bg-black/40 justify-end gap-2">
              {/* BACK BUTTON */}
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.8}
                className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center border border-white/10 shadow-lg"
              >
                <Image
                  source={icons.left}
                  tintColor="#F5C518"
                  className="w-5 h-5"
                />
              </TouchableOpacity>

              {/* SAVE / UNSAVE BUTTON */}
              <TouchableOpacity
                onPress={toggleSaveMovie}
                activeOpacity={0.8}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center border border-white/10 shadow-lg"
              >
                <Image
                  source={icons.save}
                  tintColor={isSaved ? "#F5C518" : "white"}
                  className="w-5 h-5"
                />
              </TouchableOpacity>

              <Text className=" text-white text-4xl font-bold">
                {details?.title}
              </Text>

              {/* GENRES */}
              <View className="flex-row flex-wrap gap-1">
                {details?.genres.map((g) => (
                  <View
                    key={g.id}
                    className="bg-[#F5C518]/70 rounded-full px-2 py-1"
                  >
                    <Text className="text-white text-xs font-medium">
                      {g.name}
                    </Text>
                  </View>
                ))}
              </View>

              {/* RUNTIME / RATING / YEAR */}
              <View className="flex flex-row gap-2">
                <HeaderMetaData
                  icon={icons.star}
                  text={details?.vote_average}
                />
                <HeaderMetaData icon={icons.timer} text={details?.runtime} />
                <HeaderMetaData
                  icon={icons.calendar}
                  text={details?.release_date?.slice(0, 4)}
                />
              </View>
            </View>
          </View>

          {/* OVERVIEW */}
          <View className="flex gap-4 mx-4">
            <Text className="text-white text-xl font-semibold">Overview</Text>
            <Text className="text-white text-md leading-6">
              {details?.overview}
            </Text>
          </View>

          {/* CAST */}
          <View className="flex gap-4 mx-4">
            <Text className="text-white text-xl font-semibold">Cast</Text>
            <FlatList
              horizontal
              data={credits}
              contentContainerStyle={{ gap: 26 }}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: credit }) => (
                <View className="flex flex-col gap-1 items-center">
                  <Image
                    source={{ uri: `${imgBase}${credit.profile_path}` }}
                    className="w-16 h-16 rounded-full"
                    resizeMode="cover"
                  />
                  <Text className="text-white text-sm font-semibold">
                    {credit.character}
                  </Text>
                  <Text className="text-gray-300 text-xs">{credit.name}</Text>
                </View>
              )}
            />
          </View>

          {/* SIMILAR MOVIES */}
          <View className="flex gap-4 mx-4">
            <Text className="text-white text-xl font-semibold">Similar</Text>
            <FlatList
              scrollEnabled={false}
              data={similar}
              numColumns={2}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={{
                justifyContent: "space-between",
              }}
              renderItem={({ item: movie }) => (
                <MovieCardDisplay movie={movie} genreMap={genreMap} />
              )}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}
