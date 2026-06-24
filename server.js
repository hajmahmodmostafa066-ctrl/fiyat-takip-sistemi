require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const app = express();

// 1. Veritabanı Bağlantısı
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. API Rotaları (MUTLAKA Statik dosyalardan ÖNCE olmalı!)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ hata: "Kullanıcı bulunamadı." });
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ hata: "Hatalı şifre." });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ mesaj: "Başarılı", token, isim: user.name });
    } catch (e) {
        res.status(500).json({ hata: "Sunucu hatası." });
    }
});

app.post('/api/urun-ekle', async (req, res) => {
    try {
        const { name, category, price, stock, description } = req.body;
        const product = await prisma.product.create({
            data: { name, category, price: parseFloat(price), stock: parseInt(stock), description: description || "" }
        });
        res.json({ mesaj: "Ürün başarıyla eklendi", product });
    } catch (e) {
        res.status(500).json({ hata: "Ürün eklenemedi." });
    }
});

app.get('/api/urunler', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (e) {
        res.status(500).json({ hata: "Ürünler getirilemedi." });
    }
});

// 4. Statik Dosyalar (En altta)
app.use(express.static(__dirname));

// 5. Fallback (Tüm diğer yollar index.html'e gider)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`[BAŞARILI] Termoenerji ERP sunucusu ${PORT} portunda çalışıyor...`));
