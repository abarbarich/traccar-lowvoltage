import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import {
  IconButton, Tooltip, Avatar, ListItemAvatar, ListItemText, ListItemButton,
  Typography, Box,
} from '@mui/material';
import PowerOffIcon from '@mui/icons-material/PowerOff';
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

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(76, 175, 80, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0px rgba(76, 175, 80, 0); }
`;

const motionPulse = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(255, 193, 7, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(255, 193, 7, 0); }
  100% { box-shadow: 0 0 0 0px rgba(255, 193, 7, 0); }
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
    boxShadow: `0 0 10px ${theme.palette.success.main}, 0 0 20px ${theme.palette.success.main}66`,
    animation: `${pulse} 2s infinite`,
  },
  ignitionStale: {
    border: `4px solid ${theme.palette.success.main}aa`,
    animation: 'none', 
  },
  motionActive: {
    border: `4px solid ${theme.palette.warning.main}`,
    boxShadow: `0 0 10px ${theme.palette.warning.main}, 0 0 20px ${theme.palette.warning.main}66`,
    animation: `${motionPulse} 2s infinite`,
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
    gap: '2px',
  },
  voltageBadge: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    padding: '1px 4px',
    borderRadius: '4px',
    fontWeight: 800,
    fontSize: '0.65rem',
    color: theme.palette.text.primary,
  },
  voltageAlert: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    borderColor: theme.palette.error.dark,
    animation: `${alertPulse} 2s infinite ease-in-out`,
  },
  statusText: {
    display: 'block',
    fontSize: '0.75rem',
  },
  success: { color: theme.palette.success.main },
  selected: { backgroundColor: theme.palette.action.selected },
}));

const DeviceRow = ({ devices, index, style }) => {
  const { classes, cx } = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const item = devices[index];
  const position = useSelector((state) => state.session.positions[item.id]);

  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  const speedUnit = useAttributePreference('speedUnit', 'kn');

  const isDataStale = item.lastUpdate ? dayjs().diff(dayjs(item.lastUpdate), 'minute') > 10 : true;
  
  const isIgnitionOn = position?.attributes?.ignition === true;
  const isTowing = position?.attributes?.tow === true;

  const rawPower = position?.attributes?.power;
  const powerValue = (rawPower !== undefined && rawPower !== null) ? parseFloat(rawPower) : null;
  const isPowerCut = powerValue !== null && powerValue < 1.0;

  const getSpeedData = () => {
    if (position && position.hasOwnProperty('speed')) {
      const speedValue = position.speed;
      if (speedValue > 0 && isDataStale) return { value: '?', unit: '', isStale: true };
      const formatted = formatSpeed(speedValue, speedUnit, t).replace(/\.\d+/, '');
      const parts = formatted.split(' ');
      return { value: parts[0], unit: parts.length > 1 ? parts[1] : '', isStale: false };
    }
    return null;
  };

  const speedData = getSpeedData();

  const getAvatarClass = () => {
    if (isIgnitionOn) return isDataStale ? classes.ignitionStale : classes.ignitionActive;
    if (isTowing && !isDataStale) return classes.motionActive;
    return classes.ignitionInactive;
  };

  return (
    <div style={style}>
      <ListItemButton
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
        selected={selectedDeviceId === item.id}
        className={selectedDeviceId === item.id ? classes.selected : null}
      >
        <ListItemAvatar>
          <Tooltip title={isTowing ? "Tow" : ""}>
            <Avatar className={cx(classes.avatarBase, getAvatarClass())}>
              <img className={classes.icon} src={mapIcons[mapIconKey(item.category)]} alt="" />
            </Avatar>
          </Tooltip>
        </ListItemAvatar>
        
        <ListItemText
          primary={item[devicePrimary]}
          secondary={
            <Typography variant="caption" className={cx(classes.statusText, classes[getStatusColor(item.status)])}>
              {(item.status === 'online' || !item.lastUpdate) ? formatStatus(item.status, t) : dayjs(item.lastUpdate).fromNow()}
            </Typography>
          }
          slotProps={{ primary: { noWrap: true, fontWeight: 'bold' } }}
        />
        
        {position && (
          <div className={classes.rightColumn}>
            {speedData && (
              <div className={classes.speedRow}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1, color: speedData.isStale ? 'error.main' : 'text.primary' }}>
                  {speedData.value}
                </Typography>
                <Typography sx={{ fontSize: '0.6rem', ml: 0.2, color: 'text.secondary', textTransform: 'uppercase' }}>
                  {speedData.unit}
                </Typography>
              </div>
            )}

            <div className={classes.iconRow}>
              <Tooltip title={powerValue === null ? t('sharedNoData') : (isPowerCut ? "MAIN POWER DISCONNECTED" : "External Power")}>
                <div className={cx(classes.voltageBadge, { [classes.voltageAlert]: isPowerCut })}>
                  {isPowerCut && <PowerOffIcon sx={{ fontSize: '0.7rem', mr: 0.2 }} />}
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
