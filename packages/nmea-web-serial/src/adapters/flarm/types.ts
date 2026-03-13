import type { GGAPacket, GSAPacket, RMCPacket } from 'nmea-simple';
import type { PacketStub } from 'nmea-simple/dist/codecs/PacketStub';
import type { FLACPacket, FLAUPacket, GRMZPacket, FLAAPacket } from '../../parser/codecs';
import type { GRMZFixType } from '../../parser/codecs/GRMZ';
import type { FLACFeatures } from '../../parser/codecs/FLAC';
import type { FLAEPacket } from '../../parser/codecs/FLAE';
import type { FLAVPacket } from '../../parser/codecs/FLAV';

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

export enum Severity {
  None = 0,
  Info = 1,
  ReducedFunctionality = 2,
  Fatal = 3,
}

export enum ErrorCode {
  FirmwareExpired = 0x11,
  FirmwareUpdateError = 0x12,

  Power = 0x21,
  UIError = 0x22,
  AudioError = 0x23,
  ADCError = 0x24,
  SDCardError = 0x25,
  USBError = 0x26,
  LEDError = 0x27,
  EEPROMError = 0x28,
  GeneralHardwareError = 0x29,
  TransponderReceiverUnserviceable = 0x2a,
  EEPROMError2 = 0x2b,
  GPIOError = 0x2c,

  GPSCommunication = 0x31,
  GPSModuleConfiguration = 0x32,
  GPSAntenna = 0x33,

  RFCommunication = 0x41,
  DuplicateRadioID = 0x42,
  WrongICAOAddress = 0x43,

  Communication = 0x51,

  FlashMemory = 0x61,

  PressureSensor = 0x71,

  ObstacleDatabase = 0x81,
  ObstacleDatabaseExpired = 0x82,

  FlightRecorder = 0x91,
  EngineNoiseRecording = 0x93,
  RangeAnalyzer = 0x94,

  ConfigurationError = 0xa1,

  InvalidObstacleLicense = 0xb1,
  InvalidIGCLicense = 0xb2,
  InvalidAUDLicense = 0xb3,
  InvalidENLLicense = 0xb4,
  InvalidRFBLicense = 0xb5,
  InvalidTISLicense = 0xb6,

  GenericError = 0x100,
  FlashFileSystem = 0x101,

  ExternalDisplayFirmwareUpdate = 0x110,

  OutsideDesignatedRegion = 0x120,

  Other = 0xf1,
}

export enum AircraftType {
  Reserved0 = 0,
  Glider = 1,
  TowPlane = 2,
  Rotorcraft = 3,
  Skydiver = 4,
  DropPlane = 5,
  HangGlider = 6,
  Paraglider = 7,
  PropellerAircraft = 8,
  JetAircraft = 9,
  Unknown = 10,
  Balloon = 11,
  Airship = 12,
  UAV = 13,
  Reserved14 = 14,
  StaticObstacle = 15,
}

export enum FlarmSource {
  FLARM = 0,
  ADSB = 1,
  ADSR = 3,
  TISB = 4,
  MODES = 6,
}

export interface Error {
  severity: Severity;
  code: ErrorCode | number;
  message?: string;
}

type WithSource<T, S extends string> = T & { source: S | null };

export type FlarmTime = WithSource<
  {
    utc: Date;
    local: Date | null;
  },
  'GGA' | 'RMC'
> | null;

export type FlarmPosition = WithSource<
  {
    latitude: number;
    longitude: number;
    fixType?: 'none' | 'fix' | 'delta' | 'pps' | 'rtk' | 'frtk' | 'estimated' | 'manual' | 'simulation';
    status?: 'valid' | 'warning' | 'invalid';
    altitudeMeters?: number;
    satellitesInView?: number;
    horizontalDilution?: number;
  },
  'GGA' | 'RMC'
> | null;

export type FlarmHeading = WithSource<
  {
    degreesTrue: number;
    isDerived: boolean;
  },
  'COG'
> | null;

export type FlarmSpeed = WithSource<
  {
    knots: number;
  },
  'RMC'
> | null;

export type FlarmDilution = WithSource<
  {
    selectionMode: 'manual' | 'automatic';
    fixMode: 'none' | 'unknown' | '2D' | '3D';
    satellites: number[];
    pdop: number;
    hdop: number;
    vdop: number;
  },
  'GSA'
> | null;

export type FlarmStatus = WithSource<
  {
    gps: GpsStatus;
    power: PowerStatus;
    rxDevices: number;
    txDevices: number;
  },
  'FLAU'
> | null;

export type FlarmAlarm = WithSource<
  {
    level: AlarmLevel;
    type: AlarmType | number;
    relativeBearing: number;
    relativeVertical: number;
    relativeDistance: number;
  },
  'FLAU'
> | null;

export type FlarmAltitude = WithSource<
  {
    altitude: number;
    unit: string;
    fixMode: GRMZFixType;
  },
  'GRMZ'
> | null;

export type FlarmDevice = WithSource<
  {
    features: FLACFeatures;
    hwVersion: string;
    swVersion: string;
    flarmVersion: string;
    obstacleVersion: string;
    deviceType: string;
    deviceId: string;
    build: string;
    serial: string;
    region: string;
    radioId: string;
    radioIdType: 'Unknown' | 'FLARM' | 'ADSB';
  },
  'FLAC'
> | null;

export type FlarmErrors = WithSource<
  {
    errors: Error[];
  },
  'FLAE'
> | null;

export type FlarmAircraft = {
  alarmLevel: number;
  relativeNorth: number;
  relativeEast?: number;
  relativeVertical: number;
  idType?: number;
  id?: string;
  track?: number;
  turnRate?: number;
  groundSpeed?: number;
  climbRate?: number;
  aircraftType: AircraftType;
  noTrack?: boolean;
  rssi?: number;
  source?: FlarmSource;
};

export type FlarmAircrafts = WithSource<
  {
    aircrafts: FlarmAircraft[];
  },
  'FLAA'
> | null;

export interface FlarmData {
  time: FlarmTime;
  position: FlarmPosition;
  heading: FlarmHeading;
  speed: FlarmSpeed;
  dilution: FlarmDilution;
  status: FlarmStatus;
  alarm: FlarmAlarm;
  altitude: FlarmAltitude;
  device: FlarmDevice;
  errors: FlarmErrors;
  aircrafts: FlarmAircrafts;
}

export interface StoredPackets extends Record<string, PacketStub | undefined> {
  // GGA — GPS Fix Data (Global Positioning System Fix Data)
  GGA?: GGAPacket;
  // RMC — Recommended Minimum Specific GNSS Data
  RMC?: RMCPacket;
  // GSA - Active satellites and dilution of precision
  GSA?: GSAPacket;
  // PFLAU – Heartbeat, status, and basic alarms
  FLAU?: FLAUPacket;
  // PGRMZ – Garmin's barometric altitude
  GRMZ?: GRMZPacket;
  // PFLAC – Device features
  FLAC?: FLACPacket;
  // PFLAA – Data on other proximate aircraft
  FLAA?: FLAAPacket;
  // PFLAE – Self-test result and errors codes
  FLAE?: FLAEPacket;
  // PFLAV – Version information
  FLAV?: FLAVPacket;
}
