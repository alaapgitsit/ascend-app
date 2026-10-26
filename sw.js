const C='ascend-v3';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).catch(()=>{}));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  const isDoc=e.request.mode==='navigate'||url.pathname.endsWith('/')||url.pathname.endsWith('index.html');
  if(isDoc){
    // Network-first for the page: new deploys show up immediately; fall back to cache offline.
    e.respondWith(fetch(e.request).then(resp=>{const cp=resp.clone();caches.open(C).then(c=>c.put('index.html',cp));return resp;}).catch(()=>caches.match('index.html').then(r=>r||caches.match('./'))));
    return;
  }
  // Cache-first for static assets, refreshed in the background.
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{try{const cp=resp.clone();caches.open(C).then(c=>c.put(e.request,cp));}catch(_){}return resp;}).catch(()=>caches.match('index.html'))));
});
