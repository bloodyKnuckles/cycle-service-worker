const xs = require('xstream').default
const div = require('@cycle/dom').div

module.exports = (sources)  => {
  const vdom$ = xs.of(div([div('app'), div('#section')]))
  const log$ = sources.SWM
    .map(msg => 'message received: ' + msg.data)

  return {
    DOM: vdom$,
    SWM: xs.empty(),
    log: log$
  }
}
