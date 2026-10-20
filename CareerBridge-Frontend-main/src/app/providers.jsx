import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, ThemeProvider } from '../stores';

export const AppProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default AppProviders;
