export function selectFields<T>(fields: (keyof T)[]): string {
  return fields.join(" ");
}
