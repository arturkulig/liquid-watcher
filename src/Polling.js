import {spawn, send} from 'liquid'
import * as SubscriptionsAll from './SubscriptionsAll'
import * as PollingWorker from './PollingWorker'
import {Map, Set} from 'immutable'

const __MODULE__ = 'POLLING'

export function addHandler (handler) {
  GenEvent.addHandler(__MODULE__, handler)
}

export function start () {
  let ok, reason

  [ok, reason] = GenEvent.start(__MODULE__)

  if (!ok) {
    return [false, reason]
  }

  let formulas = null
  let currentFormulasWorkers = Map()
  SubscriptionsAll.addHandler(async connectionsByFormulas => {
    console.log('> POLLING SUBS')

    const nextFormulas = keysOfSet(connectionsByFormulas)

    const nextFormulasWorkers = nextFormulas
      .reduce(
        (result, item) => result.set(item, item),
        Map()
      )
      .map(
        formula => (
          currentFormulasWorkers.get(formula) ||
          PollingWorker.start(formula, __MODULE__)
        )
      )

    await quitWorkers(
      pick(
        currentFormulasWorkers,
        subtractSets(formulas, nextFormulas)
      )
    )

    await reemitWorkers(nextFormulasWorkers)

    console.log('  POLLING', nextFormulas.count(), 'workers')

    formulas = nextFormulas
    currentFormulasWorkers = nextFormulasWorkers
  })

  return [true, __MODULE__]
}

function keysOfSet (collection) {
  return collection.keySeq().toSet()
}

function pick (collection, keys) {
  return collection.filter(
    (item, key) => keys.includes(key)
  )
}

async function quitWorkers (workers) {
  await Promise.all(
    workers.toArray().map(quitWorker)
  )
}

async function quitWorker (worker) {
  await send(worker, ['parent:exit'])
}

async function reemitWorkers (workers) {
  await Promise.all(
    workers.toArray().map(reemitWorker)
  )
}

async function reemitWorker (worker) {
  await send(worker, ['parent:reemit'])
}

function subtractSets (collection, toRemove) {
  return (collection || Set()).filter(
    formula => !toRemove.includes(formula)
  )
}
