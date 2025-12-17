// src/components/MyBooks.jsx
import React, { useEffect, useState } from "react";
import PageNavbar from "./generic/PageNavbar";
import CreateBookModal from "./CreateBookModal";
import BookModal from "./BookModal";
import "../styles/mybooks.css";
import FetchHelper from "../fetchHelper";
import SearchField from "./SearchField";
import BookList from "./BookList";

export default function MyBooks({
  setBooks = () => { },
  setScreen = () => { },
  onViewChapter,
  handleCreateBook,
  fetchBooks,
  fetchClientBooks }) {
  const [list, setList] = useState(() => {
    try {
      const fromLocal = JSON.parse(localStorage.getItem("mybooks") || "[]");
      return (Array.isArray(books) && books.length) ? books : fromLocal;
    } catch {
      return [];
    }
  });


  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  /* 
  const filteredBooks = list.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );*/
  
  const books = []

  const loadBooks = async () => {
    setList(await fetchClientBooks())
  }

  useEffect(() => {
    loadBooks();
  }, []);


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
    /*
    setOpenBook(book);
    setModalMode("view");
    */
    setScreen(`book/${book.id}`,1)
  };

  const openEdit = (book) => {
    setOpenBook(book);
    setModalMode("edit");
  };

  const handleCreate = async (newBook) => {
    const normalized = {
      ...newBook,
      name: newBook.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chapters: Array.isArray(newBook.chapters)
        ? newBook.chapters.map(n => (typeof n === 'string' ? {
          id: Date.now().toString(), index: newBook.chapters.length, book_id: newBook.id, name: n, content: "",
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        } : n))
        : [],
      id: newBook.id ?? Date.now().toString(),
    };

    setList(prev => {
      const next = [normalized, ...prev];
      try { localStorage.setItem("mybooks", JSON.stringify(next)); } catch (e) { console.warn(e); }
      if (typeof setBooks === "function") setBooks(next);
      return next;
    });

    await handleCreateBook(normalized);

    loadBooks();

    setCreateOpen(false);

    console.log(books)
  };

  const handleSave = (updated) => {
    setList(prev => {
      const next = prev.map(b => (b.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : b));
      try { localStorage.setItem("mybooks", JSON.stringify(next)); } catch (e) { console.warn(e); }
      if (typeof setBooks === "function") setBooks(next);
      return next;
    });
    setOpenBook(null);
  };

  // --- NEW: delete handler ---
  const handleDelete = async (id) => {
    const book = list.find(b => b.id === id);
    const ok = window.confirm(`Delete book "${book?.name ?? 'Untitled'}"? This is irreversible.`);
    if (!ok) return;

    const response = await FetchHelper.books.delete(id);
    console.log(response)
    if (!response.ok) return;
    if (response.ok) loadBooks();

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
          className="ds-btn ds-btn-primary create-btn"
          onClick={() => setCreateOpen(true)}
          aria-label="Create new book"
        >
          <span className="plus">+</span> <span> Create new book</span>
        </button>

        <SearchField value={search} onChange={setSearch} />

        <BookList
          books={list}
          onView={openView}
          onEdit={openEdit}
          search={search}
          onDelete={handleDelete}
        />
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
        onViewChapter={onViewChapter}
      />
    </div>
  );
}