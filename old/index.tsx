/**
 * Точка входа приложения
 * 
 * AuthProvider оборачивает всё приложение для предоставления
 * контекста аутентификации во всех компонентах.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './auth/AuthContext';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
