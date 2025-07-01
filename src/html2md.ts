import html2md from "html-to-md";

export function htmltomd(html: string): string {
  return html2md(html);
}
