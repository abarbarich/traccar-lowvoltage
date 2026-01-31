export default {
  MuiUseMediaQuery: {
    defaultProps: {
      noSsr: true,
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.default,
      }),
    },
  },
  MuiButton: {
    styleOverrides: {
      sizeMedium: {
        height: '40px',
      },
      // --- NEW: INDUSTRIAL BUTTONS GLOBALLY ---
      root: {
        fontWeight: 700, // Make all buttons bolder by default
        letterSpacing: '0.5px',
      },
    },
  },
  MuiFormControl: {
    defaultProps: {
      size: 'small',
    },
  },
  MuiSnackbar: {
    defaultProps: {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center', // Keep your center alignment
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      enterDelay: 500,
      enterNextDelay: 500,
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        '@media print': {
          color: theme.palette.alwaysDark.main,
        },
      }),
    },
  },
  // --- NEW: SQUARE DIALOGS (Industrial Look) ---
  MuiDialog: {
    defaultProps: {
      PaperProps: {
        square: true, // Removes rounded corners from all popups
      },
    },
  },
  // --- NEW: SQUARE ALERTS (Matching your Status Card) ---
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 0, // Square corners for notifications
        fontWeight: 'bold', // Bold text for readability
        alignItems: 'center',
      },
    },
  },
};
