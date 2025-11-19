'use client';
import { useState, useEffect } from 'react';
import { Ticket, Home, Calendar, Music, AlertCircle } from 'lucide-react';
// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import ButtonLink from '@components/Button/ButtonLink';

const Page: React.FC = () => {
  const [tickets, setTickets] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    delay: number;
    duration: number;
  }>>([]);
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Generar tickets flotantes
    const newTickets = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2
    }));
    setTickets(newTickets);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Master>
      <style jsx>{`
        .ticket-404-wrapper {
          min-height: 100vh;
          background: #000;
          color: #facc15;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .tickets-background {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .floating-ticket {
          position: absolute;
          opacity: 0.1;
        }

        .floating-ticket svg {
          width: 40px;
          height: 40px;
          fill: #facc15;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        .spotlight {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(250, 204, 21, 0.3) 0%, transparent 70%);
          pointer-events: none;
          opacity: 0.2;
          transition: all 0.3s ease-out;
          z-index: 2;
        }

        .content-center {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 800px;
          width: 100%;
        }

        .alert-icon {
          margin: 0 auto 2rem;
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .alert-glow {
          position: absolute;
          inset: 0;
          background: #facc15;
          filter: blur(40px);
          opacity: 0.3;
          animation: pulse 2s ease-in-out infinite;
        }

        .alert-svg {
          position: relative;
          width: 80px;
          height: 80px;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .error-number {
          font-size: 9rem;
          font-weight: 900;
          color: #facc15;
          letter-spacing: 1rem;
          margin: 0 0 2rem 0;
          line-height: 1;
        }

        .error-digit {
  position: relative;
  display: inline-block;
  font-family: 'Arial', monospace;
  font-size: 9rem;
  color: #facc15;
  font-weight: 900;
  transition: transform 0.3s ease;
  text-shadow: 0 0 2px #facc15;
  animation: glitch-skew 1.5s infinite linear alternate-reverse;
}

.error-digit::before,
.error-digit::after {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  color: #facc15;
  overflow: hidden;
  clip-path: inset(0 0);
}

.error-digit::before {
  text-shadow: -3px 0 red;
  animation: glitch-1 2.5s infinite linear alternate-reverse;
}

.error-digit::after {
  text-shadow: -3px 0 cyan;
  animation: glitch-2 2s infinite linear alternate-reverse;
}

@keyframes glitch-1 {
  0% { clip-path: inset(0 0 80% 0); }
  15% { clip-path: inset(15% 0 60% 0); }
  30% { clip-path: inset(30% 0 40% 0); }
  45% { clip-path: inset(45% 0 30% 0); }
  60% { clip-path: inset(60% 0 15% 0); }
  75% { clip-path: inset(75% 0 5% 0); }
  100% { clip-path: inset(0 0 80% 0); }
}

@keyframes glitch-2 {
  0% { clip-path: inset(80% 0 0 0); }
  15% { clip-path: inset(60% 0 20% 0); }
  30% { clip-path: inset(40% 0 40% 0); }
  45% { clip-path: inset(20% 0 60% 0); }
  60% { clip-path: inset(10% 0 70% 0); }
  75% { clip-path: inset(5% 0 75% 0); }
  100% { clip-path: inset(80% 0 0 0); }
}

@keyframes glitch-skew {
  0% { transform: skew(0deg); }
  20% { transform: skew(3deg); }
  40% { transform: skew(-3deg); }
  60% { transform: skew(2deg); }
  80% { transform: skew(-2deg); }
  100% { transform: skew(0deg); }
}


        .error-digit:hover {
          transform: scale(1.1);
        }

        .error-title {
          font-size: 3rem;
          font-weight: bold;
          color: #fff;
          margin: 0 0 1.5rem 0;
        }

        .error-description {
          font-size: 1.25rem;
          color: #fbbf24;
          margin: 0 auto 3rem;
          line-height: 1.6;
          max-width: 600px;
        }

        .ticket-decoration {
          display: inline-block;
          padding: 2rem 3rem;
          border: 3px dashed #facc15;
          border-radius: 0.75rem;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          margin: 0 0 3rem 0;
          transition: transform 0.3s ease;
        }

        .ticket-decoration:hover {
          transform: scale(1.05);
        }

        .ticket-inner {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          justify-content: center;
        }

        .ticket-icon-svg {
          width: 48px;
          height: 48px;
          animation: pulse 2s ease-in-out infinite;
        }

        .ticket-info {
          text-align: left;
        }

        .ticket-label {
          font-size: 0.875rem;
          color: #fbbf24;
          margin: 0 0 0.25rem 0;
        }

        .ticket-code {
          font-size: 1.5rem;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #facc15;
          margin: 0;
        }

        .buttons-wrapper {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }

        .decorative-icons {
          display: flex;
          gap: 2rem;
          justify-content: center;
          opacity: 0.5;
        }

        .icon-animated {
          width: 32px;
          height: 32px;
          animation: bounce 1.5s ease-in-out infinite;
        }

        .icon-animated:nth-child(2) {
          animation-delay: 0.2s;
        }

        .icon-animated:nth-child(3) {
          animation-delay: 0.4s;
        }

        @media (max-width: 768px) {
          .error-number {
            font-size: 6rem;
            letter-spacing: 0.5rem;
          }
          
          .error-title {
            font-size: 2rem;
          }
          
          .error-description {
            font-size: 1rem;
            padding: 0 1rem;
          }

          .ticket-decoration {
            padding: 1.5rem 2rem;
          }

          .ticket-inner {
            flex-direction: column;
            gap: 1rem;
          }

          .ticket-info {
            text-align: center;
          }
        }
      `}</style>

      <div className='ticket-404-wrapper'>
        {/* Tickets flotantes de fondo */}
        <div className='tickets-background'>
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className='floating-ticket'
              style={{
                left: `${ticket.x}%`,
                top: `${ticket.y}%`,
                transform: `rotate(${ticket.rotation}deg)`,
                animation: `float ${ticket.duration}s ease-in-out ${ticket.delay}s infinite`
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V9H3V7Z" />
                <path d="M3 9V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9H3Z" />
              </svg>
            </div>
          ))}
        </div>

        {/* Efecto spotlight siguiendo el mouse */}
        <div
          className='spotlight'
          style={{
            left: mousePosition.x - 300,
            top: mousePosition.y - 300,
          }}
        />

        {/* Contenido principal */}
        <div className='content-center'>
          {/* Icono de alerta */}
          <div className='alert-icon'>
            <div className='alert-glow' />
            <svg className='alert-svg' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#facc15" strokeWidth="2"/>
              <path d="M12 8V12" stroke="#facc15" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1" fill="#facc15"/>
            </svg>
          </div>

          {/* Número 404 */}
          <h1 className='error-number'>
  <span className='error-digit' data-text="4">4</span>
  <span className='error-digit' data-text="0">0</span>
  <span className='error-digit' data-text="4">4</span>
