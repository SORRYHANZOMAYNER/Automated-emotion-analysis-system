import React, { useState } from 'react';
import LoginForm from '../login/LoginForm';
import RegistrationForm from '../registration/RegistrationForm'
import './AuthForm.css';


const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="auth-form-container">
         <div className="auth-form">
          {isLogin ? <LoginForm /> : <RegistrationForm />}
          <button className="toggle-button" onClick={toggleForm}>
            {isLogin ? '+' : 'x'}
          </button>
        </div>
    </div>
  );
};

export default AuthForm;
