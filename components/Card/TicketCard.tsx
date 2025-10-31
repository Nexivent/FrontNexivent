import Link from 'next/link';

interface ITicketDetail {
  quantity: number;
  type: string;
}

interface IProps {
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
  eventUrl,
  eventName,
  eventWhen,
  eventVenue,
  eventImage,
  purchaseDetails,
  downloadUrl,
  sendUrl,
  color = 'yellow',
}) => (
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
      <Link href={downloadUrl} className={`button ${color}`}>
        <span className='material-symbols-outlined'>download</span>
        Descargar
      </Link>
      <Link href={sendUrl} className={`button ${color}-overlay`}>
        <span className='material-symbols-outlined'>forward_to_inbox</span>
        Enviar
      </Link>
    </div>
  </div>
);

export default TicketCard;
