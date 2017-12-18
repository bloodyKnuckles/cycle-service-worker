# cycle-service-worker

Run a separate [Cycle.js](https://cycle.js.org/) app in a service worker and open a message channel between it and the app in the main thread. See [example](https://github.com/bloodyKnuckles/cycle-service-worker/tree/master/example).

## use

__client.js__
```
const run = require('@cycle/run').run
const xs = require('xstream').default
const makeDOMDriver = require('@cycle/dom').makeDOMDriver
const div = require('@cycle/dom').div
const makeServiceWorkerMessageDriver = require('cycle-service-worker').makeServiceWorkerMessageDriver

function main (sources) {

  const vdom$ = xs.of(div([div('app'), div('#section')]))
  const log$ = sources.SWM
    .map(msg => 'message received: ' + msg.data)

  return {
    DOM: vdom$,
    SWM: xs.empty(),
    log: log$
  }
}

run(main, {
  DOM: makeDOMDriver('#main'),
  SWM: makeServiceWorkerMessageDriver('./service-worker.js'),
  log: msg$ => { msg$.addListener({next: msg => console.log(msg)}) }
})
```


__service-worker.js__
```
const run = require('@cycle/run').run
const xs = require('xstream').default
const makeServiceWorkerEventDriver = require('cycle-service-worker').makeServiceWorkerEventDriver

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
```

##run example
```
git clone https://github.com/bloodyKnuckles/cycle-service-worker.git
cd cycle-service-worker
npm install
npm run-script beefy
```
Now open [localhost:9966/example/public/index.html](http://localhost:9966/example/public/index.html), and open the console.
