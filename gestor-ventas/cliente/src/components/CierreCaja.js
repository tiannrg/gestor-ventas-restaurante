import React, { useState, useEffect } from 'react';
import { Button, TextField, Select, MenuItem, Box, Paper, Typography, List, ListItem, ListItemText, ListItemIcon, InputAdornment } from '@mui/material';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid } from '@mui/x-data-grid';

function CierreCaja() {
  const [fecha, setFecha] = useState('');
  const [negocioId, setNegocioId] = useState('1');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroNegocio, setFiltroNegocio] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filteredHistorial, setFilteredHistorial] = useState([]);

  useEffect(() => {
    let url = 'http://localhost:3001/cierres-caja/historial?';
    if (filtroFecha) url += `fecha=${filtroFecha}&`;
    if (filtroNegocio) url += `negocio_id=${filtroNegocio}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setHistorial(data))
      .catch(error => console.error('Error al obtener historial:', error));
  }, [filtroFecha, filtroNegocio]);

  useEffect(() => {
    const filtered = historial.filter(item =>
      (item.nombre_negocio && item.nombre_negocio.toLowerCase().includes(searchText.toLowerCase())) ||
      (item.total_ventas && item.total_ventas.toString().includes(searchText)) ||
      (item.total_gastos && item.total_gastos.toString().includes(searchText)) ||
      (item.ganancia && item.ganancia.toString().includes(searchText))
    );
    setFilteredHistorial(filtered);
  }, [searchText, historial]);

  const handleGenerarCierre = () => {
    if (!fecha) {
        alert('Por favor, selecciona una fecha para generar el cierre.');
        return;
    }
    setLoading(true);
    setResultado(null);
    fetch('http://localhost:3001/cierre-caja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha, negocio_id: negocioId }),
    })
      .then(res => res.json())
      .then(data => {
        setResultado(data);
        setFiltroFecha('');
        setFiltroNegocio('');
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al generar cierre:', error);
        setLoading(false);
      });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'fecha',
      headerName: 'Fecha',
      width: 150,
      valueFormatter: (value) => new Date(value).toLocaleDateString('es-CO', { timeZone: 'UTC' }),
    },
    { 
      field: 'nombre_negocio', 
      headerName: 'Negocio', 
      flex: 1,
      minWidth: 150 
    },
    {
      field: 'total_ventas',
      headerName: 'Total Ventas',
      type: 'number',
      width: 130,
      align: 'left',
      headerAlign: 'left',
      valueFormatter: (value) => `$${Number(value).toLocaleString('es-CO')}`,
    },
    {
      field: 'total_gastos',
      headerName: 'Total Gastos',
      type: 'number',
      width: 130,
      align: 'left',
      headerAlign: 'left',
      valueFormatter: (value) => `$${Number(value).toLocaleString('es-CO')}`,
    },
    {
      field: 'ganancia',
      headerName: 'Ganancia Neta',
      type: 'number',
      width: 150,
      align: 'left',
      headerAlign: 'left',
      valueFormatter: (value) => `$${Number(value).toLocaleString('es-CO')}`,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Generar y Guardar Cierre de Caja
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Selecciona la fecha"
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Select value={negocioId} onChange={e => setNegocioId(e.target.value)}>
            <MenuItem value="1">Comidas Rápidas</MenuItem>
            <MenuItem value="2">Almuerzos</MenuItem>
          </Select>
          <Button 
            variant="contained" 
            onClick={handleGenerarCierre} 
            disabled={loading}
          >
            {loading ? 'Calculando...' : 'Generar y Guardar Cierre'}
          </Button>
        </Box>
      </Paper>

      {resultado && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Resultados para el día {new Date(fecha + 'T00:00:00-05:00').toLocaleDateString('es-CO')}
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><PointOfSaleIcon color="success" /></ListItemIcon>
              <ListItemText 
                primary="Total Ventas" 
                secondary={`$${Number(resultado.totalVentas).toLocaleString('es-CO')}`} 
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><ShoppingCartIcon color="error" /></ListItemIcon>
              <ListItemText 
                primary="Total Gastos" 
                secondary={`$${Number(resultado.totalGastos).toLocaleString('es-CO')}`}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><AttachMoneyIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Ganancia Neta" 
                secondary={`$${Number(resultado.ganancia).toLocaleString('es-CO')}`}
                primaryTypographyProps={{ fontWeight: 'bold', fontSize: '1.2rem' }}
                secondaryTypographyProps={{ fontSize: '1.2rem', color: resultado.ganancia >= 0 ? 'green' : 'red' }}
              />
            </ListItem>
          </List>
        </Paper>
      )}

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Historial de Cierres</Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} InputLabelProps={{ shrink: true }} label="Filtrar por fecha" />
            <Select value={filtroNegocio} onChange={e => setFiltroNegocio(e.target.value)} displayEmpty>
                <MenuItem value="">Todos los Negocios</MenuItem>
                <MenuItem value="1">Comidas Rápidas</MenuItem>
                <MenuItem value="2">Almuerzos</MenuItem>
            </Select>
            <Button onClick={() => { setFiltroFecha(''); setFiltroNegocio(''); setSearchText('')}}>Quitar Filtros</Button>
        </Box>

        <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por negocio o monto..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
                startAdornment: (
                <InputAdornment position="start">
                    <SearchIcon />
                </InputAdornment>
                ),
            }}
        />

        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={filteredHistorial}
            columns={columns}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            pageSizeOptions={[5, 10]}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>
    </Box>
  );
}
export default CierreCaja;