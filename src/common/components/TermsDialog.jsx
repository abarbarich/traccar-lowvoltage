import { useSelector } from 'react-redux';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, Link, Typography, DialogTitle
} from '@mui/material';
import { useTranslation } from './LocalizationProvider';

const TermsDialog = ({ open, onCancel, onAccept }) => {
  const t = useTranslation();

  const termsUrl = useSelector((state) => state.session.server.attributes.termsUrl);
  const privacyUrl = useSelector((state) => state.session.server.attributes.privacyUrl);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      // "square" is now handled globally by theme/components.js
    >
      <DialogTitle sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
        {t('userTerms')}
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText component="div">
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
            {t('userTermsPrompt')}
          </Typography>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>
              <Link href={termsUrl} target="_blank" sx={{ fontWeight: 'bold', textDecoration: 'none' }}>
                {t('userTerms')}
              </Link>
            </li>
            <li>
              <Link href={privacyUrl} target="_blank" sx={{ fontWeight: 'bold', textDecoration: 'none' }}>
                {t('userPrivacy')}
              </Link>
            </li>
          </ul>
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ padding: 2, justifyContent: 'space-between' }}>
        <Button 
          onClick={onCancel} 
          color="error" 
          variant="outlined" // Technical outline style
          sx={{ fontWeight: 900 }}
        >
          {t('sharedCancel')}
        </Button>
        <Button 
          onClick={onAccept} 
          variant="contained" 
          color="primary"
          sx={{ fontWeight: 900, paddingX: 3 }}
        >
          {t('sharedAccept')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsDialog;
