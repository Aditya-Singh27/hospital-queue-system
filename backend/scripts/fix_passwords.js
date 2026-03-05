require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function fixPasswords() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        const adminHash = await bcrypt.hash('Admin@1234', 12);
        await client.query('UPDATE admins SET password_hash = $1 WHERE email = $2', [adminHash, 'admin@hospital.com']);
        console.log('Fixed admin password');

        const docHash = await bcrypt.hash('Doctor@1234', 12);
        await client.query('UPDATE doctors SET password_hash = $1', [docHash]);
        console.log('Fixed all doctor passwords');
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

fixPasswords();
