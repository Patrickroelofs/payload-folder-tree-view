import type { Endpoint } from "payload";

export interface Endpoints {
  folder: Omit<Endpoint, 'root'>;
  item: Omit<Endpoint, 'root'>;
  root: Omit<Endpoint, 'root'>;
}

export type TreeData = {
  createdAt: string;
  data?: TreeData[];
  id: string;
  relationTo: string;
  title: string;
  updatedAt: string;
}