// src/components/MyBooks.jsx
import React, { useEffect, useState } from "react";
import PageNavbar from "./generic/PageNavbar";
import CreateBookModal from "./CreateBookModal";
import BookModal from "./BookModal";
import "../styles/mybooks.css";

export default function MyBooks({ books = [], setBooks = () => {}, setScreen = () => {} }) {
  const [list, setList] = useState(() => {
    try {
      const fromLocal = JSON.parse(localStorage.getItem("mybooks") || "[]");
      return (Array.isArray(books) && books.length) ? books : fromLocal;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("mybooks", JSON.stringify(list));
    if (typeof setBooks === "function") setBooks(list);
  }, [list]);

  useEffect(() => {
    if (Array.isArray(books) && books.length) setList(books);
  }, [books]);

  const [createOpen, setCreateOpen] = useState(false);
  const [openBook, setOpenBook] = useState(null);
  const [modalMode, setModalMode] = useState("view");

  const openView = (book) => {
    setOpenBook(book);
    setModalMode("view");
  };
  const openEdit = (book) => {
    setOpenBook(book);
    setModalMode("edit");
  };

  const handleCreate = (newBook) => {
    const normalized = {
      ...newBook,
      chapters: Array.isArray(newBook.chapters)
        ? newBook.chapters.map(t => (typeof t === 'string' ? { title: t, content: "" } : t))
        : [],
      lastEdited: newBook.lastEdited ?? new Date().toISOString(),
      id: newBook.id ?? Date.now().toString(),
    };

    setList(prev => {
      const next = [normalized, ...prev];
      try { localStorage.setItem("mybooks", JSON.stringify(next)); } catch (e) { console.warn(e); }
      if (typeof setBooks === "function") setBooks(next);
      return next;
    });

    setCreateOpen(false);
  };

  const handleSave = (updated) => {
    setList(prev => {
      const next = prev.map(b => (b.id === updated.id ? { ...updated, lastEdited: new Date().toISOString() } : b));
      try { localStorage.setItem("mybooks", JSON.stringify(next)); } catch (e) { console.warn(e); }
      if (typeof setBooks === "function") setBooks(next);
      return next;
    });
    setOpenBook(null);
  };

  // --- NEW: delete handler ---
  const handleDelete = (id) => {
    const book = list.find(b => b.id === id);
    const ok = window.confirm(`Видалити книгу "${book?.title ?? 'Без назви'}"? Це незворотно.`);
    if (!ok) return;

    setList(prev => {
      const next = prev.filter(b => b.id !== id);
      try { localStorage.setItem("mybooks", JSON.stringify(next)); } catch (e) { console.warn(e); }
      if (typeof setBooks === "function") setBooks(next);
      return next;
    });

    // Якщо зараз відкрито модал тієї самої книги — закриваємо
    if (openBook && openBook.id === id) {
      setOpenBook(null);
    }
  };
  // --- end delete handler ---

  return (
    <div className="mybooks-root">
      <main className="mybooks-main">
        <h1 className="mybooks-title">My books</h1>

        <button
          className="create-btn"
          onClick={() => setCreateOpen(true)}
          aria-label="Create new book"
        >
          <span className="plus">+</span> <span> Create new book</span>
        </button>

        <div className="books-list">
          {list.length === 0 ? (
            <div className="no-books">No books yet. Create your first book.</div>
          ) : (
            list.map(b => (
              <div className="book-card" key={b.id}>
                <div className="book-title">{b.title}</div>
                <div className="book-meta">
                  Chapters: {Array.isArray(b.chapters) ? b.chapters.length : 0} · Last edited: {b.lastEdited ? new Date(b.lastEdited).toLocaleString() : "—"}
                </div>

                <div className="book-actions">
                  <button className="btn btn-view" onClick={() => openView(b)}>View</button>
                  <button className="btn btn-edit" onClick={() => openEdit(b)}>Edit</button>

                  {/* Delete button */}
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(b.id)}
                    aria-label={`Delete ${b.title}`}
                    title="Delete book"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="mybooks-footer">
        <PageNavbar setScreen={setScreen} />
      </footer>

      <CreateBookModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      <BookModal
        open={!!openBook}
        book={openBook}
        mode={modalMode}
        onClose={() => setOpenBook(null)}
        onSave={handleSave}
      />
    </div>
  );
}