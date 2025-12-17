// src/components/BookModal.jsx
import React, { useEffect, useState } from "react";
import "../styles/book-modal.css";
import FetchHelper from "../fetchHelper";

export default function BookModal({
  open = false,
  book = null,
  mode = "view", // "view" | "edit"
  onClose = () => { },
  onSave = () => { },
  onViewChapter = () => { }
}) {
  if (!open || !book) return null;

  const isView = mode === "view";

  // ---------- helper: нормалізація книги для EDIT ----------
  function normalizeBook(b) {
    if (!b) {
      return {
        id: "",
        name: "",
        genre: "",
        description: "",
        chapters: [],
        createdAt: null,
        updatedAt: null
      };
    }

    return {
      id: b.id ?? "",
      name: b.name ?? "",
      genre: b.genre ?? "",
      description: b.description ?? "",
      chapters: Array.isArray(b.chapters)
        ? b.chapters.map((c) => ({
          id: c.id ?? Date.now(),
          index: c.index ?? null,
          book_id: b.id ?? "",
          name: c.name ?? "",
          content: c.content ?? "",
          createdAt: c.createdAt ?? null,
          updatedAt: c.updatedAt ?? null
        }))
        : [],
      createdAt: b.createdAt ?? null,
      updatedAt: b.updatedAt ?? null
    };
  }

  // draft для EDIT
  const [draft, setDraft] = useState(() => normalizeBook(book));

  // розгортання глав:
  //  - для VIEW – по _viewId
  //  - для EDIT – по id
  const [viewExpandedId, setViewExpandedId] = useState(null);
  const [editExpandedId, setEditExpandedId] = useState(null);

  // loader
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setDraft(normalizeBook(book));
      setViewExpandedId(null);
      setEditExpandedId(null);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [book, mode, open]);

  // ---------- handlers для EDIT ----------
  const handleTitleChange = (e) => {
    const value = e.target.value;
    setDraft((prev) => ({ ...prev, name: value }));
  };

  const handleGenreChange = (e) => {
    const value = e.target.value;
    setDraft((prev) => ({ ...prev, genre: value }));
  };


  const handleDescChange = (e) => {
    const value = e.target.value;
    setDraft((prev) => ({ ...prev, description: value }));
  };

  const handleChapterTitleChange = (chapterId, value) => {
    setDraft((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, name: value, updatedAt: new Date().toISOString() } : ch
      ),
    }));
  };

  const handleChapterContentChange = (chapterId, value) => {
    setDraft((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) =>
        ch.id === chapterId
          ? { ...ch, content: value, updatedAt: new Date().toISOString() }
          : ch
      ),
    }));
  };

  const handleAddChapter = () => {
    const id = Date.now().toString();
    setDraft((prev) => ({
      ...prev,
      chapters: [
        ...prev.chapters,
        {
          id: id, index: prev.chapters.length + 1, book_id: prev.id, name: "New chapter", content: "",
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        },
      ],
    }));
    setEditExpandedId(id);
  };

  const handleRemoveChapter = (chapterId) => {
    const chapter = draft.chapters.find(chapter => chapter.id === chapterId);

    const ok = window.confirm(`Delete chapter "${chapter.name}" ? This is irreversible.`);
    if (!ok) return;

    setDraft((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((ch) => ch.id !== chapterId),
    }));

    setEditExpandedId((prev) => (prev === chapterId ? null : prev));
  };

  const handleSaveClick = async () => {
    const updated = {
      ...draft,
      name: draft.name,
      updatedAt: new Date().toISOString(),
    };

    const response = await FetchHelper.books.edit( {
      name: draft.name,
      genre: draft.genre
    }, draft.id)

    console.log("EDIT BOOK RESPONSE")
    console.log(response)

    onSave(updated);
  };

  // ---------- LOADER ----------
  if (isLoading) {
    return (
      <div className="bm-overlay">
        <div
          className="bm-modal"
          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          <div className="loader-spinner" />
        </div>
      </div>
    );
  }

  // =========================================================
  //                      VIEW MODE
  // =========================================================
  if (isView) {
    const chapters = draft.chapters;

    return (
      <div className="bm-overlay">
        <div className="bm-modal">
          <button className="bm-close" onClick={onClose} aria-label="Close">
            ✕
          </button>

          <h2 className="bm-title">View book</h2>
          <p className="bm-sub">Book overview</p>

          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 14,
                color: "#98b4c9",
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              Title
            </div>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {book.name || <em>No title</em>}
            </div>
          </div>

          {/* Genre */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 14,
                color: "#98b4c9",
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              Genre
            </div>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {book.genre || <em>No genre</em>}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 14,
                color: "#98b4c9",
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              Description
            </div>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
                whiteSpace: "pre-wrap",
              }}
            >
              {book.description || <em>No description</em>}
            </div>
          </div>

          {/* Chapters (view only) */}
          <h3 style={{ margin: "0 0 10px 0", color: "#e6eef0" }}>Chapters</h3>
          {chapters.length === 0 ? (
            <div className="bm-empty">No chapters yet.</div>
          ) : (
            <div className="bm-chapters">
              {chapters.map((ch, idx) => {
                return (
                  <div key={ch.id} className="bm-chapter">
                    <div className="bm-chapter-header">
                      <div className="bm-chapter-index">{idx + 1}</div>
                      <div className="bm-chapter-title">
                        {ch.name || <em>Untitled chapter</em>}
                      </div>

                      <button
                        className="bm-ghost"
                        onClick={() => onViewChapter(ch.id)}
                        style={{ padding: "6px 10px", minWidth: 105 }}
                        type="button"
                      >
                        View chapter
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bm-actions">
            <button className="bm-btn bm-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  //                      EDIT MODE
  // =========================================================
  const chapters = draft.chapters;

  return (
    <div className="bm-overlay">
      <div className="bm-modal">
        <button className="bm-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2 className="bm-title">Edit book</h2>
        <p className="bm-sub">
          Edit book title and description. Chapters can be edited below.
        </p>

        {/* TITLE */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 14,
              color: "#98b4c9",
              marginBottom: 4,
              fontWeight: 600,
            }}
          >
            Title
          </div>
          <input
            className="bm-chapter-title-input"
            value={draft.name}
            onChange={handleTitleChange}
            placeholder="Book title"
          />
        </div>

        {/* GENRE */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 14,
              color: "#98b4c9",
              marginBottom: 4,
              fontWeight: 600,
            }}
          >
            Genre
          </div>
          <input
            className="bm-chapter-title-input"
            value={draft.genre}
            onChange={handleGenreChange}
            placeholder="Genre"
          />
        </div>

        {/* DESCRIPTION */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 14,
              color: "#98b4c9",
              marginBottom: 4,
              fontWeight: 600,
            }}
          >
            Description
          </div>
          <textarea
            className="bm-chapter-textarea"
            value={draft.description}
            onChange={handleDescChange}
            placeholder="Book description"
          />
        </div>

        {/* CHAPTERS */}
        <h3 style={{ margin: "0 0 10px 0", color: "#e6eef0" }}>Chapters</h3>

        {chapters.length === 0 ? (
          <div className="bm-empty" style={{ marginBottom: 12 }}>
            No chapters yet. Add your first chapter.
          </div>
        ) : (
          <div className="bm-chapters">
            {chapters.map((ch, idx) => {
              const isExpanded = editExpandedId === ch.id;
              return (
                <div key={ch.id} className="bm-chapter">
                  <div className="bm-chapter-header">
                    <div className="bm-chapter-index">{idx + 1}</div>

                    <input
                      className="bm-chapter-title-input"
                      value={ch.name}
                      onChange={(e) =>
                        handleChapterTitleChange(ch.id, e.target.value)
                      }
                      placeholder="Chapter title"
                    />

                    <button
                      className="bm-ghost"
                      onClick={() =>
                        setEditExpandedId((prev) =>
                          prev === ch.id ? null : ch.id
                        )
                      }
                      style={{ padding: "6px 10px" }}
                      type="button"
                    >
                      {isExpanded ? "Hide text" : "Show text"}
                    </button>

                    <button
                      className="bm-remove"
                      onClick={() => handleRemoveChapter(ch.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>

                  {isExpanded && (
                    <textarea
                      className="bm-chapter-textarea"
                      value={ch.content}
                      onChange={(e) =>
                        handleChapterContentChange(ch.id, e.target.value)
                      }
                      placeholder="Chapter text"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          className="bm-btn bm-add"
          type="button"
          onClick={handleAddChapter}
          style={{ marginTop: 10 }}
        >
          + Add chapter
        </button>

        <div className="bm-actions">
          <button className="bm-btn bm-ghost" onClick={onClose}>
            Close
          </button>
          <button className="bm-btn bm-primary" onClick={handleSaveClick}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}