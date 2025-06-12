import { CodaFieldMap } from "./meta";

export function parseField(value: any, field: CodaFieldMap): any {
  if (field.type === "string[]") {
    return (value || "")
      .split(field.separator!)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  }
  if (field.type === "number[]") {
    return (value || "")
      .split(field.separator!)
      .map((s: string) => parseInt(s.trim(), 10))
      .filter((n: number) => !isNaN(n));
  }
  if (field.type === "number") {
    return value !== undefined && value !== null && value !== "" ? parseFloat(value) : 0;
  }
  if (field.type === "date") {
    return value ? new Date(value) : undefined;
  }
  // string (par défaut)
  return value || "";
}