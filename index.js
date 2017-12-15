const xs = require('xstream').default
const adapt = require('@cycle/run/lib/adapt').adapt

function makeServiceWorkerEventDriver () {

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
          case 'intstall':
          case 'activate':
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

  installServiceWorker(sw)

  function ServiceWorkerMessageDriver (message$, name = 'SWM') {
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
  return ServiceWorkerMessageDriver
}

function installServiceWorker (sw) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(sw)
  }
}

exports.makeServiceWorkerEventDriver = makeServiceWorkerEventDriver
exports.makeServiceWorkerMessageDriver = makeServiceWorkerMessageDriver
exports.installServiceWorker = installServiceWorker
