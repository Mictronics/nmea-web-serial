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

import type { PacketStub } from 'nmea-simple/dist/codecs/PacketStub';
import { initStubFields } from 'nmea-simple/dist/codecs/PacketStub';
import { createNmeaChecksumFooter } from '../../utils';

export const sentenceId = 'FLAC' as const;
export const sentenceName = 'Device features' as const;

export type FLACCapValue =
  | 'AUD'
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
  | 'XPDR';

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
};

export interface FLACFeatures {
  audio: boolean;
  alertZoneGenerator: boolean;
  pressureSensor: boolean;
  batteryCompartment: boolean;
  secondDataPort: boolean;
  engineNoiseLevelSensor: boolean;
  groundStationDevice: boolean;
  igcApprovedRecorder: boolean;
  obstacleDatabase: boolean;
  antennaDiversity: boolean;
  sdCard: boolean;
  garminTIS: boolean;
  userInterface: boolean;
  usbSlot: boolean;
  adsbModule: boolean;
}

export interface FLACPacket extends PacketStub<typeof sentenceId> {
  features: FLACFeatures;
  hwVersion: string;
  swVersion: string;
  flarmVersion: string;
  deviceType: string;
  deviceId: string;
  build: string;
  serial: string;
  region: string;
  radioId: string;
  radioIdType: 'Unknown' | 'FLARM' | 'ADSB';
}

const flarmDevice: FLACPacket = {
  features: {
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
  },
  hwVersion: '',
  swVersion: '',
  flarmVersion: '',
  deviceType: '',
  deviceId: '',
  build: '',
  serial: '',
  region: '',
  radioId: '',
  radioIdType: 'Unknown',
  sentenceId,
};

export type FLACRequestConfigItem =
  | 'HWVER'
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
  | 'TASK';

export interface FLACRequestPacket extends PacketStub<typeof sentenceId> {
  queryType: 'R';
  configItem: FLACRequestConfigItem;
}

export function decodeSentence(_stub: PacketStub, fields: string[]): FLACPacket {
  initStubFields(flarmDevice, sentenceId, sentenceName);
  const decoded = flarmDevice;

  if (fields[1] !== 'A') {
    return decoded;
  }

  const field3 = fields[3] ?? '';
  switch (fields[2]) {
    case 'CAP': {
      const caps = fields[3]?.split(';') ?? [];
      Object.keys(decoded.features).forEach((k) => (decoded.features[k as keyof FLACFeatures] = false));
      for (const cap of caps) {
        const key = CAP_TO_FEATURE[cap as FLACCapValue];
        if (key) {
          decoded.features[key] = true;
        }
      }
      break;
    }
    case 'HWVER':
      {
        decoded.hwVersion = field3;
      }
      break;
    case 'DEVTYPE':
      {
        decoded.deviceType = field3;
      }
      break;
    case 'DEVICEID':
      {
        decoded.deviceId = field3;
      }
      break;
    case 'SWVER':
      {
        decoded.swVersion = field3;
      }
      break;
    case 'FLARMVER':
      {
        decoded.flarmVersion = field3;
      }
      break;
    case 'BUILD':
      {
        decoded.build = field3;
      }
      break;
    case 'SER':
      {
        decoded.serial = field3;
      }
      break;
    case 'REGION':
      {
        decoded.region = field3;
      }
      break;
    case 'RADIOID':
      {
        switch (field3) {
          case '1':
            decoded.radioIdType = 'ADSB';
            break;
          case '2':
            decoded.radioIdType = 'FLARM';
            break;
          default:
            decoded.radioIdType = 'Unknown';
            break;
        }
        decoded.radioId = fields[4] ?? '';
      }
      break;
    default:
      break;
  }
  return decoded;
}

export function encodePacket(packet: FLACRequestPacket, talker: string): string {
  const result = [`$${talker}${sentenceId}`];

  result.push(packet.queryType);
  result.push(packet.configItem);

  const resultWithoutChecksum = result.join(',');
  return resultWithoutChecksum + createNmeaChecksumFooter(resultWithoutChecksum);
}
