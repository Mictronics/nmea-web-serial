/*
 * PFLAU – Heartbeat, status, and basic alarms
 *
 *        1    2    3     4       5            6                 7           8                  9                   10
 *        |    |    |     |       |            |                 |           |                  |                   |
 * PFLAU,<RX>,<TX>,<GPS>,<Power>,<AlarmLevel>,<RelativeBearing>,<AlarmType>,<RelativeVertical>,<RelativeDistance>[,<ID>]
 *
 * Field Number:
 *  1. Number of devices with unique IDs currently received regardless of the horizontal or vertical separation. 0-99
 *  2. Transmission status:
 *      1 for OK
 *      0 for no transmission.
 *  3. GPS status:
 *      0 = no GPS reception
 *      1 = 3d-fix on ground, i.e. not airborne
 *      2 = 3d-fix when airborne
 *  4. Power status:
 *      1 for OK
 *      0 for under- or over-voltage.
 *  5. Alarm level as assessed by FLARM:
 *      0 = no alarm (also used for no-alarm traffic information)
 *      1 = aircraft or obstacle alarm, 15-20 seconds to impact, Alert Zone alarm, or traffic advisory (<AlarmType> = 4)
 *      2 = aircraft or obstacle alarm, 10-15 seconds to impact
 *      3 = aircraft or obstacle alarm, 0-10 seconds to impact
 *  6. Relative bearing in degrees from true ground track to the intruder’s position. -180 - 180
 *  7.  Type of alarm as assessed by FLARM:
 *      0 = no aircraft within range or no-alarm traffic information
 *      2 = aircraft alarm
 *      3 = obstacle/Alert Zone alarm (if data port version < 7, otherwise only obstacle alarms are indicated by <AlarmType> = 3)
 *      4 = traffic advisory (sent once each time an aircraft enters within distance 1.5 km and vertical distance 300 m from own ship; when data port version >=4)
 *  8. Relative vertical separation in meters above own position. -32768 to 32767
 *  9. Relative horizontal distance in meters to the target or obstacle. 0 to 2147483647
 *  10. 6-digit hexadecimal value (e.g. “5A77B1”) as configured in the target’s PFLAC,,ID.
 */

import type { PacketStub } from 'nmea-simple/dist/codecs/PacketStub'
import { initStubFields } from 'nmea-simple/dist/codecs/PacketStub'

export const sentenceId = 'FLAU' as const
export const sentenceName = 'Heartbeat, status, and basic alarms' as const

export interface FLAUPacket extends PacketStub<typeof sentenceId> {
  gpsStatus: number
  powerStatus: number
  rxDevices: number
  txDevices: number
  alarmLevel: number
  alarmType: number
  relativeBearing: number
  relativeVertical: number
  relativeDistance: number
  id: number
}

export function decodeSentence(stub: PacketStub, fields: string[]): FLAUPacket {
  return {
    ...initStubFields(stub, sentenceId, sentenceName),
    gpsStatus: Number.parseInt(fields[3] ?? '0', 10),
    powerStatus: Number.parseInt(fields[4] ?? '0', 10),
    rxDevices: Number.parseInt(fields[1] ?? '0', 10),
    txDevices: Number.parseInt(fields[2] ?? '0', 10),
    alarmLevel: Number.parseInt(fields[5] ?? '0', 10),
    alarmType: Number.parseInt(fields[7] ?? '0', 10),
    relativeBearing: fields[6] === '' ? 0 : Number.parseInt(fields[6] ?? '0', 10),
    relativeVertical: fields[8] === '' ? 0 : Number.parseInt(fields[8] ?? '0', 10),
    relativeDistance: fields[9] === '' ? 0 : Number.parseInt(fields[9] ?? '0', 10),
    id: Number.parseInt(fields[1] ?? '0', 16),
  }
}
