//Files to cache
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/icons/icon-512x512.png",
  "/icons/icon-192x192.png",
  "./manifest.webmanifest",
];

// install
self.addEventListener("install", function (evt) {
    // pre cache image data
    
      
    // pre cache all static assets
    evt.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );

    // tell the browser to activate this service worker immediately once it
    // has finished installing
    self.skipWaiting();
  });


  // evt.waitUntil(
  //   caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/images"))
  //   );

  // self.addEventListener("activate", function(evt) {
  //   evt.waitUntil(
  //     caches.keys().then(keyList => {
  //       return Promise.all(
  //         keyList.map(key => {
  //           if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
  //             console.log("Removing old cache data", key);
  //             return caches.delete(key);
  //           }
  //         })
  //       );
  //     })
  //   );

  //   self.clients.claim();
  // });

  self.addEventListener('fetch', function(evt) {
    if (evt.request.url.includes('/api/')) {
        console.log('[Service Worker] Fetch (data)', evt.request.url);

        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    if(response.status ===200) {
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            })
        );
        return;
    }
    evt.respondWith(

        // caches.open(CACHE_NAME).then(cache => {
        //     return cache.match(evt.request).then(response => {
        //         return response || fetch(evt.request);
        //     });
        // })
        fetch(evt.request).catch(function() {
          return caches.match(evt.request).then(function(response) {
            if (response) {
              return response;
            } else if (evt.request.headers.get("accept").includes("text/html")) {
              // return the cached home page for all requests for html pages
              return caches.match("/");
            }
          });
        })
    );
    });