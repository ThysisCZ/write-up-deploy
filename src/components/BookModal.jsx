// src/components/BookModal.jsx
import React, { useEffect, useState } from "react";
import "../styles/book-modal.css";

export default function BookModal({
  open = false,
  book = null,
  mode = "view", // "view" | "edit"
  onClose = () => {},
  onSave = () => {},
}) {
  if (!open || !book) return null;

  const isView = mode === "view";

  // ---------- helper: нормалізація книги для EDIT ----------
  function normalizeBook(b) {
    if (!b) {
      return {
        id: "",
        title: "",
        description: "",
        chapters: [],
      };
    }

    return {
      id: b.id ?? "",
      title: b.title ?? "",
      description: b.description ?? "",
      chapters: Array.isArray(b.chapters)
        ? b.chapters.map((c, idx) => ({
            id: c.id ?? `ch-${idx}-${Date.now()}`,
            title: c.title ?? "",
            content: c.content ?? "",
            lastEdited: c.lastEdited ?? null,
          }))
        : [],
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
    setDraft((prev) => ({ ...prev, title: value }));
  };

  const handleDescChange = (e) => {
    const value = e.target.value;
    setDraft((prev) => ({ ...prev, description: value }));
  };

  const handleChapterTitleChange = (chapterId, value) => {
    setDraft((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, title: value } : ch
      ),
    }));
  };

  const handleChapterContentChange = (chapterId, value) => {
    setDraft((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) =>
        ch.id === chapterId
          ? { ...ch, content: value, lastEdited: new Date().toISOString() }
          : ch
      ),
    }));
  };

  const handleAddChapter = () => {
    const id = `new-${Date.now()}`;
    setDraft((prev) => ({
      ...prev,
      chapters: [
        ...prev.chapters,
        { id, title: "New chapter", content: "", lastEdited: null },
      ],
    }));
    setEditExpandedId(id);
  };

  const handleRemoveChapter = (chapterId) => {
    const ok = window.confirm("Delete this chapter?");
    if (!ok) return;

    setDraft((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((ch) => ch.id !== chapterId),
    }));

    setEditExpandedId((prev) => (prev === chapterId ? null : prev));
  };

  const handleSaveClick = () => {
    const updated = {
      ...draft,
      lastEdited: new Date().toISOString(),
    };
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
    const rawChapters = Array.isArray(book.chapters) ? book.chapters : [];

    // робимо стабільний _viewId, якщо у глави немає id
    const chapters = rawChapters.map((c, idx) => ({
      ...c,
      _viewId: c.id ?? `view-${idx}`,
    }));

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
              {book.title || <em>No title</em>}
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
                const hasContent = !!ch.content;
                const isExpanded = viewExpandedId === ch._viewId;

                return (
                  <div key={ch._viewId} className="bm-chapter">
                    <div className="bm-chapter-header">
                      <div className="bm-chapter-index">{idx + 1}</div>
                      <div className="bm-chapter-title">
                        {ch.title || <em>Untitled chapter</em>}
                      </div>
                    </div>

                    {/* Текст ВЗАГАЛІ не видно, поки не expanded */}
                    {hasContent && isExpanded && (
                      <div className="bm-chapter-content">
                        <p className="bm-pre">{ch.content}</p>
                      </div>
                    )}

                    {hasContent && (
                      <button
                        className="bm-ghost"
                        style={{ marginTop: 8, padding: "4px 10px" }}
                        onClick={() =>
                          setViewExpandedId((prev) =>
                            prev === ch._viewId ? null : ch._viewId
                          )
                        }
                      >
                        {isExpanded ? "Hide text" : "Show text"}
                      </button>
                    )}
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
            value={draft.title}
            onChange={handleTitleChange}
            placeholder="Book title"
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
                      value={ch.title}
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