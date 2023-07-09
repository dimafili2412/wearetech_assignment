const express = require('express');
const path = require('path');
const products = require('./products');

const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

//parse json
app.use(express.json());

// Cart state
let cart = [];

// Routes

// Root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get cart
app.get('/cart', (req, res) => {
    res.send(cart);
});

// Get products
app.get('/products', (req, res) => {
    res.send(products);
});

// Add product to cart
app.post('/cart/add', (req, res) => {
    const { productIndex, planIndex } = req.body;
    const product = products[productIndex];
    const plan = product.plans[planIndex];
    const item = {
        title: product.name,
        subtitle: plan.name,
        price: plan.price,
        img: product.img,
    };
    cart.push(item);
    res.sendStatus(200);
});

// Remove product from cart
app.post('/cart/remove', (req, res) => {
    const { index } = req.body;
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
});

// Checkout
app.post('/checkout', (req, res) => {
    //placeholder, will always succeed
    res.sendStatus(200);
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
