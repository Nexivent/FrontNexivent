import { searchEvents } from "../../../lib/list/searchEvents";

export async function GET(request: Request) {
    const params = Object.fromEntries(new URL(request.url).searchParams);

    const result = await searchEvents(params);

    return Response.json(result);
}
