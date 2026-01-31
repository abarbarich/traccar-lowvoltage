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

  // --- NEW UI: CONTROLS ---
  enableImmobiliser: {
    name: 'UI: Enable Immobiliser Controls',
    type: 'boolean',
  },
  enableOutput: {
    name: 'UI: Enable Generic Output Controls',
    type: 'boolean',
  },

  // --- NEW UI: HOUR METER ---
  enableHours: {
    name: 'UI: Show Hours (Next to Speed)',
    type: 'boolean',
  },
  enableHoursOnly: {
    name: 'UI: Show Hours Only (Replace Speed)',
    type: 'boolean',
  },
  hoursSource: {
    name: 'UI: Hour Meter Data Source (default: hours)',
    type: 'string',
  },

  // --- NEW UI FUEL CONFIGURATION ---
  fuelSource: {
    name: 'UI: Fuel Level Data Source (default: fuelLevel)',
    type: 'string',
  },

  // --- NEW UI: INPUTS & SENSORS ---
  input1Type: {
    name: 'UI: Input 1 Icon Type (bilge, fuel, battery, door)',
    type: 'string',
  },
  input1Source: {
    name: 'UI: Input 1 Data Source (default: in1)',
    type: 'string',
  },
  input2Type: {
    name: 'UI: Input 2 Icon Type (bilge, fuel, battery, door)',
    type: 'string',
  },
  input2Source: {
    name: 'UI: Input 2 Data Source (default: in2)',
    type: 'string',
  },
}), [t]);
