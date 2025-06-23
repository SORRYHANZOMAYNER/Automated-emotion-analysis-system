import React, { useEffect, useState } from 'react';
import { Typography, Table, Image, message, Button } from 'antd';
import { deleteAppeal, fetchCurrentUser } from '../service/apiService';
import { DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const HistoryPage = () => {
  const [histories, setHistories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getHistories = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await fetchCurrentUser(token);
        setHistories(data.appeals);
      } catch (error) {
        setError('Не удалось загрузить данные');
        message.error('Не удалось загрузить данные');
      }
    };

    getHistories();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  const handleDelete = async (date) => {
    try {
      await deleteAppeal(date);
      console.log(`Удаление записи с датой: ${date}`);
      message.success('Запись успешно удалена!');

      setHistories(histories.filter((history) => history.date !== date));
    } catch (error) {
      message.error('Ошибка при удалении записи.');
    }
  };

  const columns = [
    {
      title: 'Дата обращения',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Образец фото',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <Image src={image} alt="Образец фото" style={{ width: '100px', height: '100px' }} />
      ),
      width: '20%',
    },
    {
      title: 'Распознанная эмоция',
      dataIndex: 'emotion',
      key: 'emotion',
      width: '80%',
      render: (emotion, record) => (
        <span>
          <span style={{ fontSize: '20px' }}>{emotion}</span>
          &nbsp;&nbsp;
          {}
          <Button 
            type="link" 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.date)} 
            danger
          />
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', textAlign: 'center' }}>
      <Title>История запросов</Title>
      <Table
        columns={columns}
        dataSource={histories}
        pagination={false}
        rowKey="id"
        style={{ marginTop: '16px', width: '80%', margin: '0 auto' }}
      />
    </div>
  );
};

export default HistoryPage;