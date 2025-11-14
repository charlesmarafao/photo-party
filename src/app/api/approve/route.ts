import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import type { PhotoItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	try {
		const { id } = await req.json();
		if (!id) {
			return NextResponse.json({ error: "id é obrigatório." }, { status: 400 });
		}
		const kv = getKV();
		const item = (await kv.get(`photo:${id}`)) as PhotoItem | null;
		if (!item) {
			return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
		}
		if (!item.generatedUrl) {
			return NextResponse.json({ error: "Imagem ainda não está pronta." }, { status: 409 });
		}
		item.status = "approved";
		item.updatedAt = Date.now();
		await kv.set(`photo:${id}`, item);
		return NextResponse.json({ ok: true });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message ?? "Erro ao aprovar imagem." }, { status: 500 });
	}
}


