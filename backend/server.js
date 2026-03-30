const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Sample Route
app.get('/api/orders', (req, res) => {
    res.json([{ id: 1, item: 'Item 1', quantity: 10 }]);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
