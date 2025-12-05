// src/components/ChapterModal.jsx
import React, { useState, useEffect } from "react";
import "../styles/chapter-modal.css";

export default function ChapterModal({ open, chapter = null, mode = "view", onClose = () => {}, onSave = () => {} }) {
  const [local, setLocal] = useState({ title: "", content: "" });

  useEffect(() => {
    if (!chapter) return;
    setLocal({
      title: chapter.title || "",
      content: chapter.content || ""
    });
  }, [chapter]);

  if (!open || !chapter) return null;

  const save = () => {
    onSave({
      title: local.title.trim() || "Untitled",
      content: local.content
    });
    onClose();
  };

  return (
    <div className="cm-overlay" role="dialog" aria-modal="true">
      <div className="cm-modal">
        <button className="cm-close" onClick={onClose}>✕</button>

        <h3 className="cm-title">{local.title}</h3>

        {mode === "view" ? (
          <div className="cm-content">
            {local.content
              ? local.content.split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))
              : <em>— no content —</em>
            }
          </div>
        ) : (
          <div className="cm-edit">
            <label className="cm-label">Title</label>
            <input
              className="cm-input"
              value={local.title}
              onChange={(e) => setLocal(prev => ({ ...prev, title: e.target.value }))}
            />

            <label className="cm-label">Content</label>
            <textarea
              className="cm-textarea"
              value={local.content}
              onChange={(e) => setLocal(prev => ({ ...prev, content: e.target.value }))}
            />

            <div className="cm-actions">
              <button className="cm-btn cm-save" onClick={save}>Save</button>
              <button className="cm-btn cm-cancel" onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}