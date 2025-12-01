import { ClipLoader } from "react-spinners";
import { useState, useEffect } from 'react';
import BackArrow from "./generic/BackArrow";
import PageNavbar from "./generic/PageNavbar";
import LogoutIcon from '@mui/icons-material/Logout';

function CreateBookScreen({ pathname, setScreen }) {
    const [bookListCall, setBookListCall] = useState({ state: "inactive" });
    const [logoutCall, setLogoutCall] = useState({ state: "inactive" });

    const loadBooks = () => {
        setBookListCall({ state: "pending" });

        setTimeout(() => {
            setBookListCall({ state: "success" });
        }, 2000);
    }

    // simulate book loading on component mount
    useEffect(() => {
        loadBooks();
    }, []);

    const handleLogout = () => {
        setLogoutCall({ state: "pending" });

        setTimeout(() => {
            setLogoutCall({ state: "success" });

            setScreen('/login', -1);
        }, 2000);
    }

    return (
        <div>
            <div className="page-header">
                <div className="header-top-row">
                    <BackArrow className="header-back" onClick={() => setScreen("/home", -1)} />

                    <div className="header-buttons">
                        <button className="basic-btn" onClick={handleLogout}>
                            {logoutCall.state === "pending" ? (
                                <ClipLoader color="var(--color-primary)" size={20} />
                            ) : (
                                <>
                                    <LogoutIcon /> Logout
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <h1 className="page-title">My Books (placeholder)</h1>
            </div>

            <div style={{ minHeight: '100vh', padding: 20 }}>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
                    {bookListCall.state === "pending" ? <ClipLoader color="var(--color-white)" size={30} /> : "There are no books yet."}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>

                </div>
            </div>

            <div style={{ width: "100%", minHeight: "15vh", fontSize: "20px", display: "flex", justifyContent: "space-evenly", overflow: "clip" }} className="page-footer">
                <PageNavbar pathname={pathname} setScreen={setScreen} />
            </div>

        </div>
    )
}

export default CreateBookScreen;