import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Header from "./components/Header.jsx";
import Dashboard from "./components/Dashboard.jsx";
import EvaluateSubmission from "./components/EvaluateSubmission.jsx";
import MyEvaluations from "./components/MyEvaluations.jsx";
import SignIn from "./components/SignIn.jsx";
import SignUp from "./components/Signup.jsx";
import Assign from "./components/Assign.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import JudgeSchedule from "./components/JudgeSchedule.jsx";

import "./App.css";

// Layout to hide sidebar & header on auth pages
function Layout({ children }) {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/signin" || location.pathname === "/signup";

  return (
    <div className="app">
      {!isAuthPage && <Header />}

      <main className={`main-content ${isAuthPage ? "sidebar-hidden" : ""}`}>
        {children}

        {!isAuthPage && (
          <footer className="footer">
            © {new Date().getFullYear()} Codora AI | Judge Evaluation Portal
          </footer>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Default route -> SignIn */}
          <Route path="/" element={<Navigate to="/signin" replace />} />

          {/* Auth Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Judge Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/judge-schedule"
            element={
              <ProtectedRoute>
                <JudgeSchedule />
              </ProtectedRoute>
            }
          />

          <Route
            path="/evaluate"
            element={
              <ProtectedRoute>
                <EvaluateSubmission />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-evaluations"
            element={
              <ProtectedRoute>
                <MyEvaluations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assign"
            element={
              <ProtectedRoute>
                <Assign />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
