import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import {
  Tooltip, Avatar, ListItemAvatar, ListItemText, ListItemButton,
  Typography,
} from '@mui/material';

// Icons
import PowerOffIcon from '@mui/icons-material/PowerOff';
import ShieldIcon from '@mui/icons-material/Shield';
import DoorFrontIcon from '@mui/icons-material/DoorFront'; 
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'; 
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull'; 
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert'; 
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import WaterIcon from '@mui/icons-material/Water';
import BoltIcon from '@mui/icons-material/Bolt';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { devicesActions } from '../store';
import {
  formatStatus, getStatusColor, formatSpeed,
} from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { mapIconKey, mapIcons } from '../map/core/preloadImages';
import { useAdministrator } from '../common/util/permissions';
import { useAttributePreference } from '../common/util/preferences';

dayjs.extend(relativeTime);

// --- ANIMATIONS ---
const pulseGreen = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(76, 175, 80, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0px rgba(76, 175, 80, 0); }
`;
const pulseYellow = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(255, 214, 0, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(255, 214, 0, 0); }
  100% { box-shadow: 0 0 0 0px rgba(255, 214, 0, 0); }
`;
const pulseOrange = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(255, 109, 0, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(255, 109, 0, 0); }
  100% { box-shadow: 0 0 0 0px rgba(255, 109, 0, 0); }
`;
const pulseMotion = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(255, 193, 7, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(255, 193, 7, 0); }
  100% { box-shadow: 0 0 0 0px rgba(255, 193, 7, 0); }
`;
const yellowToRedFlash = keyframes`
  0% { background-color: #FFD600; color: #000; }
  50% { background-color: #D32F2F; color: #FFF; }
  100% { background-color: #FFD600; color: #000; }
`;
const orangeToRedFlash = keyframes`
  0% { background-color: #FF6D00; color: #FFF; }
  50% { background-color: #D32F2F; color: #FFF; }
  100% { background-color: #FF6D00; color: #FFF; }
`;
const alertPulse = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.02); }
  100% { opacity: 1; transform: scale(1); }
