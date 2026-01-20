import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper, BottomNavigation, BottomNavigationAction, Menu, MenuItem, Typography, Badge,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import { sessionActions } from '../../store';
import { useTranslation } from './LocalizationProvider';
import { useRestriction } from '../util/permissions';
import { nativePostMessage } from './NativeInterface';

const useStyles = makeStyles()((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    height: '56px', // Standard compact height
    display: 'flex',
    justifyContent: 'center',
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  actionItem: {
    padding: 0,
    minWidth: 0,
    // This part strictly kills the label space
    '& .MuiBottomNavigationAction-label': {
      display: 'none !important', 
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      paddingTop: 0,
      '& svg': {
        transform: 'scale(1.15)',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 8,
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        backgroundColor: theme.palette.primary.main,
      },
    },
    '& svg': {
      fontSize: '1.5rem',
      transition: 'all 0.2s ease-in-out',
    },
  },
}));

const BottomMenu = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');
  const disableReports = useRestriction('disableReports');
  const user = useSelector((state) => state.session.user);
  const socket = useSelector((state) => state.session.socket);
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const [anchorEl, setAnchorEl] = useState(null);

  const currentSelection = () => {
    if (location.pathname === `/settings/user/${user.id}`) return 'account';
    if (location.pathname.startsWith('/settings')) return 'settings';
    if (location.pathname.startsWith('/reports')) return 'reports';
    if (location.pathname === '/') return 'map';
    return null;
  };

  const handleSelection = (event, value) => {
    switch (value) {
      case 'map': navigate('/'); break;
      case 'reports':
        navigate(selectedDeviceId ? `/reports/combined?deviceId=${selectedDeviceId}` : '/reports/combined');
        break;
      case 'settings': navigate('/settings/preferences?menu=true'); break;
      case 'account': setAnchorEl(event.currentTarget); break;
      case 'logout': handleLogout(); break;
      default: break;
    }
  };

  const handleAccount = () => {
    setAnchorEl(null);
    navigate(`/settings/user/${user.id}`);
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await fetch('/api/session', { method: 'DELETE' });
    nativePostMessage('logout');
    navigate('/login');
    dispatch(sessionActions.updateUser(null));
  };

  return (
    <Paper square elevation={0} className={classes.root}>
      <BottomNavigation 
        value={currentSelection()} 
        onChange={handleSelection} 
        showLabels={false}
        sx={{ width: '100%', maxWidth: '600px', backgroundColor: 'transparent' }}
      >
        <BottomNavigationAction
          className={classes.actionItem}
          icon={(
            <Badge color="error" variant="dot" invisible={socket !== false}>
              <MapIcon />
            </Badge>
          )}
          value="map"
        />
        {!disableReports && (
          <BottomNavigationAction className={classes.actionItem} icon={<DescriptionIcon />} value="reports" />
        )}
        <BottomNavigationAction className={classes.actionItem} icon={<SettingsIcon />} value="settings" />
        {readonly ? (
          <BottomNavigationAction className={classes.actionItem} icon={<ExitToAppIcon />} value="logout" />
        ) : (
          <BottomNavigationAction className={classes.actionItem} icon={<PersonIcon />} value="account" />
        )}
      </BottomNavigation>
      
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleAccount}>
          <Typography sx={{ fontWeight: 600 }}>{t('settingsUser')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Typography color="error" sx={{ fontWeight: 600 }}>{t('loginLogout')}</Typography>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default BottomMenu;
