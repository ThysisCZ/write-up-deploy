import { ClipLoader } from "react-spinners";
import { useState, useEffect } from 'react';
import BackArrow from "./generic/BackArrow";
import PageNavbar from "./generic/PageNavbar";
import LogoutIcon from '@mui/icons-material/Logout';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import SettingsIcon from '@mui/icons-material/Settings';

export default function ProfileScreen({ pathname, setScreen }) {
    const [profileCall, setProfileCall] = useState({ state: "inactive" });
    const [logoutCall, setLogoutCall] = useState({ state: "inactive" });

    const authorName = "J. K. Rowling";
    const genres = ["Fantasy", "Drama", "Fiction"];
    const email = "j.k.rowling@gmail.com";
    const bio = "J. K. Rowling is the British novelist who wrote Harry Potter, a seven-volume series about a young wizard. \
    Published from 1997 to 2007, the fantasy novels are the best-selling book series in history, with over 600 million copies sold."

    const loadProfile = () => {
        setProfileCall({ state: "pending" });

        setTimeout(() => {
            setProfileCall({ state: "success" });
        }, 100);
    }

    // simulate profile loading on component mount
    useEffect(() => {
        loadProfile();
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
                        <button className="basic-btn">
                            <SettingsIcon /> Edit
                        </button>
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

                <h1 className="page-title">Author's profile</h1>
            </div>

            <div style={{ minHeight: '112vh' }}>
                <div style={{ position: "absolute", left: "10%", right: "10%" }}>
                    {profileCall.state === "pending" ? <div style={{ display: "flex", justifyContent: "center" }}>
                        <ClipLoader color="var(--color-white)" size={30} />
                    </div> :
                        <div>
                            <div>
                                <h2>Personal information</h2>

                                <Card variant="outlined">
                                    <CardContent style={{ display: "flex", justifyContent: "center", color: "white" }} className="card">
                                        <Stack direction="row" spacing={3} style={{ marginTop: 17 }}>
                                            <Avatar style={{ height: 100, width: 100, marginTop: 10 }} />
                                            <div>
                                                <div>
                                                    Name: {authorName}
                                                </div>
                                                <div>
                                                    Genres:
                                                    <ul style={{ marginTop: 5 }}>
                                                        {genres.map(genre =>
                                                            <li>
                                                                {genre}
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </div>

                            <div>
                                <h2>Contact</h2>

                                <Card variant="outlined">
                                    <CardContent style={{ display: "flex", justifyContent: "left", color: "white", height: 15 }} className="card">
                                        <Stack direction="row" spacing={2}>
                                            <h3>Email:</h3>
                                            <div>
                                                {email}
                                            </div>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </div>

                            <div>
                                <h2>Bio</h2>

                                <Card variant="outlined">
                                    <CardContent style={{ display: "flex", justifyContent: "left", color: "white", paddingBottom: 15 }} className="card">
                                        <div>
                                            {bio}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    }
                </div>
            </div>

            <div style={{ width: "100%", minHeight: "15vh", fontSize: "20px", display: "flex", justifyContent: "space-evenly", overflow: "clip" }} className="page-footer">
                <PageNavbar pathname={pathname} setScreen={setScreen} />
            </div>

        </div >
    )
}

// src/components/ProfileScreen.jsx

/*
export default function ProfileScreen({ setScreen = () => {} }) {
  // При потребі підключіть додаткові пропси: user, onEdit, onLogout тощо.
  return (
    <div style={{ padding: 24, color: '#fff' }}>
      <h1 style={{ marginTop: 0 }}>Profile</h1>
      <section style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, margin: '6px 0' }}>User</h2>
        <div style={{
          background: 'rgba(10,36,56,0.45)',
          padding: 12,
          borderRadius: 12,
          maxWidth: 520
        }}>
          <div style={{ fontWeight: 700 }}>Your username</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>jk.rowling@gmail.com</div>
        </div>
      </section>

      <section style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, margin: '6px 0' }}>About</h2>
        <div style={{
          background: 'rgba(10,36,56,0.45)',
          padding: 12,
          borderRadius: 12,
          maxWidth: 520,
          lineHeight: 1.4,
          color: 'rgba(255,255,255,0.9)'
        }}>
          Тут буде інформація про користувача. Коротка біографія, жанри, інші деталі.
        </div>
      </section>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => setScreen('/home', -1)}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            background: '#0b3b5a',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          Back
        </button>

        <button
          onClick={() => alert('Edit profile — реалізувати тут')}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          Edit profile
        </button>
      </div>
    </div>
  );
}
*/