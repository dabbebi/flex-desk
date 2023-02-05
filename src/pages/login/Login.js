import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { useState } from 'react';
import './Login.css';
import logo from '../../assets/img/logo.png';
import { login } from '../../services/authentication/auth.service';
import { useNavigate } from 'react-router-dom';

function Login() {
  let navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailClassError, setEmailClassError] = useState('');
  const [passwordClassError, setPasswordClassError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  async function signIn(e) {
    var err = false;
    try {
      e.preventDefault();
      if(email === '') {
        err = true;
        setEmailClassError('p-invalid block');
        setEmailError('This field is required!');
      }
      if(password === '') {
        err = true;
        setPasswordClassError('p-invalid block');
        setPasswordError('This field is required!');
      }
      if (err) {
        return;
      }
      const response = await login(email, password);

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);

      navigate("/flexy-desk/office"); 
      window.location.reload();
    } catch (error) {
      console.log(error.response.data);
      setPasswordClassError('p-invalid block');
      setPasswordError('Your password is incorrect, try again!');
    }
  }

  function updateEmail(value) {
    setEmail(value);
    if(value !== ''){
      setEmailClassError('');
      setEmailError('');
    }else {
      setEmailClassError('p-invalid block');
      setEmailError('This field is required!');
    }
  }

  function updatePassword(value) {
    setPassword(value);
    if(value !== ''){
      setPasswordClassError('');
      setPasswordError('');
    }else {
      setPasswordClassError('p-invalid block');
      setPasswordError('This field is required!');
    }
    
  }

  return (
    <div id='login-id'>

        <div className="login-container">
          <div className="login-card">
            <div className="linedata-img">
              <img src={logo} alt="" id='logo-linedata-login'/>
            </div>
            <h2>Sign in to continue...</h2>
            <form autoComplete='on'>
              <div className="input-container">
                <div className='input-label'>Email</div>
                <div className="email-div">
                  <InputText className={emailClassError} id="email-field" value={email} onChange={(e) => updateEmail(e.target.value)}/>
                  <div id="email-help" className="p-error block">{emailError}</div>
                </div>
              </div>
              <br />
              <div className="input-container">
                <div className='input-label'>Password</div>
                <div className='password-div'>
                  <Password id='password-field' className={passwordClassError} value={password} onChange={(e) => updatePassword(e.target.value)} toggleMask  feedback={false}/>
                  <div id="password-help" className="p-error block">{passwordError}</div>
                </div>
              </div>
              <br />
              <div className="input-container">
                <div className='input-label'></div>
                <div className="btn-container">
                  <button className='login-btn' onSubmit={(e) => signIn(e)} onClick={(e) => signIn(e)}>Sign In</button>
                </div>
              </div>
            </form>
            
          </div>
        </div>

    </div>
  );
}

export default Login;