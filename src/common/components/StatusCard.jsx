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
    padding: theme.spacing(1, 1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  heroSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 3),
    backgroundColor: theme.palette.background.default,
  },
  speedValue: {
    fontSize: '3.5rem',
    fontWeight: 900,
    lineHeight: 0.8,
    letterSpacing: '-2px',
  },
  unitText: {
    fontSize: '1rem',
    fontWeight: 700,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(0.5),
    textTransform: 'uppercase',
  },
  avatarBase: {
    width: 40,
    height: 40,
    border: '3px solid transparent',
    transition: 'all 0.3s ease',
    backgroundColor: theme.palette.primary.main,
  },
  ignitionActive: {
    border: `3px solid ${theme.palette.success.main}`,
    boxShadow: `0 0 8px ${theme.palette.success.main}66`,
    animation: `${pulse} 2s infinite`,
  },
  motionActive: {
    border: `3px solid ${theme.palette.warning.main}`,
    boxShadow: `0 0 8px ${theme.palette.warning.main}66`,
    animation: `${motionPulse} 2s infinite`,
  },
  ignitionInactive: {
    border: `3px solid ${theme.palette.neutral.main}44`,
  },
  iconImage: {
    width: '24px',
    height: '24px',
    filter: 'brightness(0) invert(1)',
  },
  voltageBadge: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(0.2, 0.8),
    borderRadius: '4px',
    fontWeight: 800,
    fontSize: '0.75rem',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
  },
  voltageAlert: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    borderColor: theme.palette.error.dark,
    animation: `${alertPulse} 2s infinite ease-in-out`,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(1, 2),
  },
  table: {
    '& .MuiTableCell-root': {
      borderBottom: 'none',
      padding: theme.spacing(0.5, 0),
    },
  },
  actions: {
    justifyContent: 'space-between',
    padding: theme.spacing(1, 2),
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
  
  // Use live state to ensure parity with DeviceRow
  const livePosition = useSelector((state) => state.session.positions[deviceId || positionProp?.deviceId]);
  const position = livePosition || positionProp;
  const device = useSelector((state) => state.devices.items[deviceId || position?.deviceId]);
  
  const speedUnit = useAttributePreference('speedUnit', 'kn');
  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference('positionItems', 'fixTime,address,speed,totalDistance');
  
  const [removing, setRemoving] = useState(false);

  // New Tow-Based Logic
  const isIgnitionOn = position?.attributes?.ignition === true;
  const isTowing = position?.attributes?.tow === true; // Utilizing the specific 'tow' attribute

  const rawPower = position?.attributes?.power;
  const powerValue = (rawPower !== undefined && rawPower !== null) ? parseFloat(rawPower) : null;
  const isPowerCut = powerValue !== null && powerValue < 1.0;

  const isReplay = !!disableActions; 
  const isDataStale = !isReplay && position ? dayjs().diff(dayjs(position.fixTime), 'minute') > 10 : false;

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetchOrThrow('/api/devices');
      dispatch(devicesActions.refresh(await response.json()));
    }
    setRemoving(false);
  });

  const getAvatarClass = () => {
    if (isIgnitionOn && !isDataStale) return classes.ignitionActive;
    if (isTowing && !isDataStale) return classes.motionActive;
    return classes.ignitionInactive;
  };

  return (
    <>
      {(device || position) && (
        <Card elevation={0} className={classes.card}>
          <div className={classes.header}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
                <Typography 
                  className={classes.speedValue} 
                  sx={{ color: isDataStale && position?.speed > 0 ? 'error.main' : 'text.primary' }}
                >
                  {position ? formatSpeed(position.speed, speedUnit, t).split(' ')[0].replace(/\.\d+/, '') : '0'}
                </Typography>
                <Typography className={classes.unitText}>
                  {formatSpeed(0, speedUnit, t).split(' ')[1]}
                </Typography>
              </Box>
              
              {position?.fixTime && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: isDataStale ? 'error.main' : 'text.secondary', 
                    fontWeight: 700,
                    mt: 0.2, 
                    pl: 0.8,            
                    textTransform: 'uppercase',
                    fontSize: '0.6rem',
                    letterSpacing: '0.05rem',
                    display: 'block'
                  }}
                >
                  {dayjs(position.fixTime).fromNow()}
                </Typography>
              )}
            </Box>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
              <Tooltip title={powerValue === null ? t('sharedNoData') : (isPowerCut ? "MAIN POWER DISCONNECTED" : "External Voltage")}>
                <div className={cx(classes.voltageBadge, { [classes.voltageAlert]: isPowerCut })}>
                  {isPowerCut && <PowerOffIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />}
                  {powerValue !== null ? `${powerValue.toFixed(1)}V` : "---V"}
                </div>
              </Tooltip>
              
              <Tooltip title={isTowing ? "Tow" : ""}>
                <Avatar className={cx(classes.avatarBase, getAvatarClass())}>
                  <img className={classes.iconImage} src={mapIcons[mapIconKey(device?.category || 'default')]} alt="" />
                </Avatar>
              </Tooltip>
            </div>
          </div>

          <CardContent className={classes.content}>
            <Table size="small" className={classes.table}>
              <TableBody>
                {position && positionItems.split(',').filter((key) => position.hasOwnProperty(key) || position.attributes?.hasOwnProperty(key)).map((key) => (
                  <TableRow key={key}>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase' }}>
                        {positionAttributes[key]?.name || key}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
              <IconButton onClick={() => navigate(`/replay?deviceId=${device.id}`)}><RouteIcon /></IconButton>
              <IconButton onClick={() => navigate(`/settings/device/${device.id}/command`)}><SendIcon /></IconButton>
              <IconButton onClick={() => navigate(`/settings/device/${device.id}`)} disabled={deviceReadonly}><EditIcon /></IconButton>
              <IconButton color="error" onClick={() => setRemoving(true)} disabled={deviceReadonly}><DeleteIcon /></IconButton>
            </CardActions>
          )}
        </Card>
      )}

      <RemoveDialog open={removing} endpoint="devices" itemId={device?.id} onResult={handleRemove} />
    </>
  );
};

export default StatusCard;
