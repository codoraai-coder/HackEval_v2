// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./SignIn.css"; // Reuse your existing CSS

// function Auth() {
//     const [isLogin, setIsLogin] = useState(true); // Toggle between login/signup
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const navigate = useNavigate();

//     // Handle login
//     const handleLogin = (e) => {
//         e.preventDefault();
//         const users = JSON.parse(localStorage.getItem("users")) || [];
//         const user = users.find(u => u.email === email && u.password === password);

//         if (user) {
//             alert("Login successful!");
//             navigate("/dashboard");
//         } else {
//             alert("Invalid credentials!");
//         }
//     };

//     // Handle signup
//     // const handleSignUp = (e) => {
//     //     e.preventDefault();
//     //     const users = JSON.parse(localStorage.getItem("users")) || [];

//     //     // Check if email already exists
//     //     if (users.find(u => u.email === email)) {
//     //         alert("Email already registered!");
//     //         return;
//     //     }

//     //     users.push({ email, password });
//     //     localStorage.setItem("users", JSON.stringify(users));
//     //     alert("Signup successful! Please login.");
//     //     setEmail("");
//     //     setPassword("");
//     //     setIsLogin(true); // Switch to login after signup
//     // };

//     // return (
//     //     <div className="auth-container">
//     //         <h2>{isLogin ? "Sign In" : "Sign Up"}</h2>
//     //         <form onSubmit={isLogin ? handleLogin : handleSignUp}>
//     //             <input
//     //                 type="email"
//     //                 placeholder="Email"
//     //                 value={email}
//     //                 onChange={(e) => setEmail(e.target.value)}
//     //                 required
//     //             />
//     //             <input
//     //                 type="password"
//     //                 placeholder="Password"
//     //                 value={password}
//     //                 onChange={(e) => setPassword(e.target.value)}
//     //                 required
//     //             />
//     //             <button type="submit">{isLogin ? "Sign In" : "Sign Up"}</button>
//     //         </form>
//     //         <p style={{ marginTop: "15px", fontSize: "14px" }}>
//     //             {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
//     //             <strong
//     //                 style={{ cursor: "pointer", color: "#0077ff" }}
//     //                 onClick={() => setIsLogin(!isLogin)}
//     //             >
//     //                 {isLogin ? "Sign Up" : "Sign In"}
//     //             </strong>
//     //         </p>
//     //     </div>
//     // );
// }

// export default Auth;
