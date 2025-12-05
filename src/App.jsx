// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import WelcomeScreen from "./components/WelcomeScreen";
import SignUpScreen from "./components/SignUpScreen";
import LoginScreen from "./components/LoginScreen";
import HomeScreen from "./components/HomeScreen";
import MyBooks from "./components/MyBooks";
import ProfileScreen from "./components/ProfileScreen";
import BookDetail from "./components/BookDetail";

export default function App() {
  const navigate = useNavigate();

  // GLOBAL BOOK STATE (синхронізація з localStorage)
  const [books, setBooks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mybooks") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem("mybooks", JSON.stringify(books)); } catch (e) { console.warn(e); }
  }, [books]);

  // CREATE BOOK helper (отримує newBook від CreateBookModal)
  const handleCreateBook = (newBook) => {
    const book = {
      id: newBook.id ?? Date.now().toString(),
      title: newBook.title || "Untitled",
      description: newBook.description || "",
      chapters: Array.isArray(newBook.chapters)
        ? newBook.chapters.map(t => (typeof t === "string" ? { title: t, content: "" } : t))
        : [],
      lastEdited: newBook.lastEdited ?? new Date().toISOString(),
    };

    setBooks(prev => {
      const next = [book, ...(prev || [])];
      try { localStorage.setItem("mybooks", JSON.stringify(next)); } catch (e) { console.warn(e); }
      return next;
    });
  };

  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen onGetStarted={() => navigate("/signup")} onLogin={() => navigate("/login")} />} />

      <Route path="/signup" element={<SignUpScreen onLogin={() => navigate("/login")} onRegisterSuccess={() => navigate("/home")} />} />

      <Route path="/login" element={<LoginScreen onSignUp={() => navigate("/signup")} onLoginSuccess={() => navigate("/home")} />} />

      <Route path="/home" element={
        <HomeScreen
          setScreen={navigate}
          onCreateBook={handleCreateBook}
          onViewMyBooks={() => navigate("/mybooks")}
          books={books}
          setBooks={setBooks}
        />
      } />

      <Route path="/mybooks" element={<MyBooks books={books} setBooks={setBooks} onViewBook={(id) => navigate(`/book/${id}`)} />} />

      <Route path="/book/:id" element={<BookDetail books={books} setBooks={setBooks} />} />

      <Route path="/profile" element={<ProfileScreen setScreen={navigate} />} />
    </Routes>
  );
}