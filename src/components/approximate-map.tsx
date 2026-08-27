import type { Zone } from "@/lib/domain/catalog";

type ApproximateMapProps = {
  zone: Zone;
  areaLabel: string;
};

const zoneCoordinates: Record<Zone, { latitude: number; longitude: number }> = {
  Centro: { latitude: -23.55, longitude: -46.64 },
  Norte: { latitude: -23.49, longitude: -46.62 },
  Sul: { latitude: -23.63, longitude: -46.66 },
  Leste: { latitude: -23.55, longitude: -46.54 },
  Oeste: { latitude: -23.56, longitude: -46.71 },
};

function mapSource(zone: Zone) {
  const { latitude, longitude } = zoneCoordinates[zone];
  const west = (longitude - 0.035).toFixed(3);
  const east = (longitude + 0.035).toFixed(3);
  const south = (latitude - 0.025).toFixed(3);
  const north = (latitude + 0.025).toFixed(3);

  return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

export function ApproximateMap({ zone, areaLabel }: ApproximateMapProps) {
  return (
    <section aria-label="Mapa aproximado" className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white p-5">
      <div><p className="text-sm font-black text-emerald-950">Localização aproximada</p><p className="mt-1 text-sm text-emerald-950/70">{areaLabel}</p></div>
      <iframe className="mt-5 h-64 w-full rounded-2xl border border-emerald-950/10" loading="lazy" src={mapSource(zone)} title={`Mapa interativo da região ${zone}`} />
      <p className="mt-4 text-xs leading-5 text-emerald-950/70">Explore a região no mapa. O marcador representa uma área aproximada e não o endereço do espaço.</p>
    </section>
  );
}
