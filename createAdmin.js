const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdmin() {
    const email = "admin@termoenerji.com"; // Buraya kullanacağın e-postayı yaz
    const password = "TermoAdmin123";      // Buraya kullanacağın şifreyi yaz
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                name: "Termoenerji Admin",
                role: "ADMIN"
            }
        });
        console.log("Admin hesabı başarıyla oluşturuldu!");
        console.log("E-posta:", email);
        console.log("Şifre:", password);
    } catch (e) {
        console.error("Hata! Kullanıcı zaten var veya veritabanı bağlantısı yapılamadı:", e);
    }
}

createAdmin();
