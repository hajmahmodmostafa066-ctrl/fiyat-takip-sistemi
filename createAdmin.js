require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// PrismaClient'ı başlat
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@termoenerji.com';
    const password = 'TermoAdmin123';
    
    // Şifreyi güvenli hale getir
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Admin hesabı oluşturuluyor...");

    try {
        // Yeni şemadaki 'appUser' modelini kullanıyoruz
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
            console.log('⚠️ Bu e-posta ile kayıt zaten mevcut, atlanıyor.');
        } else {
            console.error('❌ Kayıt sırasında bir hata oluştu:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
