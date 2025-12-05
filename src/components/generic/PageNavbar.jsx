// src/components/generic/PageNavbar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import "./page-navbar.css"; // шлях до css (постав вірний)

export default function PageNavbar() {
  const navigate = useNavigate();
  const loc = useLocation();

  const nav = (path) => {
    if (loc.pathname !== path) navigate(path);
  };

  return (
    <div className="page-navbar" role="navigation" aria-label="Bottom navigation">
      <button
        className={`nav-btn ${loc.pathname === "/home" ? "active" : ""}`}
        onClick={() => nav("/home")}
      >
        <HomeIcon className="nav-icon" />
        <div className="nav-label">Home</div>
      </button>

      <button
        className={`nav-btn ${loc.pathname === "/mybooks" ? "active" : ""}`}
        onClick={() => nav("/mybooks")}
      >
        <MenuBookIcon className="nav-icon" />
        <div className="nav-label">My Books</div>
      </button>

      <button
        className={`nav-btn ${loc.pathname === "/profile" ? "active" : ""}`}
        onClick={() => nav("/profile")}
      >
        <PersonIcon className="nav-icon" />
        <div className="nav-label">Profile</div>
      </button>
    </div>
  );
}