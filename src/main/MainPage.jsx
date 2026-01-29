import {
  useState, useCallback, useEffect,
} from 'react';
import { Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import DeviceList from './DeviceList';
import BottomMenu from '../common/components/BottomMenu';
import StatusCard from '../common/components/StatusCard';
import { devicesActions } from '../store';
import usePersistedState from '../common/util/usePersistedState';
import EventsDrawer from './EventsDrawer';
import useFilter from './useFilter';
import MainToolbar from './MainToolbar';
import MainMap from './MainMap';
import { useAttributePreference } from '../common/util/preferences';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
  },
  sidebar: {
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      position: 'fixed',
      left: 0,
      top: 0,
      height: `calc(100% - ${theme.spacing(3)})`,
      width: theme.dimensions.drawerWidthDesktop,
      margin: theme.spacing(1.5),
      zIndex: 3,
    },
    [theme.breakpoints.down('md')]: {
      height: '100%',
      width: '100%',
    },
  },
  header: {
    pointerEvents: 'auto',
    zIndex: 6,
  },
  footer: {
    pointerEvents: 'auto',
    zIndex: 5,
  },
  middle: {
    flex: 1,
    display: 'grid',
    minHeight: 0,
  },
  contentMap: {
    pointerEvents: 'auto',
    gridArea: '1 / 1',
  },
  contentList: {
    pointerEvents: 'auto',
    gridArea: '1 / 1',
    zIndex: 4,
    display: 'flex',
    minHeight: 0,
  },
  // --- StatusCard Container Styles ---
  statusCardContainer: {
    position: 'fixed',
    zIndex: 7,
    pointerEvents: 'none', // Allows clicking the map *behind* the container area
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end', // Aligns content to bottom
    
    // DESKTOP: Sidebar positioning
    [theme.breakpoints.up('md')]: {
      left: theme.spacing(1.5),
      bottom: theme.spacing(1.5),
      width: theme.dimensions.drawerWidthDesktop,
      maxHeight: `calc(100% - ${theme.spacing(11)})`, 
    },
    
    // MOBILE: Bottom sheet positioning
    [theme.breakpoints.down('md')]: {
      left: 0,
      right: 0,
      bottom: 0,
      height: '50vh', // Defines the maximum area available for the card
      width: '100%',
    },
  },
  statusCardInner: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    
    // DESKTOP: Needs container styling (shadow, overflow) because StatusCard is 'flat' on desktop
    [theme.breakpoints.up('md')]: {
      pointerEvents: 'auto',
      boxShadow: theme.shadows[10],
      overflow: 'hidden',
      borderRadius: theme.spacing(1), // Optional: rounds desktop card corners slightly
    },

    // MOBILE: Container must be INVISIBLE and PASS-THROUGH
    // The StatusCard component inside handles its own shadow, radius, and pointerEvents.
    [theme.breakpoints.down('md')]: {
      pointerEvents: 'none', // Crucial: lets you click map through the empty top part
      boxShadow: 'none',     // FIX: Removes the "ghost box" shadow
      background: 'transparent',
    },
  },
}));

const MainPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const mapOnSelect = useAttributePreference('mapOnSelect', true);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectedPosition = filteredPositions.find((position) => selectedDeviceId && position.deviceId === selectedDeviceId);

  const [filteredDevices, setFilteredDevices] = useState([]);

  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = usePersistedState('filter', {
    statuses: [],
    groups: [],
  });
  const [filterSort, setFilterSort] = usePersistedState('filterSort', '');
  const [filterMap, setFilterMap] = usePersistedState('filterMap', false);

  const [devicesOpen, setDevicesOpen] = useState(desktop);
  const [eventsOpen, setEventsOpen] = useState(false);

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) {
      setDevicesOpen(false);
    }
  }, [desktop, mapOnSelect, selectedDeviceId]);

  useFilter(keyword, filter, filterSort, filterMap, positions, setFilteredDevices, setFilteredPositions);

  return (
    <div className={classes.root}>
      {desktop && (
        <MainMap
          filteredPositions={filteredPositions}
          selectedPosition={selectedPosition}
          onEventsClick={onEventsClick}
        />
      )}
      <div className={classes.sidebar}>
        <Paper square elevation={3} className={classes.header}>
          <MainToolbar
            filteredDevices={filteredDevices}
            devicesOpen={devicesOpen}
            setDevicesOpen={setDevicesOpen}
            keyword={keyword}
            setKeyword={setKeyword}
            filter={filter}
            setFilter={setFilter}
            filterSort={filterSort}
            setFilterSort={setFilterSort}
            filterMap={filterMap}
            setFilterMap={setFilterMap}
          />
        </Paper>
        <div className={classes.middle}>
          {!desktop && (
            <div className={classes.contentMap}>
              <MainMap
                filteredPositions={filteredPositions}
                selectedPosition={selectedPosition}
                onEventsClick={onEventsClick}
              />
            </div>
          )}
          <Paper square className={classes.contentList} style={devicesOpen ? {} : { visibility: 'hidden' }}>
            <DeviceList devices={filteredDevices} />
          </Paper>
        </div>
        {desktop && (
          <div className={classes.footer}>
            <BottomMenu />
          </div>
        )}
      </div>
      
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />

      {/* Optimized StatusCard Container */}
      {selectedDeviceId && (
        <div className={classes.statusCardContainer}>
          <div className={classes.statusCardInner}>
            <StatusCard
              deviceId={selectedDeviceId}
              position={selectedPosition}
              onClose={() => dispatch(devicesActions.selectId(null))}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;

