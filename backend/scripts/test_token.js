require('dotenv').config();
const { query } = require('../src/config/database');

async function test() {
    const queueId = 'CA-C02';
    try {
        const queryStr = `
        SELECT q.token_number, q.status, q.estimated_wait_minutes, q.priority_score,
               q.registered_at, q.called_at, q.is_emergency,
               d.name as doctor_name, d.department,
               (SELECT COUNT(*) FROM queues q2 
                WHERE q2.doctor_id = q.doctor_id 
                AND q2.status = 'waiting' 
                AND q2.priority_score > q.priority_score) + 1 as position_in_queue
        FROM queues q
        JOIN doctors d ON d.id = q.doctor_id
        WHERE q.token_number = $1
      `;
        const res = await query({ text: queryStr, values: [queueId], name: 'fetch-by-token-test' });
        console.log(JSON.stringify(res.rows[0], null, 2));
    } catch (e) {
        console.error("PG ERROR:", e.message);
    }
}
test();
