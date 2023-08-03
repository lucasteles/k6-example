import { JSONValue } from 'k6'
import type { RefinedResponse, ResponseType } from 'k6/http'
import type { Trend } from 'k6/metrics'

export const getTimestamp = (): string => {
  const date = new Date()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0')

  return `${hours}:${minutes}:${seconds}.${milliseconds}`
}

export const logger = {
  info(...val: unknown[]): void {
    console.log(getTimestamp(), ...val)
  },
  warn(...val: unknown[]): void {
    console.warn(getTimestamp(), ...val)
  },
  error(...val: unknown[]): void {
    console.error(getTimestamp(), ...val)
  },
}

export const logWaitingTime = ({
  metric,
  response,
  messageType,
}: {
  metric: Trend
  response: RefinedResponse<ResponseType | undefined>
  messageType: string
}): void => {
  const responseTimeThreshold = 5000
  let correlationId: JSONValue = ''
  const responseTime = response.timings.waiting
  try {
    const json = response.json()
    if (json && typeof json === 'object' && 'correlationId' in json)
      correlationId = json.correlationId
  } catch (err) { /* noop */ }

  // Log any responses that far longer than expected so we can troubleshoot those particular queries
  if (responseTime > responseTimeThreshold) {
    logger.warn(
      `${messageType} with correlationId '${correlationId}' took longer than ${responseTimeThreshold}`
    )
  }
  metric.add(responseTime)
}