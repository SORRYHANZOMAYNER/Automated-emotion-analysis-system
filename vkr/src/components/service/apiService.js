import axios from 'axios';

const API_BASE_URL = 'http://62.109.19.68:8000/api1/v1'; 

export const registerUser = async (login,email, password) => {  
  try {  
      const response = await axios.post(API_BASE_URL + '/register', { login,email, password },);  
      return response;  
  } catch (error) {  
      throw error;   
  }  
};   
export const loginUser = async (login, password) => {  
    try {  
        const response = await axios.post(API_BASE_URL + '/login', null, {  
            params: { login, password },  
        });  
        
        console.log("Token from back:", response.data); 
        return response.data; 
    } catch (error) {  
        console.error("Ошибка при входе:", error);  
        throw error;  
    }  
};  
export const uploadAvatar = async (file) => {
  const token = localStorage.getItem('token');
  if (!token) {
      throw new Error('Токен не найден');
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
      const response = await axios.post(API_BASE_URL + '/user/avatar/me', formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
          }
      });
      return response.data;
  } catch (error) {
      console.error('Ошибка при загрузке аватара2:', error);
      throw error;
  }
};
export const fetchCurrentUser = async () => {  
  const token = localStorage.getItem('token');  
  console.log("Токен для получения информации: " + token)
  if (!token) {  
      throw new Error('Токен не найден'); 
  }  

  try {  
      const response = await axios.get(API_BASE_URL + '/userme', {  
          headers: {  
              Authorization: `Bearer ${token}` 
          }  
      });  
      return response.data; 
  } catch (error) {  
      console.error('Ошибка при получении информации о пользователе:', error);  
      throw error; 
  }  
};  
export const updateCurrentUser = async (login,email,phone) => {  
  const token = localStorage.getItem('token');  
  console.log("Токен для обновления информации: " + token)
  if (!token) {  
      throw new Error('Токен не найден'); 
  }  

  try {  
      const response = await axios.put(API_BASE_URL + '/user/me', { login,email, phone }, {  
          headers: {  
              Authorization: `Bearer ${token}` 
          }  
      });  
      return response.data; 
  } catch (error) {  
      console.error('Ошибка при обновлении информации о пользователе:', error);  
      throw error; 
  }  
};  
export const deleteAppeal = async (date) =>{
    const token = localStorage.getItem('token');
    try {
        console.log("Токен для удаления истории: " + token)  
        if (!token) {  
            throw new Error('Токен не найден'); 
        }  
        const formData = new FormData();
        formData.append('date', date);  
        const response = await axios.delete(API_BASE_URL + '/appeal', formData, {  
            headers: {  
                Authorization: `Bearer ${token}` 
            }  
        });  
        console.log('Deleting appeal:', response.data);   
  } catch (error) {  
      console.error('Ошибка при удалении истории:', error);  
      throw error; 
  }  
}
export const createAppeal = async (emotion, file) => {  
    const token = localStorage.getItem('token');
    try { 
       const formData = new FormData();
       formData.append('emotion', emotion);
       formData.append('image',  file); 
      const createAppealResponse = await axios.post(API_BASE_URL + '/appeal',formData,
        {
            headers: {  
                Authorization: `Bearer ${token}` 
            }  
        }
      );  
      console.log('Appeal created:', createAppealResponse.data);  
    } catch (error) {  
      console.error('Error creating appeal:', error);  
    }  
  };  

  const convertToBase64 = (file) => {  
    return new Promise((resolve, reject) => {  
      const reader = new FileReader();  
      reader.onload = () => {  
        resolve(reader.result);  
      };  
      reader.onerror = (error) => {  
        reject(error);  
      };  
      reader.readAsDataURL(file);  
    });  
  };  