import {spawn, timeout} from 'liquid'

const {stdout} = process

const Banner = (async () => {
  stdout.write('\n\n\n')
  for (let letter of [
    'Night gathers, and now my watch begins.',
    'It shall not end until my death.',
    'I shall take no wife, hold no lands, father no children.',
    'I shall wear no crowns and win no glory.',
    'I shall live and die at my post.',
    'I am the sword in the darkness.',
    'I am the watcher on the walls.',
    'I am the fire that burns against the cold,',
    'the light that brings the dawn,',
    'the horn that wakes the sleepers,',
    'the shield that guards the realms of men.',
    'I pledge my life and honor to the Night\'s Watch,',
    'for this night and all the nights to come.'
  ].join('\n').split('')) {
    await timeout(1000 / 120)
    if (letter === '\n') {
      await timeout(300)
    }
    stdout.write(letter)
  }
  stdout.write('\n\n\n')
  resolve()
})()

export default Banner
