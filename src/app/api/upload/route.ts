import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { EVENT_SLUG } from "@/constants/themes";
import type { PhotoItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File | null;
		const themeKey = (formData.get("themeKey") as string | null) ?? "";
		const prompt = (formData.get("prompt") as string | null) ?? "";

		if (!file) {
			return NextResponse.json({ error: "Arquivo de imagem é obrigatório." }, { status: 400 });
		}

		const id = randomUUID();
		const ext = "png"; // padronizamos como png para saída final; entrada pode ser qualquer
		const filename = `${EVENT_SLUG}/${id}/original.${ext}`;

		// Envia arquivo original para o Blob com content-type do upload
		const arrayBuffer = await file.arrayBuffer();
		const contentType = file.type || "image/png";
		const { url: originalUrl } = await put(filename, Buffer.from(arrayBuffer), {
			access: "public",
			contentType,
			token: process.env.BLOB_READ_WRITE_TOKEN,
		});

		const kv = getKV();
		const now = Date.now();
		const item: PhotoItem = {
			id,
			originalUrl,
			prompt,
			themeKey,
			status: "uploaded",
			createdAt: now,
			updatedAt: now,
		};

		await kv.set(`photo:${id}`, item);
		await kv.zadd(`photos`, { score: now, member: id });

		return NextResponse.json({ id, item });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message ?? "Erro ao fazer upload." }, { status: 500 });
	}
}


