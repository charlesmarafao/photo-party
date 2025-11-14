import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import type { PhotoItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");
		if (!id) {
			return NextResponse.json({ error: "id é obrigatório." }, { status: 400 });
		}
		const kv = getKV();
		const item = (await kv.get(`photo:${id}`)) as PhotoItem | null;
		if (!item) {
			return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
		}
		return NextResponse.json({ item });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message ?? "Erro ao buscar item." }, { status: 500 });
	}
}


