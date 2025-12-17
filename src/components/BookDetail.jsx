import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageNavbar from "./generic/PageNavbar";
import "../styles/book-detail.css";
import ChapterEditorModal from "./ChapterEditorModal";
import FetchHelper from "../fetchHelper";
import BackArrow from "./generic/BackArrow";

// якщо у тебе вже є свій ChapterModal – можеш використати його
function SimpleChapterModal({ chapter, onClose }) {
  if (!chapter) return null;

  return (
    <div className="chapter-modal-backdrop">
      <div className="chapter-modal">
        <h2>{chapter.name}</h2>
        <div className="chapter-modal-content">
          {chapter.content || <em>No content</em>}
        </div>
        <button className="chapter-modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function BookDetail({
  books = [],
  setBooks = () => {},
  setScreen,
  readOnly = false, // <<-- важливий прапорець
}) {
  const navigate = useNavigate();


  const [editorChapter, setEditorChapter] = useState(null);
  const [openedChapter, setOpenedChapter] = useState(null); // для перегляду тексту

  const params = useParams();
  const bookId = params.id;

  const [canEdit,setCanEdit] = useState(false);

  const loadBook = async () => {
    const result = await FetchHelper.books.get(undefined,bookId);
    if (result.ok) {
      setBook(result.response);
      if ( result.response.authorId === localStorage.getItem("authorId") ) {
        setCanEdit(true)
      } else {
        setCanEdit(false)
      }
    }
  }

  const [book, setBook] = useState()


  useEffect(() => {
    loadBook();
  }, []);

  const openEditor = (chapter) => {
    if (readOnly) return; // в режимі перегляду не відкриваємо редактор
    setEditorChapter(chapter);
  };

  const saveChapter = (updated) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;

        let chapters = [...(b.chapters || [])];

        if (updated.id) {
          chapters = chapters.map((c) =>
            c.id === updated.id
              ? { ...c, ...updated, lastEdited: new Date().toISOString() }
              : c
          );
        } else {
          chapters.unshift({
            ...updated,
            id: Date.now().toString(),
            lastEdited: new Date().toISOString(),
          });
        }

        return { ...b, chapters, lastEdited: new Date().toISOString() };
      })
    );

    setEditorChapter(null);
  };

  const handleChapterClick = (chapter) => {
    // в будь-якому режимі при кліку відкриваємо перегляд тексту
    setOpenedChapter(chapter);
  };

  return (
    <div>
      { !book ?  
      <div style={{ padding: 20, color: "white" }}>
        <h1>Book not found</h1>
        <BackArrow onClick={() => setScreen("/mybooks",-1)}>Back</BackArrow>
        <PageNavbar />
      </div>
      :
      <div className="book-detail-root">
        <h1 className="book-title">{book.name}</h1>
        <p className="book-desc">{book.description}</p>

        <div className="chapter-header">
          <h2>Chapters</h2>

          {/* КНОПКА ADD CHAPTER – тільки якщо не readOnly */}
          {!canEdit ? <></> :
            <button
              className="add-btn"
              onClick={() => openEditor({ title: "", content: "" })}
            >
              + Add Chapter
            </button>
          }
        </div>

        <div className="chapter-list">
          {book.chapters?.length ? (
            book.chapters.map((c) => (
              <div
                key={c.id}
                className="chapter-item"
                onClick={() => handleChapterClick(c)} // клік = перегляд тексту
              >
                <div className="chapter-item-header">
                  <div>
                    <h3 className="chapter-title">{c.name}</h3>
                    <div className="chapter-meta">
                      {c.lastEdited
                        ? new Date(c.lastEdited).toLocaleString()
                        : ""}
                    </div>
                  </div>

                  {/* Кнопка Edit – тільки в режимі редагування */}
                  {!canEdit ? <></> :
                    <div>
                      <button
                        className="chapter-edit-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // щоб не спрацьовував відкриття тексту
                          openEditor(c);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  }
                </div>

                {/* У режимі перегляду – НЕ показуємо контент взагалі, тільки заголовок.
                    У режимі редагування можемо залишити короткий preview або теж сховати. */}
                
                  <div className="chapter-content-preview">
                    {c.content ? (
                      c.content.length > 180
                        ? c.content.slice(0, 180) + "…"
                        : c.content
                    ) : (
                      <em>No content</em>
                    )}
                  </div>
                
              </div>
            ))
          ) : (
            <div className="empty-chapters">No chapters yet</div>
          )}
        </div>

        <PageNavbar />

        {/* Модалка редагування – тільки коли не readOnly */}
        {!readOnly && editorChapter && (
          <ChapterEditorModal
            chapter={editorChapter}
            onClose={() => setEditorChapter(null)}
            onSave={saveChapter}
          />
        )}

        {/* Модалка перегляду тексту глави – працює в обох режимах */}
        {openedChapter && (
          <SimpleChapterModal
            chapter={openedChapter}
            onClose={() => setOpenedChapter(null)}
          />
        )}
      </div>
      }
    </div>
  );
}