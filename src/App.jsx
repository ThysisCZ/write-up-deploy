import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from 'framer-motion';
import WelcomeScreen from './components/WelcomeScreen';
import SignUpScreen from './components/SignUpScreen';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import MyBooks from "./components/MyBooks";
import ProfileScreen from './components/ProfileScreen';
import Chapter from "./components/Chapter";
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import FetchHelper from "./fetchHelper";
import { path } from "framer-motion/client";
import BookDetail from "./components/BookDetail";

import "./styles/design-system.css";

const pageVariants = {

  initial: direction => ({
    opacity: 0,
    x: direction > 0 ? 50 : -50,   // slide from right for forward, left for back
    scale: 0.99,
    transition: { duration: 0.01 }
  }),

  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.36, ease: [0.2, 0.8, 0.2, 1] },
  },

  exit: direction => ({
    opacity: 0,
    x: direction < 0 ? 50 : -50,   // slide out opposite direction
    scale: 0.99,
    transition: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] },
  }),

};

export default function App() {


  // GLOBAL BOOK STATE (синхронізація з localStorage)
  const [books, setBooks] = useState([])

  const fetchBooks = async (searchParams = undefined) => {
    const fetchedBooks = await FetchHelper.books.list(searchParams)
    console.log(fetchedBooks.response)
    return Array.isArray(fetchedBooks.response) ? fetchedBooks.response : []
  }
  const fetchClientBooks = async () => {
    const clientAuthorId = localStorage.getItem("authorId");
    if (clientAuthorId == "null" || !clientAuthorId) {
      return [];
    } else {
      const fetchedBooks = await FetchHelper.books.list({ authorId: clientAuthorId })
      console.log(fetchedBooks.response)
      return Array.isArray(fetchedBooks.response) ? fetchedBooks.response : []
    }
  }

  // Load books into global state once
  useEffect(() => {
    fetchBooks().then(fetched => {
      setBooks(fetched || []);
    });
  }, []);

  const [screen, setScreen] = useState('welcome'); // welcome | signup | login | home
  // direction: +1 moving forward, -1 moving back (controls slide direction)
  const [direction, setDirection] = useState(1);
  const [animating, setAnimating] = useState(false);  // controls whether or not the exit/enter animation should play
  const [entering, setEntering] = useState(false);

  function goTo(next) {
    // simple heuristic: welcome <-> signup <-> login <-> home ordering
    const order = { welcome: 0, signup: 1, login: 2, home: 3 };
    setDirection(order[next] >= order[screen] ? 1 : -1);
    navTo(next);
  }

  const location = useLocation();
  const { pathname } = location;



  const [nextPath, setNextPath] = useState("/")

  const navigateTo = useNavigate();


  if (!localStorage.getItem("accessToken")) {
    if (pathname != "/" && pathname != "/signup" && pathname != "/login") navigateTo("/")
  }

  function navTo(to_URI, dir = 1) {
    // While animating away, do not schedule another animation and page navigation
    if (animating) return;

    setNextPath(to_URI)

    setDirection(dir);
    setAnimating(true);
    setEntering(false);
  }

  //Which state to animate to 
  function animationStateController() {

    if (entering) return { ...pageVariants.initial(direction) }

    if (!animating) return { ...pageVariants.animate }
    if (animating) return { ...pageVariants.exit(direction) }

  }

  //Enter next animation state based on the actual animation, so that there is no mismatch between time delays and processed animations
  function handleAnimationFinish() {

    if (animating) {
      navigateTo(nextPath)
      setAnimating(false);
      setEntering(true);
    }

    if (entering) {
      setEntering(false);
    }
  };

  useEffect(() => {
    try { localStorage.setItem("mybooks", JSON.stringify(books)); } catch (e) { console.warn(e); }
  }, [books]);

  // CREATE BOOK helper (отримує newBook від CreateBookModal)
  /*
  const handleCreateBookOLD = (newBook) => {
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
  };*/

  const handleCreateBook = async (newBook) => {
    const response = await FetchHelper.books.create({
      name: newBook.name || newBook.title || "Untitled",
      genre: newBook.genre || "No Genre",
      description: newBook.description || ""
    })
    console.log(response)
  }

  const loginLocal = async (response) => {
    localStorage.setItem("accessToken", response.accessToken)
    localStorage.setItem("refreshToken", response.refreshToken)
    localStorage.setItem("username", response.username)
    localStorage.setItem("email", response.email)
    localStorage.setItem("userId", response.userId)
    localStorage.setItem("authorId", response.authorId)
  }

  const removeLocalSessionData = async () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflowX: "hidden" }}>

      <AnimatePresence mode="wait">
        <Routes>

          <Route path="/"
            element={
              <motion.div
                animate={animationStateController()}
                onAnimationComplete={() => handleAnimationFinish()}

                style={{ width: '100%' }}
              >
                <WelcomeScreen onGetStarted={() => navTo('/signup', 1)} onLogin={() => navTo('/login', 1)} navToInstantly={navigateTo} />
              </motion.div>
            } />

          <Route path="/signup"
            element={
              <motion.div
                animate={animationStateController()}
                onAnimationComplete={() => handleAnimationFinish()}

                style={{ width: '100%' }}
              >
                <SignUpScreen onLogin={() => navTo('login', -1)} onRegisterSuccess={() => navTo('home', 1)} loginLocal={loginLocal} />
              </motion.div>
            } />

          <Route path="/login"
            element={
              <motion.div
                animate={animationStateController()}
                onAnimationComplete={() => handleAnimationFinish()}

                style={{ width: '100%' }}
              >

                <LoginScreen onSignUp={() => navTo('signup', 1)} onLoginSuccess={() => navTo('home', 1)} loginLocal={loginLocal} />
              </motion.div>
            } />

          <Route path="/home"
            element={
              <motion.div
                animate={animationStateController()}
                onAnimationComplete={() => handleAnimationFinish()}

                style={{ width: '100%' }}
              >

                <HomeScreen pathname={pathname}
                  setScreen={navTo}
                  onCreateBook={handleCreateBook}
                  onViewMyBooks={() => navTo("mybooks", 1)}
                  onViewChapter={(id) => navTo(`/chapter/${id}`, 1)}
                  books={books}
                  setBooks={setBooks}
                  fetchBooks={fetchBooks}
                  fetchClientBooks={fetchClientBooks}
                  removeLocalSessionData={removeLocalSessionData}
                />
              </motion.div>
            } />

          <Route path="/mybooks"
            element={
              <motion.div
                animate={animationStateController()}
                onAnimationComplete={() => handleAnimationFinish()}

                style={{ width: '100%' }}
              >
                <MyBooks
                  books={books}
                  setBooks={setBooks}
                  setScreen={navTo}
                  handleCreateBook={handleCreateBook}
                  onViewChapter={(id) => navTo(`/chapter/${id}`, 1)}
                  fetchBooks={fetchBooks}
                  fetchClientBooks={fetchClientBooks} />
              </motion.div>
            } />

          <Route path="/book/:bookid/chapter/:chapterid"
            element={
              <motion.div
                animate={animationStateController()}
                onAnimationComplete={() => handleAnimationFinish()}

                style={{ width: '100%' }}
              >

                <Chapter books={books} setScreen={navTo} fetchBooks={fetchBooks} />
              </motion.div>
            } />

          <Route path="/book/:id"
            element={
              <motion.div
                animate={animationStateController()}
                onAnimationComplete={() => handleAnimationFinish()}

                style={{ width: '100%' }}
              >

                <BookDetail setScreen={navTo} />
              </motion.div>
            } />


          <Route path="/profile"
            element={
              <motion.div
                animate={animationStateController()}
                onAnimationComplete={() => handleAnimationFinish()}

                style={{ width: '100%' }}
              >

                <ProfileScreen pathname={pathname} setScreen={navTo} />
              </motion.div>
            } />

            <Route path="/author"
            element={
              <motion.div
                animate={animationStateController()}
                onAnimationComplete={() => handleAnimationFinish()}

                style={{ width: '100%' }}
              >

                <ProfileScreen pathname={pathname} setScreen={navTo} />
              </motion.div>
            } />
        </Routes>
      </AnimatePresence>
    </div>
  );

}