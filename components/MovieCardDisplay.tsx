import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

interface MovieCardDisplayProps {
  movie: {
    id: number;
    title: string;
    poster_path: string;
    release_date?: string;
    vote_average: number;
    genre_ids?: number[];
    genres?: Array<{ id: number; name: string }>;
  };
  genreMap: Record<number, string> | null;
}

export default function MovieCardDisplay({
  movie,
  genreMap,
}: MovieCardDisplayProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/movie/[id]",
          params: { id: movie.id.toString() },
        })
      }
      className="w-[48%] rounded-xl overflow-hidden bg-[#1A1A2E]"
    >
      <Image
        source={{ uri: `${IMG_BASE}${movie.poster_path}` }}
        className="w-full h-52"
        resizeMode="cover"
      />

      <View className="p-2 gap-2">
        <View className="flex-row flex-wrap gap-1">
          {/* Use details genres if available, the save contains the genres already so need to map that thang */}
          {movie.genres && movie.genres.length > 0
            ? movie.genres.map((g) => (
                <View
                  key={g.id}
                  className="bg-[#F5C518]/20 rounded-full px-2 py-[2px]"
                >
                  <Text className="text-[#F5C518] text-xs font-medium">
                    {g.name}
                  </Text>
                </View>
              ))
            : // Usual setup in index and view page discover on which we map the ids to the genreMap
              movie.genre_ids?.map((id) => (
                <View
                  key={id}
                  className="bg-[#F5C518]/20 rounded-full px-2 py-[2px]"
                >
                  <Text className="text-[#F5C518] text-xs font-medium">
                    {genreMap?.[id] ?? "Unknown"}
                  </Text>
                </View>
              ))}
        </View>

        <Text
          numberOfLines={1}
          className="text-white text-sm font-semibold tracking-tight"
        >
          {movie.title}
        </Text>

        <Text className="text-gray-400 text-xs">
          {movie.release_date?.slice(0, 4) || "—"} • ⭐{" "}
          {movie.vote_average?.toFixed(1) ?? "N/A"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
