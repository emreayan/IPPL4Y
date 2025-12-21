import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Login from "./components/Login";
import Home from "./components/Home";
import Player from "./components/Player";
import { Toaster } from "./components/ui/sonner";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/player"
          element={
            <ProtectedRoute>
              <Player />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
