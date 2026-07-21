export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")   // remove anything that isn't a letter, number, space, or hyphen
    .replace(/\s+/g, "-")            // replace spaces with hyphens
    .replace(/-+/g, "-")             // collapse consecutive hyphens
    .replace(/^-+|-+$/g, "");        // strip leading/trailing hyphens
}
