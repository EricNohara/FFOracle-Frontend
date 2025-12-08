// interfaces for responses from article endpoint from our backend
export interface IPlayerNewsArticle {
  headline: string | null;
  description: string | null;
  published: Date | null;
  images: IEspnImage[];
  story: string | null;
  links: IEspnNewsLinks;
  playerId: number | null;
  localPlayerId: string;
}

export interface IEspnImage {
  url: string | null;
  alt: string | null;
}

export interface IEspnNewsLinks {
  web: IEspnNewsWebLink | null;
}

interface IEspnNewsWebLink {
  href: string | null;
}
