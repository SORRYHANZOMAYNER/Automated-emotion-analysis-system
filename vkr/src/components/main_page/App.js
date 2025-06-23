import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from 'react-router-dom';
import {
  Layout,
  Button,
  Upload,
  message,
  Card,
  Typography,
  Breadcrumb,
  Divider,
  Row,
  Col,
  Select,
  Avatar,
  Modal, 
  Form, 
  Input, 
} from 'antd'; 
import {
  HomeOutlined,
  LoginOutlined,
  LogoutOutlined,
  UploadOutlined,
  HistoryOutlined,
  UserOutlined,
  CameraOutlined,
  ApiOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  MailOutlined,
} from '@ant-design/icons';
import PersonalPage from '../personal_page/Personal';
import HistoryPage from '../history/History';
import {
  BsEmojiGrin,
  BsEmojiSurprise,
  BsEmojiGrimace,
  BsEmojiAngry,
  BsEmojiTear,
  BsEmojiExpressionless,
  BsEmojiNeutral,
  BsEmojiDizzy,
} from 'react-icons/bs';
import AuthForm from '../auth/AuthForm';
import emailjs from 'emailjs-com';
import { fetchCurrentUser, createAppeal } from '../service/apiService';
import {SERVICE_ID,TEMPLATE_ID,PUBLIC_KEY} from '../service/enviroment';
import axios from 'axios';
import './App.css';
const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const emotionsData = [
  { icon: <BsEmojiGrin />, label: 'Радость', value: 'happy', color: '#FFD700' },
  { icon: <BsEmojiSurprise />, label: 'Удивление', value: 'surprise', color: '#FF69B4' },
  { icon: <BsEmojiGrimace />, label: 'Отвращение', value: 'disgust', color: '#8B0000' },
  { icon: <BsEmojiAngry />, label: 'Гнев', value: 'anger', color: '#FF4500' },
  { icon: <BsEmojiTear />, label: 'Грусть', value: 'sad', color: '#1E90FF' },
  { icon: <BsEmojiExpressionless />, label: 'Безразличие', value: 'contempt', color: '#808080' },
  { icon: <BsEmojiDizzy />, label: 'Страх', value: 'fear', color: '#A0522D' },
  { icon: <BsEmojiNeutral />, label: 'Нейтральное', value: 'neutral', color: '#C0C0C0' },
];

const models = [
  { value: 'custom', label: 'Custom CNN' },
  { value: 'efficientnet-b0', label: 'EfficientNet-B0' },
  { value: 'resnet50', label: 'ResNet50' },
];

