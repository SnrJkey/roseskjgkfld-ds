const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const files = {
  users: './data/users.json',
  finance: './data/finance.json',
  family: './data/family.json',
  chat: './data/chat.json'
};

function readJSON(type) {
  return JSON.parse(fs.readFileSync(files[type], 'utf8') || '[]');
}

function writeJSON(type, data) {
  fs.writeFileSync(files[type], JSON.stringify(data, null, 2));
}

// ===== API =====
app.get('/api/:type', (req, res) => {
  const type = req.params.type;
  if(files[type]) res.json(readJSON(type));
  else res.status(404).send('Not found');
});

app.post('/api/:type', (req, res) => {
  const type = req.params.type;
  if(!files[type]) return res.status(404).send('Not found');

  const data = readJSON(type);
  const body = req.body;

  if(body.action === 'clear' && type==='finance'){
    writeJSON(type, []);
    return res.json({status:'ok'});
  }

  if(body.action === 'remove' && type==='family'){
    const filtered = data.filter(u=>u.name !== body.name);
    writeJSON(type, filtered);
    return res.json({status:'ok'});
  }

  data.push(body);
  writeJSON(type, data);
  res.json({status:'ok'});
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
