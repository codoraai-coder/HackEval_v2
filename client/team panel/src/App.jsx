import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

// Components
import Header from "./components/Header.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TeamInfo from "./pages/TeamInfo.jsx";
import Submissions from "./pages/Submissions.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Mentors from "./pages/Mentors.jsx";
import Analytics from "./pages/Analytics.jsx";
import Notifications from "./pages/Notifications.jsx";
import SignIn from "./pages/Auth/SignIn.jsx";
import ProfileSettings from "./pages/Auth/ProfileSettings.jsx";
import SignUp from "./pages/Auth/Signup.jsx";

// Styles
import "./pages/styles.css";

// Context
import { TeamContext } from "./context/TeamContext.js";

function App() {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  // Sidebar state removed

  // Load team data from localStorage on app start
  useEffect(() => {
    const savedTeam = localStorage.getItem("team");
    if (savedTeam) {
      try {
        const teamData = JSON.parse(savedTeam);
        setTeam(teamData);
      } catch (error) {
        localStorage.removeItem("team");
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "#1B4332",
        }}
      >
        Loading Hackathon Dashboard...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <TeamContext.Provider value={{ team, setTeam }}>
        <div className="app">
          {team ? (
            <>
              <Header />
              <main className="main-content">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/team"
                    element={
                      <PrivateRoute>
                        <TeamInfo />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/submissions"
                    element={
                      <PrivateRoute>
                        <Submissions />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/leaderboard"
                    element={
                      <PrivateRoute>
                        <Leaderboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/mentors"
                    element={
                      <PrivateRoute>
                        <Mentors />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <PrivateRoute>
                        <Analytics />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <PrivateRoute>
                        <Notifications />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <ProfileSettings />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </main>
            </>
          ) : (
            <Routes>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup"
                     element={
                      <SignUp />
                     } />
              <Route path="*" element={<Navigate to="/signin" replace />} />
            </Routes>
          )}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#4ade80",
                secondary: "#fff",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </TeamContext.Provider>
    </BrowserRouter>
  );
}

export default App;
