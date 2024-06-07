const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios'); 

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado...'))
.catch(err => console.log(err));

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
    const { city, country } = req.body;

    // Hacer una solicitud a una API de clima (ejemplo)
    const response = await axios.get(`https://api.weatherapi.com/v1/current.json`, {
      params: {
        key: process.env.WEATHER_API_KEY, // Asegúrate de tener tu clave API en el archivo .env
        q: `${city},${country}`
      }
    });

    const weatherData = response.data;

    // Crear un nuevo objeto de búsqueda con los datos de la API de clima
    const search = new Search({
      city: weatherData.location.name,
      country: weatherData.location.country,
      temperature: weatherData.current.temp_c,
      condition: weatherData.current.condition.text,
      conditionText: weatherData.current.condition.text,
      icon: weatherData.current.condition.icon,
    });

    // Guardar la búsqueda en la base de datos
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
