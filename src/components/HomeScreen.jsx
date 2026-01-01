// src/components/HomeScreen.jsx
import { ClipLoader } from "react-spinners";
import { useState, useEffect } from "react";
import PageNavbar from "./generic/PageNavbar";
import LogoutIcon from "@mui/icons-material/Logout";
import "../styles/home.css";
import "../styles/mybooks.css";
import CreateBookModal from "./CreateBookModal";
import Stack from "@mui/material/Stack";
import BookModal from "./BookModal";
import FetchHelper from "../fetchHelper";
import SearchField from "./SearchField";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import SearchIcon from '@mui/icons-material/Search';

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

    const [bookRange, setBookRange] = useState(0);
    const [search, setSearch] = useState("");
    const [searchMode, setSearchMode] = useState("name");

    const isAuthor = localStorage.getItem("authorId") !== "null" && localStorage.getItem("authorId") !== null;

    const loadBooks = async (sourceBooks, bookOffset = bookRange) => {

        // Fetch books online
        sourceBooks = [];
        // Use fetchBooks for readers, fetchClientBooks for authors
        if (isAuthor) {
            sourceBooks = await fetchClientBooks();
        } else {
            var searchParams = { offset: bookOffset, limit: 20 }

            if (search !== "") {
                if (searchMode === "name") searchParams.name = search
                if (searchMode === "genre") searchParams.genre = search
            }

            sourceBooks = await fetchBooks(searchParams);
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
                const modifiedGenre = book.genre.trim().toLowerCase();
                genres.add(modifiedGenre);
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
                <div className="header-left" />
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
                                        <div className="recent-item" key={b.id} role="listitem" onClick={() => setScreen(`book/${b.id}`, 1)}>
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

                        <Stack direction="horizontal" style={{ justifyContent: "center" }}>
                            <SearchField value={search} onChange={setSearch} />
                            <button className="ds-btn ds-btn-primary" style={{ height: "30px", marginTop: "12px", paddingTop: "4px" }}
                                onClick={
                                    () => {
                                        loadBooks(null, bookRange)
                                    }
                                }
                            ><SearchIcon /></button>
                        </Stack>
                        <Stack direction="horizontal" style={{ justifyContent: "center", marginBottom: "24px" }}>
                            Search by
                            <Stack direction="horizontal" style={{ marginLeft: "8px" }}>
                                {searchMode === "name" ? <button className="ds-btn ds-btn-primary" style={{ borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }}>Name</button> : <></>}
                                {searchMode !== "name" ? <button className="ds-btn ds-btn-secondary" onClick={() => { setSearchMode("name") }} style={{ borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }}>Name</button> : <></>}
                                {searchMode === "genre" ? <button className="ds-btn ds-btn-primary" style={{ borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px" }}>Genre</button> : <></>}
                                {searchMode !== "genre" ? <button className="ds-btn ds-btn-secondary" onClick={() => { setSearchMode("genre") }} style={{ borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px" }}>Genre</button> : <></>}
                            </Stack>
                        </Stack>

                        <Stack direction="horizontal" style={{ justifyContent: "space-evenly" }}>
                            <button className="ds-btn"
                                onClick={() => {
                                    setBookRange(0)
                                    loadBooks(null, 0)
                                }}
                            ><KeyboardDoubleArrowLeftIcon style={{ fontSize: "24px" }} /></button>

                            <button className="ds-btn"
                                onClick={() => {
                                    if (bookRange > 0) {
                                        setBookRange(bookRange - 20)
                                        loadBooks(null, bookRange - 20)
                                    }
                                }}
                            ><KeyboardArrowLeftIcon style={{ fontSize: "24px" }} /></button>

                            {`${bookRange} - ${bookRange + 20}`}

                            <button className="ds-btn"
                                onClick={() => {
                                    setBookRange(bookRange + 20)
                                    loadBooks(null, bookRange + 20)
                                }}
                            ><KeyboardArrowRightIcon style={{ fontSize: "24px" }} /></button>
                        </Stack>

                        <div className="books-list">
                            {
                                bookList.map(b => (
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
                                            <button className="btn btn-view" onClick={() => setScreen(`/book/${b.id}`, 1)}>View</button>
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
                        onViewChapter={onViewChapter}
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