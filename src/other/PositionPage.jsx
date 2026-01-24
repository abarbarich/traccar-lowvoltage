import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Typography, AppBar, Toolbar, IconButton, Table, TableRow, TableCell, TableBody, Box, Container, Switch, FormControlLabel,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate, useParams } from 'react-router-dom';
import SpeedIcon from '@mui/icons-material/Speed';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import StorageIcon from '@mui/icons-material/Storage';
import ShareIcon from '@mui/icons-material/Share';
import dayjs from 'dayjs';

import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PositionValue from '../common/components/PositionValue';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import BackIcon from '../common/components/BackIcon';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
  },
  content: {
    overflow: 'auto',
    flexGrow: 1,
    paddingBottom: theme.spacing(4), 
  },
  header: {
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
  },
  title: {
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: '0.9rem',
  },
  pageContainer: {
    backgroundColor: theme.palette.background.paper,
    minHeight: '100%',
    padding: 0,
    [theme.breakpoints.up('md')]: {
      borderLeft: `1px solid ${theme.palette.divider}`,
      borderRight: `1px solid ${theme.palette.divider}`,
    },
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.background.default,
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  sectionTitle: {
    fontWeight: 800,
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    color: theme.palette.primary.main,
    letterSpacing: '0.05rem',
  },
  table: {
    width: '100%',
    '& .MuiTableCell-root': {
      padding: theme.spacing(1.2, 2),
      borderBottom: `1px solid ${theme.palette.divider}44`,
    },
  },
  labelContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: 800,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    lineHeight: 1.2,
  },
  attributeKey: {
    fontSize: '0.6rem',
    color: theme.palette.text.disabled,
    fontFamily: '"Roboto Mono", monospace',
    marginTop: '2px',
  },
  value: {
    fontWeight: 800,
    fontSize: '0.9rem',
    fontFamily: '"Roboto Mono", monospace',
    textAlign: 'right',
  }
}));

const PositionPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();
  const { id } = useParams();
  const [item, setItem] = useState();
  
  // Persistent preference using localStorage
  const [hideRaw, setHideRaw] = useState(() => {
    return localStorage.getItem('hideRawIO') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hideRawIO', hideRaw);
  }, [hideRaw]);

  const positionAttributes = usePositionAttributes(t);

  useEffectAsync(async () => {
    if (id) {
      const response = await fetchOrThrow(`/api/positions?id=${id}`);
      const positions = await response.json();
      if (positions.length > 0) {
        setItem(positions[0]);
      }
    }
  }, [id]);

  const device = useSelector((state) => (item ? state.devices.items[item.deviceId] : null));

  const handleShare = async () => {
    const shareData = {
      title: `${device?.name} - Technical Report`,
      text: `Telemetry for ${device?.name}\nTime: ${dayjs(item.fixTime).format('LLL')}\nLat: ${item.latitude}, Lon: ${item.longitude}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text}\nURL: ${shareData.url}`);
      alert('Copied to clipboard');
    }
  };

  const AttributeSection = ({ title, icon, keys, isAttributes = false }) => {
    if (!item) return null;
    
    const filteredKeys = hideRaw 
      ? keys.filter(key => !key.toLowerCase().startsWith('io'))
      : keys;

    const validKeys = filteredKeys.filter(key => 
      isAttributes ? item.attributes?.hasOwnProperty(key) : item.hasOwnProperty(key)
    );
    
    if (validKeys.length === 0) return null;

    return (
      <Box>
        <div className={classes.sectionHeader}>
          {React.cloneElement(icon, { sx: { fontSize: '1rem', opacity: 0.7 } })}
          <Typography className={classes.sectionTitle}>{title}</Typography>
        </div>
        <Table className={classes.table}>
          <TableBody>
            {validKeys.map((key) => (
              <TableRow key={key}>
                <TableCell>
                  <div className={classes.labelContainer}>
                    <Typography className={classes.label}>
                      {positionAttributes[key]?.name || key}
                    </Typography>
                    <Typography className={classes.attributeKey}>
                      {key}
                    </Typography>
                  </div>
                </TableCell>
                <TableCell className={classes.value}>
                  <PositionValue position={item} property={isAttributes ? null : key} attribute={isAttributes ? key : null} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  return (
    <div className={classes.root}>
      <AppBar position="sticky" color="inherit" className={classes.header}>
        <Container maxWidth="md" sx={{ padding: 0 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" sx={{ mr: 1 }} onClick={() => navigate(-1)}>
              <BackIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography className={classes.title}>
                {device?.name || t('sharedUnknown')}
              </Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch 
                  size="small" 
                  checked={hideRaw} 
                  onChange={(e) => setHideRaw(e.target.checked)} 
                />
              }
              label={
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                  Hide IO
                </Typography>
              }
            />
            
            <IconButton onClick={handleShare}>
              <ShareIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <div className={classes.content}>
        <Container maxWidth="md" className={classes.pageContainer}>
          <Box sx={{ p: 2, textAlign: 'center', opacity: 0.6 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
              Report Generated: {item && dayjs(item.fixTime).format('DD MMM YYYY • HH:mm:ss')}
            </Typography>
          </Box>

          <AttributeSection 
            title="GPS & Movement" 
            icon={<SpeedIcon />} 
            keys={['speed', 'course', 'altitude', 'latitude', 'longitude', 'accuracy']} 
          />

          <AttributeSection 
            title="Power Metrics" 
            isAttributes
            icon={<BatteryChargingFullIcon />} 
            keys={['power', 'batteryLevel', 'ignition', 'charge', 'rssi']} 
          />

          <AttributeSection 
            title="Diagnostic Data" 
            isAttributes
            icon={<SettingsInputComponentIcon />} 
            keys={['rpm', 'coolantTemp', 'fuelLevel', 'fuelConsumption', 'odometer', 'distance', 'motion']} 
          />

          {item && (
            <AttributeSection 
              title="Extended Telemetry" 
              isAttributes
              icon={<StorageIcon />} 
              keys={Object.keys(item.attributes).filter(k => 
                !['power', 'batteryLevel', 'ignition', 'charge', 'rssi', 'motion', 'rpm', 'coolantTemp', 'fuelLevel', 'fuelConsumption', 'odometer', 'distance'].includes(k)
              )} 
            />
          )}
        </Container>
      </div>
    </div>
  );
};

export default PositionPage;
