/* global io */

window.socket = io('http://localhost:8765')

console.log('socket', window.socket.id)

window.addEventListener('load', () => {
  window.socket.emit('subscribe', { url: 'http://localhost:8080/index.html' })
  // create debug info displaying node
  const debugElement = document.createElement('PRE')
  // mount node onto document
  window.document.body.appendChild(debugElement)
  // update it with fresh newResources
  window.socket.on(
    'content',
    ({ content }) => {
      console.log('update')
      debugElement.innerText = content
    }
  )
})
