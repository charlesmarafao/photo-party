"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Spotlight } from "@/components/ui/spotlight";

interface Item {
	id: string;
	generatedUrl?: string;
}

export default function SlideshowPage() {
	const [items, setItems] = useState<Item[]>([]);
	const [index, setIndex] = useState(0);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	// polling para buscar aprovadas
	useEffect(() => {
		let active = true;
		async function load() {
			try {
				const res = await fetch(`/api/list?approved=true&limit=200`, { cache: "no-store" });
				if (!res.ok) return;
				const data = await res.json();
				if (!active) return;
				const list = (data?.items ?? []) as Item[];
				setItems(list.filter((i) => !!i.generatedUrl));
			} catch {}
		}
		load();
		const iv = setInterval(load, 5000);
		return () => {
			active = false;
			clearInterval(iv);
		};
	}, []);

	// rotação
	useEffect(() => {
		if (timerRef.current) clearInterval(timerRef.current);
		timerRef.current = setInterval(() => {
			setIndex((prev) => {
				const len = items.length || 1;
				return (prev + 1) % len;
			});
		}, 7000);
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [items]);

	const current = useMemo(() => {
		if (!items.length) return null;
		return items[index % items.length];
	}, [items, index]);

	return (
		<div className="fixed inset-0 bg-black">
			<Spotlight className="left-[-10%] top-[-10%]" />
			{current?.generatedUrl ? (
				<Image
					key={current.id}
					src={current.generatedUrl}
					alt="Foto do evento"
					fill
					className="object-contain transition-opacity duration-700"
					priority
				/>
			) : (
				<div className="w-full h-full flex items-center justify-center text-white/70">
					Aguardando fotos aprovadas...
				</div>
			)}
			<div className="absolute top-4 left-4 text-white font-semibold text-lg heading">
				Aniversário da Ana
			</div>
			<div className="absolute bottom-4 left-4 text-white/80 text-sm">
				Patrocínio (logo placeholder)
			</div>
		</div>
	);
}


