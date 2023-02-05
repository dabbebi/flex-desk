import './Header.css';
import logo from '../../assets/img/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'primereact';

function Header() {
    let navigate = useNavigate();
    
    function logout(e) {
        e.preventDefault();
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/flexy-desk/login"); 
        window.location.reload();
    }

  return (
    <div id='header-id'>
        <div className="logo-div">
            <img id='logo-linedata' src={logo} alt="" />
        </div>
        <div className='sections-div'>
            <Link className='page active' to='/flexy-desk/office' onClick={null}>
                <i className="pi pi-building" style={{fontSize: '17px'}}></i> {" "} Office
            </Link>
        </div>
        <div id='logout-div'>
            <Button label="Sign Out" icon="pi pi-sign-out" className="p-button-text" onClick={(e) => logout(e)} style={{color: 'gray'}}/>
        </div>
    </div>
  );
}

export default Header;