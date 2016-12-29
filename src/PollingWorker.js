import {
  spawn,
  timeout,
  GenEvent
} from 'liquid'
import * as Fetcher from './Fetcher'
import {
  SUBSCRIPTION_POLL_INTERVAL
} from './Config'

export function start (formula, pollingEventPID) {
  const [, pid] = spawn(async (receive, self) => {
    console.log('+ POLL WORKER NEW', formula.get('url'))

    Fetcher.goGet(formula, self)

    let content = null

    while (true) {
      const [command, ...args] = await receive()
      switch (command) {
        case 'parent:exit': {
          console.log('- POLL WORKER EXIT', formula.get('url'))
          return
        }

        case 'parent:reemit': {
          if (content) {
            console.log('< POLL WORKER REEMIT', formula.get('url'))
            GenEvent.notify(pollingEventPID, [formula, content])
          }
          break
        }

        case 'Fetcher:fetched': {
          [content] = args

          console.log('< POLL WORKER EMIT', formula.get('url'))
          GenEvent.notify(pollingEventPID, [formula, content])

          reFetch(formula, self)

          break
        }
      }
    }
  })

  return pid
}

async function reFetch (formula, workerPID) {
  await timeout(
    formula.get('interval', SUBSCRIPTION_POLL_INTERVAL) | 0
  )
  Fetcher.goGet(formula, workerPID)
}
