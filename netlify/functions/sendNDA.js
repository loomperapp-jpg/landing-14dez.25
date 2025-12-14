cat > netlify/functions/sendNDA.js <<'EOF'
// skeleton Netlify Function - sendNDA
exports.handler = async function(event, context) {
  try {
    const payload = event.httpMethod === 'POST' ? JSON.parse(event.body) : {};
    console.log('sendNDA payload', payload);
    return { statusCode: 200, body: JSON.stringify({ ok:true }) };
  } catch(err){
    return { statusCode:500, body: JSON.stringify({ ok:false, error: String(err) }) };
  }
};
EOF