</h1>

          {/* Título y descripción */}
          <h2 className='error-title'>Pagina no encontrada!</h2>
          <p className='error-description'>
            Parece que este pagina se eliminó o nunca existió. ¡Pero tenemos muchos eventos esperándote!
          </p>

          {/* Ticket decorativo */}
          <div className='ticket-decoration'>
            <div className='ticket-inner'>
              <svg className='ticket-icon-svg' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V9H3V7Z" fill="#facc15"/>
                <path d="M3 9V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9H3Z" fill="#facc15"/>
                <path d="M9 13H15" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div className='ticket-info'>
                <p className='ticket-label'>CÓDIGO DE ERROR</p>
                <p className='ticket-code'>404-NF</p>
              </div>
            </div>
          </div>

          {/* Botones */}
           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-8 py-4 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-yellow-400/50"
          >
            <Home size={20} />
            Volver al Inicio
          </button>
          
          <button
            onClick={() => window.location.href = '/list?search=1'}
            className="flex items-center gap-2 px-8 py-4 border-2 border-yellow-400 text-yellow-400 font-bold rounded-lg hover:bg-yellow-400 hover:text-black transform hover:scale-105 transition-all duration-300"
          >
            <Calendar size={20} />
            Ver Eventos
          </button>
        </div>

          {/* Iconos decorativos */}
          <div className='decorative-icons'>
            <svg className='icon-animated' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18V5L21 12L9 19V18Z" fill="#facc15"/>
              <circle cx="5" cy="12" r="2" fill="#facc15"/>
            </svg>
            <svg className='icon-animated' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V9H3V7Z" fill="#facc15"/>
              <path d="M3 9V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9H3Z" fill="#facc15"/>
            </svg>
            <svg className='icon-animated' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="#facc15" strokeWidth="2"/>
              <path d="M8 2V6M16 2V6M3 10H21" stroke="#facc15" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>
    </Master>
  );
};

export default Page;