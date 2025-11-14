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

export const THEMES: Record<ThemeKey, string> = {
	neon80s: "neon glow, cores vibrantes, vaporwave, detalhes fluorescentes, festa noturna",
	revistaGlam: "capa de revista, iluminação de estúdio suave, look editorial chic",
	pbCinema: "preto e branco cinematográfico, alto contraste, grão sutil, glamour",
	aquarela: "efeito aquarela suave, pinceladas orgânicas, bordas difusas",
	cartoon: "estilo cartoon leve, traços limpos, cores planas suaves",
	tropical: "temática tropical, palmeiras, confete, cores quentes, luz dourada",
	glitter: "glitter cintilante, bokeh, brilho festivo, tons dourado e rosa",
	cyberpunk: "luzes neon magenta e azul, cidade futurista, clima noturno úmido",
	studioPortrait: "retrato de estúdio, fundo suave desfocado, pele natural, luz suave",
	popArt: "estilo pop art, cores saturadas, pontos ben-day, contornos marcados",
};

export const DEFAULT_SIZE = "1024x1024";
export const EVENT_SLUG = "aniversario-da-ana";


