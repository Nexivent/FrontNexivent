'use client';

interface LugarInfoProps {
  lugar: string;
  imagenLugar?: string;
}

export default function LugarInfo({ lugar, imagenLugar }: LugarInfoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
      <h6 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>{lugar}</h6>
      {imagenLugar && (
        <div style={{ position: 'relative' }}>
          <span className="ver-lugar-text">Ver lugar</span>
          <div className="lugar-image-popup">
            <img 
              src={imagenLugar} 
              alt={`Imagen de ${lugar}`}
              style={{ width: '100%', height: 'auto', borderRadius: '4px', display: 'block' }}
            />
          </div>
        </div>
      )}
      
      <style jsx>{`
        .ver-lugar-text {
          color: #cddc39;
          font-size: 0.9rem;
          cursor: pointer;
          text-decoration: underline;
          transition: color 0.3s ease;
          white-space: nowrap;
        }
        
        .ver-lugar-text:hover {
          color: #fff;
        }
        
        .lugar-image-popup {
          display: none;
          position: absolute;
          bottom: 100%;
          left: 0;
          margin-bottom: 10px;
          z-index: 1000;
          background: #000;
          border: 2px solid #cddc39;
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 4px 20px rgba(205, 220, 57, 0.3);
          min-width: 300px;
          max-width: 400px;
        }
        
        .ver-lugar-text:hover + .lugar-image-popup {
          display: block;
        }
        
        @media (max-width: 768px) {
          .lugar-image-popup {
            min-width: 250px;
            max-width: 300px;
            left: 50%;
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}