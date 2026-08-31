const CACHE='ekyc-viewer-v7';
const ASSETS=['./','./index.html','./manifest.webmanifest','./sw.js','./icon.svg'];

async function patchHTML(response){
  if(!response || !response.ok) return response;
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html')) return response;
  let html=await response.text();
  html=html.replace('const t=(k2|2)>>>0;const keyByte=(Math.imul(t,(t^1)>>>0)>>>8)&255;','const t=((k2&0xffff)|3)>>>0;const keyByte=((t*(t^1))>>>8)&255;');
  html=html.replace('const expected=(flags&8)?((u16(bytes,lp+6)>>>8)&255):((crc>>>24)&255);','const expected=(flags&8)?((u16(bytes,lp+10)>>>8)&255):((crc>>>24)&255);');
  return new Response(html,{status:response.status,statusText:response.statusText,headers:{'Content-Type':'text/html;charset=UTF-8'}});
}

self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    const source=cached||await fetch(event.request);
    return patchHTML(source);
  })());
});
