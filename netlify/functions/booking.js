const fetch = require('node-fetch');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }
  const { name, email, phone, when, message } = payload;
  if (!name || !email) {
    return { statusCode: 400, body: 'Missing required fields' };
  }

  // Basic record: in a real setup persist to DB or send to CRM
  const record = { name, email, phone: phone || '', when: when || '', message: message || '', receivedAt: new Date().toISOString() };

  // Optionally forward to external webhook (e.g., Slack, Zapier, TidyCal) if configured
  const webhook = process.env.BOOKING_WEBHOOK;
  if (webhook) {
    try {
      await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) });
    } catch (err) {
      console.error('Webhook forward failed', err);
    }
  }

  // Return a friendly response
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, message: 'Received', data: record })
  };
};
