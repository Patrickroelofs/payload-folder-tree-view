import type { Endpoint } from "payload";

export interface Endpoints {
  files: Omit<Endpoint, 'root'>;
  openFolder: Omit<Endpoint, 'root'>;
}

export type File = {
  id: string;
  relationTo: string;
  title: string;
}