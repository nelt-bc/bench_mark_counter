export function camelToLowerWords(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}

export function camelToUpperWords(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase();
}
