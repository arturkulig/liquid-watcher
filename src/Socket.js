import socketio from 'socket.io'
import {WS_PORT} from './Config'

const socket = socketio(WS_PORT)
console.log('Socket listening on', WS_PORT)

export default socket
