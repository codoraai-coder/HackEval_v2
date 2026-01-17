// import React, { useEffect, useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Sidebar from './components/Sidebar.jsx';
// import Header from './components/Header.jsx';
// import Dashboard from './components/Dashboard.jsx';
// import RoundScheduler from './components/RoundScheduler.jsx';
// import JudgeAssignment from './components/JudgeAssignment.jsx';
// import ScoreCompiler from './components/ScoreCompiler.jsx';
// import Leaderboard from './components/Leaderboard.jsx';
// import MentorManagement from './components/MentorManagement.jsx';
// import ExcelUpload from './components/ExcelUpload.jsx';
// import Login from './components/Login.jsx';
// import AdminSignup from './components/Signup.jsx'; // Add this import
// import FinalSubmissionList from './components/FinalSubmissionList.jsx';
// import './App.css';

// function App() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(() => {
//     try {
//       return Boolean(localStorage.getItem('authToken'));
//     } catch {
//       return false;
//     }
//   });
//   const [userInfo, setUserInfo] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem('authUser') || '{}');
//     } catch {
//       return {};
//     }
//   });

//   // Active round (for Header display)
//   const [activeRound, setActiveRound] = useState(null);

//   useEffect(() => {
//     let timerId;
//     let mounted = true;
//     const fetchActive = async () => {
//       try {
//         const token = localStorage.getItem('authToken');
//         const res = await fetch('http://localhost:8000/round-state/active', {
//           headers: token ? { 'Authorization': `Bearer ${token}` } : {}
//         });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (!mounted) return;
//         setActiveRound(data.round);
//       } catch {}
//     };

//     if (isAuthenticated) {
//       fetchActive();
//       timerId = setInterval(fetchActive, 5000);
//     }

//     return () => { 
//       mounted = false; 
//       if (timerId) clearInterval(timerId); 
//     };
//   }, [isAuthenticated]);

//   const handleLogin = (user) => {
//     try {
//       localStorage.setItem('authUser', JSON.stringify(user));
//       localStorage.setItem('authToken', user.token);
//       setUserInfo(user);
//     } catch {}
//     setIsAuthenticated(true);
//     setSidebarOpen(false);
//   };

//   const handleLogout = () => {
//     try {
//       localStorage.removeItem('authUser');
//       localStorage.removeItem('authToken');
//       localStorage.removeItem('userType');
//       localStorage.removeItem('userEmail');
//     } catch {}
//     setIsAuthenticated(false);
//     setUserInfo({});
//     setSidebarOpen(false);
//   };

//   useEffect(() => {
//     const onResize = () => {
//       if (window.innerWidth < 1024) {
//         setSidebarOpen(false);
//       }
//     };
//     window.addEventListener('resize', onResize);
//     return () => window.removeEventListener('resize', onResize);
//   }, []);

//   const ProtectedRoute = ({ children, adminOnly = false }) => {
//     if (!isAuthenticated) {
//       return <Navigate to="/login" replace />;
//     }

//     if (adminOnly && userInfo.userType !== 'admin') {
//       return (
//         <div className="container">
//           <h2>Access Denied</h2>
//           <p>You need admin privileges to access this page.</p>
//         </div>
//       );
//     }

//     return children;
//   };

