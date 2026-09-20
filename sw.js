// Gym Road Trip service worker.
// Shell is cached so the app opens with no signal; gym lookups always hit the network.
var CACHE = 'grt-v1';
var SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      // no-store: a plain fetch can be satisfied by the HTTP cache after a real deploy
      return Promise.all(SHELL.map(function(u){
        return fetch(u, {cache:'no-store'}).then(function(r){
          if(r.ok) return c.put(u, r);
        }).catch(function(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; })
                            .map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var url = new URL(e.request.url);
  if(e.request.method !== 'GET') return;
  // Never cache gym/geocode lookups - stale results would be worse than none.
  if(url.hostname.indexOf('overpass') > -1 || url.hostname.indexOf('nominatim') > -1) return;
  if(url.origin !== location.origin) return;

  e.respondWith(
    fetch(e.request).then(function(r){
      var copy = r.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); }).catch(function(){});
      return r;
    }).catch(function(){ return caches.match(e.request); })
  );
});
