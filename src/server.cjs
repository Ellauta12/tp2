const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir esquema y modelo
const searchSchema = new mongoose.Schema({
  city: String,
  country: String,
  temperature: Number,
  condition: String,
  conditionText: String,
  icon: String,
  date: { type: Date, default: Date.now },
});

const Search = mongoose.model('Search', searchSchema);

// Ruta para guardar una búsqueda
app.post('/api/search', async (req, res) => {
  try {
    const search = new Search(req.body);
    await search.save();
    res.status(201).send(search);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Ruta para obtener todas las búsquedas
app.get('/api/search', async (req, res) => {
  try {
    const searches = await Search.find();
    res.status(200).send(searches);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
