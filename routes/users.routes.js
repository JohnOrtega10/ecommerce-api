const express = require('express');

//Controllers
const {
  createUser,
  loginUser,
  getAllProducts,
  updateUser,
  deleteUser,
  getAllOrders,
  getOrderById
} = require('../controllers/users.controller');

//Middlewares
const { validateSession } = require('../middlewares/auth.middleware');
const {
  userExists,
  protectAccountOwner
} = require('../middlewares/users.middleware');
const {
  createUserValidations,
  validateResult
} = require('../middlewares/validators');

const router = express.Router();

router.post('/', createUserValidations, validateResult, createUser);

router.post('/login', loginUser);

router.use(validateSession);

router.get('/me', getAllProducts);

router.get('/orders', getAllOrders);

router.get('/orders/:id', getOrderById);

router
  .use('/:id', userExists, protectAccountOwner)
  .route('/:id')
  .patch(updateUser)
  .delete(deleteUser);

module.exports = { usersRouter: router };
