import { ClipLoader } from "react-spinners";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import BackArrow from "./generic/BackArrow";
import FetchHelper from "../fetchHelper";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import "../styles/chapter.css";

function Chapter({ setScreen }) {
    const [chapterCall, setChapterCall] = useState("inactive");
    const [chapterData, setChapterData] = useState(null);

    const params = useParams();
    const bookId = params.bookId;
    const chapterId = params.chapterId;

    const isAuthor = localStorage.getItem("authorId") !== "null";

    const [comments, setComments] = useState([
        {
            id: "1",
            username: "Jirka",
            text: "Super kapitola bro 🔥"
        },
        {
            id: "2",
            username: "Oleksandr",
            text: "Je to top 👍"
        },
        {
            id: "3",
            username: "Honza",
            text: "Jen tak dál 🙌"
        }
    ]);

    const [newCommentText, setNewCommentText] = useState("");

    const handleAddComment = () => {
        const username = localStorage.getItem("username");

        const newComment = {
            id: Date.now(),
            username,
            text: newCommentText.trim()
        };

        setComments(prev => [newComment, ...prev]);
        setNewCommentText("");
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

    // Load chapter on mount
    useEffect(() => {
        loadChapter();
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
                                <TextField
                                    multiline
                                    fullWidth
                                    variant="filled"
                                    label="Write a comment"
                                    maxRows={4}
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    style={{ backgroundColor: "white" }}
                                />

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
                                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
                                    <Avatar sx={{ bgcolor: "white", color: "black" }}>{comment.username.slice(0, 1)}</Avatar>
                                    <div>
                                        <b>{comment.username}</b>
                                    </div>
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
    );
}

export default Chapter;