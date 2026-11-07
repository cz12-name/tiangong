/* 天宫 service worker：
   动态内容（首页 / 版本号）永远走网络，不缓存 —— 保证固定网址能自动拿到最新版；
   静态资源（图标 / manifest）缓存优先，断网也能用。 */
var CACHE = 'tiangong-v12';
var ASSETS = ['./manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(ASSETS).catch(function () {});
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  var p = url.pathname;
  // 导航页、index.html、version.txt：随时取网络最新，不写缓存
  var dyn = req.mode === 'navigate' || p.endsWith('index.html') || p.endsWith('version.txt');
  if (dyn) {
    e.respondWith(fetch(req).catch(function () { return caches.match(req); }));
    return;
  }
  // 其余静态资源：缓存优先，离线可用
  e.respondWith(
    caches.match(req).then(function (r) {
      if (r) return r;
      return fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
        return res;
      }).catch(function () { return caches.match('./index.html'); });
    })
  );
});
