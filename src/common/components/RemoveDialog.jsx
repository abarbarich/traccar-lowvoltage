import Button from '@mui/material/Button';
import { Snackbar, Alert } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from './LocalizationProvider';
import { useCatch } from '../../reactHelper';
import { snackBarDurationLongMs } from '../util/duration';
import fetchOrThrow from '../util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  root: {
    [theme.breakpoints.down('md')]: {
      bottom: `calc(${theme.dimensions.bottomBarHeight}px + ${theme.spacing(1)})`,
    },
  },
  button: {
    height: 'auto',
    marginTop: 0,
    marginBottom: 0,
    fontWeight: 900, // Extra bold for the action button
    textTransform: 'uppercase',
  },
}));

const RemoveDialog = ({
  open, endpoint, itemId, onResult,
}) => {
  const { classes } = useStyles();
  const t = useTranslation();

  const handleRemove = useCatch(async () => {
    await fetchOrThrow(`/api/${endpoint}/${itemId}`, { method: 'DELETE' });
    onResult(true);
  });

  return (
    <Snackbar
      className={classes.root}
      open={open}
      autoHideDuration={snackBarDurationLongMs}
      onClose={() => onResult(false)}
      // Anchor matches your other notifications
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} 
    >
      <Alert
        severity="warning" // Yellow/Orange warning color
        onClose={() => onResult(false)}
        action={
          <Button 
            size="small" 
            className={classes.button} 
            color="inherit" 
            onClick={handleRemove}
            variant="outlined" // outlined button inside the alert looks very technical
            sx={{ borderWidth: '2px', '&:hover': { borderWidth: '2px' } }}
          >
            {t('sharedRemove')}
          </Button>
        }
        sx={{ width: '100%', alignItems: 'center' }}
      >
        {t('sharedRemoveConfirm')}
      </Alert>
    </Snackbar>
  );
};

export default RemoveDialog;
