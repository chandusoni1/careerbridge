import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const getSystemTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark'; // Safe fallback
};

export const ThemeProvider = ({ children }) => {
  // 1. themePreference: 'system' | 'light' | 'dark'
  // - Default for new users: 'system'
  // - Backward compatibility: if previous 'cb_theme' exists and is 'light' or 'dark', preserve it!
  const [themePreference, setThemePreferenceState] = useState(() => {
    const savedPref = localStorage.getItem('cb_theme_preference');
    if (savedPref === 'system' || savedPref === 'light' || savedPref === 'dark') {
      return savedPref;
    }
    const legacy = localStorage.getItem('cb_theme');
    if (legacy === 'light' || legacy === 'dark') {
      return legacy;
    }
    return 'system'; // Default for all new users
  });

  // 2. Resolved appearance: 'light' | 'dark'
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    const pref =
      localStorage.getItem('cb_theme_preference') ||
      localStorage.getItem('cb_theme') ||
      'system';
    if (pref === 'light') return 'light';
    if (pref === 'dark') return 'dark';
    return getSystemTheme();
  });

  // 3. Listen to OS system preference changes dynamically when preference is 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => {
      if (themePreference === 'system') {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleSystemChange);
      }
    };
  }, [themePreference]);

  // 4. Update resolvedTheme whenever themePreference changes
  useEffect(() => {
    let effective = themePreference;
    if (themePreference === 'system') {
      effective = getSystemTheme();
    }
    setResolvedTheme(effective);
  }, [themePreference]);

  // 5. Apply resolved theme classes to <html> document root and persist preference
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }

    localStorage.setItem('cb_theme_preference', themePreference);
    localStorage.setItem('cb_theme', resolvedTheme);
  }, [resolvedTheme, themePreference]);

  const setThemePreference = (pref) => {
    if (pref === 'system' || pref === 'light' || pref === 'dark') {
      setThemePreferenceState(pref);
    }
  };

  const toggleTheme = () => {
    setThemePreferenceState((prev) => {
      if (prev === 'system') return 'light';
      if (prev === 'light') return 'dark';
      return 'system';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme, // Backward compatible: 'light' | 'dark'
        themePreference, // 'system' | 'light' | 'dark'
        setThemePreference,
        toggleTheme,
        setTheme: setThemePreference, // Backward compatibility
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
