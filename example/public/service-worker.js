const run = require('@cycle/run').run
const makeServiceWorkerEventDriver = require('../../').makeServiceWorkerEventDriver
const xs = require('xstream').default

function main (sources) {

  self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim())
  })

  const incmsg$ = sources.SWE.events('message')
    .map(msg => 'message received: ' + msg.data)
 
  const message$ = xs.periodic(1000).take(3).map(inc => 'send message ' + inc)

  return {
    SWE: message$,
    log: incmsg$
  }
}

run(main, {
  SWE: makeServiceWorkerEventDriver(),
  log: msg$ => { msg$.addListener({next: msg => console.log(msg)}) }
})

/*
self.addEventListener('fetch', function(event){
  console.log('Caught request for ' + event.request.url)
  switch ( event.request.url ) {
    case 'http://localhost:9966/public/index.html':
      event.respondWith(fetch(event.request))
      break
    case 'http://localhost:9966/public/test.html':
      event.respondWith(new Response('<a href="index.html">Back home</a>', {
        headers: {'Content-Type': 'text/html'}
      }))
      break
  }
})
*/
