"use client";

import { useEffect, useState } from "react";
import { useUser } from "@contexts/UserContext";

import Master from "@components/Layout/Master";
import Section from "@components/Section/Section";
import Heading from "@components/Heading/Heading";
import TicketCard from "@components/Card/TicketCard";

const Page: React.FC = () => {
  const { user } = useUser();
  const userId = user?.id ? parseInt(user.id) : 2;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/member/tickets/${userId}`);

        if (!res.ok) {
          throw new Error("Error cargando tickets");
        }

        const data = await res.json();
        setTickets(data);
      } catch (err) {
        console.error("Error obteniendo tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userId]);

  return (
    <Master>
      <Section className='black-background hero-offset'>
        <div className='container'>
          <div className='center'>
            <Heading type={1} color='gray' text='Mis Tickets' />
            <p className='gray form-information'>
              Puedes acceder a los boletos que compraste desde esta página en cualquier momento.
              Puedes descargarlos o enviarlos. Ten en cuenta que no podrás ver los boletos de eventos
              que ya hayan finalizado o sido cancelados en esta página.
            </p>
          </div>
        </div>
      </Section>

      <Section className='list-cards'>
        <div className='container events-grid'>

          {loading && <p className="gray">Cargando tickets...</p>}

          {!loading && tickets.length === 0 && (
            <p className="gray">No tienes tickets disponibles.</p>
          )}

          {tickets.map((t: any) => (
            <TicketCard
              key={t.idTicket}
              id={String(t.idTicket)}
              eventUrl={`/event/${t.evento.idEvento}`}
              eventName={t.evento.titulo}
              eventWhen={new Date(t.fechaInicio).toLocaleString("es-PE", {
                dateStyle: "long",
                timeStyle: "short"
              })}
              eventVenue={t.evento.lugar}
              eventImage={t.evento.imagenPortada || "/placeholder.jpg"}
              purchaseDetails={[{ quantity: 1, type: t.tipoSector }]}
              downloadUrl={`/tickets/download/${t.idTicket}`}
              sendUrl={`/tickets/send/${t.idTicket}`}
            />
          ))}

        </div>
      </Section>
    </Master>
  );
};

export default Page;
