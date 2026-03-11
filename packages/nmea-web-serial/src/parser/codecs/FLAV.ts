/*
 * PFLAV – Version information
 *
 *        1           2          3            4
 *        |           |          |            |
 * PFLAV,<QueryType>,<HwVersion>,<SwVersion>,<ObstVersion>
 *
 * Query type:
 *  R = request FLARM to send version; other parameters should then be omitted
 *  A = FLARM sends version (requested and spontaneous)
 *
 * HwVersion:
 *  Decimal fixed point with two digits after radix point (dot) and one before. Range: from 0.00 to 9.99.
 *
 * SwVersion:
 *  Decimal floating-point value. Maximum two digits before radix point and maximum 4 digits after.
 *
 * ObstVersion:
 *  Up to 18 ASCII characters (any character, no special structure); the field is empty when no obstacle database is present.
 *
 */
import type { PacketStub } from 'nmea-simple/dist/codecs/PacketStub';
import { initStubFields } from 'nmea-simple/dist/codecs/PacketStub';

export const sentenceId = 'FLAV' as const;
export const sentenceName = 'Version information' as const;

export interface FLAVPacket extends PacketStub<typeof sentenceId> {
  hwVersion: string;
  swVersion: string;
  obstacleVersion: string;
}

export function decodeSentence(_stub: PacketStub, fields: string[]): FLAVPacket {
  const decoded: FLAVPacket = {
    hwVersion: '',
    swVersion: '',
    obstacleVersion: '',
    sentenceId,
  };
  initStubFields(decoded, sentenceId, sentenceName);

  if (fields[1] !== 'A') {
    return decoded;
  }

  decoded.hwVersion = fields[2] ?? '';
  decoded.swVersion = fields[3] ?? '';
  decoded.obstacleVersion = fields[4] ?? '';

  return decoded;
}
