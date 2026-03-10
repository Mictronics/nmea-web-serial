import type { GGAPacket, GSAPacket, RMCPacket } from 'nmea-simple';
import type { FLACPacket, FLAUPacket, GRMZPacket } from '../../parser/codecs';
import type { FlarmData, StoredPackets } from './types';

function computePosition(gga?: GGAPacket, rmc?: RMCPacket): FlarmData['position'] {
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

function computeTime(gga?: GGAPacket, rmc?: RMCPacket): FlarmData['time'] {
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

function computeSpeed(rmc?: RMCPacket): FlarmData['speed'] {
  if (rmc && rmc.status === 'valid') {
    return { knots: rmc.speedKnots, source: 'RMC' };
  }
  return null;
}

function computeHeading(rmc?: RMCPacket): FlarmData['heading'] {
  // Fallback to COG (Course Over Ground) from RMC
  const cog = rmc?.trackTrue ?? 0;
  if (cog !== undefined) {
    return { degreesTrue: cog, source: 'COG', isDerived: true };
  }
  return null;
}

function computeDilution(gsa?: GSAPacket): FlarmData['dilution'] {
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

function computeStatus(status?: FLAUPacket): FlarmData['status'] {
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

function computeAlarm(alarm?: FLAUPacket): FlarmData['alarm'] {
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

function computeAltitude(alt?: GRMZPacket): FlarmData['altitude'] {
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

function computeDevice(dev?: FLACPacket): FlarmData['device'] {
  if (dev) {
    return {
      features: dev.features,
      hwVersion: dev.hwVersion,
      swVersion: dev.swVersion,
      serial: dev.serial,
      build: dev.build,
      flarmVersion: dev.flarmVersion,
      deviceId: dev.deviceId,
      deviceType: dev.deviceType,
      region: dev.region,
      radioId: dev.radioId,
      radioIdType: dev.radioIdType,
      source: 'FLAC',
    };
  }
  return null;
}

export function computeFlarmData(packets: StoredPackets): FlarmData {
  const time = computeTime(packets.GGA, packets.RMC);
  const position = computePosition(packets.GGA, packets.RMC);
  const speed = computeSpeed(packets.RMC);
  const heading = computeHeading(packets.RMC);
  const dilution = computeDilution(packets.GSA);
  const status = computeStatus(packets.FLAU);
  const alarm = computeAlarm(packets.FLAU);
  const altitude = computeAltitude(packets.GRMZ);
  const device = computeDevice(packets.FLAC);

  return { time, position, speed, heading, status, alarm, dilution, altitude, device };
}
