import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
} from "react-router-dom";
import NavBar from "./components/NavBar/NavBar";
import Chat from "./components/Chats/Chat";
import Auth from "./components/Auth/Auth";
import Hero from "./components/HeroSection/Hero";
import { AuthContext } from "./components/context/auth-context";
import { useAuth } from "./components/hooks/auth-hook";
import AddFriend from "./components/AddFriend/AddFriend";
import About from "./components/About/About";
import Profile from "./components/Profile/Profile";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";

function App() {
  const { token, login, logout, role } = useAuth();
  let routes;

  if (token) {
    routes = (
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/chats" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/add-friend" element={<AddFriend />} />
        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  } else {
    routes = (
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/chats" element={<Auth />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }
  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        role: role,
        login: login,
        logout: logout,
      }}
    >
      <Router>
        <NavBar />
        <main>{routes}</main>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
