import Link from "next/link";

type BrandLogoProps = {
  /** "light" para fundos escuros (hero), "dark" para fundos claros. */
  tone?: "light" | "dark";
  className?: string;
};

/** Marca: portão aberto de pátio com uma pegada, e o nome em letra própria. */
export function BrandLogo({ tone = "dark", className = "" }: BrandLogoProps) {
  const isLight = tone === "light";

  return (
    <Link
      className={`group inline-flex items-center gap-2.5 ${isLight ? "text-white" : "text-emerald-950"} ${className}`}
      href="/"
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-[0.7rem] transition group-hover:rotate-3 ${
          isLight ? "bg-lime-300 text-emerald-950" : "bg-emerald-950 text-lime-300"
        }`}
      >
        <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
          {/* portão aberto */}
          <path d="M3 20V9.2a1 1 0 0 1 .62-.92L9 6v14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M21 20V9.2a1 1 0 0 0-.62-.92L15 6v14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M2 20h20" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          {/* pegada */}
          <circle cx="12" cy="13.4" fill="currentColor" r="2.1" />
          <circle cx="9.5" cy="9.6" fill="currentColor" r="1" />
          <circle cx="12" cy="8.7" fill="currentColor" r="1" />
          <circle cx="14.5" cy="9.6" fill="currentColor" r="1" />
        </svg>
      </span>
      <span className="text-[1.35rem] font-black leading-none tracking-[-0.045em]">
        Pátio<span className={isLight ? "text-lime-300" : "text-emerald-700"}> Livre</span>
      </span>
    </Link>
  );
}
