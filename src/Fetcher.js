import {
  spawn,
  send,
  timeout
} from 'liquid'
import fetch from 'node-fetch'
import {MAX_FAILED_FETCH_INTERVAL} from './Config'

const __MODULE__ = 'Fetcher'

export function start () {
  const [ok] = spawn(
    async (receive) => {
      while (true) {
        const [formula, receiverPID, trial] = await receive()

        const {url, ...opts} = formula.toJS()

        const [fetched, response] = await failFreeCall(() => fetch(url, opts))
        if (!fetched || response.status >= 400) {
          retryLater(formula, receiverPID, trial + 1)
          continue
        }

        const [ok, content] = await failFreeCall(() => response.text())
        if (!ok || !content) {
          retryLater(formula, receiverPID, trial + 1)
          continue
        }

        console.log('< Fetcher HTTP', response.status, opts.method || 'GET', url)
        await send(receiverPID, ['Fetcher:fetched', content])
      }
    },
    __MODULE__
  )

  if (!ok) {
    return [false, `${__MODULE__}.start could not run process`]
  }

  return [true, __MODULE__]
}

async function retryLater (formula, receiverPID, trial) {
  const nextTrialTimeout = Math.min(MAX_FAILED_FETCH_INTERVAL, Math.pow(2, trial))
  console.log(`  ${__MODULE__} HTTP FAIL`, formula.get('url'), 'RETRY IN', nextTrialTimeout)

  await timeout(nextTrialTimeout)
  await goGet(formula, receiverPID, trial)
}

export async function goGet (formula, receiverPID, trial = 0) {
  await send(__MODULE__, [formula, receiverPID, trial])
}

async function failFreeCall (f) {
  try {
    const result = await f.apply(null)
    return [true, result]
  } catch (e) {
    return [false, e]
  }
}

