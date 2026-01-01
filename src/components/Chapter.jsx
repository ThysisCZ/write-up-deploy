import { ClipLoader } from "react-spinners";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import BackArrow from "./generic/BackArrow";
import FetchHelper from "../fetchHelper";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import ConfirmDeleteCommentModal from "./ConfirmDeleteCommentModal";
import "../styles/chapter.css";

function Chapter({ setScreen }) {
    const [chapterCall, setChapterCall] = useState("inactive");
    const [chapterData, setChapterData] = useState(null);

    const params = useParams();
    const bookId = params.bookid;
    const chapterId = params.chapterid;

    const isAuthor = localStorage.getItem("authorId") !== "null";

    const [commentCall, setCommentCall] = useState("inactive");
    const [comments, setComments] = useState([]);
    const [commentValid, setCommentValid] = useState(true);

    const [newCommentText, setNewCommentText] = useState("");
    const [commentToDelete, setCommentToDelete] = useState(null);

    const handleAddComment = async () => {
        const dtoIn = {
            text: newCommentText.trim()
        }

        setCommentCall("pending");

        try {
            const result = await FetchHelper.books.chapters.comments.create(
                dtoIn,
                bookId,
                chapterId
            )

            if (result) {
                setComments(prev => [result, ...prev]);
                console.log(result);
                setNewCommentText("");
                setCommentValid(true);

                if (result.status === 400) {
                    setCommentValid(false);
                }

                loadComments();
            } else {
                setCommentCall("error");
            }
        } catch (err) {
            console.error(err);
            setCommentCall("error");
        }

    };

    const handleDeleteComment = async (id) => {
        const comment = comments.find(com => com.id === id);

        setCommentCall("pending");

        try {
            const result = await FetchHelper.books.chapters.comments.delete(
                undefined,
                bookId,
                chapterId,
                comment.id
            )

            if (result) {
                const updatedComments = comments.filter(comment => comment.id !== id);

                setComments(updatedComments);
                setCommentToDelete(null);
                setCommentCall("success");
            } else {
                setCommentCall("error");
            }
        } catch (err) {
            console.error(err);
            setCommentCall("error");
        }
    };

    const loadChapter = async () => {
        setChapterCall("pending");

        try {
            const result = await FetchHelper.books.chapters.get(
                undefined,
                bookId,
                chapterId
            )

            if (result) {
                setChapterData(result.response);
                console.log(result.response)
                setChapterCall("success");
            } else {
                setChapterCall("error");
            }
        } catch (err) {
            console.error(err);
            setChapterCall("error");
        }
    };

    const loadComments = async () => {
        setCommentCall("pending");

        try {
            const result = await FetchHelper.books.chapters.comments.list(
                undefined,
                bookId,
                chapterId
            )

            if (result) {
                setComments(result.response);
                setCommentCall("success");
            } else {
                setCommentCall("error");
            }
        } catch (err) {
            console.error(err);
            setCommentCall("error");
        }
    };

    // Load chapter and comments on mount
    useEffect(() => {
        loadChapter();
        loadComments();
    }, []);

    // Loading state
    if (chapterCall === "pending") {
        return (
            <div className="chapter-root">
                <header className="chapter-header">
                    <div className="header-left">
                        <BackArrow onClick={() => setScreen(`/book/${bookId}`, -1)} />
                    </div>
                    <div className="header-center">
                        <h1 className="chapter-title">Loading...</h1>
                    </div>
                    <div className="header-right" />
                </header>
                <div
                    style={{
                        position: "absolute",
                        left: "10%",
                        right: "10%",
                        display: "flex",
                        justifyContent: "center",
                        marginTop: 50,
                    }}
                >
                    <ClipLoader color="var(--color-white)" size={30} />
                </div>
            </div>
        );
    }

    // Error
    if (!chapterData) {
        return (
            <div className="chapter-root">
                <header className="chapter-header">
                    <div className="header-left">
                        <BackArrow onClick={() => setScreen(`/book/${bookId}`, -1)} />
                    </div>
                    <div className="header-center">
                        <h1 className="chapter-title">Chapter Not Found</h1>
                    </div>
                    <div className="header-right" />
                </header>
                <div
                    style={{
                        position: "absolute",
                        left: "10%",
                        right: "10%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginTop: 50,
                    }}
                >
                </div>
            </div>
        );
    }

    // Success state
    return (
        <>
            <div className="chapter-root">
                <header className="chapter-header">
                    <div className="header-left">
                        <BackArrow onClick={() => setScreen(`/book/${bookId}`, -1)} />
                    </div>
                    <div className="header-center">
                        <h1 className="chapter-title">
                            {chapterData.name}
                        </h1>
                    </div>
                    <div className="header-right" />
                </header>
                <div>
                    <div style={{ position: "absolute", left: "10%", right: "10%" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "left",
                                marginTop: 30,
                            }}
                            className="chapter-content"
                        >
                            {chapterData.content}
                        </div>
                        <div className="comment-header">
                            <h2>Comments</h2>

                            {!isAuthor && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {commentValid ?
                                        <TextField
                                            multiline
                                            fullWidth
                                            variant="filled"
                                            label="Write a comment"
                                            maxRows={4}
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                            style={{ backgroundColor: "white" }}
                                        /> :
                                        <TextField
                                            error
                                            id="outlined-error-helper-text"
                                            helperText="No less than 5 characters allowed."
                                            multiline
                                            fullWidth
                                            variant="filled"
                                            label="Write a comment"
                                            maxRows={4}
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                            style={{ backgroundColor: "white" }}
                                        />
                                    }

                                    <button
                                        className="ds-btn ds-btn-primary"
                                        onClick={handleAddComment}
                                        style={{ alignSelf: "flex-end" }}
                                    >
                                        Post comment
                                    </button>
                                </div>
                            )}
                        </div>
                        <div style={{ marginBottom: 30 }}>
                            {comments.map(comment =>
                                <div className="comment" key={comment.id}>
                                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
                                            <Avatar sx={{ bgcolor: "white", color: "black" }}>{comment.username?.slice(0, 1)}</Avatar>
                                            <div>
                                                <b>{comment.username}</b>
                                            </div>
                                        </div>
                                        {comment.username === localStorage.getItem("username") &&
                                            <div style={{ margin: 10 }}>
                                                <button className="ds-btn ds-btn-danger" onClick={() => setCommentToDelete(comment)}>Delete</button>
                                            </div>
                                        }
                                    </div>
                                    <div>
                                        {comment.text}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDeleteCommentModal
                commentToDelete={commentToDelete}
                setCommentToDelete={setCommentToDelete}
                onDelete={() => handleDeleteComment(commentToDelete.id)}
            />
        </>
    );
}

export default Chapter;