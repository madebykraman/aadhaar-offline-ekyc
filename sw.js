const CACHE='ekyc-viewer-v12';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./sw.js','./icon.svg'];

self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())
));

self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));

self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  // HTML is network-first so a newly deployed app is not held behind an old shell.
  const networkFirst=event.request.mode==='navigate'||url.pathname.endsWith('/')||url.pathname.endsWith('/index.html');
  event.respondWith(networkFirst
    ? fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response}).catch(()=>caches.match(event.request).then(cached=>cached||new Response('Offline',{status:503,headers:{'Content-Type':'text/plain'}})))
    : caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response}))
  );
});
