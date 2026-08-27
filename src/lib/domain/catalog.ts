export const ZONES = ["Centro", "Norte", "Sul", "Leste", "Oeste"] as const;
export const USE_TYPES = ["passeio", "brincadeira", "treino", "socializacao"] as const;
export const DOG_SIZES = ["pequeno", "medio", "grande"] as const;
export const AMENITIES = ["cercado", "gramado", "agua", "sombra", "agility"] as const;

export type Zone = (typeof ZONES)[number];
export type UseType = (typeof USE_TYPES)[number];
export type DogSize = (typeof DOG_SIZES)[number];
export type Amenity = (typeof AMENITIES)[number];

export type Space = {
  slug: string;
  name: string;
  zone: Zone;
  neighborhoodLabel: string;
  approximateMapArea: string;
  allowedUses: UseType[];
  dogSizes: DogSize[];
  maxDogs: number;
  amenities: Amenity[];
  imageUrl: string;
  imageAlt: string;
  description: string;
};

export const AMENITY_LABELS: Record<Amenity, string> = {
  cercado: "Área cercada",
  gramado: "Gramado",
  agua: "Água disponível",
  sombra: "Sombra",
  agility: "Itens de treino",
};

export const USE_TYPE_LABELS: Record<UseType, string> = {
  passeio: "Passeio tranquilo",
  brincadeira: "Brincadeira livre",
  treino: "Treino",
  socializacao: "Socialização",
};

export const DOG_SIZE_LABELS: Record<DogSize, string> = {
  pequeno: "Pequeno porte",
  medio: "Médio porte",
  grande: "Grande porte",
};

