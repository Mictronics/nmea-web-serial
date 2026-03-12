/*
 * PFLAA – Data on other proximate aircraft
 *
 *        1            2               3              4                  5        6    7       8          9             10          11              12         13       14
 *        |            |               |              |                  |        |    |       |          |             |           |               |          |        |
 * PFLAA,<AlarmLevel>,<RelativeNorth>,<RelativeEast>,<RelativeVertical>,<IDType>,<ID>,<Track>,<TurnRate>,<GroundSpeed>,<ClimbRate>,<AircraftType>[,<NoTrack>[,<Source>,<RSSI>]]
 *
 * Alarm Level:
 *  Decimal integer value. Range: from 0 to 3.
 *  0 = no alarm (also used for no-alarm traffic information)
 *  1 = alarm, 15-20 seconds to impact
 *  2 = alarm, 10-15 seconds to impact
 *  3 = alarm, 0-10 seconds to impact
 *
 * Relative North:
 *  Decimal integer value. Range: from -20000000 to 20000000.
 *
 *  Relative position in meters true north from own position. If
 *  <RelativeEast> is empty, <RelativeNorth> represents the
 *  estimated distance to a target with unknown bearing
 *  (transponder Mode-C/S).
 *
 * Relative East:
 *  Decimal integer value. Range: from -20000000 to 20000000.
 *
 *  Relative position in meters true east from own position. The
 *  field is empty for non-directional targets.
 *
 * Relative Vertical:
 *  Decimal integer value. Range: from -32768 to 32767.
 *
 *  Relative vertical separation in meters above own position.
 *  Negative values indicate that the other aircraft is lower.
 *  Some distance-dependent random noise is applied to altitude
 *  data if stealth mode is activated either on the target or own
 *  aircraft and no alarm is present at this time.
 *
 * ID Type:
 *  Decimal integer value. Range: from 0 to 2.
 *  Defines the interpretation of the following <ID> field.
 *  0 = random ID, configured or if stealth mode is activated either on the target or own aircraft
 *  1 = official ICAO 24-bit aircraft address
 *  2 = fixed FLARM ID (chosen by FLARM)
 *
 *  The field is empty if no identification is known (e.g. transponder Mode-C).
 *
 * ID:
 *  6-digit hexadecimal value (e.g. “5A77B1”) as configured in the target’s PFLAC,,ID sentence.
 *
 *  The interpretation is delivered in <ID-Type>. The field is empty if no identification is known (e.g. Transponder Mode-C).
 *  Random ID will be sent if stealth mode is activated either on the target or own aircraft and no alarm is present at this time.
 *
 * Track:
 *  Decimal integer value. Range: from 0 to 359.
 *
 *  The target’s true ground track in degrees. The value 0 indicates a true north track. This field is empty if stealth
 *  mode is activated either on the target or own aircraft and for non-directional targets.
 *
 * Turn Rate:
 *  Currently this field is empty.
 *
 * Ground Speed:
 *  Decimal integer value. Range: from 0 to 32767.
 *
 *  When the aircraft is considered moving, the target’s ground speed in m/s, forced to > 0. When the aircraft is considered on the ground, the field is
 *  forced to 0. This field is empty if stealth mode is activated either on the target or own aircraft and for non-directional targets.
 *
 * Climb Rate:
 *  Decimal fixed-point number with one digit after the radix point (dot). Range: from -32.7 to 32.7.
 *
 *  The target’s climb rate in m/s. Positive values indicate a climbing aircraft. This field is empty if stealth mode is
 *  activated either on the target or own aircraft and for non-directional targets.
 *
 * Aircraft Type:
 *  Hexadecimal value. Range: from 0 to F.
 *  Aircraft types:
 *  0 = (reserved)
 *  1 = glider/motor glider (turbo, self-launch, jet) / TMG
 *  2 = tow plane/tug plane
 *  3 = helicopter/gyrocopter/rotorcraft
 *  4 = skydiver, parachute (do not use for drop plane!)
 *  5 = drop plane for skydivers
 *  6 = hang glider (hard)
 *  7 = paraglider (soft)
 *  8 = aircraft with reciprocating engine(s)
 *  9 = aircraft with jet/turboprop engine(s)
 *  A = unknown
 *  B = balloon (hot, gas, weather, static)
 *  C = airship, blimp, zeppelin
 *  D = unmanned aerial vehicle (UAV, RPAS, drone)
 *  E = (reserved)
 *  F = static obstacle
 *
 * No Track:
 *  Field is omitted if data port version <8. The target’s configured no track setting.
 *  Decimal integer value. Range: from 0 to 1.
 *  0 = no track option not set
 *  1 = no track option set
 *
 *  Targets with “no track” enabled express their intention to remain private. Data from these targets may thus not be
 *  persisted in any way (e.g. in a database). If the data is transmitted to a third-party system (e.g. a server), then the
 *  implementer must make sure the third-party system also respects this rule.
 *  Such targets will furthermore be suppressed from $PFLAA output if ownship does not move, unless the target is closer
 *  than 200m horizontally and 100m vertically.
 *
 * Source:
 *  The field is omitted if data port version <9.
 *  Data source of the $PFLAA sentence:
 *  0 = FLARM
 *  1 = ADS-B
 *  3 = ADS-R (rebroadcasting of UAT ADS-B to 1090 MHz)
 *  4 = TIS-B (broadcast of location of non-ADS-B equipped aircraft)
 *  6 = Mode-S (non-directional targets)
 *
 *  If the same target is received from multiple sources, the following precedence applies: FLARM > ADS-B > ADS-R > TIS-B > Mode-S.
 *  For ADS-R and TIS-B, no alarm is computed (AlarmLevel =0).
 *  Note: ADS-R and TIS-B position reports may be inaccurate due to a low update rate and/or extrapolation. Use for indicative display only.
 *  Note: ADS-R and TIS-B targets are sent by the ANSP only to so-called ADS-R and TIS-B clients. If ownship is not set up to act as such a client,
 *  this information may not be sent. Refer to DO-338 for details.
 *
 * RSSI:
 *  The field is omitted if data port version <9.
 *  Signal level of the received target in dBm (example: “-71.2”).
 *  Empty if unknown. This field can be used to help assess the quality of the radio link. It depends on the installation of the sending station, the
 *  installation of the receiving station and the distance.
 */
