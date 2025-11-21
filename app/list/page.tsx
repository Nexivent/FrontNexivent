import { Suspense } from "react";

// components
import Master from "@components/Layout/Master";
import Section from "@components/Section/Section";
import Heading from "@components/Heading/Heading";
import CircleButtons from "../home/components/CircleButtons";
import SearchPanel from "./SearchPanelClient";

// función unificada
import { searchEvents } from "../lib/list/searchEvents";

// --- SERVER CALL (SSR) ---
async function fetchInitialEvents() {
  const payload = {
    idCategoria: null,
    titulo: "",
    descripcion: "",
    lugar: "",
    fechaHoraInicio: new Date().toISOString(),
    page: 1,
    limit: 10
  };

  const { data } = await searchEvents(payload, true);
  return data;
}

const Page = async () => {
  const events = await fetchInitialEvents(); // <-- SSR fetch

  return (
    <Master>
      {/* HEADER */}
      <Section className="gray-background hero-offset">
        <div className="container">
          <div className="padding-bottom center">
            <Heading type={1} color="gray" text="Eventos" />
            <p className="gray">Nexivent, busca eventos en Lima.</p>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <CircleButtons />
            </div>
          </div>
        </div>
      </Section>

      {/* SEARCH PANEL (CLIENT) */}
      <Section>
        <Suspense fallback={<div>Cargando búsqueda...</div>}>
          <SearchPanel initialData={events} />
        </Suspense>
      </Section>
    </Master>
  );
};

export default Page;
