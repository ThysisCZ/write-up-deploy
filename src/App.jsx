// src/App.jsx
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import WelcomeScreen from './components/WelcomeScreen';
import SignUpScreen from './components/SignUpScreen';
import LoginScreen from './components/LoginScreen';

const pageVariants = {
  initial: direction => ({
    opacity: 0,
    x: direction > 0 ? 50 : -50,   // slide from right for forward, left for back
    scale: 0.99,
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
  const [screen, setScreen] = useState('welcome'); // welcome | signup | login
  // direction: +1 moving forward, -1 moving back (controls slide direction)
  const [direction, setDirection] = useState(1);

  function goTo(next) {
    // simple heuristic: welcome <-> signup <-> login ordering
    const order = { welcome: 0, signup: 1, login: 2 };
    setDirection(order[next] >= order[screen] ? 1 : -1);
    setScreen(next);
  }

  return (
    <div style={{ position: 'relative' }}>
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
            <SignUpScreen onLogin={() => goTo('login')} />
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
            <LoginScreen onSignUp={() => goTo('signup')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}