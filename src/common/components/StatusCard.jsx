import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Typography, CardActions, IconButton,
  Table, TableBody, TableRow, TableCell, Tooltip, Avatar, Box,
  Button, CircularProgress, Snackbar, Alert,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';

// Common Icons
import CloseIcon from '@mui/icons-material/Close';
import RouteIcon from '@mui/icons-material/Route';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BatteryStdIcon from '@mui/icons-material/BatteryStd';

// Attribute Icons
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import WaterIcon from '@mui/icons-material/Water';

// Activity Icons
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useTranslation } from './LocalizationProvider';
import RemoveDialog from './RemoveDialog';
import PositionValue from './PositionValue';
import { useDeviceReadonly } from '../util/permissions';
import usePositionAttributes from '../attributes/usePositionAttributes';
import { devicesActions } from '../../store';
import { useCatch } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';
import fetchOrThrow from '../util/fetchOrThrow';
import { mapIconKey, mapIcons } from '../../map/core/preloadImages';
import { formatSpeed } from '../util/formatter';

dayjs.extend(relativeTime);

// ... (animations unchanged) ...
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
const bluePulse = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(33, 150, 243, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(33, 150, 243, 0); }
  100% { box-shadow: 0 0 0 0px rgba(33, 150, 243, 0); }
`;

const useStyles = makeStyles()((theme) => ({
  card: {
    pointerEvents: 'auto',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    borderRadius: 0,
    backgroundColor: theme.palette.background.paper,
    height: '100%', 
    [theme.breakpoints.down('md')]: {
      height: 'auto',           
      maxHeight: '50vh',        
      marginTop: 'auto',        
      borderTopLeftRadius: 12,  
      borderTopRightRadius: 12, 
      boxShadow: theme.shadows[20], 
      position: 'relative',
      zIndex: 5,
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(0.75, 2, 0.75, 2),
    backgroundColor: theme.palette.background.default,
    gap: theme.spacing(0.2),
  },
  controlRow: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(1),
    width: '100%',
  },
  actionButton: {
    flex: 1, 
    fontSize: '0.65rem',
    fontWeight: 900,
    textTransform: 'uppercase',
    boxShadow: 'none',
    padding: '2px 0',
    minHeight: '24px',
    '&:hover': {
      boxShadow: 'none',
    },
  },
  mainRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: theme.spacing(0.5),
  },
  speedValue: {
    fontSize: '3.2rem',
    fontWeight: 900,
    lineHeight: 0.8,
    letterSpacing: '-2px',
    color: theme.palette.text.primary,
  },
  hourMeterValue: {
    fontSize: '2.4rem', 
    fontWeight: 700,
    lineHeight: 1,
    color: theme.palette.text.primary,
    fontFamily: '"Roboto Mono", "Courier New", monospace',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-1px',
  },
  unitText: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(0.5),
    textTransform: 'uppercase',
  },
  avatarBase: {
    width: 42,
    height: 42,
    border: '3px solid transparent',
    transition: 'all 0.3s ease',
    backgroundColor: theme.palette.primary.main,
  },
  ignitionActive: {
    border: `3px solid ${theme.palette.success.main}`,
    animation: `${pulseGreen} 2s infinite`,
  },
  ignitionStale: {
    border: `3px solid ${theme.palette.success.main}`,
  },
  motionActive: {
    border: `3px solid ${theme.palette.warning.main}`,
    animation: `${pulseMotion} 2s infinite`,
  },
  ignitionInactive: {
    border: `3px solid ${theme.palette.neutral.main}44`,
  },
  iconImage: {
    width: '24px',
    height: '24px',
    filter: 'brightness(0) invert(1)',
  },
  badgeGroup: {
    display: 'flex',
    gap: theme.spacing(0.5),
    alignItems: 'center',
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
    color: theme.palette.text.primary,
    textTransform: 'uppercase',
    height: '18px',
    gap: '4px',
    whiteSpace: 'nowrap',
  },
  gaugeBadge: {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    borderColor: theme.palette.divider,
    color: theme.palette.text.primary,
  },
  statusBadge: {
    height: '18px',
    width: '52px', 
    padding: '0 4px',
    fontWeight: 900,
  },
  input1Active: {
    backgroundColor: '#FFD600',
    color: 'black',
    borderColor: '#FBC02D',
    animation: `${pulseYellow} 2s infinite`,
  },
  input1Dull: {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.text.disabled,
    borderColor: theme.palette.divider,
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
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.text.disabled,
    borderColor: theme.palette.divider,
  },
  input2Critical: {
    animation: `${orangeToRedFlash} 1s infinite`,
    borderColor: '#E65100',
  },
  out1Active: {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
    borderColor: theme.palette.info.dark,
    animation: `${bluePulse} 2s infinite`,
  },
  immobActive: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  immobInactive: {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.text.disabled,
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
  // --- STYLES FOR ACTIVITY ---
  activityMove: {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
    borderColor: theme.palette.info.dark,
  },
  activityRun: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    borderColor: theme.palette.success.dark,
  },
  activityStill: {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.text.secondary,
    borderColor: theme.palette.divider,
  },
  activityUnknown: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(0.5, 2),
  },
  table: {
    '& .MuiTableCell-root': {
      borderBottom: 'none',
      padding: theme.spacing(0.3, 0),
    },
  },
  actions: {
    justifyContent: 'space-between',
    padding: theme.spacing(0.5, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
  },
}));

const StatusCard = ({ deviceId, position: positionProp, onClose, disableActions }) => {
  const { classes, cx } = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();
  const isReplay = !!disableActions;

  const livePosition = useSelector((state) => 
    !isReplay ? state.session.positions[deviceId || positionProp?.deviceId] : null
  );
  
  const position = livePosition || positionProp;
  const device = useSelector((state) => state.devices.items[deviceId || position?.deviceId]);
  
  const defaultUnit = useAttributePreference('speedUnit', 'kn');
  const isBoat = ['boat', 'ship'].includes(device?.category);
  const isIgnitionOn = position?.attributes?.ignition;
  const speedUnit = isBoat 
    ? (isIgnitionOn ? 'kn' : 'kmh') 
    : defaultUnit;

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference('positionItems', 'fixTime,address,speed,totalDistance');
  
  const [removing, setRemoving] = useState(false);
  const [commandLoading, setCommandLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const isDataStale = !isReplay && position ? dayjs().diff(dayjs(position.fixTime), 'minute') > 10 : false;

  const hasImmobiliserAttr = position?.attributes?.hasOwnProperty('immobiliser');
  const isOut1Active = position?.attributes?.out1?.toString() === 'true';

  const deviceHasImmobiliser = device?.attributes?.enableImmobiliser === true;
  const deviceHasOutput = device?.attributes?.enableOutput === true;

  const input1Source = device?.attributes?.input1Source || 'in1';
  const input2Source = device?.attributes?.input2Source || 'in2';
  const fuelSource = device?.attributes?.fuelSource || 'fuelLevel';
  
  const hoursSource = device?.attributes?.hoursSource || 'hours';
  const isGenerator = device?.category === 'generator';
  const showHoursOnly = device?.attributes?.enableHoursOnly === true || isGenerator;
  const showBoth = !showHoursOnly && device?.attributes?.enableHours === true;

  const formatHours = (ms) => {
    if (!ms) return '0000.0';
    const hours = parseFloat(ms) / 3600000;
    const fixed = hours.toFixed(1); 
    const [int, dec] = fixed.split('.');
    const paddedInt = int.padStart(4, '0');
    return `${paddedInt}.${dec}`;
  };

  const rawHours = position?.attributes?.[hoursSource];
  const hoursValue = formatHours(rawHours);
  const speedDisplay = position ? formatSpeed(position.speed, speedUnit, t).split(' ') : ['0', ''];

  const isImmobilised = hasImmobiliserAttr 
    ? position?.attributes?.immobiliser?.toString() === 'true'
    : isOut1Active;

  useEffect(() => {
    setPendingAction(null);
    setCommandLoading(false);
    setSnackbarOpen(false);
  }, [deviceId]);

  useEffect(() => {
    if (deviceHasImmobiliser) {
      if (pendingAction === 'arming' && isImmobilised) setPendingAction(null);
      if (pendingAction === 'disarming' && !isImmobilised) setPendingAction(null);
    } else if (deviceHasOutput) {
      if (pendingAction === 'on' && isOut1Active) setPendingAction(null);
      if (pendingAction === 'off' && !isOut1Active) setPendingAction(null);
    }
  }, [position, pendingAction, isImmobilised, isOut1Active, deviceHasImmobiliser, deviceHasOutput]);

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetchOrThrow('/api/devices');
      dispatch(devicesActions.refresh(await response.json()));
    }
    setRemoving(false);
  });

  const handleCustomCommand = useCatch(async (commandString, actionType) => {
    setCommandLoading(true);
    try {
      await fetchOrThrow('/api/commands/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: device.id,
          type: 'custom',
          attributes: { data: commandString },
        }),
      });
      setPendingAction(actionType);
      setSnackbarOpen(true);
    } finally {
      setCommandLoading(false);
    }
  });

  const getAvatarClass = () => {
    if (position?.attributes?.tow?.toString() === 'true' && !isDataStale) return classes.motionActive;
    if (position?.attributes?.ignition?.toString() === 'true') {
      return isDataStale ? classes.ignitionStale : classes.ignitionActive;
    }
    return classes.ignitionInactive;
  };

  const renderFuelBadge = () => {
    if (!position?.attributes || !position.attributes.hasOwnProperty(fuelSource)) {
      return null;
    }
    const level = parseFloat(position.attributes[fuelSource]); 
    const isLow = (position.attributes.hasOwnProperty('lowFuel') && position.attributes.lowFuel) || level < 15;
    return (
      <Tooltip title={`Fuel Level: ${level}%`}>
        <div 
          className={cx(classes.badgeBase, classes.statusBadge, isLow ? classes.fuelAlert : classes.gaugeBadge)}
        >
          <LocalGasStationIcon sx={{ fontSize: '0.7rem', mr: 0.2 }} />
          <span>{level.toFixed(0)}</span>
          <span style={{ paddingLeft: '1px', opacity: 0.7 }}>%</span>
        </div>
      </Tooltip>
    );
  };

  const renderPowerBadge = () => {
    if (device?.category === 'person') {
       const batteryLevel = position?.attributes?.batteryLevel;
       if (batteryLevel !== undefined && batteryLevel !== null) {
         const isLowBat = batteryLevel < 20; 
         return (
            <Tooltip title={`Phone Battery: ${batteryLevel}%`}>
              <div className={cx(classes.badgeBase, classes.statusBadge, isLowBat ? classes.voltageAlert : classes.gaugeBadge)}>
                <BatteryStdIcon sx={{ fontSize: '0.7rem', mr: 0.2 }} />
                <span>{batteryLevel}</span>
                <span style={{ paddingLeft: '1px', opacity: 0.7 }}>%</span>
              </div>
            </Tooltip>
         );
       }
       return null;
    }
    const rawPower = position?.attributes?.power;
    const powerValue = (rawPower !== undefined && rawPower !== null) ? parseFloat(rawPower) : null;
    const isPowerCut = powerValue !== null && powerValue < 1.0;
    return (
      <Tooltip title={isPowerCut ? "Power Disconnected!" : "External Power"}>
        <div className={cx(classes.badgeBase, classes.statusBadge, isPowerCut ? classes.voltageAlert : classes.gaugeBadge)}>
          {isPowerCut ? (
            <PowerOffIcon sx={{ fontSize: '0.7rem', mr: 0.2 }} />
          ) : (
            <BoltIcon sx={{ fontSize: '0.7rem', mr: 0.2 }} />
          )}
          {powerValue !== null ? (
            <>
              <span>{powerValue.toFixed(1)}</span>
              <span style={{ paddingLeft: '1px', opacity: 0.7 }}>V</span>
            </>
          ) : "---V"}
        </div>
      </Tooltip>
    );
  };

  const renderInputBadge = (inputNum) => {
    const inputType = device?.attributes?.[`input${inputNum}Type`];
    const currentSource = inputNum === 1 ? input1Source : input2Source;
    const rawVal = position?.attributes?.[currentSource];
    const active = rawVal === true || rawVal?.toString() === 'true'; 

    if (!inputType) {
      if (active) {
        const isInput1 = inputNum === 1;
        const activeClass = isInput1 ? classes.input1Active : classes.input2Active;
        return (
          <Tooltip title={`Input ${inputNum} Active`}>
            <div className={cx(classes.badgeBase, activeClass)}>
              <span>{`IN${inputNum} ON`}</span>
            </div>
          </Tooltip>
        );
      }
      return null;
    }

    const isInput1 = inputNum === 1;
    const onClassBase = isInput1 ? classes.input1Active : classes.input2Active;
    const offClassBase = isInput1 ? classes.input1Dull : classes.input2Dull;
    const critClassBase = isInput1 ? classes.input1Critical : classes.input2Critical;

    let badgeProps = { label: "UNKNOWN", icon: null, styleClass: offClassBase, tooltip: "" };

    switch (inputType) {
      case 'bilge':
        badgeProps = {
          label: active ? "HIGH LEVEL" : "LEVEL OK",
          icon: <WaterIcon sx={{ fontSize: '0.8rem' }} />,
          styleClass: active ? critClassBase : offClassBase,
          tooltip: active ? "Bilge High Water Alert" : "Bilge Level Normal"
        };
        break;
      case 'fuel':
        badgeProps = {
          label: active ? "FUEL LOW" : "FUEL OK",
          icon: <LocalGasStationIcon sx={{ fontSize: '0.8rem' }} />,
          styleClass: active ? onClassBase : offClassBase,
          tooltip: active ? "Low Fuel Level" : "Fuel Level OK"
        };
        break;
      case 'battery':
        badgeProps = {
          label: active ? "CONNECTED" : "ISOLATED",
          icon: active ? <BatteryChargingFullIcon sx={{ fontSize: '0.8rem' }} /> : <BatteryAlertIcon sx={{ fontSize: '0.8rem' }} />,
          styleClass: active ? onClassBase : offClassBase,
          tooltip: active ? "Battery Connected" : "Battery Isolated"
        };
        break;
      case 'door':
        badgeProps = {
          label: active ? "OPEN" : "CLOSED",
          icon: active ? <MeetingRoomIcon sx={{ fontSize: '0.8rem' }} /> : <DoorFrontIcon sx={{ fontSize: '0.8rem' }} />,
          styleClass: active ? onClassBase : offClassBase,
          tooltip: active ? "Door Open" : "Door Closed"
        };
        break;
      default: 
        badgeProps = {
          label: active ? `IN${inputNum} ON` : `IN${inputNum} OFF`,
          icon: null,
          styleClass: active ? onClassBase : offClassBase,
          tooltip: `Input ${inputNum} State`
        };
    }

    return (
      <Tooltip title={badgeProps.tooltip}>
        <div className={cx(classes.badgeBase, badgeProps.styleClass)}>
          {badgeProps.icon}
          <span>{badgeProps.label}</span>
        </div>
      </Tooltip>
    );
  };

  const renderActivityBadge = () => {
    const activity = position?.attributes?.activity;
    if (!activity) return null;

    let icon = <HelpOutlineIcon sx={{ fontSize: '0.8rem' }} />;
    let label = activity.replace('_', ' ').toUpperCase();
    let styleClass = classes.activityUnknown;

    switch (activity) {
      case 'in_vehicle':
        icon = <DirectionsCarIcon sx={{ fontSize: '0.8rem' }} />;
        styleClass = classes.activityMove; 
        label = "DRIVING";
        break;
      case 'on_bicycle':
        icon = <DirectionsBikeIcon sx={{ fontSize: '0.8rem' }} />;
        styleClass = classes.activityMove;
        label = "CYCLING";
        break;
      case 'running':
        icon = <DirectionsRunIcon sx={{ fontSize: '0.8rem' }} />;
        styleClass = classes.activityRun; 
        break;
      case 'on_foot':
      case 'walking':
        icon = <DirectionsWalkIcon sx={{ fontSize: '0.8rem' }} />;
        styleClass = classes.activityRun;
        label = "WALKING";
        break;
      case 'still':
        icon = <AccessibilityNewIcon sx={{ fontSize: '0.8rem' }} />;
        styleClass = classes.activityStill; 
        break;
      case 'unknown':
      default:
        styleClass = classes.activityUnknown; 
        break;
    }

    return (
       <Tooltip title={`Phone Activity: ${label}`}>
         <div className={cx(classes.badgeBase, styleClass)} style={{ padding: '0 4px', minWidth: 'unset' }}>
           {icon}
           <span style={{ marginLeft: '4px' }}>{label}</span>
         </div>
       </Tooltip>
    );
  };

  const hiddenKeys = [
    'power', 'ignition', 'motion', 'tow', 'activity',
    fuelSource, 
    input1Source, 
    input2Source,
    'batteryLevel'
  ];
  if (deviceHasImmobiliser) hiddenKeys.push('immobiliser', 'out1');
  if (deviceHasOutput) hiddenKeys.push('out1');
  if (showHoursOnly || showBoth) hiddenKeys.push(hoursSource);

  return (
    <>
      {(device || position) && (
        <Card elevation={0} className={classes.card}>
          <div className={classes.header}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>
              {device?.name || t('sharedUnknown')}
            </Typography>
            <div className={classes.headerActions}>
              {position?.id && (
                <Tooltip title={t('sharedShowDetails')}>
                  <IconButton size="small" onClick={() => navigate(`/position/${position.id}`)}>
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton size="small" onClick={onClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </div>

          <div className={classes.heroSection}>
            <div className={classes.mainRow}>
              <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
                  <Typography className={showHoursOnly ? classes.hourMeterValue : classes.speedValue}>
                    {showHoursOnly ? hoursValue : speedDisplay[0].replace(/\.\d+/, '')}
                  </Typography>
                  <Typography className={classes.unitText}>
                    {showHoursOnly ? 'HR' : speedDisplay[1]}
                  </Typography>
                </Box>
                {showBoth && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: '0.8rem', color: 'text.secondary', mr: 0.5 }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 700, 
                        color: 'text.primary',
                        fontFamily: '"Roboto Mono", "Courier New", monospace',
                        fontVariantNumeric: 'tabular-nums' 
                      }}
                    >
                      {hoursValue} HR
                    </Typography>
                  </Box>
                )}
                {position?.fixTime && (
                  <Typography 
                    variant="caption" 
                    sx={{ color: isDataStale ? 'text.secondary' : 'success.main', fontWeight: 700, fontSize: '0.6rem', mt: 0.2, textTransform: 'uppercase' }}
                  >
                    {dayjs(position.fixTime).fromNow()}
                  </Typography>
                )}
              </Box>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <Tooltip title={position?.attributes?.tow?.toString() === 'true' ? "Tow" : ""}>
                  <Avatar className={cx(classes.avatarBase, getAvatarClass())}>
                    <img className={classes.iconImage} src={mapIcons[mapIconKey(device?.category || 'default')]} alt="" />
                  </Avatar>
                </Tooltip>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                  {renderFuelBadge()}
                  {/* --- MOVED ACTIVITY BADGE HERE --- */}
                  {renderActivityBadge()}
                  {renderPowerBadge()}
                </div>
              </div>
            </div>

            <div className={classes.footerRow}>
              <div className={classes.badgeGroup}>
                  {deviceHasImmobiliser && (
                    <Tooltip title={isImmobilised ? "Immobiliser Armed" : "Immobiliser Disarmed"}>
                      <div className={cx(classes.badgeBase, isImmobilised ? classes.immobActive : classes.immobInactive)}>
                        <ShieldIcon sx={{ fontSize: '0.7rem', mr: 0.2 }} />
                        <span>{isImmobilised ? "IMMOBILISED" : "DISARMED"}</span>
                      </div>
                    </Tooltip>
                  )}
                  {deviceHasOutput && isOut1Active && (
                    <div className={cx(classes.badgeBase, classes.out1Active)}>
                       <span>OUTPUT 1 ON</span>
                    </div>
                  )}
                  {!deviceHasImmobiliser && !deviceHasOutput && isOut1Active && (
                     <div className={cx(classes.badgeBase, classes.out1Active)}>
                       <span>OUTPUT 1 ON</span>
                    </div>
                  )}
              </div>
              <div className={classes.badgeGroup}>
                {renderInputBadge(1)}
                {renderInputBadge(2)}
              </div>
            </div>

            {/* ... Rest of component ... */}
            {!isReplay && (
              <div className={classes.controlRow}>
                 {/* ... (buttons code) ... */}
                 {deviceHasImmobiliser && (
                  pendingAction ? (
                    <Button
                      size="small"
                      variant="contained"
                      color="warning" 
                      className={classes.actionButton}
                      startIcon={<HourglassTopIcon fontSize="small" sx={{ fontSize: '0.9rem', animation: 'spin 2s linear infinite' }} />}
                      disabled={true} 
                      sx={{ '&.Mui-disabled': { backgroundColor: '#ed6c02', color: 'white', opacity: 0.8 }}}
                    >
                      {pendingAction === 'arming' ? 'ARMING...' : 'DISARMING...'}
                    </Button>
                  ) : isImmobilised ? (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      className={classes.actionButton}
                      startIcon={commandLoading ? <CircularProgress size={12} color="inherit" /> : <LockOpenIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />}
                      onClick={() => handleCustomCommand('setdigout 0', 'disarming')}
                      disabled={deviceReadonly || commandLoading}
                    >
                      DISARM IMMOBILISER
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      className={classes.actionButton}
                      startIcon={commandLoading ? <CircularProgress size={12} color="inherit" /> : <LockIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />}
                      onClick={() => handleCustomCommand('setdigout 1', 'arming')}
                      disabled={deviceReadonly || commandLoading}
                    >
                      ARM IMMOBILISER
                    </Button>
                  )
                )}
                 {/* ... (output buttons) ... */}
              </div>
            )}
          </div>
          <CardContent className={classes.content}>
             {/* ... (table code) ... */}
            <Table size="small" className={classes.table}>
              <TableBody>
                {position && positionItems.split(',')
                  .filter((key) => !hiddenKeys.includes(key)) 
                  .filter((key) => position.hasOwnProperty(key) || position.attributes?.hasOwnProperty(key))
                  .map((key) => (
                  <TableRow key={key}>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                        {positionAttributes[key]?.name || key}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        <PositionValue
                          position={position}
                          property={position.hasOwnProperty(key) ? key : null}
                          attribute={position.hasOwnProperty(key) ? null : key}
                        />
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          {!isReplay && (
            <CardActions className={classes.actions} disableSpacing>
              <IconButton size="small" onClick={() => navigate(`/replay?deviceId=${device.id}`)}><RouteIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={() => navigate(`/settings/device/${device.id}/command`)}><SendIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={() => navigate(`/settings/device/${device.id}`)} disabled={deviceReadonly}><EditIcon fontSize="small" /></IconButton>
              <IconButton size="small" color="error" onClick={() => setRemoving(true)} disabled={deviceReadonly}><DeleteIcon fontSize="small" /></IconButton>
            </CardActions>
          )}
        </Card>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', fontWeight: 'bold' }}>
          Command Queued
        </Alert>
      </Snackbar>

      <RemoveDialog open={removing} endpoint="devices" itemId={device?.id} onResult={handleRemove} />
    </>
  );
};

export default StatusCard;
