const express = require('express');
const productRepo = require('../repositories/products');
const productsIndexTemplate = require('../views/products/index');

const router = express.Router();

router.get('/', async (req, res) => {
    const products = await productRepo.getAll();
    res.send(productsIndexTemplate({ products }));
});

module.exports = router;