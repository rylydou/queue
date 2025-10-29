import * as doc from "$lib/server/doc";
import { type RequestHandler } from "@sveltejs/kit";
// import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({ locals, request }) => {
	const data = await request.json();
	doc.patchItem(data);
	return new Response(null, { status: 200 });
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const data = await request.json();
	doc.createItem(data);
	return new Response(null, { status: 201 });
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
	const data = await request.text();
	doc.deleteItem(data);
	return new Response(null, { status: 200 });
};
