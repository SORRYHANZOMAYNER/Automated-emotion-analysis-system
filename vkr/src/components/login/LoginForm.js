import React, { useState } from 'react';  
import axios from 'axios';  
import { useNavigate } from 'react-router-dom';  
import { TextField, Button, Snackbar } from '@mui/material';  
import MuiAlert from '@mui/material/Alert';  
import './LoginForm.css';  
import { loginUser } from '../service/apiService';

const Alert = React.forwardRef(function Alert(props, ref) {  
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;  
});  

const LoginForm = () => {  
    const [login, setLogin] = useState('');  
    const [password, setPassword] = useState('');  
    const [error, setError] = useState('');  
    const navigate = useNavigate();  

    const handleSubmit = async (e) => {  
        e.preventDefault();  
        try {  
            const response = await loginUser(login, password); 
            const token = response.accessToken; 
            console.log("Token:" + token);
            if(localStorage.getItem('token')!=null){
                localStorage.removeItem('token');
            }
            localStorage.setItem('token', token);  
            navigate('/');
        } catch (error) {  
            if (error.response && error.response.status === 401) {  
                setError('Неверный логин или пароль!');  
            } else {  
                console.error('Ошибка при входе', error?.response?.data || error.message);  
                setError('Произошла ошибка при входе');  
            }  
        }  
    };   

    return (  
        <div className="box">  
            <div className="title">LOGIN</div>  
            <form className="login-form-body" onSubmit={handleSubmit}>  
                <div className="input">  
                    <TextField  
                          label="Логин"  
                          variant="standard"  
                          fullWidth  
                          margin="dense"  
                          value={login}  
                          onChange={(e) => setLogin(e.target.value)}  
                          required  
                          style={{ marginBottom: '15px' }}  
                    />  
                     <span className="spin"></span>  
                </div>  
                <div className="input">  
                   <TextField  
                        type="password"  
                        label="Пароль"  
                        variant="standard"  
                        fullWidth  
                        margin="dense"  
                        value={password}  
                        onChange={(e) => setPassword(e.target.value)}  
                        required  
                        style={{ marginBottom: '15px' }}  
                       />  
                    <span className="spin"></span>  
                </div>  
                <div className="button login">  
                  <Button type="submit">  
                  <span>войти</span>  
                        <i className="fa fa-check"></i>  
                    </Button>  
                </div>  
            </form>  
            {error && (  
                <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError('')}>  
                    <Alert severity="error">{error}</Alert>  
                </Snackbar>  
            )}  
        </div>  
    );  
};  

export default LoginForm;