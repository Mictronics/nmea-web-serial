import type { GGAPacket, GSAPacket, RMCPacket } from 'nmea-simple'
import type { PacketStub } from 'nmea-simple/dist/codecs/PacketStub'
import type { FLACPacket, FLAUPacket, GRMZPacket } from '../../parser/codecs'
import type { GRMZFixType } from '../../parser/codecs/GRMZ'

export enum AlarmLevel {
  None = 0,
  Impact20s = 1,
  Impact15s = 2,
  Impact10s = 3,
}

export enum AlarmType {
  None = 0,
  Aircraft = 2,
  Obstacle = 3,
  TrafficAdvisory = 4,
}

export enum GpsStatus {
  NoFix = 0,
  GroundFix = 1,
  AirborneFix = 2,
}

export enum PowerStatus {
  Good = 0,
  Fail = 1,
}

export interface FlarmData {
  time: {
    utc: Date
    local: Date | null
    source: 'GGA' | 'RMC' | null
  } | null
  position: {
    latitude: number
    longitude: number
    source: 'GGA' | 'RMC' | null
    fixType?: 'none' | 'fix' | 'delta' | 'pps' | 'rtk' | 'frtk' | 'estimated' | 'manual' | 'simulation'
    status?: 'valid' | 'warning' | 'invalid'
    altitudeMeters?: number
    satellitesInView?: number
    horizontalDilution?: number
  } | null
  heading: {
    degreesTrue: number
    source: 'COG' | null
    isDerived: boolean
  } | null
  speed: {
    knots: number
    source: 'RMC' | null
  } | null
  dilution: {
    selectionMode: 'manual' | 'automatic'
    fixMode: 'none' | 'unknown' | '2D' | '3D'
    satellites: number[]
    pdop: number
    hdop: number
    vdop: number
    source: 'GSA' | null
  } | null
  status: {
    gps: GpsStatus
    power: PowerStatus
    rxDevices: number
    txDevices: number
    source: 'FLAU' | null
  } | null
  alarm: {
    level: AlarmLevel
    type: AlarmType | number
    relativeBearing: number
    relativeVertical: number
    relativeDistance: number
    source: 'FLAU' | null
  } | null
  altitude: {
    altitude: number
    unit: string
    fixMode: GRMZFixType
    source: 'GRMZ' | null
  } | null
  device: {
    features: {
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
    } | null
    source: 'FLAC' | null
  } | null
}

export interface StoredPackets extends Record<string, PacketStub | undefined> {
  // GGA — GPS Fix Data (Global Positioning System Fix Data)
  GGA?: GGAPacket
  // RMC — Recommended Minimum Specific GNSS Data
  RMC?: RMCPacket
  // GSA - Active satellites and dilution of precision
  GSA?: GSAPacket
  // PFLAU – Heartbeat, status, and basic alarms
  FLAU?: FLAUPacket
  // PGRMZ – Garmin's barometric altitude
  GRMZ?: GRMZPacket
  // PFLAC – Device features
  FLAC?: FLACPacket
}
