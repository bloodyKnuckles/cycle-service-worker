const run = require('@cycle/run').run
const xs = require('xstream').default
const makeServiceWorkerEventDriver = require('../../').makeServiceWorkerEventDriver

function main (sources) {

  const nav$ = sources.SWE.events('fetch')
    .map(evt => {
      switch ( evt.request.url ) {
        case 'http://localhost:9966/example/public/index.html':
          evt.respondWith(fetch(evt.request))
          break
        case 'http://localhost:9966/example/public/test.html':
          evt.respondWith(new Response('<a href="index.html">Back home</a>', {
            headers: {'Content-Type': 'text/html'}
          }))
          break
      }
    })
  const message$ = xs.periodic(1000).take(3).map(inc => 'send message ' + inc)
  const incmsg$ = sources.SWE.events('message')
    .map(evt => 'message received from main: ' + evt.data)
 
  return {
    nav: nav$,
    SWE: message$,
    log: incmsg$
  }
}

run(main, {
  nav: fetch$ => { fetch$.addListener({}) },
  SWE: makeServiceWorkerEventDriver(),
  log: msg$ => { msg$.addListener({next: msg => console.log(msg)}) }
})
