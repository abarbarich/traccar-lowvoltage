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
    // Slim scrollbar to maximize space for device names
    '&::-webkit-scrollbar': {
      width: '5px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.divider,
      borderRadius: '10px',
    },
    // Ensure the list container takes full available height
    '& > div': {
      width: '100% !important',
    },
  },
}));

const DeviceList = ({ devices }) => {
  const { classes } = useStyles();
  const dispatch = useDispatch();

  // Local state to trigger a re-render every minute
  // This ensures "last update" and "stale data" logic stays current
  const [, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 60000);
    return () => clearInterval(interval);
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
      // Increased to 72 to accommodate:
      // 1. Two lines of text (Name + Status/Relative Time)
      // 2. The new Voltage Badge height + Pulse animation margin
      rowHeight={72}          
      rowProps={{ devices }}
      overscanCount={10}      // Increased for smoother scrolling with the new heavy styling
    />
  );
};

export default DeviceList;
