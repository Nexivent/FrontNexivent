"use client";
import { useState, useEffect } from "react";
import Heading from "@components/Heading/Heading";
import Master from "../../components/Layout/Master";
import { useRouter } from "next/navigation";
import { generateReport } from "../api/admin/generateReport";


const API_URL = "https://tu-backend.com/api";


export default function ReportPage() {
  const router = useRouter();

  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    idCategoria: "",
    idOrganizador: "",
    estado: "",
    limit: 100,
  });

  const [data, setData] = useState<any[]>([]);
  const [tableFilters, setTableFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    estado: "",
  });
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState<any>(null);

  // 🔹 Generar reporte → Llamada real al backend
  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setReportData(null);

    const result = await generateReport(filters);

    if (result.error) {
      setError(result.error);
    } else {
      setData(result.data.events);
      setReportData(result.data);
    }

    setLoading(false);
  };

  const handleGoToDashboard = () => {
    if (!reportData) return;

    localStorage.setItem("reportData", JSON.stringify(reportData));
    router.push("/dashboards");
  };


  // 🔹 Manejo de cambios filtros principales (antes del fetch)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: name === "limit" ? Number(value) : value });
  };

  // 🔹 Manejo filtros secundarios (filtro local)
  const handleTableChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTableFilters({ ...tableFilters, [name]: value });
  };

  // 🔹 Filtrado local de tabla
  useEffect(() => {
    let filtered = data;

    if (tableFilters.fechaInicio) {
      filtered = filtered.filter(
        (ev) => new Date(ev.fechaInicio) >= new Date(tableFilters.fechaInicio)
      );
    }
    if (tableFilters.fechaFin) {
      filtered = filtered.filter(
        (ev) => new Date(ev.fechaFin) <= new Date(tableFilters.fechaFin)
      );
    }
    if (tableFilters.estado) {
      filtered = filtered.filter((ev) => ev.estado === tableFilters.estado);
    }

    setFilteredData(filtered);
  }, [data, tableFilters]);

  return (
    <Master>
      <div className="min-h-screen bg-black text-white pt-20 pb-10">
        <section className="container mx-auto px-6 space-y-8">
          {/* 🧭 Encabezado */}
          <div className="text-center">
            <Heading type={1} color="gray" text="Reporte" />
            <p className="text-gray-400 mt-2">
              Genera y filtra tus reportes según fechas, categoría u organizador.
            </p>

            {/* 🔙 Botón para ir a Dashboards con reportData */}
            <button
              onClick={handleGoToDashboard}
              className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition"
            >
              ir a dashboards
            </button>
          </div>

          {/* 🧮 Barra de generación de reporte */}
          <div className="bg-gray-800 shadow rounded-lg p-4 flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Fecha inicio
              </label>
              <input
                type="date"
                name="fechaInicio"
                value={filters.fechaInicio}
                onChange={handleChange}
                className="border border-gray-600 bg-gray-900 text-white rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Fecha fin
              </label>
              <input
                type="date"
                name="fechaFin"
                value={filters.fechaFin}
                onChange={handleChange}
                className="border border-gray-600 bg-gray-900 text-white rounded p-2"
              />
            </div>

            <select
              name="idCategoria"
              value={filters.idCategoria}
              onChange={handleChange}
              className="border border-gray-600 bg-white text-black rounded p-2 w-40"
            >
              <option value="">Todas</option>
              <option value="1">Conciertos</option>
              <option value="5">Negocios</option>
              <option value="3">Teatro</option>
              <option value="6">Gastronomía</option>
              <option value="2">Deportes</option>
              <option value="4">Tecnología</option>
            </select>


            <div>
              <label className="block text-sm font-medium text-gray-300">
                Organizador
              </label>
              <input
                type="text"
                name="idOrganizador"
                placeholder="ID organizador"
                value={filters.idOrganizador}
                onChange={handleChange}
                className="border border-gray-600 bg-gray-900 text-white rounded p-2 w-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Estado
              </label>
              <select
                name="estado"
                value={filters.estado}
                onChange={handleChange}
                className="border border-gray-600 bg-white text-black rounded p-2 w-40"
              >
                <option value="">Todos</option>
                <option value="PUBLICADO">Publicado</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="BORRADOR">Borrador</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Límite
              </label>
              <input
                type="number"
                name="limit"
                min="1"
                value={filters.limit}
                onChange={handleChange}
                className="border border-gray-600 bg-gray-900 text-white rounded p-2 w-24"
              />
            </div>

            <button
              onClick={handleGenerate}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded transition"
            >
              Generar reporte
            </button>
          </div>

          {/* 🔍 Barra de filtros secundarios */}
          <div className="bg-gray-700 shadow rounded-lg p-4 flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Fecha inicio
              </label>
              <input
                type="date"
                name="fechaInicio"
                value={tableFilters.fechaInicio}
                onChange={handleTableChange}
                className="border border-gray-500 bg-gray-900 text-white rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200">
                Fecha fin
              </label>
              <input
                type="date"
                name="fechaFin"
                value={tableFilters.fechaFin}
                onChange={handleTableChange}
                className="border border-gray-500 bg-gray-900 text-white rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200">
                Estado
              </label>
              <select
                name="estado"
                value={tableFilters.estado}
                onChange={handleTableChange}
                className="border border-gray-600 bg-white text-black rounded p-2 w-40"
              >
                <option value="">Todos</option>
                <option value="PUBLICADO">Publicado</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="BORRADOR">Borrador</option>
              </select>
            </div>
          </div>

          {/* 📊 Tabla de resultados */}
          <div className="bg-gray-900 shadow rounded-lg overflow-x-auto">
            {filteredData.length === 0 ? (
              <p className="text-center text-gray-400 py-6">
                No hay datos para mostrar.
              </p>
            ) : (
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-yellow-500 text-black border-b border-white/30">
                  <tr>
                    <th className="border border-white/30 p-3 text-left">ID</th>
                    <th className="border border-white/30 p-3 text-left">Título</th>
                    <th className="border border-white/30 p-3 text-left">Categoría</th>
                    <th className="border border-white/30 p-3 text-left">Lugar</th>
                    <th className="border border-white/30 p-3 text-left">Estado</th>
                    <th className="border border-white/30 p-3 text-left">Inicio</th>

                    <th className="border border-white/30 p-3 text-right">Entradas</th>
                    <th className="border border-white/30 p-3 text-right">
                      Recaudación
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30">
                  {filteredData.map((ev) => (
                    <tr
                      key={ev.idEvento}
                      className="hover:bg-white/10 hover:text-white transition-colors duration-150"
                    >
                      <td className="border border-white/30 p-3">{ev.idEvento}</td>
                      <td className="border border-white/30 p-3">{ev.titulo}</td>
                      <td className="border border-white/30 p-3">{ev.categoria}</td>
                      <td className="border border-white/30 p-3">{ev.lugar}</td>
                      <td className="border border-white/30 p-3">{ev.estado}</td>
                      <td className="border border-white/30 p-3">
                        {new Date(ev.fechaInicio).toLocaleDateString("es-PE")}
                      </td>
                      <td className="border border-white/30 p-3 text-right">
                        {ev.entradasVendidas.toLocaleString()}
                      </td>
                      <td className="border border-white/30 p-3 text-right">
                        S/.{ev.recaudacionTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </Master>
  );
}
