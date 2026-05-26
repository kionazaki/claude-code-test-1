import { randomBytes } from "crypto";

export function generateId(prefix = ""): string {
  const id = randomBytes(12).toString("base64url");
  return prefix ? `${prefix}_${id}` : id;
}

export function generatePublicId(): string {
  return `pub_${randomBytes(16).toString("base64url")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function now(): string {
  return new Date().toISOString();
}
