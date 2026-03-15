import type { GGAPacket, GSAPacket, RMCPacket } from 'nmea-simple';
import type { FLACPacket, FLAUPacket, GRMZPacket, FLAEPacket, FLAVPacket, FLAAPacket } from '../../parser/codecs';
import type {
  FlarmData,
  FlarmDevice,
  FlarmPosition,
  FlarmTime,
  FlarmAlarm,
  FlarmAltitude,
  FlarmDilution,
  FlarmErrors,
  FlarmHeading,
  FlarmSpeed,
  FlarmStatus,
  StoredPackets,
  FlarmAircraft,
  FlarmAircrafts,
} from './types';

function computePosition(gga?: GGAPacket, rmc?: RMCPacket): FlarmPosition | null {
  if (gga && gga.fixType !== 'none') {
    return {
      latitude: gga.latitude,
      longitude: gga.longitude,
      source: 'GGA',
      fixType: gga.fixType,
      altitudeMeters: gga.altitudeMeters,
      satellitesInView: gga.satellitesInView,
      horizontalDilution: gga.horizontalDilution,
    };
  }

  if (rmc && rmc.status === 'valid') {
    return {
      latitude: rmc.latitude,
      longitude: rmc.longitude,
      source: 'RMC',
      status: rmc.status,
    };
  }
  return null;
}

function computeTime(gga?: GGAPacket, rmc?: RMCPacket): FlarmTime | null {
  if (gga && gga.fixType !== 'none') {
    return {
      utc: gga.time,
      local: null,
      source: 'GGA',
    };
  }

  if (rmc && rmc.status === 'valid') {
    return {
      utc: rmc.datetime,
      local: null,
      source: 'RMC',
    };
  }
  return null;
}

function computeSpeed(rmc?: RMCPacket): FlarmSpeed | null {
  if (rmc && rmc.status === 'valid') {
    return { knots: rmc.speedKnots, source: 'RMC' };
  }
  return null;
}

function computeHeading(rmc?: RMCPacket): FlarmHeading | null {
  if (!rmc || rmc.status !== 'valid') return null;

  const cog = rmc.trackTrue;
  if (cog === undefined) return null;

  return {
    degreesTrue: cog,
    source: 'COG',
    isDerived: true,
  };
}

function computeDilution(gsa?: GSAPacket): FlarmDilution | null {
  if (gsa) {
    return {
      selectionMode: gsa.selectionMode,
      fixMode: gsa.fixMode,
      satellites: gsa.satellites,
      pdop: gsa.PDOP,
      hdop: gsa.HDOP,
      vdop: gsa.VDOP,
      source: 'GSA',
    };
  }
  return null;
}

function computeStatus(status?: FLAUPacket): FlarmStatus | null {
  if (status) {
    return {
      txDevices: status.txDevices,
      rxDevices: status.rxDevices,
      gps: status.gpsStatus,
      power: status.powerStatus,
      source: 'FLAU',
    };
  }
  return null;
}

function computeAlarm(alarm?: FLAUPacket): FlarmAlarm | null {
  if (alarm) {
    return {
      level: alarm.alarmLevel,
      type: alarm.alarmType,
      relativeBearing: alarm.relativeBearing,
      relativeDistance: alarm.relativeDistance,
      relativeVertical: alarm.relativeVertical,
      source: 'FLAU',
    };
  }
  return null;
}

function computeAltitude(alt?: GRMZPacket): FlarmAltitude | null {
  if (alt) {
    return {
      altitude: alt.altitude,
      unit: alt.unit,
      fixMode: alt.fixMode,
      source: 'GRMZ',
    };
  }
  return null;
}

function computeDevice(flac?: FLACPacket, flav?: FLAVPacket): FlarmDevice | null {
  if (!flac) return null;

  const device: FlarmDevice = {
    features: flac.features,
    hwVersion: flac.hwVersion,
    swVersion: flac.swVersion,
    serial: flac.serial,
    build: flac.build,
    flarmVersion: flac.flarmVersion,
    deviceId: flac.deviceId,
    deviceType: flac.deviceType,
    region: flac.region,
    radioId: flac.radioId,
    radioIdType: flac.radioIdType,
    obstacleVersion: '',
    source: 'FLAC',
  };

  if (flav) {
    device.hwVersion = flav.hwVersion;
    device.swVersion = flav.swVersion;
    device.obstacleVersion = flav.obstacleVersion;
  }
  return device;
}

function computeErrors(err?: FLAEPacket): FlarmErrors | null {
  if (err) {
    return {
      errors: err.errors,
      source: 'FLAE',
    };
  }
  return null;
}

const AIRCRAFT_TIMEOUT_MS = 15000;

type AircraftEntry = {
  aircraft: any;
  lastSeen: number;
};

const aircraftStore = new Map<string, AircraftEntry>();

function updateAircraftCollection(flaa?: FLAAPacket): FlarmAircrafts {
  const now = Date.now();
  if (flaa) {
    const id = `${flaa.idType}:${flaa.id}`;
    if (id) {
      const distance =
        flaa.relativeEast != null && flaa.relativeNorth != null
          ? Math.sqrt(flaa.relativeEast ** 2 + flaa.relativeNorth ** 2)
          : undefined;
      aircraftStore.set(id, {
        aircraft: {
          id,
          alarmLevel: flaa.alarmLevel,
          relativeNorth: flaa.relativeNorth,
          relativeEast: flaa.relativeEast,
          relativeVertical: flaa.relativeVertical,
          idType: flaa.idType,
          track: flaa.track,
          turnRate: flaa.turnRate,
          groundSpeed: flaa.groundSpeed,
          climbRate: flaa.climbRate,
          aircraftType: flaa.aircraftType,
          noTrack: flaa.noTrack,
          distance,
        } as FlarmAircraft,
        lastSeen: now,
      });
    }
  }

  for (const [id, entry] of aircraftStore) {
    if (now - entry.lastSeen > AIRCRAFT_TIMEOUT_MS) {
      aircraftStore.delete(id);
    }
  }
  return {
    aircrafts: Array.from(aircraftStore.values()).map((v) => v.aircraft),
    source: 'FLAA',
  };
}

export function computeFlarmData(packets: StoredPackets): FlarmData {
  return {
    time: computeTime(packets.GGA, packets.RMC),
    position: computePosition(packets.GGA, packets.RMC),
    speed: computeSpeed(packets.RMC),
    heading: computeHeading(packets.RMC),
    dilution: computeDilution(packets.GSA),
    status: computeStatus(packets.FLAU),
    alarm: computeAlarm(packets.FLAU),
    altitude: computeAltitude(packets.GRMZ),
    device: computeDevice(packets.FLAC, packets.FLAV),
    errors: computeErrors(packets.FLAE),
    aircrafts: updateAircraftCollection(packets.FLAA),
  };
}
