const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors()); // CORS
app.use(bodyParser.json()); // Parsing JSON dari request body
app.use('/auth', authRoutes); // Menambahkan route untuk otentikasi

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
