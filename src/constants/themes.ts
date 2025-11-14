export type ThemeKey =
	| "neon80s"
	| "revistaGlam"
	| "pbCinema"
	| "aquarela"
	| "cartoon"
	| "tropical"
	| "glitter"
	| "cyberpunk"
	| "studioPortrait"
	| "popArt";

export interface Theme {
	key: ThemeKey;
	name: string;
	prompt: string;
	preview?: string; // futuro: imagem exemplo por tema
}

export const THEME_LIST: Theme[] = [
	{ key: "neon80s", name: "Neon Party 80s", prompt: "neon glow, cores vibrantes, vaporwave, detalhes fluorescentes, festa noturna" },
	{ key: "revistaGlam", name: "Revista Glam", prompt: "capa de revista, iluminação de estúdio suave, look editorial chic" },
	{ key: "pbCinema", name: "P&B Cinema", prompt: "preto e branco cinematográfico, alto contraste, grão sutil, glamour" },
	{ key: "aquarela", name: "Aquarela", prompt: "efeito aquarela suave, pinceladas orgânicas, bordas difusas" },
	{ key: "cartoon", name: "Cartoon Leve", prompt: "estilo cartoon leve, traços limpos, cores planas suaves" },
	{ key: "tropical", name: "Tropical", prompt: "temática tropical, palmeiras, confete, cores quentes, luz dourada" },
	{ key: "glitter", name: "Festa Glitter", prompt: "glitter cintilante, bokeh, brilho festivo, tons dourado e rosa" },
	{ key: "cyberpunk", name: "Cyberpunk", prompt: "luzes neon magenta e azul, cidade futurista, clima noturno úmido" },
	{ key: "studioPortrait", name: "Retrato de Estúdio", prompt: "retrato de estúdio, fundo suave desfocado, pele natural, luz suave" },
	{ key: "popArt", name: "Pop Art", prompt: "estilo pop art, cores saturadas, pontos ben-day, contornos marcados" },
];

export const THEMES: Record<ThemeKey, string> = Object.fromEntries(
	THEME_LIST.map((t) => [t.key, t.prompt]),
) as Record<ThemeKey, string>;

export const THEME_NAMES: Record<ThemeKey, string> = Object.fromEntries(
	THEME_LIST.map((t) => [t.key, t.name]),
) as Record<ThemeKey, string>;

export const DEFAULT_SIZE = "1024x1024";
export const EVENT_SLUG = "aniversario-da-ana";


