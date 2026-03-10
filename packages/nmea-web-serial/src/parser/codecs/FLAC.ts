/*
 * PFLAC – Device features
 *
 *        1           2                   3
 *        |           |                   |
 * PFLAC,<QueryType>,<ConfigurationItem>,<Value>
 *
 * Query Type:
 *  R = request to send content of <ConfigurationItem>; parameter <Value> should then be omitted
 *  S = request to set <ConfigurationItem> to <Value>
 *  A = FLARM answers request or setting with current content of <ConfigurationItem>
 *
 * Configuration item:
 *  HWVER    Returns hardware version of the device
 *  DEVTYPE  Returns hardware version of the device. More information than HWVER.
 *  DEVICEID Returns the device identifier
 *  SWVER    Returns the firmware version
 *  SWEXP    Returns the firmware expiration date
 *  FLARMVER Returns the bootloader version
 *  BUILD    Returns software build number
 *  SER      Returns the serial number of the device
 *  REGION   Returns the region code for the region in which the device can be used
 *  RADIOID  Returns the ID type and ID used in the FLARM radio broadcast
 *  CAP      Returns a list of features for the device
 *  OBSTDB   Returns obstacle subsystem status
 *  OBSTEXP  Returns obstacle database expiry date
 *  LIC      Returns a list of installed and not installed licenses
 *  LS       Returns a list of configuration files saved in memory
 *  TASK     Returns information about the declared task
 *
 * Feature                              CAP Information Value
 * Audio Output                         AUD
 * Alert Zone Generator                 AZN
 * Pressure Sensor                      BARO
 * Battery Compartment                  BAT
 * Second Data Port                     DP2
 * Engine Noise Level Sensor            ENL
 * Ground Station Device                GND
 * IGC Approved Recorder                IGC
 * Obstacle Database Installed          OBST
 * Antenna Diversity (Second Antenna)   RFB
 * SD Card Slot                         SD
 * Garmin TIS Protocol Support          TIS
 * Integrated User Interface            UI
 * USB Slot                             USB
 * SSR/ADS-B Module                     XPDR
 */

import type { PacketStub } from 'nmea-simple/dist/codecs/PacketStub'
import { initStubFields } from 'nmea-simple/dist/codecs/PacketStub'
import { createNmeaChecksumFooter } from '../../utils'

export const sentenceId = 'FLAC' as const
export const sentenceName = 'Device features' as const

export type FLACCapValue
  = | 'AUD'
    | 'AZN'
    | 'BARO'
    | 'BAT'
    | 'DP2'
    | 'ENL'
    | 'GND'
    | 'IGC'
    | 'OBST'
    | 'RFB'
    | 'SD'
    | 'TIS'
    | 'UI'
    | 'USB'
    | 'XPDR'

const CAP_TO_FEATURE: Record<FLACCapValue, keyof FLACFeatures> = {
  AUD: 'audio',
  AZN: 'alertZoneGenerator',
  BARO: 'pressureSensor',
  BAT: 'batteryCompartment',
  DP2: 'secondDataPort',
  ENL: 'engineNoiseLevelSensor',
  GND: 'groundStationDevice',
  IGC: 'igcApprovedRecorder',
  OBST: 'obstacleDatabase',
  RFB: 'antennaDiversity',
  SD: 'sdCard',
  TIS: 'garminTIS',
  UI: 'userInterface',
  USB: 'usbSlot',
  XPDR: 'adsbModule',
}

export interface FLACFeatures {
  audio: boolean
  alertZoneGenerator: boolean
  pressureSensor: boolean
  batteryCompartment: boolean
  secondDataPort: boolean
  engineNoiseLevelSensor: boolean
  groundStationDevice: boolean
  igcApprovedRecorder: boolean
  obstacleDatabase: boolean
  antennaDiversity: boolean
  sdCard: boolean
  garminTIS: boolean
  userInterface: boolean
  usbSlot: boolean
  adsbModule: boolean
}

export interface FLACPacket extends PacketStub<typeof sentenceId> {
  features: FLACFeatures
}

export type FLACRequestConfigItem
  = | 'HWVER'
    | 'DEVTYPE'
    | 'DEVICEID'
    | 'SWVER'
    | 'SWEXP'
    | 'FLARMVER'
    | 'BUILD'
    | 'SER'
    | 'REGION'
    | 'RADIOID'
    | 'CAP'
    | 'OBSTDB'
    | 'OBSTEXP'
    | 'LIC'
    | 'LS'
    | 'TASK'

export interface FLACRequestPacket extends PacketStub<typeof sentenceId> {
  queryType: 'R'
  configItem: FLACRequestConfigItem
}

export function decodeSentence(stub: PacketStub, fields: string[]): FLACPacket {
  const features: FLACFeatures = {
    audio: false,
    alertZoneGenerator: false,
    pressureSensor: false,
    batteryCompartment: false,
    secondDataPort: false,
    engineNoiseLevelSensor: false,
    groundStationDevice: false,
    igcApprovedRecorder: false,
    obstacleDatabase: false,
    antennaDiversity: false,
    sdCard: false,
    garminTIS: false,
    userInterface: false,
    usbSlot: false,
    adsbModule: false,
  }

  const decoded = {
    ...initStubFields(stub, sentenceId, sentenceName),
    features,
  }

  if (fields[1] !== 'A') {
    return decoded
  }

  switch (fields[2]) {
    case 'CAP': {
      const caps = fields[3]?.split(';') ?? []
      for (const cap of caps) {
        const key = CAP_TO_FEATURE[cap as FLACCapValue]
        if (key) {
          features[key] = true
        }
      }
      break
    }
    default:
      break
  }

  return decoded
}

export function encodePacket(packet: FLACRequestPacket, talker: string): string {
  const result = [`$${talker}${sentenceId}`]

  result.push(packet.queryType)
  result.push(packet.configItem)

  const resultWithoutChecksum = result.join(',')
  return resultWithoutChecksum + createNmeaChecksumFooter(resultWithoutChecksum)
}
