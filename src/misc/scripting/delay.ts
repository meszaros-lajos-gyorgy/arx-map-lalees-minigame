let delayOffset = 0
let delayIdx = 0

export const delay = (delayInMs: number) => {
  return `TIMERdelay${++delayIdx} -m 1 ${delayInMs}`
}

export const delayAdd = (delayInMs: number) => {
  delayOffset += delayInMs
  return delay(delayOffset)
}

export const resetDelay = () => {
  delayOffset = 0
}
