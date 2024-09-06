const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sql = require('mssql');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  user: 'kullan',
  password: '123456',
  server: 'DESKTOP-JNRGUFB\\SQLEXPRESS',
  database: 'scooter',
  options: {
    encrypt: false,
    enableArithAbort: true,
    trustServerCertificate: true
  }
};

// SQL bağlantı kontrolü
async function connectToDB() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("Connected to the database");
    return pool;
  } catch (err) {
    console.error("Database connection error:", err);
  }
}

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await connectToDB();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query('SELECT * FROM [User] WHERE username = @username AND password = @password');

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
