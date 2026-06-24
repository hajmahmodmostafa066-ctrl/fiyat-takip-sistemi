require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

// 1. Veritabanı Bağlantısını Kontrol Et
if (!process.env.DATABASE_URL) {
    console.error("HATA: DATABASE_URL tanımlı değil! Render Ayarları > Environment Variables kısmına git ve DATABASE_URL ekle.");
    process.exit(1); // Sunucuyu başlatma, hata vererek dur.
}

// 2. Prisma Bağlantısını (Adapter ile) Güvenli Başlat
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();

app.use(cors());
app.use(express.json());

// --- ROTALAR ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ hata: "E-posta ve şifre zorunludur." });

        const user = await prisma.appUser.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ hata: "Kullanıcı bulunamadı." });
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ hata: "Hatalı şifre." });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ mesaj: "Başarılı", token, isim: user.name });
    } catch (e) {
        res.status(500).json({ hata: "Sunucu hatası: " + e.message });
    }
});

app.use(express.static(__dirname));
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Portu her zaman Render'ın atadığı şekilde al
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`[BAŞARILI] Termoenerji ERP sunucusu ${PORT} portunda çalışıyor...`);
});
