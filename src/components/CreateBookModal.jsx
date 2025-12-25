// src/components/CreateBookModal.jsx
import React, { useState } from "react";
import "../styles/create-book-modal.css";

export default function CreateBookModal({ open, onClose = () => { }, onCreate = () => { } }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [genre, setGenre] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapters, setChapters] = useState([]);

  // for inline edit
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editValue, setEditValue] = useState("");

  if (!open) return null;

  const addChapter = () => {
    const title = chapterTitle.trim();
    if (!title) return;
    setChapters(prev => [...prev, title]);
    setChapterTitle("");
  };

  const removeChapter = (i) => {
    setChapters(prev => prev.filter((_, idx) => idx !== i));
    // if we removed an editing item, reset editor
    if (editingIndex === i) {
      setEditingIndex(-1);
      setEditValue("");
    } else if (editingIndex > i) {
      setEditingIndex(prev => prev - 1);
    }
  };

  const startEdit = (i) => {
    setEditingIndex(i);
    setEditValue(chapters[i] || "");
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setEditValue("");
  };

  const saveEdit = () => {
    if (editingIndex < 0) return;
    const v = editValue.trim();
    if (!v) return;
    setChapters(prev => prev.map((c, idx) => (idx === editingIndex ? v : c)));
    setEditingIndex(-1);
    setEditValue("");
  };

  const handleCreate = () => {
    const newBook = { id: Date.now().toString(), name: title.trim(), description: desc.trim(), genre: genre.trim(), chapters };
    onCreate(newBook);
    // очистити локально
    setTitle("");
    setDesc("");
    setGenre("");
    setChapters([]);
    setChapterTitle("");
    setEditingIndex(-1);
    setEditValue("");
  };

  return (
    <div className="cbm-overlay" role="dialog" aria-modal="true">
      <div className="cbm-modal">
        <button className="cbm-close" onClick={onClose} aria-label="Close">×</button>

        <h2 className="cbm-title">Create New Book</h2>
        <p className="cbm-sub">Start writing your next story</p>

        <label className="cbm-label">Book Title</label>
        <input className="cbm-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter book title..." />

        <label className="cbm-label">Genre</label>
        <input className="cbm-input" value={genre} onChange={e => setGenre(e.target.value)} placeholder="What genre is your book?" />

        <label className="cbm-label">Description (optional)</label>
        <textarea className="cbm-textarea" value={desc} onChange={e => setDesc(e.target.value)} placeholder="What's your book about?" />

        {/* Chapters */}

        <div className="cbm-actions">
          <button className="cbm-btn cbm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="cbm-btn cbm-btn-primary" onClick={handleCreate} disabled={!title.trim()}>Create</button>
        </div>
      </div>
    </div>
  );
}

/*<label className="cbm-label">Chapters</label>
        <div className="cbm-chapter-row">
          <input
            className="cbm-input"
            value={chapterTitle}
            onChange={e => setChapterTitle(e.target.value)}
            placeholder="Chapter title..."
            onKeyDown={(e) => { if (e.key === "Enter") addChapter(); }}
          />
          <button className="cbm-btn cbm-btn-sm" onClick={addChapter}>Add</button>
        </div>

        <ul className="cbm-chapter-list">
          {chapters.map((c, i) => (
            <li key={i} className="cbm-chapter-item">
              <div className="cbm-chapter-left">
                <span className="cbm-chapter-index">{i + 1}.</span>

                {editingIndex === i ? (
                  <input
                    className="cbm-chapter-editinput"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
                    autoFocus
                  />
                ) : (
                  <span className="cbm-chapter-text">{c}</span>
                )}
              </div>

              <div className="cbm-chapter-actions">
                {editingIndex === i ? (
                  <>
                    <button className="cbm-btn cbm-btn-sm" onClick={saveEdit}>Save</button>
                    <button className="cbm-btn cbm-btn-sm cbm-btn-ghost" onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="cbm-btn cbm-btn-sm" onClick={() => startEdit(i)}>Edit</button>
                    <button className="cbm-btn cbm-btn-sm cbm-btn-danger" onClick={() => removeChapter(i)}>Remove</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
*/