//   return (
//     <Router>
//       <div className={`app ${sidebarOpen ? 'sidebar-opened' : ''}`}>
//         {isAuthenticated && (
//           <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userType={userInfo.userType} />
//         )}
//         <div className="main-content">
//           {isAuthenticated && (
//             <Header 
//               onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
//               onLogout={handleLogout} 
//               activeRound={activeRound}
//               userEmail={userInfo.email}
//               userType={userInfo.userType}
//             />
//           )}
//           <main className="content">
//             <Routes>
//               <Route
//                 path="/"
//                 element={
//                   isAuthenticated ? (
//                     <Navigate to="/dashboard" replace />
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />
//               <Route
//                 path="/login"
//                 element={
//                   isAuthenticated ? (
//                     <Navigate to="/dashboard" replace />
//                   ) : (
//                     <Login onLogin={handleLogin} />
//                   )
//                 }
//               />
//               <Route
//   path="/judge-signup"
//   element={
//     isAuthenticated ? (
//       <Navigate to="/dashboard" replace />
//     ) : (
//       <AdminSignup 
//         userType="judge"
//         onSignupSuccess={() => window.location.href = '/login'}
//         onBackToLogin={() => window.location.href = '/login'}
//       />
//     )
//   }
// />
//               <Route
//                 path="/admin-signup"
//                 element={
//                   isAuthenticated ? (
//                     <Navigate to="/dashboard" replace />
//                   ) : (
//                     <AdminSignup 
//                       onSignupSuccess={() => window.location.href = '/login'}
//                       onBackToLogin={() => window.location.href = '/login'}
//                     />
//                   )
//                 }
//               />
//               <Route
//                 path="/dashboard"
//                 element={
//                   <ProtectedRoute>
//                     <Dashboard />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/round-scheduler"
//                 element={
//                   <ProtectedRoute adminOnly={true}>
//                     <RoundScheduler />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/judge-assignment"
//                 element={
//                   <ProtectedRoute adminOnly={true}>
//                     <JudgeAssignment />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/score-compiler"
//                 element={
//                   <ProtectedRoute adminOnly={true}>
//                     <ScoreCompiler />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/leaderboard"
//                 element={
//                   <ProtectedRoute>
//                     <Leaderboard />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/mentor-management"
//                 element={
//                   <ProtectedRoute adminOnly={true}>
//                     <MentorManagement />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/excel-upload"
//                 element={
//                   <ProtectedRoute adminOnly={true}>
//                     <ExcelUpload />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route
//                 path="/final-submissions"
//                 element={
//                   <ProtectedRoute>
//                     <FinalSubmissionList />
//                   </ProtectedRoute>
//                 }
//               />
//             </Routes>
//           </main>
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;











import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import RoundScheduler from './components/RoundScheduler.jsx';
import JudgeAssignment from './components/JudgeAssignment.jsx';
import ScoreCompiler from './components/ScoreCompiler.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import MentorManagement from './components/MentorManagement.jsx';
import ExcelUpload from './components/ExcelUpload.jsx';
import AdminLogin from './components/Login.jsx';
import AdminSignup from './components/Signup.jsx';
import FinalSubmissionList from './components/FinalSubmissionList.jsx';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return Boolean(localStorage.getItem('authToken'));
    } catch {
      return false;
    }
  });
  const [userInfo, setUserInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('authUser') || '{}');
    } catch {
      return {};
    }
  });

  // Active round (for Header display)
  const [activeRound, setActiveRound] = useState(null);

  useEffect(() => {
    let timerId;
    let mounted = true;
    const fetchActive = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('http://localhost:8000/round-state/active', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setActiveRound(data.round);
      } catch { }
    };

    if (isAuthenticated) {
      fetchActive();
      timerId = setInterval(fetchActive, 5000);
    }

    return () => {
      mounted = false;
      if (timerId) clearInterval(timerId);
    };
  }, [isAuthenticated]);

  const handleLogin = (user) => {
    try {
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('authToken', user.accessToken);
      setUserInfo(user);
    } catch { }
    setIsAuthenticated(true);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userEmail');
    } catch { }
    setIsAuthenticated(false);
    setUserInfo({});
    setSidebarOpen(false);
  };

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // Backend returns user data nested in 'user' object and uses 'role' instead of 'userType'
    const userRole = userInfo.user?.role || userInfo.role || userInfo.userType;
    if (adminOnly && userRole !== 'admin') {
      return (
        <div className="container">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
      );
    }

    return children;
  };

  return (
    <Router>
      <div className={`app ${sidebarOpen ? 'sidebar-opened' : ''}`}>
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userType={userInfo.userType} />
        )}
        <div className="main-content">
          {isAuthenticated && (
            <Header
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              onLogout={handleLogout}
              activeRound={activeRound}
              userEmail={userInfo.email}
              userType={userInfo.userType}
            />
          )}
          <main className="content">
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <AdminLogin onLogin={handleLogin} />
                  )
                }
              />
              <Route
                path="/admin-signup"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <AdminSignup
                      onSignupSuccess={() => window.location.href = '/login'}
                      onBackToLogin={() => window.location.href = '/login'}
                    />
                  )
                }
              />
              <Route
                path="/judge-signup"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <AdminSignup
                      userType="judge"
                      onSignupSuccess={() => window.location.href = '/login'}
                      onBackToLogin={() => window.location.href = '/login'}
                    />
                  )
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/round-scheduler"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <RoundScheduler />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/judge-assignment"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <JudgeAssignment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/score-compiler"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <ScoreCompiler />
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
                path="/mentor-management"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <MentorManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/excel-upload"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <ExcelUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/final-submissions"
                element={
                  <ProtectedRoute>
                    <FinalSubmissionList />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;