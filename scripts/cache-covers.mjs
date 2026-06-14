import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const dataPath = new URL("../src/books.js", import.meta.url);
const coverDir = new URL("../assets/covers/", import.meta.url);

function parseBooks(source) {
  const prefix = "window.books = ";
  if (!source.startsWith(prefix)) {
    throw new Error("src/books.js must start with `window.books = `");
  }
  return JSON.parse(source.slice(prefix.length).replace(/;\s*$/, ""));
}

function remoteMediumCover(url) {
  if (!url?.startsWith("https://covers.openlibrary.org/")) return null;
  return url.replace(/-L\.jpg$/, "-M.jpg");
}

async function downloadCover(book) {
  const remote = remoteMediumCover(book.remoteCover ?? book.cover);
  if (!remote) return book;

  const filename = `${book.id}.jpg`;
  const outputUrl = new URL(filename, coverDir);
  const publicPath = `./assets/covers/${filename}`;

  if (!existsSync(outputUrl)) {
    const response = await fetch(remote);
    if (!response.ok) {
      throw new Error(`${book.title}: ${response.status} ${response.statusText}`);
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    await writeFile(outputUrl, bytes);
  }

  return {
    ...book,
    remoteCover: book.remoteCover ?? book.cover,
    cover: publicPath,
  };
}

const source = await readFile(dataPath, "utf8");
const books = parseBooks(source);
await mkdir(coverDir, { recursive: true });

const cached = [];
for (const [index, book] of books.entries()) {
  const next = book.coverStatus === "已核验" ? await downloadCover(book) : book;
  cached.push(next);
  console.log(`${index + 1}/${books.length} ${next.title}: ${next.cover ?? "fallback"}`);
  await new Promise((resolve) => setTimeout(resolve, 80));
}

await writeFile(dataPath, `window.books = ${JSON.stringify(cached, null, 2)};\n`, "utf8");