`;

const useStyles = makeStyles()((theme) => ({
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  avatarBase: {
    transition: 'all 0.3s ease-in-out',
    border: '4px solid transparent',
  },
  ignitionActive: {
    border: `4px solid ${theme.palette.success.main}`,
    animation: `${pulseGreen} 2s infinite`,
  },
  ignitionStale: {
    border: `4px solid ${theme.palette.success.main}`,
  },
  motionActive: {
    border: `4px solid ${theme.palette.warning.main}`,
    animation: `${pulseMotion} 2s infinite`,
  },
  ignitionInactive: {
    border: `4px solid ${theme.palette.neutral.main}44`,
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: theme.spacing(1),
    minWidth: '90px', 
  },
  speedRow: {
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: '2px',
  },
  iconRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
  },
  badgeBase: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid',
    padding: '1px 4px',
    borderRadius: '4px',
    fontWeight: 900,
    fontSize: '0.65rem',
    height: '18px',
  },
  statusBadge: {
    minWidth: '52px',
    width: '52px', 
  },
  input1Active: {
    backgroundColor: '#FFD600',
    color: 'black',
    borderColor: '#FBC02D',
    animation: `${pulseYellow} 2s infinite`,
  },
  input1Dull: {
    backgroundColor: '#FFF59D',
    color: 'rgba(0,0,0,0.5)',
    borderColor: '#FBC02D66',
  },
  input1Critical: {
    animation: `${yellowToRedFlash} 1s infinite`,
    borderColor: '#FBC02D',
  },
  input2Active: {
    backgroundColor: '#FF6D00',
    color: 'white',
    borderColor: '#E65100',
    animation: `${pulseOrange} 2s infinite`,
  },
  input2Dull: {
    backgroundColor: '#FFCCBC',
    color: 'rgba(0,0,0,0.6)',
    borderColor: '#E6510066',
  },
  input2Critical: {
    animation: `${orangeToRedFlash} 1s infinite`,
    borderColor: '#E65100',
  },
  voltageAlert: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    animation: `${alertPulse} 2s infinite ease-in-out`,
  },
  fuelAlert: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    borderColor: theme.palette.warning.dark,
  },
  immobActive: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  immobInactive: {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
  statusText: {
    display: 'block',
    fontSize: '0.75rem',
  },
  selected: { backgroundColor: theme.palette.action.selected },
}));

const DeviceRow = ({ devices, index, style }) => {
  const { classes, cx } = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  
  const item = devices[index];
  const position = useSelector((state) => state.session.positions[item.id]);
  
  // --- DYNAMIC SPEED UNIT LOGIC ---
  const defaultUnit = useAttributePreference('speedUnit', 'kn');
  
  // UPDATED: Removed jet_ski
  const isBoat = ['boat', 'ship'].includes(item.category);
  const isIgnitionOn = position?.attributes?.ignition;
  
  const speedUnit = isBoat 
    ? (isIgnitionOn ? 'kn' : 'kmh') 
    : defaultUnit;
  // --------------------------------

  const isDataStale = item.lastUpdate ? dayjs().diff(dayjs(item.lastUpdate), 'minute') > 10 : true;

  const getSpeedDisplay = () => {
    if (position && position.hasOwnProperty('speed')) {
      const formatted = formatSpeed(position.speed, speedUnit, t).replace(/\.\d+/, '');
      const parts = formatted.split(' ');
      return { value: parts[0], unit: parts.length > 1 ? parts[1] : '' };
    }
    return { value: '0', unit: '' };
  };

  const speedData = getSpeedDisplay();

  const renderFuelBadge = () => {
    if (!position?.attributes || !position.attributes.hasOwnProperty('fuelLevel')) {
      return null;
    }

    const level = parseFloat(position.attributes.fuelLevel); 
    const isLow = (position.attributes.hasOwnProperty('lowFuel') && position.attributes.lowFuel) || level < 15;

    return (
      <Tooltip title={`Fuel Level: ${level}%`}>
        <div className={cx(classes.badgeBase, classes.statusBadge, { [classes.fuelAlert]: isLow })}>
          <LocalGasStationIcon sx={{ fontSize: '0.7rem', mr: 0.2 }} />
          {level.toFixed(0)}%
        </div>
      </Tooltip>
    );
  };

  const renderInputBadge = (inputNum) => {
    const attrs = position?.attributes || {};
    const suffix = inputNum === 1 ? '1' : '2';
    const isInput1 = inputNum === 1;
    
    const activeClass = isInput1 ? classes.input1Active : classes.input2Active;
    const dullClass = isInput1 ? classes.input1Dull : classes.input2Dull;
    const critClass = isInput1 ? classes.input1Critical : classes.input2Critical;

    if (attrs[`floatSwitch${suffix}`] === true) {
      return (
        <Tooltip title="High Level!">
          <div className={cx(classes.badgeBase, critClass)}><WaterIcon sx={{ fontSize: '0.8rem' }} /></div>
        </Tooltip>
      );
    }
    if (attrs[`lowFuel${suffix}`] === true) {
      return (
        <Tooltip title="Low Fuel Level">
          <div className={cx(classes.badgeBase, activeClass)}><LocalGasStationIcon sx={{ fontSize: '0.8rem' }} /></div>
        </Tooltip>
      );
    }
    if (attrs.hasOwnProperty(`batteryIsolated${suffix}`)) {
      const isConnected = attrs[`batteryIsolated${suffix}`] === true;
      return (
        <Tooltip title={isConnected ? "Battery Connected" : "Battery Isolated"}>
          <div className={cx(classes.badgeBase, isConnected ? activeClass : dullClass)}>
            {isConnected ? <BatteryChargingFullIcon sx={{ fontSize: '0.8rem' }} /> : <BatteryAlertIcon sx={{ fontSize: '0.8rem' }} />}
          </div>
        </Tooltip>
      );
    }
    if (attrs.hasOwnProperty(`doorOpen${suffix}`)) {
      const isOpen = attrs[`doorOpen${suffix}`] === true;
      return (
        <Tooltip title={isOpen ? "Door Open" : "Door Closed"}>
          <div className={cx(classes.badgeBase, isOpen ? activeClass : dullClass)}>
            {isOpen ? <MeetingRoomIcon sx={{ fontSize: '0.8rem' }} /> : <DoorFrontIcon sx={{ fontSize: '0.8rem' }} />}
          </div>
        </Tooltip>
      );
    }
    if (attrs[`in${inputNum}`] === true) {
      return (
        <Tooltip title={`Input ${inputNum} Active`}>
          <div className={cx(classes.badgeBase, activeClass)}>{`IN${inputNum}`}</div>
        </Tooltip>
      );
    }
    return null;
  };

  const rawPower = position?.attributes?.power;
  const powerValue = (rawPower !== undefined && rawPower !== null) ? parseFloat(rawPower) : null;
  const isPowerCut = powerValue !== null && powerValue < 1.0;

  return (
    <div style={style}>
      <ListItemButton 
        onClick={() => dispatch(devicesActions.selectId(item.id))} 
        selected={selectedDeviceId === item.id}
        className={selectedDeviceId === item.id ? classes.selected : null}
      >
        <ListItemAvatar>
          <Avatar className={cx(classes.avatarBase, position?.attributes?.ignition ? (isDataStale ? classes.ignitionStale : classes.ignitionActive) : classes.ignitionInactive)}>
            <img className={classes.icon} src={mapIcons[mapIconKey(item.category)]} alt="" />
          </Avatar>
        </ListItemAvatar>
        
        <ListItemText 
          primary={item.name} 
          secondary={
            <Typography variant="caption" className={cx(classes.statusText, classes[getStatusColor(item.status)])}>
              {item.status === 'online' ? t('deviceStatusOnline') : dayjs(item.lastUpdate).fromNow()}
            </Typography>
          } 
          slotProps={{ primary: { noWrap: true, fontWeight: 'bold' } }} 
        />

        {position && (
          <div className={classes.rightColumn}>
            {/* Row 1: Speed */}
            <div className={classes.speedRow}>
              <Typography sx={{ 
                fontSize: '1.2rem', 
                fontWeight: 900, 
                lineHeight: 1,
                color: isDataStale ? 'text.secondary' : 'text.primary'
              }}>
                {speedData.value}
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', ml: 0.2, color: 'text.secondary', textTransform: 'uppercase' }}>
                {speedData.unit}
              </Typography>
            </div>

            {/* Row 2: Badges */}
            <div className={classes.iconRow}>
              {renderInputBadge(1)}
              {renderInputBadge(2)}
              {position.attributes.hasOwnProperty('immobiliser') ? (
                <div className={cx(classes.badgeBase, position.attributes.immobiliser ? classes.immobActive : classes.immobInactive)}>
                  <ShieldIcon sx={{ fontSize: '0.8rem' }} />
                </div>
              ) : (
                position.attributes.out1 && <div className={cx(classes.badgeBase, classes.out1Active)}>OUT1</div>
              )}

              {renderFuelBadge()}
              
              <Tooltip title={isPowerCut ? "Power Disconnected!" : "External Power"}>
                <div className={cx(classes.badgeBase, classes.statusBadge, { [classes.voltageAlert]: isPowerCut })}>
                  {isPowerCut ? (
                    <PowerOffIcon sx={{ fontSize: '0.7rem', mr: 0.2 }} />
                  ) : (
                    <BoltIcon sx={{ fontSize: '0.7rem', mr: 0.2 }} />
                  )}
                  {powerValue !== null ? `${powerValue.toFixed(1)}V` : "--.-V"}
                </div>
              </Tooltip>
            </div>
          </div>
        )}
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;

