const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Güvenlik ve veri okuma izinleri
app.use(cors());
app.use(express.json());

// API'nin çalıştığını test etmek için ana sayfa
app.get('/', (req, res) => {
    res.json({ 
        sistem: "Termoenerji İklimlendirme ERP Backend", 
        durum: "Aktif ve Çalışıyor",
        versiyon: "1.0.0"
    });
});

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[BAŞARILI] Termoenerji ERP sunucusu ${PORT} portunda çalışıyor...`);
});