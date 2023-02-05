import './App.css';
import { Routes, Route } from "react-router-dom";
import Header from './components/header/Header';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import isLoggedIn from './services/authentication/isLoggedIn';

function App() {

  return (
    <>
    {
      !isLoggedIn() && 
        <Routes>
          <Route path="/flexy-desk/login" element={<Login />} />
          <Route path="*" element={<Login />} />
        </Routes>
    }

    {
      isLoggedIn() && (
        <>
          <Header />
          <Routes>
            <Route path="/flexy-desk/home" element={<Home />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </>
      )
    }
    </>
  );
}

export default App;