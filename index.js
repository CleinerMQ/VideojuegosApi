const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { sql, getConnection } = require('./db');

const app = express();
const port = 3000;
const secretKey = 'tu_clave_secreta';

app.use(bodyParser.json());
app.use(cors());




app.post('/registrarJugador', async (req, res) => {
    const { nombreUsuario, password } = req.body;
    
    try {
        // Generar hash de la contraseña
        const hashedPassword = password;

        // Conectar a la base de datos
        const pool = await getConnection();
        
        // Ejecutar procedimiento almacenado para registrar jugador
        await pool.request()
            .input('NombreUsuario', sql.NVarChar, nombreUsuario)
            .input('PasswordHash', sql.NVarChar, hashedPassword)
            .execute('sp_RegistrarJugador');

        res.status(201).json({ mensaje: 'Jugador registrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Ruta para iniciar sesión (obtener datos de jugador) utilizando procedimiento almacenado
app.post('/login', async (req, res) => {
    const { nombreUsuario, password } = req.body;
    
    try {
        // Generar hash de la contraseña ingresada
        const hashedPassword = password ;
        
        // Conectar a la base de datos
        const pool = await getConnection();

        // Ejecutar procedimiento almacenado para obtener datos del jugador
        const result = await pool.request()
            .input('NombreUsuario', sql.NVarChar, nombreUsuario)
            .input('PasswordHash', sql.NVarChar, hashedPassword)
            .execute('sp_ObtenerDatosJugador');

        // Verificar si se encontró algún jugador con el nombre de usuario y contraseña proporcionados
        if (result.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario o contraseña incorrectos' });
        }

        // Si el inicio de sesión es exitoso, devolver los datos del jugador
        res.status(200).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Ruta para actualizar el ranking de un jugador utilizando procedimiento almacenado
// Ruta para actualizar el ranking de un jugador utilizando procedimiento almacenado
app.put('/actualizarRanking', async (req, res) => {
    const { nombreUsuario, ranking } = req.body;
    try {
        const pool = await getConnection();

        // Actualizar el ranking utilizando el procedimiento almacenado
        await pool.request()
            .input('NombreUsuario', sql.NVarChar, nombreUsuario)
            .input('Ranking', sql.Int, ranking) // Asegúrate de pasar el parámetro @Ranking
            .execute('sp_ActualizarRankingJugador');

        res.status(200).json({ mensaje: 'Ranking actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Ruta para actualizar las monedas de un jugador utilizando procedimiento almacenado
app.put('/actualizarMonedas', async (req, res) => {
    const { nombreUsuario, monedas } = req.body;
    try {
        const pool = await getConnection();

        await pool.request()
            .input('NombreUsuario', sql.NVarChar, nombreUsuario)
            .input('Monedas', sql.Int, monedas)
            .execute('sp_ActualizarMonedasJugador');

        res.status(200).json({ mensaje: 'Monedas actualizadas' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Ruta para obtener el top 3 de jugadores por ranking
app.get('/top3Ranking', async (req, res) => {
    try {
        const pool = await getConnection();

        const result = await pool.request()
            .execute('sp_Top3RankingJugadores');

        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ejemplo de uso en Node.js utilizando mssql
app.put('/restarMonedas', async (req, res) => {
    const { nombreUsuario, monedasARestar } = req.body;
    try {
        const pool = await getConnection();

        const result = await pool.request()
            .input('NombreUsuario', sql.NVarChar, nombreUsuario)
            .input('MonedasARestar', sql.Int, monedasARestar)
            .execute('sp_RestarMonedasJugador');

        res.status(200).json({ mensaje: result.recordset[0].Mensaje });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para comprar personaje
app.post('/comprarPersonaje', async (req, res) => {
    const { nombreUsuario, campoPersonaje, costoMonedas } = req.body;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('NombreUsuario', sql.NVarChar, nombreUsuario)
            .input('CampoPersonaje', sql.NVarChar, campoPersonaje)
            .input('CostoMonedas', sql.Int, costoMonedas)
            .execute('sp_ComprarPersonaje');

        res.status(200).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener el estado de los personajes
app.post('/estadoPersonajes', async (req, res) => {
    const { nombreUsuario } = req.body;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('NombreUsuario', sql.NVarChar, nombreUsuario)
            .execute('sp_ObtenerEstadoPersonajes');

        res.status(200).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Otras rutas y configuraciones aquí...

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
