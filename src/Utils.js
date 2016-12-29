export function timeout (interval = 0) {
  return new Promise(resolve => setTimeout(resolve, interval))
}
