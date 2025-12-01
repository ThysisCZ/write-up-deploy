// src/App.jsx
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import WelcomeScreen from './components/WelcomeScreen';
import SignUpScreen from './components/SignUpScreen';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import CreateBookScreen from './components/CreateBookScreen';
import ProfileScreen from './components/ProfileScreen';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

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
  function navTo(to_URI, dir) {
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

  }

  // URI-based route switching
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
                <WelcomeScreen onGetStarted={() => navTo('/signup', 1)} onLogin={() => navTo('/login', 1)} />
              </motion.div>
            } />


          <Route path="/login"
            element={
              <motion.div
                animate={animationStateController()}
                onAnimationComplete={() => handleAnimationFinish()}

                style={{ width: '100%' }}
              >

                <LoginScreen onSignUp={() => navTo('signup', 1)} onLoginSuccess={() => navTo('home', 1)} />
              </motion.div>
            } />


          <Route path="/signup"
            element={
              <motion.div
                animate={animationStateController()}
                onAnimationComplete={() => handleAnimationFinish()}

                style={{ width: '100%' }}
              >

                <SignUpScreen onLogin={() => navTo('login', -1)} onRegisterSuccess={() => navTo('home', 1)} />
              </motion.div>
            } />

          <Route path="/home"
            element={
              (pathname === "/home" && <motion.div
                animate={animationStateController()}
                onAnimationComplete={() => handleAnimationFinish()}

                style={{ width: '100%' }}
              >

                <HomeScreen pathname={pathname} setScreen={navTo} />
              </motion.div>)
            } />

          <Route path="/books"
            element={
              (pathname === "/books" && <motion.div
                animate={animationStateController()}
                onAnimationComplete={() => handleAnimationFinish()}

                style={{ width: '100%' }}
              >

                <CreateBookScreen pathname={pathname} setScreen={navTo} />
              </motion.div>)
            } />

          <Route path="/profile"
            element={
              (pathname === "/profile" && <motion.div
                animate={animationStateController()}
                onAnimationComplete={() => handleAnimationFinish()}

                style={{ width: '100%' }}
              >

                <ProfileScreen pathname={pathname} setScreen={navTo} />
              </motion.div>)
            } />
        </Routes>
      </AnimatePresence>
    </div>
  );

  /*
    Additional routes
    /profile (with user ID query)
    /book    (with book ID query)
    /chapter (with book ID and chapter ID query)
    ...
  */


  // Previous state-based route switching, with animations
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflowX: "hidden" }}>
      <AnimatePresence mode="wait" initial={false}>
        {screen === 'welcome' && (
          <motion.div
            key="welcome"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%' }}
          >
            <WelcomeScreen onGetStarted={() => goTo('signup')} onLogin={() => goTo('login')} />
          </motion.div>
        )}

        {screen === 'signup' && (
          <motion.div
            key="signup"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%' }}
          >
            <SignUpScreen onLogin={() => goTo('login')} onRegisterSuccess={() => goTo('home')} />
          </motion.div>
        )}

        {screen === 'login' && (
          <motion.div
            key="login"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%' }}
          >
            <LoginScreen onSignUp={() => goTo('signup')} onLoginSuccess={() => goTo('home')} />
          </motion.div>
        )}

        {screen === 'home' && (
          <motion.div
            key="home"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%' }}
          >
            <HomeScreen setScreen={setScreen} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}