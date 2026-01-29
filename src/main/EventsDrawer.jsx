import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Drawer, IconButton, List, ListItemButton, ListItemText, Toolbar, Typography, Box, Avatar,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { formatNotificationTitle, formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { eventsActions, devicesActions, sessionActions } from '../store';
import { mapIconKey, mapIcons } from '../map/core/preloadImages';

const useStyles = makeStyles()((theme) => ({
  drawerPaper: {
    width: theme.dimensions.drawerWidthDesktop,
    backgroundColor: theme.palette.background.default,
    boxShadow: theme.shadows[10],
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  header: {
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  list: {
    padding: 0,
    overflowY: 'auto',
  },
  eventItem: {
    margin: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      transform: 'translateX(-4px)',
    },
  },
  avatar: {
    width: 32,
    height: 32,
    backgroundColor: theme.palette.primary.main,
    marginRight: theme.spacing(1.5),
  },
  icon: {
    width: '18px',
    height: '18px',
    filter: 'brightness(0) invert(1)',
  },
  time: {
    fontWeight: 700,
    color: theme.palette.primary.main,
    fontSize: '0.7rem',
  }
}));

const EventsDrawer = ({ open, onClose }) => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);
  const events = useSelector((state) => state.events.items);

  const handleEventClick = async (event) => {
    // 1. If the event has a positionId, fetch it and update the session
    // This ensures the StatusCard shows the data at the time of the event
    if (event.positionId) {
      try {
        const response = await fetch(`/api/positions?id=${event.positionId}`);
        if (response.ok) {
          const positions = await response.json();
          if (positions.length > 0) {
            // Update the positions in Redux so the map and StatusCard have the event data
            dispatch(sessionActions.updatePositions(positions));
          }
        }
      } catch (error) {
        console.error("Failed to fetch event position:", error);
      }
    }

    // 2. Select the device to trigger the StatusCard in MainPage
    dispatch(devicesActions.selectId(event.deviceId));

    // 3. Close the drawer
    onClose();
  };

  const formatType = (event) => formatNotificationTitle(t, {
    type: event.type,
    attributes: {
      alarms: event.attributes.alarm,
    },
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ className: classes.drawerPaper }}
    >
      <div className={classes.header}>
        <Typography variant="subtitle1" className={classes.title}>
          {t('reportEvents')}
        </Typography>
        <Box>
          <IconButton size="small" onClick={() => dispatch(eventsActions.deleteAll())}>
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </div>

      <List className={classes.list}>
        {events.map((event) => {
          const device = devices[event.deviceId];
          return (
            <ListItemButton
              key={event.id}
              className={classes.eventItem}
              onClick={() => handleEventClick(event)}
              disabled={!event.id}
            >
              <Avatar className={classes.avatar}>
                <img 
                  className={classes.icon} 
                  src={mapIcons[mapIconKey(device?.category || 'default')]} 
                  alt="" 
                />
              </Avatar>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {device?.name || t('sharedUnknown')}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="caption" display="block" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {formatType(event)}
                    </Typography>
                    <Typography className={classes.time}>
                      {formatTime(event.eventTime, 'seconds')}
                    </Typography>
                  </Box>
                }
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(eventsActions.delete(event));
                }}
              >
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
};

export default EventsDrawer;

