import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  IconButton, Paper, Slider, Toolbar, Typography, Tooltip,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import TuneIcon from '@mui/icons-material/Tune';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MapView from '../map/core/MapView';
import MapRoutePath from '../map/MapRoutePath';
import MapRoutePoints from '../map/MapRoutePoints';
import MapPositions from '../map/MapPositions';
import { formatTime } from '../common/util/formatter';
import ReportFilter, { updateReportParams } from '../reports/components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatch } from '../reactHelper';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import StatusCard from '../common/components/StatusCard';
import MapScale from '../map/MapScale';
import BackIcon from '../common/components/BackIcon';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebar: {
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    zIndex: 3,
    left: 0,
    top: 0,
    margin: theme.spacing(1.5),
    width: theme.dimensions.drawerWidthDesktop,
    [theme.breakpoints.down('md')]: {
      width: '100%',
      margin: 0,
    },
  },
  header: {
    pointerEvents: 'auto',
    zIndex: 6,
    borderRadius: theme.shape.borderRadius,
  },
  title: {
    flexGrow: 1,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  // --- Cohesive Bottom Stack ---
  bottomStack: {
    position: 'fixed',
    zIndex: 7,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      left: theme.spacing(1.5),
      bottom: theme.spacing(1.5),
      width: theme.dimensions.drawerWidthDesktop,
    },
    [theme.breakpoints.down('md')]: {
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
    },
  },
  replayControlCard: {
    pointerEvents: 'auto',
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[10],
  },
  statusCardInner: {
    pointerEvents: 'auto',
    height: '45vh',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[10],
    [theme.breakpoints.down('md')]: {
      height: '40vh',
      borderRadius: 0,
    },
  },
  timeLabel: {
    fontWeight: 800,
    color: theme.palette.primary.main,
    fontFamily: '"Roboto Mono", monospace',
  },
  countLabel: {
    fontWeight: 'bold',
    opacity: 0.6,
    fontSize: '0.75rem',
  }
}));

const ReplayPage = () => {
  const t = useTranslation();
  const theme = useTheme();
  const { classes } = useStyles();
  const navigate = useNavigate();
  const timerRef = useRef();

  const [searchParams, setSearchParams] = useSearchParams();
  const defaultDeviceId = useSelector((state) => state.devices.selectedId);

  const [positions, setPositions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState(defaultDeviceId);
  const [showCard, setShowCard] = useState(false);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const loaded = Boolean(from && to && !loading && positions.length);

  const deviceName = useSelector((state) => (selectedDeviceId ? state.devices.items[selectedDeviceId]?.name : null));

  useEffect(() => {
    if (!from && !to) setPositions([]);
  }, [from, to]);

  useEffect(() => {
    if (playing && positions.length > 0) {
      timerRef.current = setInterval(() => {
        setIndex((i) => (i < positions.length - 1 ? i + 1 : i));
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, positions]);

  useEffect(() => {
    if (index >= positions.length - 1) {
      setPlaying(false);
    }
  }, [index, positions]);

  const onPointClick = useCallback((_, i) => {
    setIndex(i);
    setShowCard(true);
  }, []);

  const onMarkerClick = useCallback((positionId) => {
    setShowCard(!!positionId);
  }, []);

  const onShow = useCatch(async ({ deviceIds, from, to }) => {
    const deviceId = deviceIds.find(() => true);
    setLoading(true);
    setSelectedDeviceId(deviceId);
    const query = new URLSearchParams({ deviceId, from, to });
    try {
      const response = await fetchOrThrow(`/api/positions?${query.toString()}`);
      setIndex(0);
      const data = await response.json();
      setPositions(data);
      if (!data.length) throw Error(t('sharedNoData'));
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className={classes.root}>
      <MapView>
        <MapGeofence />
        <MapRoutePath positions={positions} />
        <MapRoutePoints positions={positions} onClick={onPointClick} showSpeedControl />
        {index < positions.length && (
          <MapPositions positions={[positions[index]]} onMarkerClick={onMarkerClick} titleField="fixTime" />
        )}
      </MapView>
      <MapScale />
      <MapCamera positions={positions} />

      {/* TOP TOOLBAR & FILTER */}
      <div className={classes.sidebar}>
        <Paper elevation={3} className={classes.header}>
          <Toolbar>
            <IconButton edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
              <BackIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>{t('reportReplay')}</Typography>
            {loaded && (
              <>
                <Tooltip title={t('sharedDownload')}>
                  <IconButton onClick={() => window.location.assign(`/api/positions/kml?${new URLSearchParams({ deviceId: selectedDeviceId, from, to })}`)}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <IconButton edge="end" onClick={() => updateReportParams(searchParams, setSearchParams, 'ignore', [])}>
                  <TuneIcon />
                </IconButton>
              </>
            )}
          </Toolbar>
          {!loaded && (
            <div style={{ padding: theme.spacing(2), pointerEvents: 'auto' }}>
              <ReportFilter onShow={onShow} deviceType="single" loading={loading} />
            </div>
          )}
        </Paper>
      </div>

      {/* BOTTOM COHESIVE STACK */}
      {loaded && (
        <div className={classes.bottomStack}>
          {/* Streamlined Control Deck */}
          <Paper className={classes.replayControlCard} elevation={0}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
               <Typography variant="caption" className={classes.timeLabel}>
                {formatTime(positions[index].fixTime, 'seconds')}
              </Typography>
              <Typography variant="caption" className={classes.countLabel}>
                {index + 1} / {positions.length}
              </Typography>
            </div>
            
            <Slider
              size="small"
              max={positions.length - 1}
              value={index}
              onChange={(_, val) => setIndex(val)}
              sx={{ mb: 1 }}
            />

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: theme.spacing(3) }}>
              <IconButton size="small" onClick={() => setIndex((i) => i - 1)} disabled={playing || index <= 0}>
                <FastRewindIcon fontSize="small" />
              </IconButton>
              <IconButton 
                onClick={() => setPlaying(!playing)} 
                sx={{ 
                  backgroundColor: theme.palette.primary.main, 
                  color: 'white', 
                  '&:hover': { backgroundColor: theme.palette.primary.dark },
                  width: 42,
                  height: 42
                }}
              >
                {playing ? <PauseIcon /> : <PlayArrowIcon /> }
              </IconButton>
              <IconButton size="small" onClick={() => setIndex((i) => i + 1)} disabled={playing || index >= positions.length - 1}>
                <FastForwardIcon fontSize="small" />
              </IconButton>
            </div>
          </Paper>

          {/* Unified Status Card */}
          {showCard && (
            <div className={classes.statusCardInner}>
              <StatusCard
                deviceId={selectedDeviceId}
                position={positions[index]}
                onClose={() => setShowCard(false)}
                disableActions
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReplayPage;
