import React, { useState } from 'react';
import ProductManager from './components/ProductManager';
import GastosManager from './components/GastosManager';
import VentasManager from './components/VentasManager';
import CierreCaja from './components/CierreCaja';
import HomePage from './components/HomePage';
import { Container, AppBar, Toolbar, Typography, Button, Box, Paper, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import theme from './theme';

function App() {
  const [vista, setVista] = useState('inicio');

  const renderVista = () => {
    switch (vista) {
      case 'inicio':
        return <HomePage setVista={setVista} />;
      case 'productos':
        return <ProductManager />;
      case 'gastos':
        return <GastosManager />;
      case 'ventas':
        return <VentasManager />;
      case 'cierre':
        return <CierreCaja />;
      default:
        return <HomePage setVista={setVista} />;
    }
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => setVista('inicio')} sx={{ mr: 2 }}>
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mi Gestor de Ventas
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 2, display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Button variant={vista === 'ventas' ? 'contained' : 'outlined'} onClick={() => setVista('ventas')}>Gestionar Ventas</Button>
          <Button variant={vista === 'gastos' ? 'contained' : 'outlined'} onClick={() => setVista('gastos')}>Gestionar Gastos</Button>
          <Button variant={vista === 'productos' ? 'contained' : 'outlined'} onClick={() => setVista('productos')}>Gestionar Productos</Button>
          <Button variant={vista === 'cierre' ? 'contained' : 'outlined'} onClick={() => setVista('cierre')}>Cierre de Caja</Button>
        </Paper>
        
        <main>
          {renderVista()}
        </main>
      </Container>
    </Box>
  );
}

export default App;

