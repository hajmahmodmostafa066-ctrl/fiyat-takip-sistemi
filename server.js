require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Veritabanı Bağlantısı
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();

// Ayarlar
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Frontend dosyalarının olduğu klasör

// 1. Ana Sayfa (Arayüzü Sunar)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Giriş Yap API
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

// 3. Ürün Ekleme API
app.post('/api/urun-ekle', async (req, res) => {
    try {
        const { name, category, price, stock, description } = req.body;
        const product = await prisma.product.create({
            data: { 
                name, 
                category, 
                price: parseFloat(price), 
                stock: parseInt(stock), 
                description: description || "" 
            }
        });
        res.json({ mesaj: "Ürün başarıyla eklendi", product });
    } catch (e) {
        res.status(500).json({ hata: "Ürün eklenemedi." });
    }
});

// 4. Ürünleri Listeleme API
app.get('/api/urunler', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (e) {
        res.status(500).json({ hata: "Ürünler getirilemedi." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`));
