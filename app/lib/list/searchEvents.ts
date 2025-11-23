export async function searchEvents(params: any = {}, useAbsolute = false) {
    const baseUrl = useAbsolute
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/evento/filter`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/evento/filter`;

    const query = new URLSearchParams();

    if (params.categoriaId) query.append("categoriaId", params.categoriaId);
    if (params.organizadorId) query.append("organizadorId", params.organizadorId);
    if (params.titulo) query.append("titulo", params.titulo);
    if (params.descripcion) query.append("descripcion", params.descripcion);
    if (params.lugar) query.append("lugar", params.lugar);
    if (params.fecha) query.append("fecha", params.fecha);
    if (params.horaInicio) query.append("horaInicio", params.horaInicio);

    const finalUrl = `${baseUrl}?${query.toString()}`;

    console.log("🔎 GET enviado al backend desde searchEvents:", finalUrl);

    try {
        const res = await fetch(finalUrl, { method: "GET", cache: "no-store" });

        let json = null;

        try {
            json = await res.json();
        } catch (err) {
            console.warn("⚠ Respuesta NO es JSON:", err);
        }

        return {
            data: json?.eventos ?? [],
            total: json?.total ?? 0,
            pagination: {
                pagina_actual: json?.pagina_actual,
                total_paginas: json?.total_paginas
            },
            ok: true
        };

    } catch (error) {
        console.error("❌ Error total en searchEvents:", error);
        return {
            data: [],
            ok: false,
            error: "Fetch failed"
        };
    }
}
