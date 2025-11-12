"use client";

import React from "react";
import Master from "@components/Layout/Master";
import Heading from "@components/Heading/Heading";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
} from "@components/Card/dashboard";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// 🧩 Mock Data (simula respuesta del backend)
const mockData = {
  summary: {
    totalEventos: 48,
    totalPublicados: 32,
    totalCancelados: 6,
    totalBorradores: 10,
    entradasVendidasTotales: 12560,
    recaudacionTotal: 984000.5,
  },
  topEventos: [
    {
      idEvento: 101,
      titulo: "Festival de Música Electrónica Lima",
      lugar: "Parque de la Exposición",
      entradasVendidas: 3200,
      recaudacion: 256000.0,
    },
    {
      idEvento: 115,
      titulo: "Rock & Beer Fest 2025",
      lugar: "Estadio San Marcos",
      entradasVendidas: 2800,
      recaudacion: 233500.0,
    },
    {
      idEvento: 102,
      titulo: "Expo Gamer Perú 2025",
      lugar: "Centro de Convenciones María Angola",
      entradasVendidas: 2100,
      recaudacion: 189000.0,
    },
  ],
  byCategory: [
    {
      idCategoria: 1,
      categoria: "Conciertos",
      cantidadEventos: 15,
      recaudacionTotal: 520000.0,
      entradasVendidas: 6700,
    },
    {
      idCategoria: 2,
      categoria: "Ferias y Expos",
      cantidadEventos: 10,
      recaudacionTotal: 300000.0,
      entradasVendidas: 4100,
    },
    {
      idCategoria: 3,
      categoria: "Teatro",
      cantidadEventos: 8,
      recaudacionTotal: 164000.0,
      entradasVendidas: 1760,
    },
    {
      idCategoria: 4,
      categoria: "Deportes",
      cantidadEventos: 15,
      recaudacionTotal: 180000.0,
      entradasVendidas: 2000,
    },
  ],
};

// 🧭 Página principal
export default function DashboardPage() {
  const { summary, topEventos, byCategory } = mockData;
  const router = useRouter();

  return (
    <Master>
      <div className="min-h-screen bg-black text-white pt-20 pb-10 px-6 space-y-16">
        
        {/* 🧩 Encabezado */}
        <div className="text-center">
          <Heading type={1} color="gray" text="Dashboard de Eventos" />
          <p className="text-gray-400 mt-2">
            Visualiza el rendimiento general de tus eventos.
          </p>
          {/* 🔙 Botón para volver */}
            <button
            onClick={() => router.push("/report")}
            className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition"
            >
            ← Volver al reporte
            </button>
        </div>
         
        {/* 📈 Resumen general */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            
          <Card><CardContent><h3 className="text-gray-400">Total de eventos</h3><p className="text-3xl font-bold">{summary.totalEventos}</p></CardContent></Card>
          <Card><CardContent><h3 className="text-gray-400">Publicados</h3><p className="text-3xl font-bold">{summary.totalPublicados}</p></CardContent></Card>
          <Card><CardContent><h3 className="text-gray-400">Cancelados</h3><p className="text-3xl font-bold">{summary.totalCancelados}</p></CardContent></Card>
          <Card><CardContent><h3 className="text-gray-400">Borradores</h3><p className="text-3xl font-bold">{summary.totalBorradores}</p></CardContent></Card>
          <Card><CardContent><h3 className="text-gray-400">Entradas vendidas</h3><p className="text-3xl font-bold">{summary.entradasVendidasTotales.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent><h3 className="text-gray-400">Recaudación total</h3><p className="text-3xl font-bold">${summary.recaudacionTotal.toLocaleString()}</p></CardContent></Card>
        </section>

        {/* 📊 Gráfico por categoría */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Recaudación por Categoría</h2>
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="categoria" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#222", border: "none" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="recaudacionTotal" fill="#f6d13bff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 🏆 Top eventos */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Top Eventos por Recaudación</h2>
          <div className="bg-gray-900 rounded-lg overflow-x-auto shadow-lg">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-800 text-gray-300 border-b border-white/20">
                <tr>
                  <th className="text-left p-3">Título</th>
                  <th className="text-left p-3">Lugar</th>
                  <th className="text-right p-3">Entradas</th>
                  <th className="text-right p-3">Recaudación</th>
                </tr>
              </thead>
              <tbody>
                {topEventos.map((ev) => (
                  <tr key={ev.idEvento} className="border-t border-white/10 hover:bg-white/5 transition">
                    <td className="p-3">{ev.titulo}</td>
                    <td className="p-3">{ev.lugar}</td>
                    <td className="p-3 text-right">{ev.entradasVendidas.toLocaleString()}</td>
                    <td className="p-3 text-right">${ev.recaudacion.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Master>
  );
}
