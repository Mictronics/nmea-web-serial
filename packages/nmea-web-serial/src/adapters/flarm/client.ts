import type { NmeaClientOptions } from '../../core/client'
import type { FlarmData, StoredPackets } from './types'
import { NmeaClient } from '../../core/client'
import { createFlarmNmeaMachine } from './adapter'

export class FlarmNmeaClient extends NmeaClient<FlarmData, StoredPackets> {
  constructor(options?: NmeaClientOptions<FlarmData>) {
    const machine = createFlarmNmeaMachine()
    super(machine, {
      enableLogging: options?.enableLogging,
      baudRate: options?.baudRate,
      onData: options?.onData,
      onStateChange: options?.onStateChange,
      onError: options?.onError,
    })
  }
}
