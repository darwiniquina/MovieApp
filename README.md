# Movie App

A sleek and intelligent movie discovery app powered by **TMDB** (The Movie Database) and **AssemblyAI**.  
Type what you want to watch — whether it’s “a mind-bending sci-fi about dreams” or “movies like Parasite” —  
and the app intelligently recommends films, complete with posters, genres, and details.

---

Sample Screenshots

![First Screenhots](https://github.com/user-attachments/assets/ca010333-17c3-4515-ba2a-fd0aa9ee4198)

![Second Screenhots](https://github.com/user-attachments/assets/ae4cc6ed-f11d-4964-a71d-c26b51f62c3c)

---

## ✨ Overview

This project explores design, AI, and clean mobile development with **React Native** and **Expo**.  
It merges two APIs — **AssemblyAI** for natural language understanding and **TMDB** for movie data —  
to create a smart and seamless browsing experience.

---

## 🧠 How the AI Movie Generation Works

The AI movie generation is a side module — you can still browse movies normally using the TMDB API.  
When you describe what you want to watch, the app sends your text to **AssemblyAI**,  
which interprets your intent and returns a list of possible movie titles.  
Those titles are then fetched from **TMDB**, where you get full movie details like posters, ratings, and genres.

It’s a creative fusion of **AI-generated reasoning** and **real-world movie data**.

---

## 🖼️ Features

- AI-powered and keyword-based search modes  
- Natural language recommendations through AssemblyAI  
- Real-time data from The Movie Database (TMDB)  
- Local favorites saved with AsyncStorage  
- Clean and adaptive React Native UI with Tailwind styling  
- Pull-to-refresh and smooth scrolling experience  

---

## 🧩 Tech Stack

- React Native Expo  
- TypeScript  
- NativeWind (Tailwind CSS for React Native)  
- TMDB API  
- AssemblyAI Chat API  
- AsyncStorage for local persistence  
