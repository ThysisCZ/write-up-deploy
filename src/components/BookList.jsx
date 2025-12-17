export default function BookList({ books, onView, onEdit, onDelete, search }) {
  if (books.length === 0) {
    return <div className="no-books">No books found.</div>;
  }


/*
          <div className="book-meta">
            Chapters: {Array.isArray(b.chapters) ? b.chapters.length : 0}
          </div>*/

  books = books.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="books-list">
      {books.map(b => (
        <div className="book-card" key={b.id}>
          <div className="book-title">{b.name}</div>
          <div className="book-meta">{b.genre}</div>
          
          <div className="book-actions">
            <button className="btn" onClick={() => onView(b)}>View</button>
            <button className="btn" onClick={() => onEdit(b)}>Edit</button>
            <button className="btn-delete" onClick={() => onDelete(b.id)}>Delete</button>
          </div>
          
          <div className="book-tiny">Last Edited: {b.updatedAt}</div>
        </div>
      ))}
    </div>
  );
}