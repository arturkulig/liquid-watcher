import {
  Process,
  spawn,
  send
} from 'liquid'
import * as Polling from './Polling'
import * as UpdatingWorker from './UpdatingWorker'
import * as Subscriptions from './Subscriptions'
import {Map} from 'immutable'

const __MODULE__ = 'Updating'

export function start () {
  return spawn(async (receive, self) => {
    let connectionWorkers = Map()

    Subscriptions.addHandler(async ([event, connection, formula]) => {
      switch (event) {
        case 'newsub': {
          if (!connectionWorkers.get(connection)) {
            const [
              newConnectionWorkerOK,
              newConnectionWorkerPID
            ] = UpdatingWorker.start(connection)
            if (!newConnectionWorkerOK) {
              throw new Error(
                'Cannot run connection worker',
                newConnectionWorkerPID
              )
            }
            connectionWorkers =
              connectionWorkers.set(
                connection,
                newConnectionWorkerPID
              )
            await Process.link(newConnectionWorkerPID, self)
            await Process.link(self, newConnectionWorkerPID)
          }
          await send(
            connectionWorkers.get(connection),
            ['newsub', formula]
          )
          break
        }

        case 'unsub': {
          await send(connectionWorkers.get(connection), ['unsub', formula])
          break
        }

        case 'drop': {
          await Process.unlink(connectionWorkers.get(connection), self)
          await Process.unlink(self, connectionWorkers.get(connection))
          await send(connectionWorkers.get(connection), ['exit', formula])
          connectionWorkers = connectionWorkers.delete(connection)
          break
        }
      }
    })

    Polling.addHandler(([formula, newContent]) => {
      connectionWorkers.map(
        worker => send(worker, ['fetched', formula, newContent])
      )
    })

    await receive()
  }, __MODULE__)
}

