import { JSX } from "react";

export type SideNavItem = {
  title: string;
  path: string;
  icon?: JSX.Element;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
};

export interface Document {
  iddoc: number;
  titre: string;
  type: string | null;
  chemin: string | null;
  date_creat: Date | string | null;
  version: string | null;
  niveau_confid: number | null;
  isTemplate?: boolean;
}