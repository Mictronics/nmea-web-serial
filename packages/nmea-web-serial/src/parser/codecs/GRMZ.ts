/*
 * PGRMZ – Garmin's barometric altitude
 *
 *        1      2 3
 *        |      | |
 * PGRMZ,<Value>,F,2
 *
 * Field Number:
 *  1. Gives the barometric altitude in feet (1 ft = 0.3048 m) and can be negative.
 *  2. Unit F = feet
 *  3. GPS position fix
 *      0 = no fix
 *      2 = 2d-fix
 *      3 = 3d-fix
 */

import type { PacketStub } from 'nmea-simple/dist/codecs/PacketStub'
import { initStubFields } from 'nmea-simple/dist/codecs/PacketStub'

export const sentenceId = 'GRMZ' as const
export const sentenceName = 'Garmin barometric altitude' as const

export type GRMZFixType = 'none' | 'unknown' | '2D' | '3D'
const FixTypes: GRMZFixType[] = ['none', 'unknown', '2D', '3D']

export interface GRMZPacket extends PacketStub<typeof sentenceId> {
  altitude: number
  unit: string
  fixMode: GRMZFixType
}

export function decodeSentence(stub: PacketStub, fields: string[]): GRMZPacket {
  return {
    ...initStubFields(stub, sentenceId, sentenceName),
    altitude: Number.parseInt(fields[1] ?? '0', 10),
    fixMode: FixTypes[Number.parseInt(fields[3] ?? '1', 10)] ?? 'unknown',
    unit: fields[2] ?? 'F',
  }
}
