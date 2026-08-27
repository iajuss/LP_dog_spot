import { ZONES, type Zone } from "@/lib/domain/catalog";

type ApproximateMapProps = {
  zone: Zone;
  areaLabel: string;
};

const positions: Record<Zone, string> = {
  Norte: "left-[48%] top-[15%]",
  Oeste: "left-[24%] top-[48%]",
  Centro: "left-[49%] top-[50%]",
  Leste: "right-[16%] top-[54%]",
  Sul: "left-[48%] bottom-[14%]",
};

export function ApproximateMap({ zone, areaLabel }: ApproximateMapProps) {
  return (
    <section aria-label="Mapa aproximado" className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-[#dce9d7] p-5">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black text-emerald-950">Localização aproximada</p><p className="mt-1 text-sm text-emerald-950/70">{areaLabel}</p></div><span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-emerald-900">Sem endereço</span></div>
      <div className="relative mt-5 h-56 overflow-hidden rounded-2xl border border-white/70 bg-[#b8d3b0]" role="img" aria-label={`Área aproximada na zona ${zone}`}>
        <div className="absolute inset-[16%_20%] rotate-[-8deg] rounded-[43%_57%_50%_50%] border-[18px] border-[#e9e1c8]/80" />
        <div className="absolute left-[15%] top-[35%] h-1 w-[70%] rotate-[-16deg] bg-white/80" />
        <div className="absolute left-[36%] top-[12%] h-[75%] w-1 rotate-[22deg] bg-white/75" />
        {ZONES.map((mapZone) => <span className={`absolute text-[10px] font-black uppercase tracking-widest text-emerald-950/45 ${positions[mapZone]}`} key={mapZone}>{mapZone}</span>)}
        <span className={`absolute grid size-11 place-items-center rounded-full border-4 border-white bg-emerald-950 text-lg shadow-lg ${positions[zone]}`} aria-label={`Marcador em ${zone}`}>🐾</span>
      </div>
      <p className="mt-4 text-xs leading-5 text-emerald-950/70">O endereço só seria compartilhado em uma etapa futura de disponibilidade. Esta referência não identifica uma propriedade real.</p>
    </section>
  );
}
