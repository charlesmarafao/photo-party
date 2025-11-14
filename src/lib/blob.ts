import { put, list, del, get, type PutBlobResult } from "@vercel/blob";

export type BlobRef = PutBlobResult & { pathname?: string };

export async function putPNG(path: string, data: Buffer | Uint8Array): Promise<BlobRef> {
	return await put(path, data, {
		contentType: "image/png",
		access: "public",
	});
}

export async function listBlobs(prefix?: string) {
	return await list({ prefix });
}

export async function deleteBlob(url: string) {
	return await del(url);
}

export async function getBlob(url: string) {
	return await get(url);
}


