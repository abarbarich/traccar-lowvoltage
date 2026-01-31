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
      // Industrial Buttons
      root: {
        fontWeight: 700, 
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
        horizontal: 'center',
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
  MuiDialog: {
    defaultProps: {
      PaperProps: {
        square: true,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        fontWeight: 'bold',
        alignItems: 'center',
      },
    },
  },
  
  // --- NEW: MENU POLISH ---
  MuiMenu: {
    defaultProps: {
      elevation: 4, // Slightly lower shadow for a tighter feel
    },
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: 0, // Square corners
        border: `1px solid ${theme.palette.divider}`, // Crisp border
        backgroundColor: theme.palette.background.paper,
      }),
      list: {
        padding: 0, // Remove default top/bottom padding for a technical look
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontSize: '0.875rem',
        fontWeight: 500,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        borderLeft: '4px solid transparent', // Reserve space for the strip
        transition: 'all 0.2s',
        
        // Hover State
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          borderLeftColor: theme.palette.divider, // Subtle strip on hover
        },
        
        // Selected/Active State
        '&.Mui-selected': {
          backgroundColor: theme.palette.action.selected,
          borderLeftColor: theme.palette.primary.main, // Bright strip for active
          fontWeight: 700,
          '&:hover': {
            backgroundColor: theme.palette.action.selected,
          },
        },
      }),
    },
  },
};
