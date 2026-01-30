import { useMemo } from 'react';

export default (t) => useMemo(() => ({
  // --- EXISTING STANDARD ATTRIBUTES ---
  speedLimit: {
    name: t('attributeSpeedLimit'),
    type: 'number',
    subtype: 'speed',
  },
  fuelDropThreshold: {
    name: t('attributeFuelDropThreshold'),
    type: 'number',
  },
  fuelIncreaseThreshold: {
    name: t('attributeFuelIncreaseThreshold'),
    type: 'number',
  },
  'report.ignoreOdometer': {
    name: t('attributeReportIgnoreOdometer'),
    type: 'boolean',
  },
  deviceInactivityStart: {
    name: t('attributeDeviceInactivityStart'),
    type: 'number',
  },
  deviceInactivityPeriod: {
    name: t('attributeDeviceInactivityPeriod'),
    type: 'number',
  },
  notificationTokens: {
    name: t('attributeNotificationTokens'),
    type: 'string',
  },

  // --- NEW UI CONTROL ATTRIBUTES ---
  enableImmobiliser: {
    name: 'UI: Enable Immobiliser Mode',
    type: 'boolean',
  },
  enableOutput: {
    name: 'UI: Enable Generic Output Mode',
    type: 'boolean',
  },
  
  // --- NEW UI INPUT CONFIGURATION ---
  input1Type: {
    name: 'UI: Input 1 Type (bilge, fuel, battery, door)',
    type: 'string',
  },
  input1Source: {
    name: 'UI: Input 1 Data Source (default: in1)',
    type: 'string',
  },
  input2Type: {
    name: 'UI: Input 2 Type (bilge, fuel, battery, door)',
    type: 'string',
  },
  input2Source: {
    name: 'UI: Input 2 Data Source (default: in2)',
    type: 'string',
  },
  
  // --- NEW UI FUEL CONFIGURATION ---
  fuelSource: {
    name: 'UI: Fuel Data Source (default: fuelLevel)',
    type: 'string',
  },

}), [t]);
