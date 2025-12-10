
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import Dashboard from "./components/Dashboard.jsx";
import EvaluateSubmission from "./components/EvaluateSubmission.jsx";
import MyEvaluations from "./components/MyEvaluations.jsx";
import SignIn from "./components/SignIn.jsx";
import SignUp from "./components/Signup.jsx"; // Import the SignUp component
import Assign from "./components/Assign.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./App.css";

// Layout to hide sidebar/footer on SignIn and SignUp pages
function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/signin" || location.pathname === "/signup";
  return (
    <div className="app">
      {!isAuthPage && <Header />}
      {!isAuthPage && <Sidebar isOpen={true} />}
      <main className="main-content">
        {children}
        {!isAuthPage && (
          <footer className="footer">
            © {new Date().getFullYear()} GLA University | Judge Evaluation Portal
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

          {/* Judge Portal - Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/evaluate" element={
            <ProtectedRoute>
              <EvaluateSubmission />
            </ProtectedRoute>
          } />
          <Route path="/my-evaluations" element={
            <ProtectedRoute>
              <MyEvaluations />
            </ProtectedRoute>
          } />
          <Route path="/assign" element={
            <ProtectedRoute>
              <Assign />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;