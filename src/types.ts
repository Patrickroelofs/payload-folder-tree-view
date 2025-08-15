import type { Endpoint } from "payload";

export interface Endpoints {
  openFolder: Omit<Endpoint, 'root'>;
}