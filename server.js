require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const app = express();
app.use(cors());
app.use(express.json());

// Sadece ana dizini (root) kullan
app.use(express.static(__dirname));

// Ana sayfayı doğrudan ana dizindeki index.html'den al
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Veritabanı ve API kodlarını buraya ekleyebilirsin...
// (Diğer tüm API'lerini buraya kopyala)

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`[BAŞARILI] Termoenerji ERP sunucusu ${PORT} portunda çalışıyor...`));
