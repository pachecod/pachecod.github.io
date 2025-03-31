
const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('You can now view your scene in the browser');
});