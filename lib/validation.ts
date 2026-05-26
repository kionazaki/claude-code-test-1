export const MAX_TITLE_LENGTH = 200;
export const DEFAULT_TITLE = "Untitled Note";

export function validateTitle(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_TITLE;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return DEFAULT_TITLE;
  return trimmed.slice(0, MAX_TITLE_LENGTH);
}

export function validateContentJson(raw: unknown): object {
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      throw new Error("contentJson is not valid JSON");
    }
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("contentJson must be an object");
  }
  const obj = raw as Record<string, unknown>;
  if (obj.type !== "doc") {
    throw new Error('contentJson root type must be "doc"');
  }
  // Ensure it is serializable
  JSON.stringify(obj);
  return obj;
}

export function emptyDoc(): object {
  return { type: "doc", content: [{ type: "paragraph" }] };
}
