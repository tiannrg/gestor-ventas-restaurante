import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';

function HomePage({ setVista }) { // Acepta setVista para navegar
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h2" gutterBottom>
        Bienvenido a tu Gestor de Ventas
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Aquí podrás administrar tus productos, registrar gastos y llevar un control total de tus ventas.
      </Typography>
    </Paper>
  );
}

export default HomePage;
