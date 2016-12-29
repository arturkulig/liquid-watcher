import {
  GenEvent
} from 'liquid'
import socket from './Socket'
import {fromJS} from 'immutable'

const __MODULE__ = 'Subscriptions'

export function addHandler (handler) {
  return GenEvent.addHandler(__MODULE__, handler)
}

export function removeHandler (handler) {
  return GenEvent.removeHandler(__MODULE__, handler)
}

export function notify (handler) {
  return GenEvent.notify(__MODULE__, handler)
}

export function start () {
  const [ok] = GenEvent.start(__MODULE__)

  if (!ok) {
    return [false, `${__MODULE__}.start - cannot setup it's GenEvent`]
  }

  socket.on('connection', connection => {
    console.log('+', connection.id)

    connection.on(
      'subscribe',
      payload => {
        console.log(' ', connection.id, '+', payload.url)
        notify(['newsub', connection, fromJS(payload)])
      }
    )
    connection.on(
      'unsubscribe',
      payload => {
        console.log(' ', connection.id, '-', payload.url)
        notify(['unsub', connection, fromJS(payload)])
      }
    )
    connection.on(
      'disconnect',
      () => {
        console.log('-', connection.id)
        notify(['drop', connection])
      }
    )
  })

  return [ok, __MODULE__]
}

