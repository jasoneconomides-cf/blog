import { parseHTML } from "linkedom";
import TurndownService from "turndown";

const MARKDOWN_ACCEPT = /\btext\/markdown\b/i;

export async function onRequest(context) {
  const response = await context.next();
  const accept = context.request.headers.get("accept") || "";
  const contentType = response.headers.get("content-type") || "";

  if (
    context.request.method !== "GET" ||
    !MARKDOWN_ACCEPT.test(accept) ||
    !contentType.includes("text/html") ||
    !response.ok
  ) {
    return response;
  }

  const html = await response.text();
  const { document } = parseHTML(html);

  document
    .querySelectorAll("script, style, noscript, svg")
    .forEach((element) => element.remove());

  const title = document.querySelector("title")?.textContent?.trim();
  const canonical = document
    .querySelector('link[rel="canonical"]')
    ?.getAttribute("href");
  const main = document.querySelector("main") || document.body;
  const turndown = new TurndownService({
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    headingStyle: "atx",
  });

  const body = turndown.turndown(main.innerHTML).trim();
  const preamble = [
    title ? `# ${title}` : "",
    canonical ? `Source: ${canonical}` : "",
  ].filter(Boolean);
  const markdown = `${preamble.join("\n\n")}\n\n${body}\n`;

  const headers = new Headers(response.headers);
  headers.set("content-type", "text/markdown; charset=utf-8");
  headers.set("vary", appendVary(headers.get("vary"), "Accept"));
  headers.set("x-markdown-tokens", String(estimateTokens(markdown)));
  headers.set("x-original-tokens", String(estimateTokens(html)));
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.delete("etag");

  return new Response(markdown, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function estimateTokens(value) {
  return Math.max(1, Math.ceil(value.length / 4));
}

function appendVary(value, header) {
  const fields = (value || "")
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean);

  if (!fields.some((field) => field.toLowerCase() === header.toLowerCase())) {
    fields.push(header);
  }

  return fields.join(", ");
}
