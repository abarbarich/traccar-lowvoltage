import React, { useCallback, useMemo } from 'react'; // Added useMemo
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import MapView from '../map/core/MapView';
import MapSelectedDevice from '../map/main/MapSelectedDevice';
import MapAccuracy from '../map/main/MapAccuracy';
import MapGeofence from '../map/MapGeofence';
import MapCurrentLocation from '../map/MapCurrentLocation';
import PoiMap from '../map/main/PoiMap';
import MapPadding from '../map/MapPadding';
import { devicesActions } from '../store';
import MapDefaultCamera from '../map/main/MapDefaultCamera';
import MapLiveRoutes from '../map/main/MapLiveRoutes';
import MapPositions from '../map/MapPositions';
import MapOverlay from '../map/overlay/MapOverlay';
import MapGeocoder from '../map/geocoder/MapGeocoder';
import MapScale from '../map/MapScale';
import MapNotification from '../map/notification/MapNotification';
import useFeatures from '../common/util/useFeatures';

const MainMap = ({ filteredPositions, selectedPosition, onEventsClick }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const features = useFeatures();

  const eventsAvailable = useSelector((state) => !!state.events.items.length);

  // OPTIMIZATION: Prevent unnecessary route re-renders
  const deviceIds = useMemo(() => filteredPositions.map((p) => p.deviceId), [filteredPositions]);

  const onMarkerClick = useCallback((_, deviceId) => {
    dispatch(devicesActions.selectId(deviceId));
  }, [dispatch]);

  return (
    <>
      <MapView>
        <MapOverlay />
        <MapGeofence />
        <PoiMap />
        <MapAccuracy positions={filteredPositions} />
        <MapLiveRoutes deviceIds={deviceIds} />
        
        <MapPositions
          positions={filteredPositions}
          onMarkerClick={onMarkerClick}
          selectedPosition={selectedPosition}
          showStatus // This ensures your green/yellow status logic shows on the map markers too!
        />

        <MapDefaultCamera />
        <MapSelectedDevice />
      </MapView>

      <MapScale />
      <MapCurrentLocation />
      <MapGeocoder />

      {!features.disableEvents && (
        <MapNotification enabled={eventsAvailable} onClick={onEventsClick} />
      )}

      {/* Improved Padding Logic */}
      <MapPadding 
        start={desktop ? parseInt(theme.dimensions.drawerWidthDesktop, 10) + parseInt(theme.spacing(1.5), 10) : 0} 
        bottom={desktop ? 0 : 30} // Adds a small buffer for mobile status cards
      />
    </>
  );
};

export default MainMap;

