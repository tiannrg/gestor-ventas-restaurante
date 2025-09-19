import React, { useState, useEffect, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Button, TextField, Select, MenuItem, Box, Paper, Typography, IconButton, Grid,
    Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, InputAdornment, Alert, Divider
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';

function VentasManager() {
    const [ventas, setVentas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [cliente, setCliente] = useState('');
    const [negocioId, setNegocioId] = useState('1');
    const [itemsVenta, setItemsVenta] = useState([]);
    const [estadoOrden, setEstadoOrden] = useState('Completado');
    const [estadoPago, setEstadoPago] = useState('Pagado');
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const [detallesVenta, setDetallesVenta] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [filtroFecha, setFiltroFecha] = useState('');
    const [filtroNegocio, setFiltroNegocio] = useState('');
    const [searchText, setSearchText] = useState('');
    const [filteredVentas, setFilteredVentas] = useState([]);
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);


    useEffect(() => {
        let url = 'http://localhost:3001/ventas?';
        if (filtroFecha) url += `fecha=${filtroFecha}&`;
        if (filtroNegocio) url += `negocio_id=${filtroNegocio}`;

        fetch(url)
            .then(res => res.json())
            .then(data => setVentas(data))
            .catch(error => console.error('Error al obtener las ventas:', error));
    }, [filtroFecha, filtroNegocio]);

    useEffect(() => {
        const filtered = ventas.filter(venta =>
            (venta.cliente && venta.cliente.toLowerCase().includes(searchText.toLowerCase())) ||
            (venta.total && venta.total.toString().includes(searchText))
        );
        setFilteredVentas(filtered);
    }, [searchText, ventas]);

    useEffect(() => {
        fetch('http://localhost:3001/productos')
            .then(res => res.json())
            .then(data => setProductos(data))
            .catch(error => console.error('Error al obtener productos:', error));
    }, []);

    const handleVerDetalles = (venta) => {
        setVentaSeleccionada(venta);
        fetch(`http://localhost:3001/ventas/${venta.id}/detalles`)
            .then(response => response.json())
            .then(data => {
                setDetallesVenta(data);
                setModalOpen(true);
            })
            .catch(error => console.error('Error al obtener detalles:', error));
    };

    const handleUpdateEstadoPago = async (id, nuevoEstado) => {
        try {
            const response = await fetch(`http://localhost:3001/ventas/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado_pago: nuevoEstado }),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el estado del pago');
            }

            setVentas(ventas.map(v =>
                v.id === id ? { ...v, estado_pago: nuevoEstado } : v
            ));

        } catch (error) {
            console.error('Error:', error);
        }
    };


    const handleAddItem = (producto) => {
        const itemExistente = itemsVenta.find(item => item.id === producto.id);
        if (itemExistente) {
            setItemsVenta(itemsVenta.map(item =>
                item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
            ));
        } else {
            setItemsVenta([...itemsVenta, { ...producto, cantidad: 1 }]);
        }
    };

    const totalVenta = useMemo(() => {
        return itemsVenta.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }, [itemsVenta]);

    const handleRegistrarVenta = () => {
        if (!cliente || itemsVenta.length === 0) {
            alert('Por favor, ingresa el nombre del cliente y añade al menos un producto.');
            return;
        }
        const nuevaVenta = { cliente, total: totalVenta, estado_orden: estadoOrden, estado_pago: estadoPago, metodo_pago: metodoPago, negocio_id: parseInt(negocioId), items: itemsVenta, };
        fetch('http://localhost:3001/ventas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevaVenta) })
            .then(response => response.json())
            .then(data => {
                const nombreDelNegocio = negocioId === '1' ? 'Comidas Rápidas' : 'Almuerzos';
                const ventaParaMostrar = { ...nuevaVenta, id: data.ventaId, fecha: new Date(), nombre_negocio: nombreDelNegocio };
                setVentas([ventaParaMostrar, ...ventas]);
                setCliente('');
                setItemsVenta([]);
            })
            .catch(error => console.error('Error al registrar la venta:', error));
    };

    const productosDelNegocio = productos.filter(p => p.negocio_id == negocioId);

    const columns = [
        { field: 'id', headerName: 'ID Venta', width: 90 },
        {
            field: 'fecha', headerName: 'Fecha', width: 180,
            valueFormatter: (value) => new Date(value).toLocaleString('es-CO'),
        },
        { field: 'cliente', headerName: 'Cliente', flex: 1 },
        {
            field: 'total', headerName: 'Total', type: 'number', width: 120,
            valueFormatter: (value) => `$${Number(value).toLocaleString('es-CO')}`,
            align: 'left', headerAlign: 'left'
        },
        { field: 'nombre_negocio', headerName: 'Negocio', width: 150 },
        {
            field: 'estado_pago',
            headerName: 'Estado Pago',
            width: 150,
            renderCell: (params) => (
                <Select
                    value={params.value}
                    onChange={(e) => handleUpdateEstadoPago(params.id, e.target.value)}
                    sx={{
                        width: '100%',
                        height: '70%',
                        backgroundColor: params.value === 'Pagado' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
                        '& .MuiSelect-select': {
                            padding: '0 10px',
                        },
                    }}
                >
                    <MenuItem value="Pagado">Pagado</MenuItem>
                    <MenuItem value="No Pagado">No Pagado</MenuItem>
                </Select>
            ),
        },
        {
            field: 'actions',
            headerName: 'Detalles',
            sortable: false,
            width: 100,
            renderCell: (params) => (
                <IconButton onClick={() => handleVerDetalles(params.row)} color="primary">
                    <VisibilityIcon />
                </IconButton>
            ),
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Registrar Nueva Venta</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={2}>
                        <Select value={negocioId} onChange={e => { setNegocioId(e.target.value); setItemsVenta([]); }} fullWidth>
                            <MenuItem value="1">Comidas Rápidas</MenuItem>
                            <MenuItem value="2">Almuerzos</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField label="Nombre del Cliente" value={cliente} onChange={e => setCliente(e.target.value)} fullWidth required />
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <Select value={estadoPago} onChange={e => setEstadoPago(e.target.value)} fullWidth>
                            <MenuItem value="Pagado">Pagado</MenuItem>
                            <MenuItem value="No Pagado">No Pagado</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <Select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} fullWidth>
                            <MenuItem value="Efectivo">Efectivo</MenuItem>
                            <MenuItem value="Nequi">Nequi</MenuItem>
                            <MenuItem value="Otro">Otro</MenuItem>
                        </Select>
                    </Grid>
                </Grid>

                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Menú</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {productosDelNegocio.map(p => (
                        <Button key={p.id} variant="outlined" onClick={() => handleAddItem(p)}>
                            {p.nombre}
                        </Button>
                    ))}
                </Box>

                {itemsVenta.length > 0 &&
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>Venta Actual</Typography>
                        <List dense>
                            {itemsVenta.map(item => (<ListItem key={item.id} disablePadding> <ListItemText primary={`${item.cantidad}x ${item.nombre}`} secondary={`Subtotal: $${(item.precio * item.cantidad).toLocaleString('es-CO')}`} /> </ListItem>))}
                        </List>
                        <Typography variant="h5" sx={{ mt: 2 }}>Total: ${totalVenta.toLocaleString('es-CO')}</Typography>
                        <Button variant="contained" size="large" sx={{ mt: 2 }} onClick={handleRegistrarVenta}>Registrar Venta</Button>
                    </Box>
                }
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Historial de Ventas</Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} InputLabelProps={{ shrink: true }} label="Filtrar por fecha" />
                    <Select value={filtroNegocio} onChange={e => setFiltroNegocio(e.target.value)} displayEmpty>
                        <MenuItem value="">Todos los Negocios</MenuItem>
                        <MenuItem value="1">Comidas Rápidas</MenuItem>
                        <MenuItem value="2">Almuerzos</MenuItem>
                    </Select>
                    <Button onClick={() => { setFiltroFecha(''); setFiltroNegocio(''); setSearchText(''); }}>Quitar Filtros</Button>
                </Box>

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar venta por cliente o total..."
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
                        rows={filteredVentas}
                        columns={columns}
                        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                        pageSizeOptions={[5, 10, 20]}
                        disableRowSelectionOnClick
                    />
                </Box>
            </Paper>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
                <DialogTitle>Detalles de la Venta</DialogTitle>
                <DialogContent>
                    {ventaSeleccionada && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <strong>Método de Pago:</strong> {ventaSeleccionada.metodo_pago}
                        </Alert>
                    )}
                    
                    {}
                    <List sx={{ border: '1px solid #ddd', borderRadius: '4px', p: 1 }}>
                        {detallesVenta.map((detalle, index) => (
                            <React.Fragment key={index}>
                                <ListItem>
                                    <ListItemText
                                        primary={detalle.producto_nombre}
                                        secondary={`Unitario: $${Number(detalle.precio_unitario).toLocaleString('es-CO')}`}
                                    />
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {detalle.cantidad}x
                                    </Typography>
                                </ListItem>
                                {index < detallesVenta.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default VentasManager;