const App = () => {
  const [isSupportModalVisible, setIsSupportModalVisible] = useState(false);
  const [nameModel, setNameModel] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [data, setData] = useState(null);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [file, setFile] = useState(null); 

const handleSendSupportMessage = async (values) => {
  const { subject, message } = values;

  const templateParams = {
    subject: subject,
    message: message,
    email: 'egorka.aksenov.2018@mail.ru', 
  };

  try {
    emailjs.send('service_a5fxw5l', 'template_9v6v9fw', templateParams, 'HEL7m3czROE8fuX-g').then(
      (response) => {
        console.log('SUCCESS!', response.status, response.text);
      },
      (error) => {
        console.log('FAILED...', error);
      },
    );
    setIsSupportModalVisible(false);
  } catch (error) {
    console.error('Ошибка при отправке:', error);
  }
};

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await fetchCurrentUser();
        setData(userData);
        console.log('User from back:', userData);
      } catch (error) {
        console.error(error);
        message.error('Не удалось загрузить данные пользователя.');
      }
    };
    loadUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };

  const handleAnalyze = async () => {
    if (!nameModel) {
      message.error('Пожалуйста, выберите модель для анализа.');
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setImageUrl(reader.result);
        await analyzeEmotion(file);
      };
      reader.readAsDataURL(file);
    } else {
      message.error('Пожалуйста, загрузите фото перед анализом.');
    }
  };

  const handleBeforeUpload = (file) => {
    const isValidType =
      file.type === 'image/png' || file.type === 'image/jpeg';
    const isValidSize = file.size <= 4 * 1024 * 1024;
    if (!isValidType) {
      message.error('Можно загружать только PNG или JPG файлы!');
      return Upload.LIST_IGNORE;
    }
    if (!isValidSize) {
      message.error('Файл должен быть меньше 4 МБ!');
      return Upload.LIST_IGNORE;
    }
    setFile(file);
    setImageUrl(URL.createObjectURL(file));
    return false;
  };

  const analyzeEmotion = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('model', nameModel);
      const response = await axios.post(
        'http://62.109.19.68:8000/api1/v1/predict-emotion',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      const emotion = response.data.emotion;
      setDetectedEmotion(emotion);
      await createAppeal(emotion, file);
    } catch (error) {
      console.error('Error sending image', error);
      setDetectedEmotion('Ошибка при обработке изображения');
      message.error('Ошибка при отправке данных на сервер.');
    }
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh', fontFamily: "'Roboto', sans-serif" }}>
        {/* Фиксированная шапка */}
        <Header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '64px',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={data?.avatar}
              icon={!data?.avatar && <UserOutlined />}
              size={40}
              style={{ marginRight: '10px' }}
            />
            <Breadcrumb
              style={{
                margin: '16px 0',
                fontSize: '18px',
                color: '#000',
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              <Breadcrumb.Item>
                <Link
                  to="/"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 500,
                    color: '#000',
                  }}
                >
                  <HomeOutlined style={{ marginRight: 8 }} /> Главная
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link
                  to="/personal"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 500,
                    color: '#000',
                  }}
                >
                  <UserOutlined style={{ marginRight: 8 }} /> Личный кабинет
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link
                  to="/history"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 500,
                    color: '#000',
                  }}
                >
                  <HistoryOutlined style={{ marginRight: 8 }} /> История
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div>
            <Link to="/auth">
              <Button
                type="text"
                icon={<LoginOutlined />}
                style={{
                  fontSize: '18px',
                  marginLeft: '16px',
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                Войти
              </Button>
            </Link>
            <Link to="/auth">
              <Button
                type="text"
                danger
                icon={<LogoutOutlined />}
                style={{
                  fontSize: '18px',
                  marginLeft: '16px',
                  fontFamily: "'Roboto', sans-serif",
                }}
                onClick={handleLogout}
              >
                Выйти
              </Button>
            </Link>
          </div>
        </Header>
        {/* Основное содержимое */}
        <Content
          style={{
            padding: '50px',
            marginTop: '64px',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <div className="site-layout-content">
                  <Title level={2} style={{ fontSize: '30px', fontFamily: "'Roboto', sans-serif" }}>
                    Добро пожаловать, {data ? data.login : 'гость'}!
                  </Title>
                  {/* Иконка техподдержки */}
                  <div style={{
                    position: 'absolute',
                    top: '70px', 
                    right: '60px',
                    cursor: 'pointer'
                  }}
                    onClick={() => setIsSupportModalVisible(true)}
                  >
                    <QuestionCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  </div>
                  <Divider />
                  {/* Карточки */}
                  <Row gutter={32} style={{ marginBottom: '40px' }}>
                    <Col span={8}>
                      <Card
                        variant={false}
                        style={{
                          textAlign: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          borderRadius: '10px',
                          fontFamily: "'Roboto', sans-serif",
                        }}
                      >
                        <CameraOutlined style={{ fontSize: '48px', color: '#007bff' }} />
                        <Title level={4} style={{ fontFamily: "'Roboto', sans-serif" }}>
                          Visual Search
                        </Title>
                        <Paragraph style={{ fontFamily: "'Roboto', sans-serif" }}>
                          Загружайте изображения для поиска.
                        </Paragraph>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card
                        variant={false}
                        style={{
                          textAlign: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          borderRadius: '10px',
                          fontFamily: "'Roboto', sans-serif",
                        }}
                      >
                        <ApiOutlined style={{ fontSize: '48px', color: '#28a745' }} />
                        <Title level={4} style={{ fontFamily: "'Roboto', sans-serif" }}>
                          Multiple Neural Networks
                        </Title>
                        <Paragraph style={{ fontFamily: "'Roboto', sans-serif" }}>
                          Выбирайте подходящую модель для распознавания.
                        </Paragraph>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card
                        variant={false}
                        style={{
                          textAlign: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          borderRadius: '10px',
                          fontFamily: "'Roboto', sans-serif",
                        }}
                      >
                        <MessageOutlined style={{ fontSize: '48px', color: '#6f42c1' }} />
                        <Title level={4} style={{ fontFamily: "'Roboto', sans-serif" }}>
                          Live Chat Support
                        </Title>
                        <Paragraph style={{ fontFamily: "'Roboto', sans-serif" }}>
                          Поддержка в режиме реального времени.
                        </Paragraph>
                      </Card>
                    </Col>
                  </Row>
                  {/* Выбор модели */}
                  <Row gutter={16}>
                    <Col span={6}>
                      <Select
                        placeholder="Выберите модель"
                        style={{ width: '100%' }}
                        onChange={(value) => setNameModel(value)}
                        value={nameModel || undefined}
                      >
                        {models.map((model) => (
                          <Select.Option key={model.value} value={model.value}>
                            {model.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={18}>
                      <Paragraph
                        style={{
                          fontSize: '18px',
                          display: 'inline-block',
                          marginRight: '20px',
                        }}
                      >
                        Выберите модель
                      </Paragraph>
                    </Col>
                  </Row>
                  {/* Кнопки загрузки и анализа */}
                  <Row gutter={8} style={{ marginTop: '20px' }}>
                    <Col span={3}>
                      <Upload
                        accept="image/png, image/jpeg"
                        showUploadList={false}
                        beforeUpload={handleBeforeUpload}
                        onChange={(info) => {}}
                      >
                        <Button icon={<UploadOutlined />}
                        >Загрузить фото</Button>
                      </Upload>
                    </Col>
                    <Col span={2}>
                      <Button type="primary" onClick={handleAnalyze}>
                        Анализировать
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Paragraph
                        style={{
                          fontSize: '18px',
                          display: 'inline-block',
                          marginLeft: '20px',
                        }}
                      >
                        Загрузите фото и узнайте, какие эмоции оно вызывает!
                      </Paragraph>
                    </Col>
                  </Row>
                  {/* Превью изображения */}
                  {imageUrl && (
                    <div style={{ marginTop: '20px' }}>
                      <img
                        src={imageUrl}
                        alt="Preview"
                        style={{ width: '300px' }}
                      />
                    </div>
                  )}
                  {/* Отображение эмоций */}
                  <Row gutter={16} style={{ marginTop: '20px' }}>
                    {emotionsData.map((emotionData, index) => {
                      const isActive =
                        detectedEmotion === emotionData.value;
                      const backgroundColor = isActive
                        ? emotionData.color
                        : 'transparent';
                      return (
                        <Col span={6} key={index} style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              backgroundColor,
                              borderRadius: '50%',
                              padding: '10px',
                              display: 'inline-block',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '32px',
                                color: isActive ? 'white' : 'black',
                              }}
                            >
                              {emotionData.icon}
                            </div>
                          </div>
                          <div>{emotionData.label}</div>
                        </Col>
                      );
                    })}
                  </Row>
                  {/* Результат анализа */}
                  {detectedEmotion && (
                    <Card
                      title="Результаты анализа"
                      style={{ marginTop: '20px' }}
                    >
                      <p>Обнаруженная эмоция: {detectedEmotion}</p>
                    </Card>
                  )}
                </div>
              }
            />
            <Route path="/personal" element={<PersonalPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/auth" element={<AuthForm />} />
          </Routes>
          {/* Модальное окно поддержки */}
          <Modal
            title="Обратиться в техподдержку"
            open={isSupportModalVisible}
            onCancel={() => setIsSupportModalVisible(false)}
            footer={null}
          >
            <Form onFinish={handleSendSupportMessage}>
              <Form.Item label="Тема" name="subject" rules={[{ required: true }]}>
                <Input placeholder="Введите тему обращения" />
              </Form.Item>
              <Form.Item label="Сообщение" name="message" rules={[{ required: true }]}>
                <Input.TextArea rows={4} placeholder="Опишите вашу проблему или вопрос" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block>
                Отправить
              </Button>
            </Form>
          </Modal>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          Ant Design ©2025 Created by SORRYHANZOMAYNER
        </Footer>
      </Layout>
    </Router>
  );
};

export default App;