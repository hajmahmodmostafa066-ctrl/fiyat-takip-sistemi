require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg'); 
const { PrismaPg } = require('@prisma/adapter-pg'); 
const bcrypt = require('bcrypt');

// 1. Veritabanı bağlantı havuzu (Render için SSL zorunluluğu eklendi)
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Render'ın dış bağlantıları kabul etmesi için bu şarttır
    }
});

// 2. Prisma 7 için PostgreSQL adaptörünü bağla
const adapter = new PrismaPg(pool);

// 3. Prisma Client'i yeni adaptör kurallarıyla başlat
const prisma = new PrismaClient({ adapter });

async function main() {
    // Şifreyi veritabanında açıkça görünmemesi için kriptoluyoruz
    const hashedPassword = await bcrypt.hash('TermoAdmin123', 10);

    // Prisma ile User tablosuna ilk kaydımızı atıyoruz
    const adminUser = await prisma.user.create({
        data: {
            name: 'Sistem Yöneticisi',
            email: 'admin@termoenerji.com',
            password: hashedPassword,
            role: 'ADMIN'
        }
    });

    console.log("🎉 BAŞARILI! İlk Admin hesabı veritabanına güvenle eklendi:");
    console.log(`İsim: ${adminUser.name} | Rol: ${adminUser.role}`);
}

main()
    .catch((e) => {
        console.error("Kayıt sırasında bir hata oluştu:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });