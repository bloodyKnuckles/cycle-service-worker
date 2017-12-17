# cycle-service-worker

Run a separate [Cycle.js](https://cycle.js.org/) app in a service worker and open a message channel between it and the app in the main thread.

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
const xs = require('xstream').default
const makeServiceWorkerEventDriver = require('../../').makeServiceWorkerEventDriver

function main (sources) {

  const incmsg$ = sources.SWE.events('message')
    .map(evt => 'message received: ' + evt.data)

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
