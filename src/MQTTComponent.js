// src/MQTTComponent.js
import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const MQTTComponent = () => {
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const topico = "BananaOmastar"
  useEffect(() => {
    const client = mqtt.connect('ws://broker.emqx.io:8083/mqtt');

    client.on('connect', () => {
      console.log('✅ Conectado ao broker EMQX');
      setIsConnected(true);
      client.subscribe(topico, (err) => {
        if (err) {
          console.error('Erro ao se inscrever no tópico: ' + topico, err);
        } else {
          console.log('📡 Inscrito em ' + topico);
        }
      });
    });

    client.on('message', (topic, msg) => {
      const msgStr = msg.toString();
      console.log(`📥 Mensagem recebida: ${msgStr}`);
      setMessage(msgStr);
    });

    client.on('error', (err) => {
      console.error('❌ Erro na conexão:', err);
      setIsConnected(false);
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '1rem' }}>
      <h2>MQTT React Client</h2>
      <p>Status: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}</p>
      <p><strong>Mensagem:</strong> {message}</p>
    </div>
  );
};

export default MQTTComponent;
