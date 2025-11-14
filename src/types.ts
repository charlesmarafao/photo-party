export type PhotoStatus = "uploaded" | "processing" | "ready" | "approved" | "failed";

export interface PhotoItem {
	id: string;
	originalUrl: string;
	generatedUrl?: string;
	prompt: string;
	themeKey: string;
	status: PhotoStatus;
	createdAt: number;
	updatedAt: number;
	error?: string;
}

export interface ListResponse {
	items: PhotoItem[];
}


