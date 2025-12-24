// src/components/HomeScreen.jsx
import { ClipLoader } from "react-spinners";
import { useState, useEffect } from "react";
import BackArrow from "./generic/BackArrow";
import PageNavbar from "./generic/PageNavbar";
import LogoutIcon from "@mui/icons-material/Logout";
import "../styles/home.css";
import "../styles/mybooks.css";
import CreateBookModal from "./CreateBookModal";
import Stack from "@mui/material/Stack";
import BookModal from "./BookModal";
import FetchHelper from "../fetchHelper";
import SearchField from "./SearchField";

export default function HomeScreen({
    setScreen,
    onCreateBook,
    onViewMyBooks,
    onViewChapter,
    books = [],
    setBooks,
    fetchBooks,
    fetchClientBooks,
    username = "your username",
    removeLocalSessionData,
}) {
    const [bookListCall, setBookListCall] = useState({ state: "inactive" });
    const [logoutCall, setLogoutCall] = useState({ state: "inactive" });
    const [createOpen, setCreateOpen] = useState(false);
    const [recentBooks, setRecentBooks] = useState([]);
    const [stats, setStats] = useState([
        { label: "No.of Books", value: 0, icon: "book", color: "#4da3ff" },
        { label: "No. of Genres", value: 0, icon: "file", color: "#ecb43aff" },
    ]);
    const [error, setError] = useState(null);
    const [bookList, setBookList] = useState([]);
    const [openBook, setOpenBook] = useState(null);
    const [modalMode, setModalMode] = useState("view");
    const [search, setSearch] = useState("");

    const isAuthor = localStorage.getItem("authorId") !== "null";

    const loadBooks = async (sourceBooks) => {

        // Fetch books online
        sourceBooks = [];
        // Use fetchBooks for readers, fetchClientBooks for authors
        if (isAuthor) {
            sourceBooks = await fetchClientBooks();
        } else {
            sourceBooks = await fetchBooks();
        }


        setBookList(Array.isArray(sourceBooks) ? sourceBooks : []);

        setBookListCall({ state: "pending" });
        setError(null);
        try {
            //await new Promise((r) => setTimeout(r, 200));
            let sb = Array.isArray(sourceBooks) && sourceBooks.length ? sourceBooks : [];
            /*
            if (!sb) {
                try {
                    const raw = localStorage.getItem("mybooks");
                    sb = raw ? JSON.parse(raw) : [];
                } catch {
                    sb = [];
                }
            }
            */

            sb = sb.sort((a, b) => { return new Date(b.updatedAt) - new Date(a.updatedAt) })

            const recent = Array.isArray(sb) ? sb.slice(0, 3) : [];
            const booksCount = Array.isArray(sb) ? sb.length : 0;

            let genres = new Set();

            for (let book of sb) {
                genres.add(book.genre)
            }

            const genresCount = genres.size;

            setRecentBooks(recent);
            setStats([
                { label: "No. of Books", value: booksCount, icon: "book", color: "#4da3ff" },
                { label: "No. of Genres", value: genresCount, icon: "file", color: "#ecb43aff" },
            ]);
            setBookListCall({ state: "success" });
        } catch (err) {
            console.error(err);
            setError("Failed to load books. Try again.");
            setBookListCall({ state: "error" });
        }
    };


    useEffect(() => {
        loadBooks(books);
    }, [books]);

    const openView = (book) => {
        setOpenBook(book);
        setModalMode("view");
    };

    const handleLogout = () => {
        setLogoutCall({ state: "pending" });
        setTimeout(() => {
            setLogoutCall({ state: "success" });
            if (setScreen) setScreen("/login", -1);
            removeLocalSessionData();
        }, 700);
    };

    const booksArray = Array.isArray(bookList) ? bookList : [];

    if (booksArray.length === 0) {
        return <div className="no-books">No books found.</div>;
    }

    const filteredBooks = booksArray.filter(b =>
        b.name && b.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="home-root">
            <header className="home-header">
                <div className="header-left">
                    <BackArrow onClick={() => setScreen && setScreen("/login", -1)} />
                </div>
                <div className="header-center">
                    <Stack>
                        <h1 className="home-title">Welcome back, {localStorage.getItem("username")}</h1>
                        <p className="home-sub">{isAuthor ? "Continue your writing journey" : "What do you want to read today?"}</p>
                    </Stack>
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

            {isAuthor ?
                <>
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
                                            {s.icon === "book" ? "📘" : "🏷️"}
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
                                                <div className="recent-title">{b.name}</div>
                                                <div className="recent-meta">
                                                    <span>{b.genre}</span>
                                                    <span> • </span>
                                                    <span>⏱ {b.updatedAt || "—"}</span>
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
                        onCreate={async (newBook) => {
                            if (onCreateBook) await onCreateBook(newBook);
                            loadBooks();
                            setCreateOpen(false);
                        }}
                    />
                </> : <div className="mybooks-root">
                    <main className="mybooks-main">
                        <SearchField value={search} onChange={setSearch} />

                        <div className="books-list">
                            {
                                filteredBooks.map(b => (
                                    <div className="book-card" key={b.id}>
                                        <div className="book-title">{b.name}</div>
                                        <div className="book-meta">
                                            <div>
                                                Genre: {b.genre}
                                            </div>
                                            <div>
                                                Last edited: {b.updatedAt ? new Date(b.updatedAt).toLocaleString() : "—"}
                                            </div>
                                        </div>

                                        <div className="book-actions">
                                            <button className="btn btn-view" onClick={() => setScreen(`book/${b.id}`, 1)}>View</button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </main>

                    <BookModal
                        open={!!openBook}
                        book={openBook}
                        mode={modalMode}
                        onClose={() => setOpenBook(null)}
                    />
                </div>}
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