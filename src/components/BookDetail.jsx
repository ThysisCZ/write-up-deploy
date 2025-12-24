import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageNavbar from "./generic/PageNavbar";
import "../styles/book-detail.css";
import ChapterEditorModal from "./ChapterEditorModal";
import FetchHelper from "../fetchHelper";
import BackArrow from "./generic/BackArrow";
import Chapter from "./Chapter";

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
  setBooks = () => { },
  setScreen = () => { },
  readOnly = false, // <<-- важливий прапорець
}) {
  const [editorChapter, setEditorChapter] = useState(null);
  const [openedChapter, setOpenedChapter] = useState(null); // для перегляду тексту
  const [detailCall, setDetailCall] = useState("inactive");

  const params = useParams();
  const bookId = params.id;

  const [canEdit, setCanEdit] = useState(false);

  const loadBook = async () => {
    setDetailCall("pending");

    try {
      const result = await FetchHelper.books.get(undefined, bookId);

      if (result.ok) {
        setDetailCall("success");
        setBook(result.response);
        if (result.response.authorId === localStorage.getItem("authorId")) {
          setCanEdit(true)
        } else {
          setCanEdit(false)
        }
      } else {
        setDetailCall("error");
      }
    } catch (e) {
      console.error(e);
      setDetailCall("error");
    }
  }

  const [book, setBook] = useState()

  useEffect(() => {
    loadBook();
  }, []);

  const openEditor = async (chapter) => {
    if (readOnly) return; // в режимі перегляду не відкриваємо редактор

    // Open editor directly for new chapter
    if (!chapter.id) {
      setEditorChapter({
        name: chapter.name ?? "",
        content: chapter.content ?? "",
      });
      return;
    }

    // Fetch data for existing chapter
    const result = await FetchHelper.books.chapters.get(
      undefined,
      bookId,
      chapter.id
    );

    if (result.ok) {
      setEditorChapter(result.response);
    }
  };

  // Helper for adding a new chapter
  const upsertChapter = (chapters, updatedChapter) => {
    const exists = chapters.some(ch => ch.id === updatedChapter.id);
    return exists
      ? chapters.map(ch =>
        ch.id === updatedChapter.id ? updatedChapter : ch
      )
      : [...chapters, updatedChapter];
  };

  const saveChapter = async (updated) => {
    try {
      let chapterId = updated.id;

      if (chapterId) {
        // Update existing chapter
        const result = await FetchHelper.books.chapters.edit(
          {
            name: updated.title || updated.name || "Untitled",
            content: updated.content || ""
          },
          bookId,
          updated.id
        );

        if (!result.ok) return;
      } else {
        // Create new chapter
        const result = await FetchHelper.books.chapters.create(
          {
            name: updated.title || updated.name || "New Chapter",
            content: updated.content || ""
          },
          bookId
        );

        if (!result.ok) return;
        chapterId = result.response.id;
      }

      // Fetch full chapter including content
      const chapterData = await FetchHelper.books.chapters.get(
        undefined,
        bookId,
        chapterId
      );

      if (chapterData.ok) {
        setBook(prev => ({
          ...prev,
          chapters: upsertChapter(prev.chapters || [], chapterData.response)
        }));
      }

      setEditorChapter(null);
    } catch (error) {
      console.error("Error saving chapter:", error);
    }
  };

  const handleChapterClick = async (chapter) => {
    const result = await FetchHelper.books.chapters.get(
      undefined,
      bookId,
      chapter.id
    );

    if (result.ok) {
      setScreen(`book/${bookId}/chapter/${chapter.id}`, 1)
    }
  };

  return (
    <div>
      {!book && detailCall !== "pending" ?
        <div style={{ padding: 20, color: "white" }}>
          <BackArrow style={{ marginLeft: -30 }} onClick={() => setScreen("/home", -1)}>Back</BackArrow>
          <h1>Book not found</h1>
          <PageNavbar />
        </div>
        :
        <div className="book-detail-root">
          <BackArrow style={{ marginLeft: -20, marginBottom: 20, width: 80 }} onClick={() => setScreen("/home", -1)}>Back</BackArrow>
          <h1 className="book-title">{book?.name}</h1>
          <p className="book-desc">{book?.description}</p>

          <div className="chapter-header">
            <h2>Chapters</h2>

            {/* КНОПКА ADD CHAPTER – тільки якщо не readOnly */}
            {!canEdit ? <></> :
              <button
                className="add-btn"
                onClick={() => openEditor({ name: "", content: "" })}
              >
                + Add Chapter
              </button>
            }
          </div>

          <div className="chapter-list">
            {book?.chapters?.length ? (
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

                    <div className="chapter-buttons">
                      <button
                        className="ds-btn ds-btn-primary"
                      >
                        View
                      </button>
                      {!canEdit ? <></> :
                        <button
                          className="ds-btn ds-btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation(); // щоб не спрацьовував відкриття тексту
                            openEditor(c);
                          }}
                        >
                          Edit
                        </button>
                      }
                    </div>
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