import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import { List } from 'react-window';
import { devicesActions } from '../store';
import { useEffectAsync } from '../reactHelper';
import DeviceRow from './DeviceRow';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  list: {
    height: '100%',
    direction: theme.direction,
    // Slim scrollbar for a more modern look
    '&::-webkit-scrollbar': {
      width: '5px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.divider,
      borderRadius: '10px',
    },
  },
}));

const DeviceList = ({ devices }) => {
  const { classes } = useStyles();
  const dispatch = useDispatch();

  // Local state to trigger a re-render every minute
  // This keeps "last update" times in DeviceRow accurate
  const [, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Initial data load when the component mounts
  useEffectAsync(async () => {
    const response = await fetchOrThrow('/api/devices');
    dispatch(devicesActions.refresh(await response.json()));
  }, []);

  return (
    <List
      className={classes.list}
      rowComponent={DeviceRow}
      rowCount={devices.length}
      rowHeight={72}          // Matches the height we set in DeviceRow.jsx
      rowProps={{ devices }}
      overscanCount={5}       // Pre-renders 5 rows outside the view for smooth scrolling
    />
  );
};

export default DeviceList;
