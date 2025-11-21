export const generateReport = async (filters: any) => {

  const payload = {
    fechaInicio: filters.fechaInicio ? new Date(filters.fechaInicio).toISOString() : null,
    fechaFin: filters.fechaFin ? new Date(filters.fechaFin).toISOString() : null,
    idOrganizador: filters.idOrganizador ? Number(filters.idOrganizador) : null,
    idCategoria: filters.idCategoria ? Number(filters.idCategoria) : null,
    estado: filters.estado || null,
    limit: Number(filters.limit),
  };

  console.log("JSON enviado al backend:", payload);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { error: "Error en la respuesta del servidor" };
    }

    const data = await response.json();
    console.log("📥 Respuesta del backend:", data);

    return { data: data };
  } catch (error) {
    console.error("Error de conexión:", error);
    return { error: "No se pudo conectar al servidor" };
  }
};
