import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
import OpenInNewIcon from '@mui/icons-material/OpenInNew'; // The new pop-out icon
import PowerOffIcon from '@mui/icons-material/PowerOff';
import dayjs from 'dayjs';

import { useTranslation } from './LocalizationProvider';
import RemoveDialog from './RemoveDialog';
import PositionValue from './PositionValue';
import { useDeviceReadonly, useRestriction } from '../util/permissions';
import usePositionAttributes from '../attributes/usePositionAttributes';
import { devicesActions } from '../../store';
import { useCatch } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';
import fetchOrThrow from '../util/fetchOrThrow';
import { mapIconKey, mapIcons } from '../../map/core/preloadImages';
import { formatSpeed } from '../util/formatter';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(76, 175, 80, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0px rgba(76, 175, 80, 0); }
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
    padding: theme.spacing(1, 1.5), // Slightly tighter padding for the icons
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
    padding: theme.spacing(2, 3),
    backgroundColor: theme.palette.background.default,
  },
  speedValue: {
    fontSize: '3rem',
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: '-2px',
  },
  unitText: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(0.5),
    textTransform: 'uppercase',
  },
  avatarBase: {
    width: 52,
    height: 52,
    border: '4px solid transparent',
    transition: 'all 0.3s ease',
    backgroundColor: theme.palette.primary.main,
  },
  ignitionActive: {
    border: `4px solid ${theme.palette.success.main}`,
    boxShadow: `0 0 10px ${theme.palette.success.main}, 0 0 20px ${theme.palette.success.main}66`,
    animation: `${pulse} 2s infinite`,
  },
  ignitionInactive: {
    border: `4px solid ${theme.palette.neutral.main}44`,
  },
  iconImage: {
    width: '30px',
    height: '30px',
    filter: 'brightness(0) invert(1)',
  },
  voltageBadge: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(0.3, 1),
    borderRadius: '4px',
    fontWeight: 800,
    fontSize: '0.8rem',
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
    transition: 'all 0.3s ease',
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

const StatusCard = ({ deviceId, position, onClose }) => {
  const { classes, cx } = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();
  const device = useSelector((state) => state.devices.items[deviceId || position?.deviceId]);
  
  const speedUnit = useAttributePreference('speedUnit', 'kn');
  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference('positionItems', 'fixTime,address,speed,totalDistance');
  
  const [removing, setRemoving] = useState(false);

  // Power Cut Logic
  const rawPower = position?.attributes?.power;
  const powerValue = (rawPower !== undefined && rawPower !== null) ? parseFloat(rawPower) : null;
  const isPowerCut = powerValue !== null && powerValue < 1.0;

  const hasIgnition = position?.attributes?.hasOwnProperty('ignition');
  const isIgnitionOn = hasIgnition && position.attributes.ignition;
  
  const isReplay = !!position?.id && !deviceId; 
  const isDataStale = !isReplay && position ? dayjs().diff(dayjs(position.fixTime), 'minute') > 10 : false;

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetchOrThrow('/api/devices');
      dispatch(devicesActions.refresh(await response.json()));
    }
    setRemoving(false);
  });

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
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <Typography className={classes.speedValue} color={isDataStale ? "error" : "textPrimary"}>
                {position ? formatSpeed(position.speed, speedUnit, t).split(' ')[0].replace(/\.\d+/, '') : '0'}
              </Typography>
              <Typography className={classes.unitText}>
                {formatSpeed(0, speedUnit, t).split(' ')[1]}
              </Typography>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              {powerValue !== null && (
                <Tooltip title={isPowerCut ? "MAIN POWER DISCONNECTED" : "External Voltage"}>
                  <div className={cx(classes.voltageBadge, { [classes.voltageAlert]: isPowerCut })}>
                    {isPowerCut && <PowerOffIcon sx={{ fontSize: '1rem', mr: 0.5 }} />}
                    {powerValue.toFixed(1)}V
                  </div>
                </Tooltip>
              )}
              <Avatar 
                className={`${classes.avatarBase} ${hasIgnition && isIgnitionOn && !isDataStale ? classes.ignitionActive : classes.ignitionInactive}`}
              >
                <img className={classes.iconImage} src={mapIcons[mapIconKey(device?.category || 'default')]} alt="" />
              </Avatar>
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
