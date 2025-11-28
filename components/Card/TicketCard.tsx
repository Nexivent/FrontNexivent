'use client';

import Link from 'next/link';
import { useState } from 'react';

interface ITicketDetail {
  quantity: number;
  type: string;
}

interface IProps {
  id: string;
  eventUrl: string;
  eventName: string;
  eventWhen: string;
  eventVenue: string;
  eventImage: string;
  purchaseDetails: ITicketDetail[];
  downloadUrl: string;
  sendUrl: string;
  color?: string;
}

const TicketCard: React.FC<IProps> = ({
  id,
  eventUrl,
  eventName,
  eventWhen,
  eventVenue,
  eventImage,
  purchaseDetails,
  downloadUrl,
  sendUrl,
  color = 'yellow',
}) => {
  const [cancelling, setCancelling] = useState(false);

  const handleDownload = async () => {
    // Construimos el URL aquí
    const downloadUrl = `/api/tickets/download?eventName=${eventName}&eventWhen=${eventWhen}&eventVenue=${eventVenue}`;

    try {
      const res = await fetch(downloadUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${eventName}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando ticket:', err);
      alert('Error descargando ticket');
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro que quieres cancelar este ticket?')) return;

    setCancelling(true);

    const payload = { idTickets: [parseInt(id, 10)] };
    console.log('JSON enviado al backend Go:', payload);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tickets/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log('Respuesta del backend:', json);

      if (res.ok && json.cancelados && json.cancelados.length > 0) {
        alert(`Ticket cancelado correctamente (ID: ${id})`);
      } else {
        alert('No se pudo cancelar el ticket');
      }
    } catch (err) {
      console.error('Error cancelando ticket:', err);
      alert('Error cancelando ticket');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className='card'>
      <Link href={eventUrl} title={`Ir a: ${eventName}`}>
        <div className='card-title'>
          <h3>{eventName}</h3>
        </div>
        <div
          className='card-image'
          style={{
            backgroundImage: `url("${eventImage}")`,
          }}
        ></div>
        <div className='card-info'>
          <p>
            <span className='material-symbols-outlined'>event</span> {eventWhen}
          </p>
          <p>
            <span className='material-symbols-outlined'>apartment</span> {eventVenue}
          </p>
          <div className='ticket-purchase-details'>
            <h4>Tu Compra:</h4>
            {purchaseDetails.map((detail) => (
              <p key={detail.type}>
                - {detail.quantity} x <strong>{detail.type}</strong>
              </p>
            ))}
          </div>
        </div>
      </Link>

      <div className='card-buttons'>
        <button className={`button ${color}`} onClick={handleDownload}>
          <span className='material-symbols-outlined'>download</span> Descargar
        </button>
        <button className={`button button-red`} onClick={handleCancel} disabled={cancelling}>
          <span className='material-symbols-outlined'>cancel</span>{' '}
          {cancelling ? 'Cancelando...' : 'Cancelar'}
        </button>
      </div>
    </div>
  );
};

export default TicketCard;
