require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@termoenerji.com';
    const password = 'TermoAdmin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Admin hesabı oluşturuluyor (AppUser tablosu hedefleniyor)...");

    try {
        // Tablo adını AppUser olarak güncelledik
        const adminUser = await prisma.appUser.create({
            data: {
                email: email,
                password: hashedPassword,
                name: 'Admin',
                role: 'ADMIN'
            }
        });
        console.log('✅ Admin hesabı başarıyla oluşturuldu:', adminUser.email);
    } catch (error) {
        if (error.code === 'P2002') {
            console.log('⚠️ Bu e-posta ile kayıt zaten mevcut.');
        } else {
            console.error('❌ HATA:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
