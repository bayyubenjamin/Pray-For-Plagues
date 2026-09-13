export function maskHandle(handle: string) {
  const clean = handle.replace(/^@/, "").trim();
  if (!clean) return "*";
  return `${clean[0].toLowerCase()}****`;
}