export const SPACES: Space[] = [
  {
    slug: "quintal-da-praca",
    name: "Quintal da Praça",
    zone: "Oeste",
    neighborhoodLabel: "Região de Pinheiros",
    approximateMapArea: "Oeste, perto da área verde urbana",
    allowedUses: ["treino", "brincadeira", "passeio"],
    dogSizes: ["medio", "grande"],
    maxDogs: 3,
    amenities: ["cercado", "gramado", "agua", "sombra", "agility"],
    imageUrl: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Cão correndo em gramado amplo",
    description: "Área ampla e cercada para treinar com espaço e foco.",
  },
  {
    slug: "jardim-da-colina",
    name: "Jardim da Colina",
    zone: "Sul",
    neighborhoodLabel: "Região de Vila Mariana",
    approximateMapArea: "Sul, em uma área residencial arborizada",
    allowedUses: ["passeio", "brincadeira", "socializacao"],
    dogSizes: ["pequeno", "medio"],
    maxDogs: 2,
    amenities: ["cercado", "sombra", "agua"],
    imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Cão em área externa arborizada",
    description: "Jardim tranquilo para encontros em ritmo leve.",
  },
  {
    slug: "campo-do-sol",
    name: "Campo do Sol",
    zone: "Norte",
    neighborhoodLabel: "Região de Santana",
    approximateMapArea: "Norte, próximo a uma faixa de parques",
    allowedUses: ["brincadeira", "passeio"],
    dogSizes: ["pequeno", "medio", "grande"],
    maxDogs: 4,
    amenities: ["gramado", "agua", "sombra"],
    imageUrl: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Cachorro brincando sob luz do sol",
    description: "Campo aberto para gastar energia com espaço de sobra.",
  },
  {
    slug: "pomar-urbano",
    name: "Pomar Urbano",
    zone: "Centro",
    neighborhoodLabel: "Região de Santa Cecília",
    approximateMapArea: "Centro, em um trecho residencial",
    allowedUses: ["passeio", "treino"],
    dogSizes: ["pequeno", "medio"],
    maxDogs: 2,
    amenities: ["cercado", "sombra", "agility"],
    imageUrl: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Cão olhando para uma área verde",
    description: "Espaço compacto para rotinas de treino e passeio.",
  },
  {
    slug: "quintal-do-lago",
    name: "Quintal do Lago",
    zone: "Leste",
    neighborhoodLabel: "Região de Tatuapé",
    approximateMapArea: "Leste, em uma área de casas e praças",
    allowedUses: ["brincadeira", "socializacao"],
    dogSizes: ["pequeno", "medio", "grande"],
    maxDogs: 4,
    amenities: ["cercado", "gramado", "agua"],
    imageUrl: "https://images.unsplash.com/photo-1494947665470-20322015e3a8?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Dois cães em gramado",
    description: "Espaço aberto para cães que gostam de companhia.",
  },
  {
    slug: "terraco-verde",
    name: "Terraço Verde",
    zone: "Centro",
    neighborhoodLabel: "Região de Bela Vista",
    approximateMapArea: "Centro, em uma área de acesso fácil",
    allowedUses: ["passeio", "socializacao"],
    dogSizes: ["pequeno"],
    maxDogs: 2,
    amenities: ["cercado", "sombra", "agua"],
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Cão pequeno em área externa",
    description: "Área compacta para encontros calmos no meio da cidade.",
  },
  {
    slug: "bosque-claro",
    name: "Bosque Claro",
    zone: "Oeste",
    neighborhoodLabel: "Região de Butantã",
    approximateMapArea: "Oeste, em uma zona mais arborizada",
    allowedUses: ["passeio", "treino", "brincadeira"],
    dogSizes: ["medio", "grande"],
    maxDogs: 3,
    amenities: ["gramado", "sombra", "agility"],
    imageUrl: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Cão em caminho de parque",
    description: "Refúgio verde para uma rotina mais ativa.",
  },
  {
    slug: "gramado-do-vale",
    name: "Gramado do Vale",
    zone: "Sul",
    neighborhoodLabel: "Região de Santo Amaro",
    approximateMapArea: "Sul, em uma área de quintais amplos",
    allowedUses: ["brincadeira", "treino", "socializacao"],
    dogSizes: ["pequeno", "medio", "grande"],
    maxDogs: 5,
    amenities: ["cercado", "gramado", "agua", "agility"],
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Cão correndo ao ar livre",
    description: "Gramado versátil para grupos pequenos de cães.",
  },
  { slug: "patio-das-oliveiras", name: "Pátio das Oliveiras", zone: "Norte", neighborhoodLabel: "Região de Tucuruvi", approximateMapArea: "Norte, próximo a áreas arborizadas", allowedUses: ["passeio", "socializacao"], dogSizes: ["pequeno", "medio"], maxDogs: 3, amenities: ["cercado", "sombra", "agua"], imageUrl: "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=1200&q=85", imageAlt: "Cão em gramado verde", description: "Pátio tranquilo para encontros e passeios." },
  { slug: "jardim-do-arco", name: "Jardim do Arco", zone: "Leste", neighborhoodLabel: "Região de Anália Franco", approximateMapArea: "Leste, em uma área residencial", allowedUses: ["brincadeira", "treino"], dogSizes: ["medio", "grande"], maxDogs: 3, amenities: ["gramado", "agility", "agua"], imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=85", imageAlt: "Cão feliz em área externa", description: "Área aberta pensada para gastar energia." },
  { slug: "recanto-do-ceu", name: "Recanto do Céu", zone: "Sul", neighborhoodLabel: "Região de Saúde", approximateMapArea: "Sul, perto de praças locais", allowedUses: ["passeio", "brincadeira"], dogSizes: ["pequeno", "medio", "grande"], maxDogs: 4, amenities: ["cercado", "gramado", "sombra"], imageUrl: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=1200&q=85", imageAlt: "Cão em parque", description: "Recanto arejado para a rotina ao ar livre." },
  { slug: "casa-da-serra", name: "Casa da Serra", zone: "Oeste", neighborhoodLabel: "Região de Alto de Pinheiros", approximateMapArea: "Oeste, em área de casas", allowedUses: ["treino", "socializacao", "brincadeira"], dogSizes: ["pequeno", "medio", "grande"], maxDogs: 5, amenities: ["cercado", "gramado", "agua", "agility"], imageUrl: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?auto=format&fit=crop&w=1200&q=85", imageAlt: "Cão olhando para a câmera", description: "Quintal amplo para encontros com mais energia." },
];

export function getSpaceBySlug(slug: string): Space | undefined {
  return SPACES.find((space) => space.slug === slug);
}
