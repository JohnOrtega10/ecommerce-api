const express = require('express');

//Controllers
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/products.controller');

//Middlewares
const { validateSession } = require('../middlewares/auth.middleware');
const {
  productExits,
  protectProductOwner
} = require('../middlewares/products.middleware');
const {
  createProductValidations,
  validateResult
} = require('../middlewares/validators');

const router = express.Router();

router.use(validateSession);

router
  .route('/')
  .post(createProductValidations, validateResult, createProduct)
  .get(getAllProducts);

router
  .use('/:id', productExits)
  .route('/:id')
  .get(getProductById)
  .patch(protectProductOwner, updateProduct)
  .delete(protectProductOwner, deleteProduct);

module.exports = { productsRouter: router };
