const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: 'localhost',
    user: 'developer',
    password: 'developer',
    database: 'gestor_ventas'
}).promise();

db.getConnection()
    .then(connection => {
        console.log('¡Conexión a la base de datos MySQL exitosa! ✅');
        connection.release();
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos:', err);
    });

// --- CRUD PARA PRODUCTOS ---
app.get('/productos', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM productos');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
app.post('/productos', async (req, res) => {
    try {
        const { nombre, precio, negocio_id } = req.body;
        const sql = 'INSERT INTO productos (nombre, precio, negocio_id) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [nombre, parseInt(precio), negocio_id]);
        res.status(201).json({ message: 'Producto creado exitosamente', productoId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
app.put('/productos/:id', async (req, res) => {
    try {
        const { nombre, precio, negocio_id } = req.body;
        const sql = 'UPDATE productos SET nombre = ?, precio = ?, negocio_id = ? WHERE id = ?';
        await db.query(sql, [nombre, parseInt(precio), negocio_id, req.params.id]);
        res.json({ message: 'Producto actualizado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
app.delete('/productos/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
/***********************************************************************************************************************************************************/

// --- CRUD PARA GASTOS ---
app.get('/gastos', async (req, res) => {
    try {
        const { fecha, negocio_id } = req.query;
        let sql = 'SELECT * FROM gastos';
        const params = [];
        const conditions = [];
        if (fecha) {
            conditions.push('fecha = ?');
            params.push(fecha);
        }
        if (negocio_id) {
            conditions.push('negocio_id = ?');
            params.push(negocio_id);
        }
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY fecha DESC';
        const [results] = await db.query(sql, params);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
app.post('/gastos', async (req, res) => {
    try {
        const { descripcion, monto, fecha, negocio_id } = req.body;
        const sql = 'INSERT INTO gastos (descripcion, monto, fecha, negocio_id) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [descripcion, parseInt(monto), fecha, negocio_id]);
        res.status(201).json({ message: 'Gasto registrado exitosamente', gastoId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
app.put('/gastos/:id', async (req, res) => {
    try {
        const { descripcion, monto, fecha, negocio_id } = req.body;
        const sql = 'UPDATE gastos SET descripcion = ?, monto = ?, fecha = ?, negocio_id = ? WHERE id = ?';
        await db.query(sql, [descripcion, parseInt(monto), fecha, negocio_id, req.params.id]);
        res.json({ message: 'Gasto actualizado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
/***********************************************************************************************************************************************************/


// --- CRUD PARA VENTAS ---
app.get('/ventas', async (req, res) => {
    try {
        const { fecha, negocio_id } = req.query;
        let sql = `SELECT v.*, n.nombre AS nombre_negocio FROM ventas v JOIN negocios n ON v.negocio_id = n.id`;
        const params = [];
        const conditions = [];
        if (fecha) {
            conditions.push('DATE(v.fecha) = ?');
            params.push(fecha);
        }
        if (negocio_id) {
            conditions.push('v.negocio_id = ?');
            params.push(negocio_id);
        }
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY v.fecha DESC';
        const [results] = await db.query(sql, params);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
app.get('/ventas/:id/detalles', async (req, res) => {
    try {
        const ventaId = req.params.id;
        const sql = `SELECT vd.cantidad, vd.precio_unitario, p.nombre AS producto_nombre FROM venta_detalles vd JOIN productos p ON vd.producto_id = p.id WHERE vd.venta_id = ?`;
        const [detalles] = await db.query(sql, [ventaId]);
        res.json(detalles);
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.post('/ventas', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { cliente, total, estado_orden, estado_pago, metodo_pago, negocio_id, items } = req.body;
        const ventaSql = 'INSERT INTO ventas (cliente, total, estado_orden, estado_pago, metodo_pago, negocio_id) VALUES (?, ?, ?, ?, ?, ?)';
        const [ventaResult] = await connection.query(ventaSql, [cliente, parseInt(total), estado_orden, estado_pago, metodo_pago, negocio_id]);
        const ventaId = ventaResult.insertId;
        const detallesSql = 'INSERT INTO venta_detalles (venta_id, producto_id, cantidad, precio_unitario) VALUES ?';
        const detallesValues = items.map(item => [ventaId, item.id, item.cantidad, parseInt(item.precio)]);
        await connection.query(detallesSql, [detallesValues]);
        await connection.commit();
        res.status(201).json({ message: 'Venta registrada exitosamente', ventaId });
    } catch (err) {
        await connection.rollback();
        console.error("Error al registrar venta:", err);
        res.status(500).json({ error: 'Error al registrar la venta' });
    } finally {
        connection.release();
    }
});
/*********************************************************************************************************************************************************** */

// --- CIERRE DE CAJA Y SU HISTORIAL ---
app.get('/cierres-caja/historial', async (req, res) => {
    try {
        const sql = `
            SELECT c.*, n.nombre AS nombre_negocio 
            FROM cierres_caja c 
            JOIN negocios n ON c.negocio_id = n.id 
            ORDER BY c.fecha DESC`;
        const [historial] = await db.query(sql);
        res.json(historial);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el historial de cierres' });
    }
});
app.post('/cierre-caja', async (req, res) => {
    const { fecha, negocio_id } = req.body;
    if (!fecha || !negocio_id) {
        return res.status(400).json({ error: 'La fecha y el negocio son obligatorios' });
    }
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [ventasResult] = await connection.query('SELECT SUM(total) as totalVentas FROM ventas WHERE DATE(fecha) = ? AND negocio_id = ?', [fecha, negocio_id]);
        const [gastosResult] = await connection.query('SELECT SUM(monto) as totalGastos FROM gastos WHERE fecha = ? AND negocio_id = ?', [fecha, negocio_id]);
        
        const totalVentas = ventasResult[0].totalVentas || 0;
        const totalGastos = gastosResult[0].totalGastos || 0;
        const ganancia = totalVentas - totalGastos;

        const insertSql = `
            INSERT INTO cierres_caja (fecha, negocio_id, total_ventas, total_gastos, ganancia) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            total_ventas = VALUES(total_ventas), 
            total_gastos = VALUES(total_gastos), 
            ganancia = VALUES(ganancia)`;
        
        await connection.query(insertSql, [fecha, negocio_id, totalVentas, totalGastos, ganancia]);
        await connection.commit();
        
        res.json({ totalVentas, totalGastos, ganancia });
    } catch (err) {
        await connection.rollback();
        console.error("Error en el cierre de caja:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
});

// INICIAR EL SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT} 🚀`);
});