export interface InfografiaTexto {
  es: string;
  en: string;
  fr: string;
  ru: string;
}

export interface Infografia {
  label: InfografiaTexto | string;
  titulo: InfografiaTexto | string;
  subtitulo: InfografiaTexto | string;
  texto: InfografiaTexto | string;
  posicion: "izquierda" | "derecha";
}

export interface Property {
  id: string;
  slug: string;
  titulo: { es: string; en: string; fr: string; ru: string };
  precio: number;
  habitaciones: number;
  banos: number;
  m2_construidos: number;
  m2_parcela: number;
  m2_terraza?: number;
  plazas_parking?: number;
  ubicacion: string;
  descripcion: { es: string; en: string; fr: string; ru: string };
  video_url: string;
  galeria_urls: string[];
  infografias: Infografia[];
  destacada: boolean;
  activa: boolean;
  referencia?: string;
}
