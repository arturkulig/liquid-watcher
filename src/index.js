import {
  Supervisor,
  Process,
  timeout
} from 'liquid'
import * as Subscriptions from './Subscriptions'
import * as SubscriptionsAll from './SubscriptionsAll'
import * as Fetcher from './Fetcher'
import * as Polling from './Polling'
import * as Updating from './Updating'
import Banner from './Banner'

(async () => {
  await Banner

  const [ok, sv] = Supervisor.start([
    Subscriptions,
    SubscriptionsAll,
    Fetcher,
    Polling,
    Updating
  ], {
    strategy: 'one_for_rest',
    name: 'Main'
  })

  if (!ok) {
    console.error('MainLoop start fail', sv)
  }

  try {
    await Process.end(app)
    console.log('MainLoop exit', result)
  } catch (reason) {
    console.log('MainLoop error', reason)
  }
  await timeout(1000)
})()

