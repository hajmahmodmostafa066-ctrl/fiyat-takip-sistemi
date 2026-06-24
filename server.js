require('dotenv').config(); // Bu satır en üstte olmak zorunda!
const express = require('express');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

// --- Hata Ayıklama (Log) ---
console.log("DB_URL Kontrolü:", process.env.DATABASE_URL ? "URL YÜKLÜ" : "URL BOŞ/YOK");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }); // Hata burada alınıyor

// Prisma bağlantısı
const prisma = new PrismaClient();

const app = express();

// --- MİDDLEWARE (İstekleri işleyen ana katman) ---
app.use(cors());
app.use(express.json()); // JSON verilerini okumak için bu satır HAYATİ önem taşır.
app.use(express.urlencoded({ extended: true }));

// --- API ROTALARI ---
app.post('/api/login', async (req, res) => {
    try {
        console.log("Gelen istek:", req.body); // Hata ayıklama için
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ hata: "E-posta ve şifre zorunludur." });
        }

        const user = await prisma.user.findUnique({ 
            where: { email: email } 
        });

        if (!user) return res.status(401).json({ hata: "Kullanıcı bulunamadı." });
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ hata: "Hatalı şifre." });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ mesaj: "Başarılı", token, isim: user.name });
    } catch (e) {
        console.error("Giriş Hatası:", e);
        res.status(500).json({ hata: "Sunucu hatası: " + e.message });
    }
});

// Ürün işlemleri
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

// --- STATİK DOSYALAR (Frontend) ---
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Port Ayarı
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`[BAŞARILI] Termoenerji ERP sunucusu ${PORT} portunda çalışıyor...`);
});
