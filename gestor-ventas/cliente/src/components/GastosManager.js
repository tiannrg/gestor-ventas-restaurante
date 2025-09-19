import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField, Select, MenuItem, Box, Paper, Typography, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function GastosManager() {
  const [gastos, setGastos] = useState([]);
  const [formState, setFormState] = useState({
    id: null, // Para saber si estamos editando
    descripcion: '',
    monto: '',
    fecha: new Date().toISOString().slice(0, 10),
    negocio_id: '1'
  });

  const [searchText, setSearchText] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroNegocio, setFiltroNegocio] = useState('');

  useEffect(() => {
    let url = 'http://localhost:3001/gastos?';
    if (filtroFecha) url += `fecha=${filtroFecha}&`;
    if (filtroNegocio) url += `negocio_id=${filtroNegocio}`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setGastos(data);
      })
      .catch(error => console.error('Error al obtener los gastos:', error));
  }, [filtroFecha, filtroNegocio]);

  // Efecto para filtrar localmente por el texto de búsqueda
  useEffect(() => {
    const filtered = gastos.filter(gasto =>
      gasto.descripcion.toLowerCase().includes(searchText.toLowerCase()) ||
      gasto.monto.toString().includes(searchText)
    );
    setFilteredRows(filtered);
  }, [searchText, gastos]);

  const handleFormChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormState({
      id: null,
      descripcion: '',
      monto: '',
      fecha: new Date().toISOString().slice(0, 10),
      negocio_id: '1'
    });
  };

  const handleEditClick = (gasto) => {
    setFormState({
      id: gasto.id,
      descripcion: gasto.descripcion,
      monto: gasto.monto,
      fecha: new Date(gasto.fecha).toISOString().slice(0, 10),
      negocio_id: gasto.negocio_id.toString(),
    });
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:3001/gastos/${id}`, { method: 'DELETE' })
      .then(() => {
        setGastos(gastos.filter(g => g.id !== id));
      })
      .catch(error => console.error('Error al eliminar el gasto:', error));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = formState.id ? `http://localhost:3001/gastos/${formState.id}` : 'http://localhost:3001/gastos';
    const method = formState.id ? 'PUT' : 'POST';
    const gastoData = { 
      descripcion: formState.descripcion, 
      monto: parseInt(formState.monto), 
      fecha: formState.fecha, 
      negocio_id: parseInt(formState.negocio_id) 
    };
    
    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gastoData)
    })
    .then(response => response.json())
    .then(data => {
      if (formState.id) {
        setGastos(gastos.map(g => (g.id === formState.id ? { ...gastoData, id: formState.id } : g)));
      } else {
        setGastos([{ ...gastoData, id: data.gastoId }, ...gastos]);
      }
      resetForm();
    })
    .catch(error => console.error('Error al registrar/actualizar el gasto:', error));
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { 
      field: 'fecha', 
      headerName: 'Fecha', 
      width: 150,
      valueFormatter: (value) => new Date(value).toLocaleDateString('es-CO', { timeZone: 'UTC' }),
    },
    { field: 'descripcion', headerName: 'Descripción', flex: 1 },
    { 
      field: 'monto', 
      headerName: 'Monto', 
      type: 'number', 
      width: 150,
      align: 'left',
      headerAlign: 'left',
      valueFormatter: (value) => `$${Number(value).toLocaleString('es-CO')}`
    },
    { 
      field: 'negocio_id', 
      headerName: 'Negocio', 
      width: 150,
      valueGetter: (value) => value === 1 ? 'Comidas Rápidas' : 'Para Almuerzos'
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      sortable: false,
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEditClick(params.row)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.id)} color="error">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {formState.id ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField name="descripcion" label="Descripción" value={formState.descripcion} onChange={handleFormChange} required />
          <TextField name="monto" label="Monto" type="number" value={formState.monto} onChange={handleFormChange} required />
          <TextField name="fecha" type="date" value={formState.fecha} onChange={handleFormChange} InputLabelProps={{ shrink: true }} required />
          <Select name="negocio_id" value={formState.negocio_id} onChange={handleFormChange}>
            <MenuItem value="1">Para Comidas Rápidas</MenuItem>
            <MenuItem value="2">Para Almuerzos</MenuItem>
          </Select>
          <Button type="submit" variant="contained">{formState.id ? 'Actualizar Gasto' : 'Registrar Gasto'}</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} InputLabelProps={{ shrink: true }} label="Filtrar por fecha" />
          <Select value={filtroNegocio} onChange={e => setFiltroNegocio(e.target.value)} displayEmpty>
            <MenuItem value="">Todos los Negocios</MenuItem>
            <MenuItem value="1">Comidas Rápidas</MenuItem>
            <MenuItem value="2">Almuerzos</MenuItem>
          </Select>
          <Button onClick={() => {setFiltroFecha(''); setFiltroNegocio('');}}>Quitar Filtros</Button>
        </Box>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar gasto por descripción o monto..."
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
            rows={filteredRows}
            columns={columns}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default GastosManager;

