/*
 * PFLAE – Self-test result and errors codes
 *
 *        1           2          3            4
 *        |           |          |            |
 * PFLAE,<QueryType>,<Severity>,<ErrorCode>[,<Message>]
 *
 * Query type:
 *  R = request FLARM to send status and error codes; other parameters should then be omitted
 *  A = FLARM sends status (requested and spontaneous)
 *
 * Severity:
 *  Decimal integer value. Range: from 0 to 3.
 *  0 = no error, i.e. normal operation. Disregard other parameters.
 *  1 = information only, i.e. normal operation
 *  2 = functionality may be reduced
 *  3 = fatal problem, device will not work
 *
 * Error codes:
 * Hexadecimal value. Range: from 0 to FFF.
 *  11 = Firmware expired (requires valid GPS information, i.e. will not be available in the first minute or so after power-on)
 *  12 = Firmware update error
 *  21 = Power (e.g. voltage < 8V)
 *  22 = UI error
 *  23 = Audio error
 *  24 = ADC error
 *  25 = SD card error
 *  26 = USB error
 *  27 = LED error
 *  28 = EEPROM error
 *  29 = General hardware error
 *  2A = Transponder receiver Mode-C/S/ADS-B unserviceable
 *  2B = EEPROM error
 *  2C = GPIO error
 *  31 = GPS communication
 *  32 = Configuration of GPS module
 *  33 = GPS antenna
 *  41 = RF communication
 *  42 = Another FLARM device with the same radio ID is being received. Alarms are suppressed for the relevant device.
 *  43 = Wrong ICAO 24-bit address or radio ID
 *  51 = Communication
 *  61 = Flash memory
 *  71 = Pressure sensor
 *  81 = Obstacle database (e.g. incorrect file type)
 *  82 = Obstacle database expired.
 *  91 = Flight recorder
 *  93 = Engine-noise recording not possible
 *  94 = Range analyzer
 *  A1 = Configuration error, e.g. while reading flarmcfg.txt from SD/USB.
 *  B1 = Invalid obstacle database license (e.g. wrong serial number)
 *  B2 = Invalid IGC feature license
 *  B3 = Invalid AUD feature license
 *  B4 = Invalid ENL feature license
 *  B5 = Invalid RFB feature license
 *  B6 = Invalid TIS feature license
 *  100 = Generic error
 *  101 = Flash File System error
 *  110 = Failure updating firmware of external display
 *  120 = Device is operated outside the designated region. The device does not work.
 *  F1 = Other
 *
 * Message:
 *  Field is omitted if data port version <7 or if DEVTYPE = Flarm04.
 *  String. Maximum 40 ASCII characters.
 *  Textual description of the error in English. The field may be empty.
 *
 */
import type { PacketStub } from 'nmea-simple/dist/codecs/PacketStub';
import { initStubFields } from 'nmea-simple/dist/codecs/PacketStub';
import { Severity, type Error } from '../../adapters/flarm/types';

export const sentenceId = 'FLAE' as const;
export const sentenceName = 'Self-test result and errors codes' as const;
export interface FLAEPacket extends PacketStub<typeof sentenceId> {
  errors: Error[];
}

function parseSeverity(value?: string): Severity {
  const parsed = Number.parseInt(value ?? '0', 10);
  if (parsed in Severity) return parsed as Severity;
  return Severity.None;
}

function parseErrorCode(value?: string): number {
  if (!value) return 0;
  return Number.parseInt(value, 16);
}

export function decodeSentence(_stub: PacketStub, fields: string[]): FLAEPacket {
  const decoded: FLAEPacket = {
    errors: [],
    sentenceId,
  };
  initStubFields(decoded, sentenceId, sentenceName);

  if (fields[1] !== 'A') {
    return decoded;
  }

  const severity = parseSeverity(fields[2]);
  const code = parseErrorCode(fields[3]);

  if (severity === Severity.None && code === 0) {
    return decoded;
  }

  decoded.errors.push({
    severity,
    code,
    message: fields[4] || undefined,
  });
  return decoded;
}
