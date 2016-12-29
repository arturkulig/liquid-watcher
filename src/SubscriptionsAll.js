import {
  GenEvent
} from 'liquid'
import * as Subscriptions from './Subscriptions'
import {Map, Set} from 'immutable'

const __MODULE__ = 'SubscriptionsAll'

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

  Subscriptions.addHandler(event => {
    const [cmd, ...args] = event
    switch (cmd) {
      case 'newsub': {
        const [connection, formula] = args
        formulas =
          formulas
          .set(
            formula,
            formulas
            .get(formula, Set())
            .add(connection)
          )
        notify(formulas)
        break
      }

      case 'unsub': {
        const [connection, formula] = args
        formulas =
          formulas
          .set(
            formula,
            formulas
            .get(formula, Set())
            .remove(connection)
          )
          .filter(
            connections => !!connections.count()
          )
        notify(formulas)
        break
      }

      case 'drop': {
        const [connection] = args
        formulas =
          formulas
          .map(
            connections => connections.remove(connection)
          )
          .filter(
            connections => !!connections.count()
          )
        notify(formulas)
        break
      }
    }

  })

  return [true, __MODULE__]
}

