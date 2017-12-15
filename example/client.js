const run = require('@cycle/run').run
const makeDOMDriver = require('@cycle/dom').makeDOMDriver
const makeServiceWorkerMessageDriver = require('../').makeServiceWorkerMessageDriver

const main = require('./main')

run(main, {
  DOM: makeDOMDriver('#main'),
  SWM: makeServiceWorkerMessageDriver('./sw.js'), // /public/service-worker.js')
  log: msg$ => { msg$.addListener({next: msg => console.log(msg)}) }
})

