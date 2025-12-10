// src/components/HomeScreen.jsx
import { ClipLoader } from "react-spinners";
import { useState, useEffect } from "react";
import BackArrow from "./generic/BackArrow";
import PageNavbar from "./generic/PageNavbar";
import LogoutIcon from "@mui/icons-material/Logout";
import "../styles/home.css";
import CreateBookModal from "./CreateBookModal";

export default function HomeScreen({
  setScreen,
  onCreateBook,
  onViewMyBooks,
  books = [],
  setBooks,
  username = "your username",
  removeLocalSessionData,
}) {
  const [bookListCall, setBookListCall] = useState({ state: "inactive" });
  const [logoutCall, setLogoutCall] = useState({ state: "inactive" });
  const [createOpen, setCreateOpen] = useState(false);
  const [recentBooks, setRecentBooks] = useState([]);
  const [stats, setStats] = useState([
    { label: "My Books", value: 0, icon: "book", color: "#4da3ff" },
    { label: "Total Chapters", value: 0, icon: "file", color: "#7c3aed" },
  ]);
  const [error, setError] = useState(null);

  const loadBooks = async (sourceBooks) => {
    setBookListCall({ state: "pending" });
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 200));
      let sb = Array.isArray(sourceBooks) && sourceBooks.length ? sourceBooks : null;
      if (!sb) {
        try {
          const raw = localStorage.getItem("mybooks");
          sb = raw ? JSON.parse(raw) : [];
        } catch {
          sb = [];
        }
      }
      const recent = Array.isArray(sb) ? sb.slice(0, 3) : [];
      const booksCount = Array.isArray(sb) ? sb.length : 0;
      const chaptersCount = Array.isArray(sb)
        ? sb.reduce((sum, b) => sum + (Array.isArray(b.chapters) ? b.chapters.length : 0), 0)
        : 0;

      setRecentBooks(recent);
      setStats([
        { label: "My Books", value: booksCount, icon: "book", color: "#4da3ff" },
        { label: "Total Chapters", value: chaptersCount, icon: "file", color: "#7c3aed" },
      ]);
      setBookListCall({ state: "success" });
    } catch (err) {
      console.error(err);
      setError("Failed to load books. Try again.");
      setBookListCall({ state: "error" });
    }
  }

  useEffect(() => {
    loadBooks(books);
  }, [books]);

  const handleLogout = () => {
    setLogoutCall({ state: "pending" });
    setTimeout(() => {
      setLogoutCall({ state: "success" });
      if (setScreen) setScreen("/login", -1);
      removeLocalSessionData();
    }, 700);
  };

  return (
    <div className="home-root">
      <header className="home-header">
        <div className="header-left">
          <BackArrow onClick={() => setScreen && setScreen("/login", -1)} />
        </div>
        <div className="header-center">
          <h1 className="home-title">Welcome back, {localStorage.getItem("username")}</h1>
          <p className="home-sub">Continue your writing journey</p>
        </div>
        <div className="header-right">
          <button aria-label="Logout" className="logout-btn" onClick={handleLogout}>
            {logoutCall.state === "pending" ? (
              <ClipLoader color="var(--accent)" size={18} />
            ) : (
              <span className="logout-inner"><LogoutIcon fontSize="small" /> Logout</span>
            )}
          </button>
        </div>
      </header>

      <main className="home-main">
        <div className="home-actions">
          <button className="action-card action-new" onClick={() => setCreateOpen(true)}>
            <div className="action-icon">+</div>
            <div className="action-text">New Book</div>
          </button>

          <button className="action-card action-mybooks" onClick={() => onViewMyBooks && onViewMyBooks()}>
            <div className="action-icon">📚</div>
            <div className="action-text">My Books</div>
          </button>
        </div>

        <section className="stats-section" aria-labelledby="stats-title">
          <h2 id="stats-title" className="section-title">Your Stats</h2>
          <div className="stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="stat-card" role="region" aria-label={s.label}>
                <div className="stat-icon" style={{ backgroundColor: hexToRgba(s.color, 0.12), color: s.color }}>
                  {s.icon === "book" ? "📘" : "📄"}
                </div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="recent-section" aria-labelledby="recent-title">
          <div className="recent-header">
            <h2 id="recent-title" className="section-title">Recently Edited</h2>
            <button className="view-all" onClick={() => onViewMyBooks && onViewMyBooks()}>View All</button>
          </div>

          <div className="recent-list" role="list">
            {bookListCall.state === "pending" ? (
              <div className="center-loader"><ClipLoader color="var(--accent)" size={28} /></div>
            ) : bookListCall.state === "error" ? (
              <div className="no-recent" style={{ color: "var(--muted)", padding: 18, textAlign: "center" }}>
                {error}
              </div>
            ) : recentBooks.length === 0 ? (
              <div className="no-recent" style={{ color: "var(--muted)", padding: 18, textAlign: "center" }}>
                No recently edited books yet.
              </div>
            ) : (
              recentBooks.map((b) => (
                <div className="recent-item" key={b.id} role="listitem" onClick={() => onViewMyBooks && onViewMyBooks()}>
                  <div className="recent-icon">📗</div>
                  <div className="recent-body">
                    <div className="recent-title">{b.title}</div>
                    <div className="recent-meta">
                      <span>{Array.isArray(b.chapters) ? b.chapters.length : 0} chapters</span>
                      <span> • </span>
                      <span>⏱ {b.lastEdited || "—"}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <PageNavbar setScreen={setScreen} />
      </footer>

      <CreateBookModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(newBook) => {
          if (onCreateBook) onCreateBook(newBook);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

/* helper */
function hexToRgba(hex, alpha = 1) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}