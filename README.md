# cycle-service-worker

## use

__client.js__
```
const run = require('@cycle/run').run
const xs = require('xstream').default
const makeDOMDriver = require('@cycle/dom').makeDOMDriver
const div = require('@cycle/dom').div
const makeServiceWorkerMessageDriver = require('../').makeServiceWorkerMessageDriver

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
  SWM: makeServiceWorkerMessageDriver('./sw.js'),
  log: msg$ => { msg$.addListener({next: msg => console.log(msg)}) }
})
```

__service-worker.js__
```
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
```
