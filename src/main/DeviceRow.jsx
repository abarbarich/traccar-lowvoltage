import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import {
  IconButton, Tooltip, Avatar, ListItemAvatar, ListItemText, ListItemButton,
  Typography,
} from '@mui/material';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60';
import Battery20Icon from '@mui/icons-material/Battery20';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import ErrorIcon from '@mui/icons-material/Error';
import PowerOffIcon from '@mui/icons-material/PowerOff'; // Added for Power Cut
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { devicesActions } from '../store';
import {
  formatAlarm, formatBoolean, formatPercentage, formatStatus, getStatusColor, formatSpeed,
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
    boxShadow: `0 0 5px ${theme.palette.success.main}44`,
    animation: 'none', 
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
    minWidth: '85px', 
  },
  speedRow: {
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: '1px',
  },
  iconRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  voltageText: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: theme.palette.text.secondary,
    marginRight: '4px',
  },
  voltageError: {
    color: theme.palette.error.main,
    fontWeight: 900,
  },
  statusText: {
    display: 'block',
    fontSize: '0.75rem',
  },
  success: { color: theme.palette.success.main },
  warning: { color: theme.palette.warning.main },
  error: { color: theme.palette.error.main },
  neutral: { color: theme.palette.neutral.main },
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
  const deviceSecondary = useAttributePreference('deviceSecondary', '');
  const speedUnit = useAttributePreference('speedUnit', 'kn');

  const isDataStale = item.lastUpdate ? dayjs().diff(dayjs(item.lastUpdate), 'minute') > 10 : true;
  const hasIgnition = position?.attributes.hasOwnProperty('ignition');
  const isIgnitionOn = hasIgnition && position.attributes.ignition;

  // Power Cut Logic
  const powerValue = position?.attributes.hasOwnProperty('power') ? parseFloat(position.attributes.power) : null;
  const isPowerCut = powerValue !== null && powerValue < 1.0;

  const getSpeedData = () => {
    if (position && position.hasOwnProperty('speed')) {
      const speedValue = position.speed;
      const showQuestion = speedValue > 0 && isDataStale;
      if (showQuestion) return { value: '?', unit: '', isStale: true };
      const formatted = formatSpeed(speedValue, speedUnit, t).replace(/\.\d+/, '');
      const parts = formatted.split(' ');
      return {
        value: parts[0],
        unit: parts.length > 1 ? parts[1] : '',
        isStale: false,
      };
    }
    return null;
  };

  const speedData = getSpeedData();

  const secondaryText = () => {
    let statusLabel = (item.status === 'online' || !item.lastUpdate) 
      ? formatStatus(item.status, t) 
      : dayjs(item.lastUpdate).fromNow();
    
    return (
      <>
        {deviceSecondary && item[deviceSecondary] && (
          <Typography variant="body2" component="span" display="block">
            {item[deviceSecondary]}
          </Typography>
        )}
        <Typography 
          variant="caption" 
          className={`${classes.statusText} ${classes[getStatusColor(item.status)]}`}
        >
          {statusLabel}
        </Typography>
      </>
    );
  };

  const getAvatarClass = () => {
    if (!hasIgnition) return '';
    if (isIgnitionOn) {
      return isDataStale ? classes.ignitionStale : classes.ignitionActive;
    }
    return classes.ignitionInactive;
  };

  return (
    <div style={style}>
      <ListItemButton
        key={item.id}
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
        selected={selectedDeviceId === item.id}
        className={selectedDeviceId === item.id ? classes.selected : null}
      >
        <ListItemAvatar>
          <Tooltip title={hasIgnition ? `${t('positionIgnition')}: ${formatBoolean(isIgnitionOn, t)}` : ""}>
            <Avatar className={`${classes.avatarBase} ${getAvatarClass()}`}>
              <img className={classes.icon} src={mapIcons[mapIconKey(item.category)]} alt="" />
            </Avatar>
          </Tooltip>
        </ListItemAvatar>
        
        <ListItemText
          primary={item[devicePrimary]}
          secondary={secondaryText()}
          slots={{ primary: Typography, secondary: 'div' }}
          slotProps={{
            primary: { noWrap: true, variant: 'body1', fontWeight: 'bold' },
            secondary: { noWrap: false },
          }}
        />
        
        {position && (
          <div className={classes.rightColumn}>
            {speedData && (
              <Tooltip title={t('positionSpeed')}>
                <div className={classes.speedRow}>
                  <Typography 
                    sx={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 900,
                      lineHeight: 1,
                      color: speedData.isStale ? 'error.main' : 'text.primary' 
                    }}
                  >
                    {speedData.value}
                  </Typography>
                  {speedData.unit && (
                    <Typography 
                      sx={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 400,
                        ml: 0.3,
                        color: speedData.isStale ? 'error.main' : 'text.secondary',
                        textTransform: 'lowercase'
                      }}
                    >
                      {speedData.unit}
                    </Typography>
                  )}
                </div>
              </Tooltip>
            )}

            <div className={classes.iconRow}>
              {powerValue !== null && (
                <Tooltip title={isPowerCut ? "MAIN POWER CUT" : "External Voltage"}>
                   <div style={{ display: 'flex', alignItems: 'center' }}>
                    {isPowerCut && <PowerOffIcon color="error" sx={{ fontSize: '0.9rem', mr: 0.3 }} />}
                    <Typography className={cx(classes.voltageText, { [classes.voltageError]: isPowerCut })}>
                      {powerValue.toFixed(1)}v
                    </Typography>
                  </div>
                </Tooltip>
              )}

              {position.attributes.hasOwnProperty('alarm') && (
                <Tooltip title={`${t('eventAlarm')}: ${formatAlarm(position.attributes.alarm, t)}`}>
                  <IconButton size="small" sx={{ p: 0.1 }}>
                    <ErrorIcon className={classes.error} style={{ fontSize: '1.1rem' }} />
                  </IconButton>
                </Tooltip>
              )}

              {position.attributes.hasOwnProperty('batteryLevel') && (
                <Tooltip title={`${t('positionBatteryLevel')}: ${formatPercentage(position.attributes.batteryLevel)}`}>
                  <IconButton size="small" sx={{ p: 0.1 }}>
                    {(position.attributes.batteryLevel > 70 && (
                      position.attributes.charge
                        ? (<BatteryChargingFullIcon style={{ fontSize: '1.1rem' }} className={classes.success} />)
                        : (<BatteryFullIcon style={{ fontSize: '1.1rem' }} className={classes.success} />)
                    )) || (position.attributes.batteryLevel > 30 && (
                      position.attributes.charge
                        ? (<BatteryCharging60Icon style={{ fontSize: '1.1rem' }} className={classes.warning} />)
                        : (<Battery60Icon style={{ fontSize: '1.1rem' }} className={classes.warning} />)
                    )) || (
                      position.attributes.charge
                        ? (<BatteryCharging20Icon style={{ fontSize: '1.1rem' }} className={classes.error} />)
                        : (<Battery20Icon style={{ fontSize: '1.1rem' }} className={classes.error} />)
                    )}
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>
        )}
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
