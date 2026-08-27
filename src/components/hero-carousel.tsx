"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = { src: string; alt: string };

const SLIDES: Slide[] = [
  {
    src: "https://images.unsplash.com/photo-1703733569670-f36996a8ca1d?auto=format&fit=crop&w=1800&q=90",
    alt: "Cães correndo soltos em um campo gramado",
  },
  {
    src: "https://images.unsplash.com/photo-1715934514075-06f0dbda1c09?auto=format&fit=crop&w=1800&q=90",
    alt: "Quintal cercado com grama aparada e muro claro",
  },
  {
    src: "https://images.unsplash.com/photo-1561283890-5d858c23b2ea?auto=format&fit=crop&w=1800&q=90",
    alt: "Campo aberto e arborizado sob céu limpo",
  },
];

export function HeroCarousel({ slides = SLIDES }: { slides?: Slide[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || slides.length < 2) return;
    const timer = setInterval(() => setCurrent((index) => (index + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  return (
    <>
      <div aria-live="off" className="absolute inset-0">
        {slides.map((slide, index) => (
          <Image
            alt={slide.alt}
            className={`object-cover transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"}`}
            fill
            key={slide.src}
            priority={index === 0}
            sizes="100vw"
            src={slide.src}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-950/70 to-emerald-950/85 sm:bg-gradient-to-r sm:from-emerald-950 sm:via-emerald-950/80 sm:to-emerald-950/20" />
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 px-5 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="pointer-events-auto flex gap-2" role="group" aria-label="Imagens do espaço">
            {slides.map((slide, index) => (
              // A barra é fina, mas o botão tem altura de toque confortável no celular.
              <button
                aria-current={index === current}
                aria-label={`Ver imagem ${index + 1}: ${slide.alt}`}
                className="flex h-11 items-center px-1"
                key={slide.src}
                onBlur={() => setIsPaused(false)}
                onClick={() => setCurrent(index)}
                onFocus={() => setIsPaused(true)}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                type="button"
              >
                <span
                  className={`block h-2 rounded-full transition-all ${index === current ? "w-10 bg-lime-300" : "w-5 bg-white/50 hover:bg-white/80"}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
