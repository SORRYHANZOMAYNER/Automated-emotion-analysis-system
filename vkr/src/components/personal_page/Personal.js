import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Form,
  message,
  Typography,
  Avatar,
  Alert,
  Popover,
  Upload,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { fetchCurrentUser, updateCurrentUser, uploadAvatar } from '../service/apiService';
import './Personal.css'; 

const { Title } = Typography;

const PersonalPage = () => {
  const [avatar, setAvatar] = useState(null); 
  const [avatarFile, setAvatarFile] = useState(null);
  const [alert, setAlert] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchCurrentUser();
        console.log("User from back:", userData);
        if (userData) {
          form.setFieldsValue({
            login: userData.login,
            email: userData.email,
            phone: userData.phone,
          });
          setAvatar(userData.avatar || null); 
        }
      } catch (error) {
        console.error(error);
        message.error('Не удалось загрузить данные пользователя.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [form]);

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Выберите изображение!');
      return false;
    }
    const fileURL = URL.createObjectURL(file);
    setAvatar(fileURL);
    setAvatarFile(file);
    return false;
  };

  const handleSubmit = async (values) => {
    const { login, email, phone } = values;

    try {
      if (avatarFile) {
        try {
          await uploadAvatar(avatarFile);
          message.success('Аватар успешно обновлен!');
        } catch (error) {
          message.error('Ошибка при загрузке аватара: ' + error.message);
        }
      }
      await updateCurrentUser(login, email, phone);
      setAlert({
        type: 'success',
        message: 'Успешно сохранено!',
        description: 'Ваши данные были успешно обновлены.',
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Ошибка!',
        description: error.message || 'Произошла ошибка при обновлении данных.',
      });
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="personal-page-container">
      <div className="personal-card">
        {alert && (
          <Alert
            message={alert.message}
            description={alert.description}
            type={alert.type}
            showIcon
            action={
              <Button size="small" onClick={() => setAlert(null)}>
                Закрыть
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '20px' }}>
            <Title level={2}>Личный кабинет</Title>
          </div>
          <Avatar
            src={avatar}
            icon={!avatar && <UserOutlined />}
            size={100}
            style={{ marginLeft: '10px' }}
          />
        </div>

        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Popover
            content="После смены имени необходимо повторить аутентификацию"
            title="Подсказка"
            trigger="click"
          >
            <InfoCircleOutlined style={{ cursor: 'pointer', marginLeft: '10px' }} />
          </Popover>

          {/* Имя */}
          <Form.Item
            label="Имя"
            name="login"
            rules={[{ required: true, message: 'Пожалуйста, введите ваше имя!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Введите ваше имя"
              style={{ width: '100%' }}
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Пожалуйста, введите ваш email!' }]}
          >
            <Input
              prefix={<MailOutlined />}
              type="email"
              placeholder="Введите ваш email"
              style={{ width: '100%' }}
            />
          </Form.Item>

          {/* Телефон */}
          <Form.Item
            label="Телефон"
            name="phone"
            rules={[{ required: true, message: 'Пожалуйста, введите ваш телефон!' }]}
          >
            <Input
              prefix={<PhoneOutlined />}
              type="tel"
              placeholder="Введите ваш телефон"
              style={{ width: '100%' }}
            />
          </Form.Item>

          {/* Аватар */}
          <Form.Item>
            <Upload
              name="avatar"
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
            >
              <Button
                variant="dashed"
                style={{ backgroundColor: '#FDD9B5', borderColor: '#FDD9B5' }}
                icon={<UploadOutlined />}
              >
                Выберите аватар
              </Button>
            </Upload>
          </Form.Item>

          {}
          <Form.Item style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button
                variant="dashed"
                style={{ backgroundColor: '#FDD9B5', borderColor: '#FDD9B5' }}
                htmlType="submit"
                icon={<UploadOutlined />}
            >
              Сохранить изменения
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default PersonalPage;