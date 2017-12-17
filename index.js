const xs = require('xstream').default
const adapt = require('@cycle/run/lib/adapt').adapt

function makeServiceWorkerEventDriver () {

  self.addEventListener('install', function(evt) {
    evt.waitUntil(self.skipWaiting())
  })

  self.addEventListener('activate', function(evt) {
    evt.waitUntil(self.clients.claim())
  })

  function ServiceWorkerEventDriver (message$, name = 'SWE') {

    message$.addListener({
      next: message => {
        self.clients.matchAll().then(clients => {
          clients.map(client => {
            return client.postMessage(message)
          })
        })
      },
      error: () => {},
      complete: () => {}
    })

    const source = {
      events: function events (eventtype) {
        switch ( eventtype ) {
          case 'message':
          case 'fetch':
            return xs.create({
              next: null,
              start: listener => {
                self.addEventListener(eventtype, function (evt) {
                  listener.next(evt)
                })
              },
              stop: () => {}
            })
            break
        }
      }
    }
    return adapt(source)
  }
  return ServiceWorkerEventDriver
}


function makeServiceWorkerMessageDriver (sw) {

  function ServiceWorkerMessageDriver (message$, name = 'SWM') {

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(sw)
   
      message$.addListener({
        next: message => {
          if ( navigator.serviceWorker.controller ) {
            navigator.serviceWorker.controller.postMessage(message)
          }
        },
        error: () => {},
        complete: () => {}
      })

      return xs.create({
        next: null,
        start: listener => {
          navigator.serviceWorker.addEventListener('message', function (evt) {
            listener.next(evt)
          })
        },
        stop: () => {}
      })
    }
  }
  return ServiceWorkerMessageDriver
}

exports.makeServiceWorkerEventDriver = makeServiceWorkerEventDriver
exports.makeServiceWorkerMessageDriver = makeServiceWorkerMessageDriver
