export async function searchEvents(payload: any, useAbsolute = false) {
    const url = useAbsolute
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/search-events`
        : `/api/search-events`;

    try {
        console.log("JSON enviado al backend:", payload);

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            cache: "no-store"
        });

        let json: any = null;

        // Intentar parsear JSON sin romper la app
        try {
            json = await res.json();
        } catch (err) {
            console.warn("⚠ Respuesta NO es JSON:", err);
            json = null;
        }

        return {
            data: json?.data ?? [],
            pagination: json?.pagination ?? null,
            ok: true
        };

    } catch (error) {
        console.error("❌ Error total en searchEvents:", error);

        return {
            data: [],
            pagination: null,
            ok: false,
            error: "Fetch failed"
        };
    }
}
