import React, { useState } from 'react';  
import axios from 'axios';  
import { useNavigate } from 'react-router-dom';  
import { TextField, Button, Snackbar } from '@mui/material';  
import MuiAlert from '@mui/material/Alert';  
import './RegistrationForm.css';  
import { registerUser } from '../service/apiService';

const Alert = React.forwardRef(function Alert(props, ref) {  
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;  
});  

const RegistrationForm = () => {  
    const [login, setLogin] = useState('');  
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');  
    const [error, setError] = useState('');  
    const [messageVisible, setMessageVisible] = useState(false); 

    const handleSubmit = async (e) => {  
        e.preventDefault();  
        setError('');  
        try {  
            await registerUser(login,email, password);  
            setError('Регистрация прошла успешно');  
        } catch (error) {  
            if (error.response && error.response.status === 400) {  
                setError('Длина логина должна быть меньше 15 символов!');  
            } else if (error.response && error.response.status === 409) {  
                setError('Этот логин уже существует! Пожалуйста, выберите другой.');  
            } else {  
                console.error('Ошибка при регистрации', error?.response?.data || error.message);  
            }  
        }  
    };  

    const handlePlusClick = () => {  
        setMessageVisible(!messageVisible); 
    };  

    return (  
        <div className="overbox">  
            <div className="material-button alt-2" onClick={handlePlusClick}>  
                <span className="shape"></span>  
            </div>  
            <div className="title">REGISTER</div>  
            <form className="registration-form-body" onSubmit={handleSubmit}>  
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
                        label="Почта"  
                        variant="standard"  
                        fullWidth  
                        margin="dense"  
                        value={email}  
                        onChange={(e) => setEmail(e.target.value)}  
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
                <div className="button">  
                    <Button type="submit">  
                        <span>Зарегистрироваться</span>  
                    </Button>  
                </div>  
            </form>  
            {error && (  
                <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError('')}>  
                    <Alert severity="error">{error}</Alert>  
                </Snackbar>  
            )}  
            {messageVisible && (  
                <Snackbar open={messageVisible} autoHideDuration={6000} onClose={() => setMessageVisible(false)}>  
                    <Alert severity="info">Автор: https://github.com/SORRYHANZOMAYNER</Alert>  
                </Snackbar>  
            )}  
        </div>  
    );  
};  

export default RegistrationForm;