import type { PacketStub } from 'nmea-simple/dist/codecs/PacketStub';
import { initStubFields } from 'nmea-simple/dist/codecs/PacketStub';
import { parseIntSafe, parseFloatSafe } from '../../utils';

export const sentenceId = 'FLAA' as const;
export const sentenceName = 'Data on other proximate aircraft' as const;

export interface FLAAPacket extends PacketStub<typeof sentenceId> {
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
  aircraftType: number;
  noTrack?: boolean;
  source?: number;
  rssi?: number;
}

export function decodeSentence(_stub: PacketStub, fields: string[]): FLAAPacket {
  if (fields.length < 12) {
    throw new Error('Invalid PFLAA sentence: insufficient fields');
  }

  const has = (v?: string) => v !== undefined && v !== '';

  const decoded: FLAAPacket = {
    ...initStubFields(_stub, sentenceId, sentenceName),

    alarmLevel: parseIntSafe(fields[1]),
    relativeNorth: parseIntSafe(fields[2]),

    relativeEast: has(fields[3]) ? parseIntSafe(fields[3]) : undefined,
    relativeVertical: parseIntSafe(fields[4]),

    idType: has(fields[5]) ? parseIntSafe(fields[5]) : undefined,
    id: has(fields[6]) ? fields[6] : undefined,

    track: has(fields[7]) ? parseIntSafe(fields[7]) : undefined,
    turnRate: has(fields[8]) ? parseFloatSafe(fields[8]) : undefined,
    groundSpeed: has(fields[9]) ? parseIntSafe(fields[9]) : undefined,
    climbRate: has(fields[10]) ? parseFloatSafe(fields[10]) : undefined,

    aircraftType: parseIntSafe(fields[11]),
  };

  if (has(fields[12])) decoded.noTrack = parseIntSafe(fields[12]) === 1;
  if (has(fields[13])) decoded.source = parseIntSafe(fields[13]);
  if (has(fields[14])) decoded.rssi = parseFloatSafe(fields[14]);

  return decoded;
}
