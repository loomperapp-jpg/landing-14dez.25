// skeleton Netlify Function - sendInvite
exports.handler = async function(event, context) {
  try {
    const payload = event.httpMethod === 'POST' ? JSON.parse(event.body) : {};
    console.log('sendInvite payload', payload);
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, message: 'Skeleton received, integrate provider to send emails.' })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: String(err) })};
  }
};