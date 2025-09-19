import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField, Select, MenuItem, Box, Paper, Typography, IconButton, InputAdornment } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

function ProductManager() {
  const [productos, setProductos] = useState([]);
  const [formState, setFormState] = useState({ id: null, nombre: '', precio: '', negocio_id: '1' });
  const [searchText, setSearchText] = useState('');
  const [filteredRows, setFilteredRows] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/productos')
      .then(res => res.json())
      .then(data => {
        setProductos(data);
        setFilteredRows(data);
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  useEffect(() => {
    const filtered = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      producto.precio.toString().includes(searchText)
    );
    setFilteredRows(filtered);
  }, [searchText, productos]);

  const handleFormChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleEditClick = (producto) => {
    setFormState({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      negocio_id: producto.negocio_id.toString(),
    });
  };

  const resetForm = () => {
    setFormState({ id: null, nombre: '', precio: '', negocio_id: '1' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = formState.id ? `http://localhost:3001/productos/${formState.id}` : 'http://localhost:3001/productos';
    const method = formState.id ? 'PUT' : 'POST';
    const productoData = { nombre: formState.nombre, precio: parseFloat(formState.precio), negocio_id: parseInt(formState.negocio_id) };

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoData)
    })
    .then(res => res.json())
    .then(data => {
        if (formState.id) {
            setProductos(productos.map(p => p.id === formState.id ? { ...p, ...productoData, id: formState.id } : p));
        } else {
            setProductos([...productos, { ...productoData, id: data.productoId }]);
        }
        resetForm();
    })
    .catch(error => console.error('Error submitting form:', error));
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:3001/productos/${id}`, { method: 'DELETE' })
      .then(() => {
        setProductos(productos.filter(p => p.id !== id));
      })
      .catch(error => console.error('Error deleting product:', error));
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'nombre', headerName: 'Nombre del Producto', flex: 1 },
    { 
      field: 'precio', 
      headerName: 'Precio', 
      type: 'number', 
      width: 150, 
      headerAlign: 'left',
      align: 'left',
      valueFormatter: (value) => `$${Number(value).toLocaleString('es-CO')}` 
    },
    {
      field: 'negocio_id',
      headerName: 'Negocio',
      width: 150,
      valueGetter: (value) => value === 1 ? 'Comidas Rápidas' : 'Almuerzos',
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      sortable: false,
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEditClick(params.row)} color="primary"><EditIcon /></IconButton>
          <IconButton onClick={() => handleDelete(params.id)} color="error"><DeleteIcon /></IconButton>
        </>
      ),
    },
  ];
    
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {formState.id ? 'Editar Producto' : 'Añadir Nuevo Producto'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField name="nombre" label="Nombre del producto" value={formState.nombre} onChange={handleFormChange} required />
          <TextField name="precio" label="Precio" type="number" value={formState.precio} onChange={handleFormChange} required />
          <Select name="negocio_id" value={formState.negocio_id} onChange={handleFormChange}>
            <MenuItem value="1">Comidas Rápidas</MenuItem>
            <MenuItem value="2">Almuerzos</MenuItem>
          </Select>
          <Button type="submit" variant="contained">{formState.id ? 'Actualizar' : 'Añadir'}</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar producto por nombre o precio..."
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

export default ProductManager;