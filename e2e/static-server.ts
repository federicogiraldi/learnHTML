import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

/**
 * Serves a copy of dist/ under /learnHTML/, reading files on every request (unlike `vite preview`), so a test can
 * change the deployed files — e.g. publish a new service worker — while the page is open.
 */
export async function serveDistCopy() {
  const root = await mkdtemp(join(tmpdir(), 'learnhtml-e2e-'));
  await cp('dist', root, { recursive: true });
  const server = createServer(async (req, res) => {
    const path = new URL(req.url ?? '/', 'http://x').pathname;
    if (!path.startsWith('/learnHTML/')) return void res.writeHead(404).end();
    const rel = normalize(path.slice('/learnHTML/'.length) || 'index.html').replace(/^(\.\.[/\\])+/, '');
    try {
      const body = await readFile(join(root, rel));
      res.writeHead(200, { 'content-type': TYPES[extname(rel)] ?? 'application/octet-stream', 'cache-control': 'no-cache' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, 'localhost', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://localhost:${port}/learnHTML/`,
    root,
    async close() {
      await new Promise((resolve) => server.close(resolve));
      await rm(root, { recursive: true, force: true });
    },
  };
}
