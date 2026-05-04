import type { Database } from "@/integrations/supabase/types";

export type UnitKey = Database["public"]["Enums"]["unit_key"];
export type Role = Database["public"]["Enums"]["app_role"];

export interface UnitInfo {
  key: UnitKey;
  short: string;
  name: string;
  level: string;
}

export const UNITS: Record<UnitKey, UnitInfo> = {
  mi:  { key: "mi",  short: "MI",  name: "Madrasah Ibtidaiyah",      level: "Dasar" },
  smp: { key: "smp", short: "SMP", name: "Sekolah Menengah Pertama", level: "Menengah" },
  smk: { key: "smk", short: "SMK", name: "Sekolah Menengah Kejuruan", level: "Atas" },
};

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin Yayasan",
  admin_mi: "Admin MI",
  admin_smp: "Admin SMP",
  admin_smk: "Admin SMK",
};

export const canAccessCMS = (role?: Role | null) => role === "super_admin";
export const canSwitchUnit = (role?: Role | null) => role === "super_admin";
export const canWriteUnit = (role?: Role | null) =>
  role === "admin_mi" || role === "admin_smp" || role === "admin_smk";

export const dashboardPathFor = (role: Role | null | undefined, unit: UnitKey | null | undefined): string => {
  if (role === "super_admin") return "/yayasan";
  if (role === "admin_mi" || unit === "mi")  return "/dashboard/mi";
  if (role === "admin_smp" || unit === "smp") return "/dashboard/smp";
  if (role === "admin_smk" || unit === "smk") return "/dashboard/smk";
  return "/dashboard/mi";
};

export const unitFromRole = (role: Role | null | undefined, fallback: UnitKey | null | undefined): UnitKey => {
  if (role === "admin_mi") return "mi";
  if (role === "admin_smp") return "smp";
  if (role === "admin_smk") return "smk";
  return fallback ?? "mi";
};
