'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// hooks
import useAlert from '@hooks/useAlert';

// components
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';

// =================================
// INTERFACES
// =================================

interface Fecha {
  idFechaEvento: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

interface Tarifa {
  idTarifa: number;        // ID único de la tarifa
  precio: number;
  tipoSector: string;      // ej: "VIP", "General", "Platino"
  stockDisponible: number;
  tipoTicket: string;      // ej: "Preventa", "Regular"
  fechaIni: string;
  fechaFin: string;
  perfil: string;          // ej: "Profesional", "Estudiante", "Founder"
}

interface EventData {
  idEvento: number;
  titulo: string;
  descripcion: string;
  descripcionArtista: string;
  imagenPortada: string;
  lugar: string;
  fechas: Fecha[];
  tarifas: Tarifa[];
}

interface TarifaConCantidad extends Tarifa {
  cantidad: number;
}

interface IProps {
  eventData: EventData;
}

// =================================
// COMPONENTE PRINCIPAL
// =================================

const TicketForm: React.FC<IProps> = ({ eventData }) => {
  const { showAlert, hideAlert } = useAlert();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<number | null>(
    eventData.fechas.length > 0 ? eventData.fechas[0].idFechaEvento : null
  );
  const [tarifasConCantidad, setTarifasConCantidad] = useState<TarifaConCantidad[]>([]);

  // =================================
  // ESTRUCTURAS DE DATOS PARA LA TABLA
  // =================================

  // Obtener lista única de sectores
  const getSectores = () => {
    const sectoresMap = new Map();
    tarifasConCantidad.forEach(tarifa => {
      if (!sectoresMap.has(tarifa.tipoSector)) {
        sectoresMap.set(tarifa.tipoSector, {
          tipoSector: tarifa.tipoSector,
        });
      }
    });
    return Array.from(sectoresMap.values());
  };

  // Obtener lista única de perfiles
  const getPerfiles = () => {
    const perfilesMap = new Map();
    tarifasConCantidad.forEach(tarifa => {
      if (!perfilesMap.has(tarifa.perfil)) {
        perfilesMap.set(tarifa.perfil, {
          perfil: tarifa.perfil,
        });
      }
    });
    return Array.from(perfilesMap.values());
  };

  // Obtener información del tipo de ticket
  const getTipoTicketInfo = () => {
    if (tarifasConCantidad.length === 0) return null;
    const primera = tarifasConCantidad[0];
    return {
      tipoTicket: primera.tipoTicket,
      fechaFin: primera.fechaFin,
    };
  };

  // Calcular stock disponible de un sector considerando las cantidades seleccionadas
  const calcularStockDisponibleSector = (tipoSector: string): number => {
    const tarifasSector = tarifasConCantidad.filter(t => t.tipoSector === tipoSector);
    if (tarifasSector.length === 0) return 0;

    // El stock es compartido entre todos los perfiles del mismo sector
    // Tomamos el stock de la primera tarifa del sector
    const stockBase = tarifasSector[0].stockDisponible;
    
    // Restamos todas las cantidades seleccionadas en ese sector
    const totalSeleccionado = tarifasSector.reduce((sum, tarifa) => sum + tarifa.cantidad, 0);
    
    return Math.max(0, stockBase - totalSeleccionado);
  };

  // Obtener tarifa específica por sector y perfil
  const getTarifa = (tipoSector: string, perfil: string): TarifaConCantidad | undefined => {
    return tarifasConCantidad.find(
      t => t.tipoSector === tipoSector && t.perfil === perfil
    );
  };

  // =================================
  // FUNCIONES AUXILIARES
  // =================================

  const formatFecha = (fechaString: string): string => {
    const date = new Date(fechaString);
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    return `${dias[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  const formatFechaCorta = (fechaString: string): string => {
    const date = new Date(fechaString);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Filtrar tarifas vigentes según la fecha actual
// Filtrar tarifas vigentes según la fecha de fin - solo muestra UN tipo de ticket
const filtrarTarifasVigentes = (tarifas: Tarifa[]): Tarifa[] => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Agrupar tarifas por tipoTicket y ordenar por fechaFin
  const tiposTicket = Array.from(new Set(tarifas.map(t => t.tipoTicket)));
  
  // Ordenar tipos de ticket por la fecha de fin más temprana
  const tiposOrdenados = tiposTicket
    .map(tipo => {
      const tarifasTipo = tarifas.filter(t => t.tipoTicket === tipo);
      const fechaFinMasProxima = tarifasTipo
        .map(t => new Date(t.fechaFin))
        .sort((a, b) => a.getTime() - b.getTime())[0];
      
      return {
        tipo,
        fechaFin: fechaFinMasProxima,
        tarifas: tarifasTipo
      };
    })
    .sort((a, b) => a.fechaFin.getTime() - b.fechaFin.getTime());

  // Buscar el primer tipo de ticket cuya fecha de fin no haya pasado
  for (const tipoData of tiposOrdenados) {
    const fin = new Date(tipoData.fechaFin);
    fin.setHours(23, 59, 59, 999);
    
    if (hoy <= fin) {
      // Retornar solo las tarifas de este tipo de ticket
      console.log(`✅ Mostrando tarifas de tipo: ${tipoData.tipo} (vigente hasta ${tipoData.fechaFin.toLocaleDateString()})`);
      return tipoData.tarifas;
    }
  }

  // Si ningún tipo está vigente, retornar array vacío
  console.warn('⚠️ No hay tarifas vigentes');
  return [];
};

  const countTickets = (): number => {
    return tarifasConCantidad.reduce((sum, tarifa) => sum + tarifa.cantidad, 0);
  };

  // =================================
  // EFECTOS
  // =================================

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    // Filtrar tarifas vigentes y agregar cantidad inicial
    const tarifasVigentes = filtrarTarifasVigentes(eventData.tarifas);
    const tarifasConCant = tarifasVigentes.map(tarifa => ({
      ...tarifa,
      cantidad: 0
    }));
    
    setTarifasConCantidad(tarifasConCant);
  }, [eventData.tarifas]);

  // =================================
  // HANDLERS
  // =================================

  const handleDecrease = (tipoSector: string, perfil: string): void => {
    setTarifasConCantidad(prev => {
      return prev.map(tarifa => {
        if (tarifa.tipoSector === tipoSector && tarifa.perfil === perfil && tarifa.cantidad > 0) {
          return { ...tarifa, cantidad: tarifa.cantidad - 1 };
        }
        return tarifa;
      });
    });
  };

  const handleIncrease = (tipoSector: string, perfil: string): void => {
    const stockDisponibleSector = calcularStockDisponibleSector(tipoSector);
    
    if (stockDisponibleSector <= 0) {
      // Usar setTimeout para ejecutar fuera del render
      setTimeout(() => {
        showAlert({ type: 'error', text: 'No hay más entradas disponibles en este sector.' });
      }, 0);
      return;
    }
  
    setTarifasConCantidad(prev => {
      return prev.map(tarifa => {
        if (tarifa.tipoSector === tipoSector && tarifa.perfil === perfil) {
          if (tarifa.cantidad >= 9) {
            // Usar setTimeout para ejecutar fuera del render
            setTimeout(() => {
              showAlert({ type: 'error', text: 'Máximo 9 entradas por tipo.' });
            }, 0);
            return tarifa;
          }
          return { ...tarifa, cantidad: tarifa.cantidad + 1 };
        }
        return tarifa;
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    hideAlert();

    const quantity = countTickets();

    if (quantity === 0) {
      showAlert({ 
        type: 'error', 
        text: 'Debes seleccionar al menos una entrada para este evento.' 
      });
      return;
    }

    if (!fechaSeleccionada) {
      showAlert({ 
        type: 'error', 
        text: 'Por favor selecciona una fecha para el evento.' 
      });
      return;
    }

    setSubmitting(true);

    try {
      // Encontrar la fecha seleccionada
      const fechaSeleccionadaObj = eventData.fechas.find(
        f => f.idFechaEvento === fechaSeleccionada
      );

      if (!fechaSeleccionadaObj) {
        showAlert({ 
          type: 'error', 
          text: 'Error: No se encontró la fecha seleccionada.' 
        });
        setSubmitting(false);
        return;
      }

      // Filtrar solo las tarifas con cantidad > 0 y formatear para /buy
      const ticketsSeleccionados = tarifasConCantidad
        .filter(tarifa => tarifa.cantidad > 0)
        .map(tarifa => ({
          id: tarifa.idTarifa,
          name: `${tarifa.tipoSector} - ${tarifa.perfil}`,
          price: `S/. ${tarifa.precio.toFixed(2)}`,
          quantity: tarifa.cantidad,
        }));

      // Crear objeto con la estructura que espera /buy/page.tsx
      const purchaseData = {
        event: {
          idEvento: eventData.idEvento,
          titulo: eventData.titulo,
          lugar: eventData.lugar,
          imagenPortada: eventData.imagenPortada,
        },
        tickets: ticketsSeleccionados,
        fecha: fechaSeleccionadaObj,
        timestamp: Date.now(),
      };

      console.log('Saving purchase data:', purchaseData);

      // Guardar en sessionStorage
      sessionStorage.setItem('purchaseData', JSON.stringify(purchaseData));

      // Verificar que se guardó
      const saved = sessionStorage.getItem('purchaseData');
      console.log('Verified saved data:', saved);

      // Pequeño delay para asegurar que se guardó
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navegar a /buy
      router.push('/buy');

    } catch (error) {
      console.error('Error saving purchase data:', error);
      showAlert({ 
        type: 'error', 
        text: 'Error al procesar tu solicitud. Por favor intenta nuevamente.' 
      });
      setSubmitting(false);
    }
  };

  // =================================
  // RENDER
  // =================================

  if (loading) {
    return <Loader type='inline' color='gray' text='Cargando...' />;
  }

  if (tarifasConCantidad.length === 0) {
    return (
      <div className='ticket-box-content'>
        <div className='paragraph-container'>
          <p>No hay entradas disponibles en este momento.</p>
        </div>
      </div>
    );
  }

  const sectores = getSectores();
  const perfiles = getPerfiles();
  const tipoTicketInfo = getTipoTicketInfo();

  return (
    <form
      noValidate
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
    >
      {eventData.fechas.length > 1 && (
        <div className='ticket-box-dates'>
          <label htmlFor='fecha-select' className='date-label'>
            Selecciona la fecha:
          </label>
          <select
            id='fecha-select'
            className='date-select'
            value={fechaSeleccionada || ''}
            onChange={(e) => setFechaSeleccionada(Number(e.target.value))}
          >
            {eventData.fechas.map((fecha) => (
              <option key={fecha.idFechaEvento} value={fecha.idFechaEvento}>
                {formatFecha(fecha.fecha)} - {fecha.horaInicio}
                {fecha.horaFin && ` a ${fecha.horaFin}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className='ticket-table-container'>
        {/* Header con tipo de ticket y vigencia */}
        {tipoTicketInfo && (
          <div className='ticket-table-header'>
            <h4 className='ticket-type-title'>
              {tipoTicketInfo.tipoTicket}
              <span className='ticket-validity'>
                (Vigente hasta {formatFechaCorta(tipoTicketInfo.fechaFin)})
              </span>
            </h4>
          </div>
        )}

        {/* Tabla de tarifas */}
        <div className='ticket-table-wrapper'>
          <table className='ticket-table'>
            <thead>
              <tr>
                <th className='perfil-column'></th>
                {sectores.map(sector => {
                  const stockDisponible = calcularStockDisponibleSector(sector.tipoSector);
                  const isAgotado = stockDisponible <= 0;
                  
                  return (
                    <th key={sector.tipoSector} className='sector-column'>
                      <div className='sector-header'>
                        <span className='sector-name'>{sector.tipoSector}</span>
                        <span className={`sector-stock ${isAgotado ? 'agotado' : ''}`}>
                          {stockDisponible} disponibles
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {perfiles.map(perfil => (
                <tr key={perfil.perfil}>
                  <td className='perfil-cell'>
                    <span className='perfil-name'>{perfil.perfil}</span>
                  </td>
                  {sectores.map(sector => {
                    const tarifa = getTarifa(sector.tipoSector, perfil.perfil);
                    const stockDisponible = calcularStockDisponibleSector(sector.tipoSector);
                    const isAgotado = stockDisponible <= 0;

                    if (!tarifa) {
                      return (
                        <td key={`${sector.tipoSector}-${perfil.perfil}`} className='tarifa-cell empty'>
                          -
                        </td>
                      );
                    }

                    return (
                      <td key={`${sector.tipoSector}-${perfil.perfil}`} className='tarifa-cell'>
                        {isAgotado ? (
                          <div className='tarifa-content agotado'>
                            <span className='material-symbols-outlined lock-icon'>lock</span>
                            <span className='agotado-text'>Agotado</span>
                          </div>
                        ) : (
                          <div className='tarifa-content'>
                            <div className='quantity-controls'>
                              <button
                                type='button'
                                className='qty-btn'
                                onClick={() => handleDecrease(sector.tipoSector, perfil.perfil)}
                                disabled={submitting || tarifa.cantidad === 0}
                              >
                                -
                              </button>
                              <input
                                readOnly
                                type='text'
                                className='qty-input'
                                value={tarifa.cantidad}
                                onChange={() => {}}
                              />
                              <button
                                type='button'
                                className='qty-btn'
                                onClick={() => handleIncrease(sector.tipoSector, perfil.perfil)}
                                disabled={submitting || isAgotado}
                              >
                                +
                              </button>
                            </div>
                            <span className='precio'>S/. {tarifa.precio.toFixed(2)}</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className='ticket-box-buttons'>
        <Button 
          type='submit' 
          color={submitting ? 'disabled' : 'yellow-filled'}
          text={submitting ? 'Procesando...' : 'Ir a pagar'}
          rightIcon={submitting ? undefined : 'arrow_forward'}
          disabled={submitting}
        />
      </div>

      <style jsx>{`
        .ticket-box-dates {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #333;
          background-color: #1a1a1a;
        }

        .date-label {
          display: block;
          color: #999;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .date-select {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: #000;
          color: #fff;
          border: 2px solid #333;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .date-select:hover {
          border-color: #cddc39;
        }

        .date-select:focus {
          outline: none;
          border-color: #cddc39;
          box-shadow: 0 0 0 3px rgba(205, 220, 57, 0.1);
        }

        .date-select option {
          background-color: #000;
          color: #fff;
          padding: 0.5rem;
        }

        .ticket-table-container {
          padding: 1rem 0;
        }

        .ticket-table-header {
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
          border-bottom: 2px solid #cddc39;
        }

        .ticket-type-title {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: #cddc39;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .ticket-validity {
          display: inline-block;
          margin-left: 1rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: #999;
          text-transform: none;
          letter-spacing: 0;
        }

        .ticket-table-wrapper {
          overflow-x: auto;
          padding: 1rem;
        }

        .ticket-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background-color: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          overflow: hidden;
        }

        .ticket-table th,
        .ticket-table td {
          padding: 1rem;
          text-align: center;
          border: 1px solid #222;
        }

        .ticket-table thead th {
          background-color: #0a0a0a;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .perfil-column {
          background-color: transparent !important;
          border: none !important;
        }

        .sector-column {
          min-width: 180px;
        }

        .sector-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sector-name {
          color: #cddc39;
          font-size: 1rem;
        }

        .sector-stock {
          color: #999;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .sector-stock.agotado {
          color: #f44336;
        }

        .perfil-cell {
          background-color: #0a0a0a;
          font-weight: 600;
          color: #fff;
          text-align: left;
          min-width: 120px;
        }

        .perfil-name {
          display: block;
        }

        .tarifa-cell {
          background-color: rgba(255, 255, 255, 0.02);
        }

        .tarifa-cell.empty {
          color: #666;
          font-style: italic;
        }

        .tarifa-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .tarifa-content.agotado {
          opacity: 0.5;
        }

        .lock-icon {
          color: #f44336;
          font-size: 1.5rem;
        }

        .agotado-text {
          color: #f44336;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .qty-btn {
          width: 32px;
          height: 32px;
          border: 2px solid #333;
          background-color: #000;
          color: #cddc39;
          border-radius: 6px;
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qty-btn:hover:not(:disabled) {
          background-color: #cddc39;
          color: #000;
          border-color: #cddc39;
        }

        .qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .qty-input {
          width: 50px;
          height: 32px;
          text-align: center;
          background-color: #1a1a1a;
          border: 2px solid #333;
          color: #fff;
          border-radius: 6px;
          font-weight: 600;
        }

        .precio {
          color: #cddc39;
          font-size: 1rem;
          font-weight: 700;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .ticket-table-wrapper {
            overflow-x: scroll;
          }

          .ticket-type-title {
            font-size: 1.1rem;
          }

          .ticket-validity {
            display: block;
            margin-left: 0;
            margin-top: 0.5rem;
          }

          .sector-column {
            min-width: 150px;
          }

          .perfil-cell {
            min-width: 100px;
          }
        }
      `}</style>
    </form>
  );
};

export default TicketForm;