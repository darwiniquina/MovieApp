import axios from "axios";

export default async function aiFetchTitles(
  searchQuery: string,
): Promise<string[]> {

  const limit = 5;
  
  if (!searchQuery) return [];

  try {
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
      }
    );

    const text = response.data.choices?.[0]?.message?.content;
    if (!text) return [];

    try {
      const parsed = JSON.parse(text);
      // Ensure a clean array of unique string titles
      return Array.isArray(parsed)
        ? [...new Set(parsed.map((t) => String(t).trim()))].filter(Boolean)
        : [];
    } catch {
      console.warn("AI response not valid JSON:", text);
      return [];
    }
  } catch (error) {
    console.error("AI fetch error:", error);
    return [];
  }
}
