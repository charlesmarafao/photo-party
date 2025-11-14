/* App do convidado - fluxo em 2 passos + aprovação */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { THEMES, THEME_LIST, type ThemeKey } from "@/constants/themes";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import Image from "next/image";

type Step = 1 | 2 | 3;

export default function HomePage() {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [theme, setTheme] = useState<ThemeKey | "">("");
	const [isUploading, setIsUploading] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [step, setStep] = useState<Step>(1);
	const [currentId, setCurrentId] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

	const themes = useMemo(() => THEME_LIST, []);

	useEffect(() => {
		if (!currentId) return;
		const iv = setInterval(async () => {
			try {
				const res = await fetch(`/api/item?id=${currentId}`);
				if (!res.ok) return;
				const data = await res.json();
				const item = data?.item as any;
				if (item?.generatedUrl) {
					setPreviewUrl(item.generatedUrl);
				}
				if (item?.status === "approved") {
					setDownloadUrl(item.generatedUrl);
					clearInterval(iv);
				}
			} catch {}
		}, 3000);
		return () => clearInterval(iv);
	}, [currentId]);

	function resetAll() {
		setFile(null);
		setTheme("");
		setIsUploading(false);
		setIsGenerating(false);
		setStep(1);
		setCurrentId(null);
		setPreviewUrl(null);
		setDownloadUrl(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	async function handleUpload() {
		if (!file) {
			toast.error("Envie uma foto primeiro.");
			return;
		}
		setIsUploading(true);
		try {
			const form = new FormData();
			form.append("file", file);
			// ainda sem tema, só criando item
			const res = await fetch("/api/upload", { method: "POST", body: form });
			const data = await res.json();
			if (!res.ok) throw new Error(data?.error ?? "Falha no upload.");
			setCurrentId(data.id);
			setStep(2);
			toast.success("Foto enviada! Escolha um tema.");
		} catch (e: any) {
			toast.error(e?.message ?? "Erro ao enviar foto.");
		} finally {
			setIsUploading(false);
		}
	}

	async function handleGenerate() {
		if (!currentId) {
			toast.error("Foto não encontrada.");
			return;
		}
		if (!theme) {
			toast.error("Escolha um tema.");
			return;
		}
		setIsGenerating(true);
		try {
			const prompt = THEMES[theme];
			const res = await fetch("/api/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: currentId, prompt, themeKey: theme }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data?.error ?? "Falha na geração.");
			setPreviewUrl(data.generatedUrl);
			setStep(3);
			toast.success("Imagem gerada! Revise e aprove.");
		} catch (e: any) {
			toast.error(e?.message ?? "Erro ao gerar.");
		} finally {
			setIsGenerating(false);
		}
	}

	async function handleApprove() {
		if (!currentId) return;
		try {
			const res = await fetch("/api/approve", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: currentId }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data?.error ?? "Falha ao aprovar.");
			toast.success("Aprovada! Sua foto entrará no telão.");
			setDownloadUrl(previewUrl);
		} catch (e: any) {
			toast.error(e?.message ?? "Erro ao aprovar.");
		}
	}

	return (
		<div className="relative">
			<Spotlight className="left-0 top-[-20%]" />
			<div className="relative mx-auto max-w-2xl px-4 py-10">
				<h1 className="heading text-3xl font-semibold text-center mb-2">Aniversário da Ana</h1>
				<div className="mx-auto mt-2 mb-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
					<div className={`px-2 py-1 rounded-md ${step >= 1 ? "bg-primary/20 text-primary-foreground/90" : "bg-muted"}`}>1/3 Enviar</div>
					<div className={`px-2 py-1 rounded-md ${step >= 2 ? "bg-primary/20 text-primary-foreground/90" : "bg-muted"}`}>2/3 Tema</div>
					<div className={`px-2 py-1 rounded-md ${step >= 3 ? "bg-primary/20 text-primary-foreground/90" : "bg-muted"}`}>3/3 Aprovar</div>
				</div>

				{/* Passo 1 */}
				<Card className="mb-4 relative overflow-hidden">
					<CardHeader>
						<CardTitle>Passo 1 — Envie sua foto</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<Input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={(e) => setFile(e.target.files?.[0] ?? null)}
							/>
							<Button className="btn-primary" onClick={handleUpload} disabled={isUploading || !file}>
								{isUploading ? "Enviando..." : "Enviar"}
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Passo 2: aparece só depois do upload */}
				{step >= 2 && (
					<Card className="mb-4 relative overflow-hidden">
						<CardHeader>
							<CardTitle>Passo 2 — Escolha um tema</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-2">
								<Select value={theme} onValueChange={(v) => setTheme(v as ThemeKey)}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Selecione um tema" />
									</SelectTrigger>
									<SelectContent>
										{themes.map((t) => (
											<SelectItem key={t.key} value={t.key}>
												{t.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Button className="btn-primary" onClick={handleGenerate} disabled={isGenerating || !currentId || !theme}>
									{isGenerating ? "Gerando..." : "Gerar"}
								</Button>
							</div>
							{/* Futuro: preview por tema (placeholder visual simples) */}
							{theme && (
								<div className="mt-3 text-xs text-muted-foreground">
									Prévia do tema ficará aqui futuramente.
								</div>
							)}
						</CardContent>
					</Card>
				)}

			{/* Aprovação */}
				{step >= 3 && (
					<Card className="mb-4 relative overflow-hidden">
						<CardHeader>
							<CardTitle>Prévia — Aprove para exibir no telão</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="relative w-full aspect-square bg-muted rounded overflow-hidden">
								{previewUrl ? (
									<Image src={previewUrl} alt="Prévia" fill className="object-contain" />
								) : (
									<div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">Processando...</div>
								)}
							</div>
							<div className="mt-3 flex gap-2">
								<Button className="btn-primary" onClick={handleApprove} disabled={!previewUrl}>
									Aprovar para o telão
								</Button>
								{downloadUrl && (
									<a className="inline-flex h-10 items-center rounded-md border px-3 text-sm" href={downloadUrl} download>
										Baixar PNG
									</a>
								)}
								<Button variant="secondary" onClick={resetAll}>
									Enviar outra
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				<div className="text-center text-xs text-muted-foreground mt-6">
					Logo do patrocinador aqui (placeholder)
				</div>
			</div>
		</div>
	);
}


