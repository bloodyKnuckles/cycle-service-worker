const xs = require('xstream').default
const div = require('@cycle/dom').div

function main (sources) {

  const vdom$ = xs.of(div([div('app'), div('#section')]))
  const message$ = xs.of('hey')
  const log$ = sources.SWM
    .map(msg => 'message received from sw: ' + msg.data)

  return {
    DOM: vdom$,
    SWM: message$,
    log: log$
  }
}

module.exports = main
