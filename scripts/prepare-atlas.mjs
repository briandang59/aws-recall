import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
const appURL = new URL('../public/app.js', import.meta.url);
let app = await readFile(appURL, 'utf8');
if (!app.includes('href="/atlas.html"')) {
  const marker = '</nav><div class="sidebar-bottom">';
  if (!app.includes(marker)) throw new Error('AWS Recall navigation marker not found');
  app = app.replace(marker, '<a class="nav-item" href="/atlas.html">${icon(\'network\')}<span>AWS Atlas · SAA-C03</span></a>' + marker);
  await writeFile(appURL, app);
}
const output = new URL('../sites/aws-atlas/dist/', import.meta.url);
await mkdir(output, { recursive: true });
for (const name of ['atlas.html', 'atlas.css', 'atlas.js', 'atlas-data.js', 'atlas-theme.js', 'atlas-map.js', 'atlas-map-data.js', 'atlas-enhancements.css', 'fonts.css', 'favicon.svg']) {
  await copyFile(new URL(`../public/${name}`, import.meta.url), new URL(name === 'atlas.html' ? 'index.html' : name, output));
}
console.log('Atlas static output synchronized: sites/aws-atlas/dist/');
