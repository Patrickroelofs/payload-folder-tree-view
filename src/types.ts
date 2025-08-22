import type { Endpoint } from "payload";

export interface Endpoints {
  folder: Omit<Endpoint, 'root'>;
  item: Omit<Endpoint, 'root'>;
}

export type TreeData = {
  relationTo: string;
  title: string;
}