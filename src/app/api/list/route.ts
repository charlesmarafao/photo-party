import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import type { PhotoItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const approvedOnly = searchParams.get("approved") === "true";
		const limit = Number(searchParams.get("limit") ?? "100");
		const kv = getKV();
		// Busca últimos IDs do ZSET
		const now = Date.now();
		const min = 0;
		const max = now;
		const ids = (await kv.zrange("photos", min, max, { byScore: true, rev: true, count: limit })) as string[];
		const items: PhotoItem[] = [];
		for (const id of ids) {
			const item = (await kv.get(`photo:${id}`)) as PhotoItem | null;
			if (!item) continue;
			if (approvedOnly && item.status !== "approved") continue;
			if (!approvedOnly && item.status === "failed") continue;
			items.push(item);
		}
		return NextResponse.json({ items });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message ?? "Erro ao listar itens." }, { status: 500 });
	}
}


