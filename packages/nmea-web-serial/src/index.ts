/**
 * @packageDocumentation
 * @categoryDescription Core
 * NMEA Web Serial API -- This description is added with the `@categoryDescription` tag
 * on the entry point in src/index.ts
 *
 * @document documents/examples.md
 */

// FLARM adapter (convenience for FLARM use cases)
export {
  createFlarmNmeaMachine,
  type FlarmData,
  FlarmNmeaClient,
} from './adapters/flarm'

// Navigation adapter (convenience for navigation-focused use cases)
export {
  createNavigationNmeaMachine,
  type NavigationData,
  NavigationNmeaClient,
  type StoredPackets,
} from './adapters/navigation'

// Core machine functionality (for custom adapters)
export {
  createNmeaMachine,
  NmeaClient,
  type NmeaClientOptions,
  type NmeaMachineActor,
  type NmeaMachineConfig,
} from './core'

// Parser
export {
  parseNmeaSentence,
  parseUnsafeNmeaSentence,
  type UnsafeAndCustomPackets,
} from './parser'
