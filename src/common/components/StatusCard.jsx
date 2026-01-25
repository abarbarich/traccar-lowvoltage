import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Avatar,
  Box,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import CloseIcon from '@mui/icons-material/Close';
import RouteIcon from '@mui/icons-material/Route';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import ShieldIcon from '@mui/icons-material/Shield';

// Attribute Icons
import DoorFrontIcon from '@mui/icons-material/DoorFront'; 
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'; 
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull'; 
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert'; 
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import WaterIcon from '@mui/icons-material/Water';

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
    height: '100%',
    width: '100%',
    borderRadius: 0,
    backgroundColor: theme.palette.background.paper,
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
    border: `1px solid ${theme.palette.divider}`,
    padding: '1px 6px',
    borderRadius: '4px',
    fontWeight: 900,
    fontSize: '0.6rem',
    color: theme.palette.text.primary,
    textTransform: 'uppercase',
    height: '18px',
    gap: '4px',
    whiteSpace: 'nowrap',
  },
  voltageBadge: {
    height: '22px',
    padding: '0 8px',
    fontSize: '0.75rem',
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
  
  const speedUnit = useAttributePreference('speedUnit', 'kn');
  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference('positionItems', 'fixTime,address,speed,totalDistance');
  
  const [removing, setRemoving] = useState(false);

  const isDataStale = !isReplay && position ? dayjs().diff(dayjs(position.fixTime), 'minute') > 10 : false;

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetchOrThrow('/api/devices');
      dispatch(devicesActions.refresh(await response.json()));
    }
    setRemoving(false);
  });

  const getAvatarClass = () => {
    if (position?.attributes?.tow?.toString() === 'true' && !isDataStale) return classes.motionActive;
    if (position?.attributes?.ignition?.toString() === 'true') {
      return isDataStale ? classes.ignitionStale : classes.ignitionActive;
    }
    return classes.ignitionInactive;
  };

  const renderInputBadge = (inputNum) => {
    const attrs = position?.attributes || {};
    const suffix = inputNum === 1 ? '1' : '2';
    const isInput1 = inputNum === 1;
    
    const activeClass = isInput1 ? classes.input1Active : classes.input2Active;
    const dullClass = isInput1 ? classes.input1Dull : classes.input2Dull;
    const critClass = isInput1 ? classes.input1Critical : classes.input2Critical;

    const hasAttr = (key) => attrs.hasOwnProperty(key);
    const isTrue = (key) => attrs[key]?.toString() === 'true';

    if (hasAttr(`floatSwitch${suffix}`)) {
      const active = isTrue(`floatSwitch${suffix}`);
      return (
        <Tooltip title={active ? "High Level Warning" : "Level Normal"}>
          <div className={cx(classes.badgeBase, active ? critClass : dullClass)}>
            <WaterIcon sx={{ fontSize: '0.8rem' }} />
            <span>{active ? "BILGE HIGH" : "BILGE OK"}</span>
          </div>
        </Tooltip>
      );
    }
    if (hasAttr(`lowFuel${suffix}`)) {
      const active = isTrue(`lowFuel${suffix}`);
      return (
        <Tooltip title={active ? "Low Fuel Level" : "Fuel Level OK"}>
          <div className={cx(classes.badgeBase, active ? activeClass : dullClass)}>
            <LocalGasStationIcon sx={{ fontSize: '0.8rem' }} />
            <span>{active ? "FUEL LOW" : "FUEL OK"}</span>
          </div>
        </Tooltip>
      );
    }
    if (hasAttr(`batteryIsolated${suffix}`)) {
      const isConnected = isTrue(`batteryIsolated${suffix}`);
      return (
        <Tooltip title={isConnected ? "Battery Connected" : "Battery Isolated"}>
          <div className={cx(classes.badgeBase, isConnected ? activeClass : dullClass)}>
            {isConnected ? <BatteryChargingFullIcon sx={{ fontSize: '0.8rem' }} /> : <BatteryAlertIcon sx={{ fontSize: '0.8rem' }} />}
            <span>{isConnected ? "BATT ON" : "BATT OFF"}</span>
          </div>
        </Tooltip>
      );
    }
    if (hasAttr(`doorOpen${suffix}`)) {
      const isOpen = isTrue(`doorOpen${suffix}`);
      return (
        <Tooltip title={isOpen ? "Door Open" : "Door Closed"}>
          <div className={cx(classes.badgeBase, isOpen ? activeClass : dullClass)}>
            {isOpen ? <MeetingRoomIcon sx={{ fontSize: '0.8rem' }} /> : <DoorFrontIcon sx={{ fontSize: '0.8rem' }} />}
            <span>{isOpen ? "OPEN" : "CLOSED"}</span>
          </div>
        </Tooltip>
      );
    }
    if (isTrue(`in${inputNum}`)) {
      return (
        <Tooltip title={`Input ${inputNum} Active`}>
          <div className={cx(classes.badgeBase, activeClass)}>
            <span>{`IN${inputNum} ON`}</span>
          </div>
        </Tooltip>
      );
    }
    return null;
  };

  const hasImmobiliserAttr = position?.attributes?.hasOwnProperty('immobiliser');
  const isImmobilised = position?.attributes?.immobiliser?.toString() === 'true';
  const isOut1Active = position?.attributes?.out1?.toString() === 'true';
  
  const rawPower = position?.attributes?.power;
  const powerValue = (rawPower !== undefined && rawPower !== null) ? parseFloat(rawPower) : null;
  const isPowerCut = powerValue !== null && powerValue < 1.0;

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
                  <Typography className={classes.speedValue}>
                    {position ? formatSpeed(position.speed, speedUnit, t).split(' ')[0].replace(/\.\d+/, '') : '0'}
                  </Typography>
                  <Typography className={classes.unitText}>
                    {formatSpeed(0, speedUnit, t).split(' ')[1]}
                  </Typography>
                </Box>
                {position?.fixTime && (
                  <Typography 
                    variant="caption" 
                    sx={{ color: isDataStale ? 'text.secondary' : 'success.main', fontWeight: 700, fontSize: '0.6rem', pl: 0.5, textTransform: 'uppercase' }}
                  >
                    {dayjs(position.fixTime).fromNow()}
                  </Typography>
                )}
              </Box>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tooltip title={isPowerCut ? "MAIN POWER DISCONNECTED" : "External Power"}>
                  <div className={cx(classes.badgeBase, classes.voltageBadge, { [classes.voltageAlert]: isPowerCut })}>
                    {isPowerCut && <PowerOffIcon sx={{ fontSize: '0.8rem', mr: 0.5 }} />}
                    {powerValue !== null ? `${powerValue.toFixed(1)}V` : "---V"}
                  </div>
                </Tooltip>
                
                <Tooltip title={position?.attributes?.tow?.toString() === 'true' ? "Tow" : ""}>
                  <Avatar className={cx(classes.avatarBase, getAvatarClass())}>
                    <img className={classes.iconImage} src={mapIcons[mapIconKey(device?.category || 'default')]} alt="" />
                  </Avatar>
                </Tooltip>
              </div>
            </div>

            <div className={classes.footerRow}>
              <div className={classes.badgeGroup}>
                {hasImmobiliserAttr ? (
                  <div className={cx(classes.badgeBase, isImmobilised ? classes.immobActive : classes.immobInactive)}>
                    <ShieldIcon sx={{ fontSize: '0.7rem' }} />
                    <span>{isImmobilised ? "SECURE" : "DISARMED"}</span>
                  </div>
                ) : (
                  isOut1Active && (
                    <div className={cx(classes.badgeBase, classes.out1Active)}>
                       <span>OUT1 ON</span>
                    </div>
                  )
                )}
              </div>

              <div className={classes.badgeGroup}>
                {renderInputBadge(1)}
                {renderInputBadge(2)}
              </div>
            </div>
          </div>

          <CardContent className={classes.content}>
            <Table size="small" className={classes.table}>
              <TableBody>
                {position && positionItems.split(',').filter((key) => position.hasOwnProperty(key) || position.attributes?.hasOwnProperty(key)).map((key) => (
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

      <RemoveDialog open={removing} endpoint="devices" itemId={device?.id} onResult={handleRemove} />
    </>
  );
};

export default StatusCard;
