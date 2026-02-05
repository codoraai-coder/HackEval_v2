import React from "react";
import {
  Routes,
  Route,
  Navigate,
  BrowserRouter,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import TeamInfo from "./pages/TeamInfo.jsx";
import Submissions from "./pages/Submissions.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
// import Mentors from "./pages/Mentors.jsx"; // COMMENTED OUT - Mentor feature disabled
import Analytics from "./pages/Analytics.jsx";
import Notifications from "./pages/Notifications.jsx";
import ProfileSettings from "./pages/Auth/ProfileSettings.jsx";

import SignIn from "./pages/Auth/SignIn.jsx";
import SignUp from "./pages/Auth/Signup.jsx";
import ProgramSchedule from "./pages/ProgramSchedule.jsx";

import { TeamProvider } from "./context/TeamContext.jsx";
import "./pages/styles.css";

function AppLayout() {
  const location = useLocation();

  const hideHeader =
    location.pathname === "/signin" ||
    location.pathname === "/signup";

  return (
    <div className="app">
      {!hideHeader && <Header />}

      <main className="main-content">
        <Routes>
          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
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
            path="/program-schedule"
            element={
              <PrivateRoute>
                <ProgramSchedule />
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
          {/* COMMENTED OUT - Mentor feature disabled
          <Route
            path="/mentors"
            element={
              <PrivateRoute>
                <Mentors />
              </PrivateRoute>
            }
          />
          */}
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

          {/* Public routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TeamProvider>
        <AppLayout />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: "#363636", color: "#fff" },
            success: {
              duration: 3000,
              iconTheme: { primary: "#4ade80", secondary: "#fff" },
            },
            error: {
              duration: 5000,
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />
      </TeamProvider>
    </BrowserRouter>
  );
}

export default App;
