import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';

function PageNavbar({ pathname, setScreen }) {
    return (
        <div style={{ width: "min-content", justifyContent: "space-evenly", display: "flex", height: "8vh" }}>
            <button className='navbar-button navbar-left' style={{ display: "block", width: "12vh", textAlign: "center", fontSize: "14px" }}
                onClick={e => pathname !== "/home" && setScreen("/home", -1)}>
                <HomeIcon style={{ fontSize: "30px" }} />
                <div>Home</div>
            </button>
            <button className='navbar-button navbar-middle' style={{ display: "block", width: "12vh", textAlign: "center", fontSize: "14px" }}
                onClick={e => pathname !== "/books" && (pathname === "/home" ? setScreen("/books", 1) : setScreen("/books", -1))}>
                <MenuBookIcon style={{ fontSize: "30px" }} />
                <div>My Books</div>
            </button>
            <button className='navbar-button navbar-right' style={{ display: "block", width: "12vh", textAlign: "center", fontSize: "14px" }}
                onClick={e => pathname !== "/profile" && setScreen("/profile", 1)}>
                <PersonIcon style={{ fontSize: "30px" }} />
                <div>Profile</div>
            </button>
        </div>
    )
}

export default PageNavbar