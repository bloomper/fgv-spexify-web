/**
 * The MusicXML text of a score file: a compressed one's (.mxl, a zip) root file, as META-INF/container.xml names it,
 * else its first .xml or .musicxml outside META-INF; any other file as UTF-8 text. Browser only: it inflates with
 * DecompressionStream.
 */
export async function scoreText(bytes: ArrayBuffer): Promise<string> {
  const data = new Uint8Array(bytes);

  if (data.length < 4 || data[0] !== 0x50 || data[1] !== 0x4b) {
    return new TextDecoder().decode(data);
  }

  const entries = zipEntries(data);
  const container = entries.get("META-INF/container.xml");
  let root: string | null = null;

  if (container) {
    const xml = new DOMParser().parseFromString(await inflate(data, container), "application/xml");

    root = xml.querySelector("rootfile")?.getAttribute("full-path") ?? null;
  }
  if (!root || !entries.has(root)) {
    root = [...entries.keys()].find((name) => !name.startsWith("META-INF/") && /\.(xml|musicxml)$/i.test(name)) ?? null;
  }
  if (!root) {
    throw new Error("No score in the compressed MusicXML");
  }
  return inflate(data, entries.get(root) as ZipEntry);
}

type ZipEntry = { method: number; offset: number; size: number };

/**
 * The entries of a zip by name, from its central directory.
 */
export function zipEntries(data: Uint8Array): Map<string, ZipEntry> {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const entries = new Map<string, ZipEntry>();
  let end = -1;

  for (let i = data.length - 22; i >= Math.max(0, data.length - 65_557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) {
    throw new Error("Not a zip file");
  }

  const count = view.getUint16(end + 10, true);
  let p = view.getUint32(end + 16, true);

  for (let i = 0; i < count && p + 46 <= data.length; i++) {
    if (view.getUint32(p, true) !== 0x02014b50) {
      break;
    }

    const method = view.getUint16(p + 10, true);
    const size = view.getUint32(p + 20, true);
    const nameLength = view.getUint16(p + 28, true);
    const extraLength = view.getUint16(p + 30, true);
    const commentLength = view.getUint16(p + 32, true);
    const local = view.getUint32(p + 42, true);
    const name = new TextDecoder().decode(data.subarray(p + 46, p + 46 + nameLength));
    const offset = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);

    entries.set(name, { method, offset, size });
    p += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

async function inflate(data: Uint8Array, entry: ZipEntry): Promise<string> {
  const raw = data.slice(entry.offset, entry.offset + entry.size);

  if (entry.method === 0) {
    return new TextDecoder().decode(raw);
  }
  if (entry.method !== 8) {
    throw new Error(`Unsupported compression ${entry.method}`);
  }

  const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"));

  return new Response(stream).text();
}
