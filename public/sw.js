
Copiar

const CACHE_NAME = 'minhafirma-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];
 
// Instalar e cachear assets principais
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});
 
// Ativar e limpar caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
 
// Estratégia: Network First, fallback para cache
self.addEventListener('fetch', e => {
  // Não cachear chamadas de API
  if(e.request.url.includes('/api/') || 
     e.request.url.includes('supabase') ||
     e.request.url.includes('anthropic')) {
    return;
  }
 
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cachear resposta bem-sucedida
        if(res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
