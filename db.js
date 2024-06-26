const sql = require('mssql');

const config = {
    user: 'Nilsonxd_SQLLogin_1',
    password: 'fadhnnv52q',
    server: 'ProyectoVideojuegos.mssql.somee.com',
    database: 'ProyectoVideojuegos',
    options: {
        encrypt: true,
        trustServerCertificate: true // Aceptar certificados autofirmados
    }
};

async function getConnection() {
    try {
        let pool = await sql.connect(config);
        return pool;
    } catch (err) {
        console.log('Database Connection Failed! Bad Config: ', err);
    }
}

module.exports = {
    sql, getConnection
};
