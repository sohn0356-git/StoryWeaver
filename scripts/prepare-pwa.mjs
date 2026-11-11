import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base=process.env.VITE_BASE_PATH||'/';
const assets=(await readdir('dist/assets')).filter(f=>/\.(js|css)$/.test(f)).map(f=>`${base}assets/${f}`);
const files=[base,...['icon.svg','manifest.webmanifest','icon-192.png','icon-512.png'].map(f=>`${base}${f}`),...assets];
const version=createHash('sha256').update(await readFile('public/sw.js')).update(await readFile('dist/index.html')).update(assets.join('|')).digest('hex').slice(0,12);
const source=await readFile('public/sw.js','utf8');
await writeFile('dist/sw.js',source.replace("const CACHE='storyweaver-v1';",`const CACHE='storyweaver-${version}';`).replace("['./','./icon.svg','./manifest.webmanifest']",JSON.stringify(files)));
console.log(`PWA: precached ${assets.length} app assets (${version})`);
