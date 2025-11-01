import MovieCardDisplay from "@/components/MovieCardDisplay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

interface Movie {
  id: number;
  title: string;
  backdrop_path: string;
  genre_ids: number[];
  vote_average: number;
  release_date?: string;
  poster_path: string;
}

const Save = () => {
  const [movies, setMovies] = useState<Movie[] | null>([]);

  const loadSavedMovies = async () => {
    const stored = await AsyncStorage.getItem("savedMovies");
    const savedMovies: Movie[] = stored ? JSON.parse(stored) : [];

    setMovies(savedMovies);
  };

  useEffect(() => {
    loadSavedMovies();
  }, []);

  if (movies?.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-20 bg-[#0F0D23]">
        <Text className="text-gray-300 mt-2">No Saved Movies</Text>
      </View>
    );
  }

  return (
    <FlatList
      className=" bg-[#0F0D23] p-4 "
      scrollEnabled={false}
      data={movies}
      numColumns={2}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={{
        justifyContent: "space-between",
        marginBottom: 5,
      }}
      contentContainerStyle={{ paddingBottom: 100, paddingTop: 40, gap: 10 }}
      renderItem={({ item: movie }) => (
        <MovieCardDisplay movie={movie} genreMap={{}} />
      )}
    />
  );
};

export default Save;
