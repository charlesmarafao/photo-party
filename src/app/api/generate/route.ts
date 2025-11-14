import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import { getOpenAI } from "@/lib/openai";
import { put } from "@vercel/blob";
import { EVENT_SLUG, DEFAULT_SIZE } from "@/constants/themes";
import type { PhotoItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	try {
		const { id, prompt: promptOverride, themeKey } = await req.json();
		if (!id) {
			return NextResponse.json({ error: "id é obrigatório." }, { status: 400 });
		}

		const kv = getKV();
		const item = (await kv.get(`photo:${id}`)) as PhotoItem | null;
		if (!item) {
			return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
		}

		// Atualiza status para processing
		item.status = "processing";
		item.updatedAt = Date.now();
		await kv.set(`photo:${id}`, item);

		// Busca imagem original como buffer
		const originalRes = await fetch(item.originalUrl);
		if (!originalRes.ok) {
			throw new Error("Falha ao baixar imagem original.");
		}
		const originalBuffer = Buffer.from(await originalRes.arrayBuffer());
		const imageFile = new File([originalBuffer], "original.png", { type: "image/png" });

		const openai = getOpenAI();
		const effectivePrompt = promptOverride && promptOverride.length > 0 ? promptOverride : item.prompt;

		// Edição image-to-image
		const res = await openai.images.edits({
			model: "gpt-image-1",
			image: [imageFile],
			prompt: effectivePrompt || "melhorar foto de festa, cores vivas, nitidez e luz equilibrada",
			size: DEFAULT_SIZE,
			response_format: "b64_json",
		});

		const b64 = res.data?.[0]?.b64_json;
		if (!b64) {
			throw new Error("Resposta inválida da IA.");
		}
		const outBuffer = Buffer.from(b64, "base64");

		const { url: generatedUrl } = await put(`${EVENT_SLUG}/${id}/generated.png`, outBuffer, {
			access: "public",
			contentType: "image/png",
		});

		item.generatedUrl = generatedUrl;
		if (themeKey && typeof themeKey === "string") {
			item.themeKey = themeKey;
		}
		if (effectivePrompt) {
			item.prompt = effectivePrompt;
		}
		item.status = "ready";
		item.updatedAt = Date.now();
		await kv.set(`photo:${id}`, item);

		return NextResponse.json({ id, generatedUrl });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message ?? "Erro ao gerar imagem." }, { status: 500 });
	}
}


