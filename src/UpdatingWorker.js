import {
  spawn,
  timeout
} from 'liquid'
import {TARGET_USER_UPDATE_INTERVAL} from './Config'
import {Map} from 'immutable'

export function start (connection) {
  return spawn(async (receive) => {
    let lastClientNotification = Date.now()
    let contents = Map()

    while (true) {
      const [command, ...args] = await receive()
      switch (command) {
        case 'exit': return
        case 'unsub': {
          const [formula] = args
          contents = contents.remove(formula)
          break
        }
        case 'newsub': {
          const [formula] = args
          contents = contents.set(formula, null)
          break
        }
        case 'fetched': {
          const [formula, content] = args
          if (contents.has(formula) && contents.get(formula) !== content) {
            contents = contents.set(formula, content)

            connection.emit('content', {formula: formula.toJS(), content})

            console.log(
              '> SOCKET',
              connection.id,
              formula.get('url'),
              content
                .substr(0, 32)
                .replace(/\r/g, '')
                .replace(/\n/g, '')
            )

            const silenceEnd =
              timeout(
                Math.min(
                  TARGET_USER_UPDATE_INTERVAL,
                  (Date.now() - lastClientNotification) / 2
                )
              )
            lastClientNotification = Date.now()
            await silenceEnd
          }
          break
        }
      }
    }
  })
}
