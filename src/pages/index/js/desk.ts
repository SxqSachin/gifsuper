import { Panel } from "./panel";

export interface Desk {
  tabs: { name: string, title: string, icon: string, new?: boolean }[];

  panels: any[];
}