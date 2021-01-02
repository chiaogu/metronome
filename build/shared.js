import { promises as fs } from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const DIST_PATH = path.join(__dirname, '..', 'dist');
export const SRC_PATH = path.join(__dirname, '..', 'src');
export const buildOptions = {
  entryPoints: [path.join(SRC_PATH, 'index.tsx')],
  outfile: path.join(DIST_PATH, 'index.js'),
  inject: [path.join(__dirname, './jsx-shim.js')],
  define: {
    'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
  },
  jsxFactory: 'h',
  jsxFragment: 'Fragment',
  format: 'esm',
  bundle: true,
}

export async function prebuild() {
  await fs.rmdir(DIST_PATH, { recursive: true });
  await fs.mkdir(DIST_PATH);
  await fs.copyFile(
    path.join(SRC_PATH, 'index.html'),
    path.join(DIST_PATH, 'index.html')
  );
}