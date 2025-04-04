import React, { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';
import './EstadoPlanta.css';

const EstadoPlanta = () => {
  const [status, setStatus] = useState('ok');
  const [isConnected, setIsConnected] = useState(false);
  const [monitorando, setMonitorando] = useState(false);
  
  const alertaAudioRef = useRef(null);
  const okAudioRef = useRef(null);
 
  useEffect(() => {
    if (!monitorando) return;

    const client = mqtt.connect('ws://broker.emqx.io:8083/mqtt', {
      keepalive: 30,
      reconnectPeriod: 1000,
    });

    alertaAudioRef.current = new Audio('/alerta.mp3');
    okAudioRef.current = new Audio('/ok.mp3');

    client.on('connect', () => {
      console.log('✅ Conectado ao broker');
      setIsConnected(true);

      setTimeout(() => {
        client.subscribe('BananaOmastar', (err) => {
          if (err) console.error('Erro ao se inscrever no tópico:', err);
        });
      }, 300);
    });

    client.on('message', (_, message) => {
      const msg = message.toString().toLowerCase();
      console.log('📩 Mensagem recebida:', msg);

      if (msg.includes('regar') || msg.includes('alerta')) {
        setStatus('alert');
        alertaAudioRef.current.play().catch((e) => {
          console.warn('🔇 Som bloqueado ou erro ao tocar:', e);
        });
      } else if (msg.includes('ok') || msg.includes('tudo certo')) {
        setStatus('ok');
        okAudioRef.current.play().catch((e) => {
            console.warn('🔇 Som bloqueado ou erro ao tocar:', e);
          });
      }
    });

    client.on('error', (err) => {
      console.error('Erro MQTT:', err);
      setIsConnected(false);
    });

    return () => client.end();
  }, [monitorando]);

  const iniciarMonitoramento = () => {
    setMonitorando(true);
  };

  return (
    <div className="plant-status-container">
      {!monitorando ? (
        <button onClick={iniciarMonitoramento} className="btn-monitoramento">
          🌱 Iniciar Monitoramento
        </button>
      ) : (
        <div className={`plant-status ${status === 'ok' ? 'status-ok' : 'status-alert'}`}>
          {status === 'ok'
            ? '🌿 Sua planta está saudável!'
            : '💧 Sua planta precisa ser regada!'}
        </div>
      )}
    </div>
  );
};

export default EstadoPlanta;
