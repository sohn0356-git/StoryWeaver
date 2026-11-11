import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const assets=(await readdir('dist/assets')).filter(f=>/\.(js|css)$/.test(f)).map(f=>`/assets/${f}`);
const version=createHash('sha256').update(assets.join('|')).digest('hex').slice(0,12);
const source=await readFile('public/sw.js','utf8');
await writeFile('dist/sw.js',source.replace("const CACHE='storyweaver-v1';",`const CACHE='storyweaver-${version}';`).replace("['/','/icon.svg','/manifest.webmanifest']",JSON.stringify(['/','/icon.svg','/manifest.webmanifest','/icon-192.png','/icon-512.png',...assets])));
console.log(`PWA: precached ${assets.length} app assets (${version})`);
