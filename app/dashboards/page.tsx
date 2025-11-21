"use client";

import React, { useEffect, useState } from "react";
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

export default function DashboardPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<any[] | null>(null);

  // 🟡 Cargar la data almacenada por /report
  useEffect(() => {
    try {
      const saved = localStorage.getItem("reportData");

      if (!saved) {
        setReportData(null);
        return;
      }

      const parsed = JSON.parse(saved);

      // Si viene como { summary, events }, tomamos events
      const events = Array.isArray(parsed?.events) ? parsed.events : [];

      setReportData(events);
    } catch (err) {
      console.error("Error cargando data:", err);
      setReportData(null);
    }
  }, []);

  // ❗ Caso: sin data → mensaje
  if (!reportData) {
    return (
      <Master>
        <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white">
          <p className="text-lg">No se encontraron datos para mostrar el dashboard.</p>

          <button
            onClick={() => router.push("/report")}
            className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition"
          >
            ← Volver al reporte
          </button>
        </div>
      </Master>
    );
  }

  // 🎯 Agregaciones
  const summary = {
    totalEventos: reportData.length,
    totalPublicados: reportData.filter((e: any) => e.estado === "PUBLICADO").length,
    totalCancelados: reportData.filter((e: any) => e.estado === "CANCELADO").length,
    totalBorradores: reportData.filter((e: any) => e.estado === "BORRADOR").length,
    entradasVendidasTotales: reportData.reduce(
      (acc: number, e: any) => acc + (e.entradasVendidas || 0),
      0
    ),
    recaudacionTotal: reportData.reduce(
      (acc: number, e: any) => acc + (e.recaudacion || 0),
      0
    ),
  };

  // 📊 Agrupación por categoría
  const byCategory = Object.values(
    reportData.reduce((acc: any, item: any) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = {
          categoria: item.categoria,
          recaudacionTotal: 0,
        };
      }
      acc[item.categoria].recaudacionTotal += item.recaudacion || 0;
      return acc;
    }, {})
  );

  // 🏆 Top 10 eventos
  const topEventos = [...reportData]
    .sort((a, b) => b.recaudacion - a.recaudacion)
    .slice(0, 10);

  return (
    <Master>
      <div className="min-h-screen bg-black text-white pt-20 pb-10 px-6 space-y-16">

        {/* 🧩 Encabezado */}
        <div className="text-center">
          <Heading type={1} color="gray" text="Dashboard de Eventos" />
          <p className="text-gray-400 mt-2">
            Visualiza el rendimiento general de tus eventos.
          </p>

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
                {topEventos.map((ev: any) => (
                  <tr key={ev.idEvento} className="border-t border-white/10 hover:bg-white/5 transition">
                    <td className="p-3">{ev.titulo}</td>
                    <td className="p-3">{ev.lugar}</td>
                    <td className="p-3 text-right">{ev.entradasVendidas?.toLocaleString()}</td>
                    <td className="p-3 text-right">${ev.recaudacion?.toLocaleString()}</td>
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
