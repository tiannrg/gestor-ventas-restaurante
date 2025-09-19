import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Mantenemos el azul sofisticado
    },
    secondary: {
      main: '#607d8b', 
    },
    // 1. Definimos el color de "error" como un rojo intenso
    error: {
      main: '#d32f2f',
    },
    // 2. Cambiamos el fondo a un gris más notable
    background: {
      default: '#eeeeee', // Un gris claro que crea un buen contraste
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    }
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h6: { fontWeight: 600 },
  },
  components: {
    // 3. Hacemos que la barra de navegación sea completamente cuadrada
    MuiAppBar: {
        styleOverrides: {
            root: {
                borderRadius: 0, // Quitamos cualquier borde redondeado
            },
        },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.07)',
        },
      },
    },
 MuiDataGrid: {
        styleOverrides: {
            root: {
                border: 'none', // Quitamos el borde general de la tabla para un look más limpio
            },
            columnHeader: {
                fontWeight: 'bold',
                // Añadimos un borde derecho sutil a cada cabecera
                borderRight: '1px solid #1976d2',
                // Nos aseguramos de que la última cabecera no tenga borde
                '&:last-of-type': {
                    borderRight: 'none',
                },
            },
            columnHeaders: {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                borderBottom: '1px solid #1976d2',
            },
            cell: {
                // Mantenemos el borde inferior para las filas
                borderBottom: '1px solid #1976d2',
                borderRight: '1px solid #1976d2',
                '&:last-of-type': {
                    borderRight: 'none',
                },
            },
            row: {
      
                '&:nth-of-type(odd)': {
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                },
            },
        },
    },
  },
});

export default theme;


