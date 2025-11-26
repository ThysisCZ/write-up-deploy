import { ClipLoader } from "react-spinners";
import { useState, useEffect } from 'react';
import BackArrow from "./generic/BackArrow";
import PageNavbar from "./generic/PageNavbar";
import LogoutIcon from '@mui/icons-material/Logout';

function HomeScreen({ setScreen }) {
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

            setScreen('/login',-1);
        }, 2000);
    }

    return (
        <div>

            <div style={{ width: "100%", minHeight: "10vh", fontSize: "20px", display: "flex", justifyContent: "space-between", boxSizing: "border-box", padding: "0 20px 0 20px" }} className="page-header">
                <BackArrow onClick={e => setScreen("/",-1)} />
                <button className="basic-btn" onClick={handleLogout} style={{ width: "9%", backgroundColor: "var(--bg-bottom)"}}>{
                    logoutCall.state === "pending" ? <ClipLoader color="var(--color-primary)" size={20} /> : (<div style={{display:"flex", alignItems:"center", textAlign:"center"}}><LogoutIcon/> Logout</div>)
                }
                </button>

                <h1 style={{ textAlign: 'center', position: "absolute", left: "10%", right: "10%", marginTop: 50 }}  className="home-screen-title">Home (placeholder)</h1>
            </div>

            <div style={{ minHeight: '100vh', padding: 20 }}>

                <p style={{ textAlign: 'center' }}>You are logged in (mock). Next: build MyBooks screen.</p>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
                    {bookListCall.state === "pending" ? <ClipLoader color="var(--color-white)" size={30} /> : "There are no books yet."}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>

                </div>
            </div>

            <div style={{ width: "100%", minHeight: "15vh", fontSize: "20px", display: "flex", justifyContent: "space-evenly", overflow: "clip" }} className="page-footer">
                <PageNavbar />
            </div>

        </div>
    )
}

export default HomeScreen;