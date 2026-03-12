import type { NmeaMachineConfig } from '../../core';
import type { FlarmData, StoredPackets } from './types';
import { createNmeaMachine } from '../../core';
import { computeFlarmData } from './computation';

export const FLARM_SENTENCE_IDS = [
  'RMC',
  'GGA',
  'GSA',
  'GRMZ',
  'FLAU',
  'FLAC',
  'FLAE',
  'FLAV',
  'FLAA',
] as const;

export function createFlarmAdapter() {
  return (packets: StoredPackets): FlarmData => {
    return computeFlarmData(packets);
  };
}

export const initialFlarmData: FlarmData = {
  time: null,
  speed: null,
  heading: null,
  position: null,
  alarm: null,
  status: null,
  dilution: null,
  altitude: null,
  device: null,
  errors: null,
  aircrafts: null,
};

export const initialFlarmPackets: StoredPackets = {};

export function createFlarmNmeaConfig(): NmeaMachineConfig<FlarmData, StoredPackets> {
  return {
    adapter: createFlarmAdapter(),
    allowedSentenceIds: FLARM_SENTENCE_IDS,
    initialData: initialFlarmData,
    initialPackets: initialFlarmPackets,
  };
}

export function createFlarmNmeaMachine() {
  return createNmeaMachine(createFlarmNmeaConfig());
}
