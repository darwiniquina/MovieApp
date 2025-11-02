import MovieCardDisplay from "@/components/MovieCardDisplay";
import { Movie } from "@/interfaces/interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

const Save = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedMovies = async () => {
    try {
      const stored = await AsyncStorage.getItem("savedMovies");
      const savedMovies: Movie[] = stored ? JSON.parse(stored) : [];
      setMovies(savedMovies);
    } catch (error) {
      console.error("Failed to load saved movies:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSavedMovies();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadSavedMovies();
  }, []);

  if (movies.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-20 bg-[#0F0D23]">
        <Text className="text-gray-300 mt-2">No Saved Movies</Text>
      </View>
    );
  }

  return (
    <FlatList
      className="bg-[#0F0D23] p-4"
      data={movies}
      numColumns={2}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={{
        justifyContent: "space-between",
        marginBottom: 5,
      }}
      contentContainerStyle={{
        paddingBottom: 100,
        paddingTop: 40,
        gap: 10,
      }}
      renderItem={({ item: movie }) => (
        <MovieCardDisplay movie={movie} genreMap={{}} />
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#F5C518"
          colors={["#F5C518"]}
        />
      }
    />
  );
};

export default Save;
