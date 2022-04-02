const express = require('express');

//Controllers
const {
  getUserCart,
  addProductToCart,
  updateProductCart,
  deleteProductCart,
  purchaseCart
} = require('../controllers/cart.controller');

//Middlewares
const { validateSession } = require('../middlewares/auth.middleware');
const {
  addProductToCartValidations,
  validateResult
} = require('../middlewares/validators');

const router = express.Router();

router.use(validateSession);

router.get('/', getUserCart);

router.post(
  '/add-product',
  addProductToCartValidations,
  validateResult,
  addProductToCart
);

router.patch('/update-cart', updateProductCart);

router.post('/purchase', purchaseCart);

router.delete('/:productId', deleteProductCart);

module.exports = { cartRouter: router };
