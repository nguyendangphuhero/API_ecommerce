import express from   'express';
import authController from '../controllers/authController';
import cartOrderController from '../controllers/cartOrderController';

const router = express.Router();

router.post('/',authController.protectRoute, cartOrderController.addToCart);

router.post('/flutter/stripepayment',cartOrderController.saveOrderHandler);

router.post('/braintree/paypalpayment/:nonce',cartOrderController.paypalOrderRequestHandler);

router
    .route('/:userid')
    .get(authController.protectRoute, cartOrderController.getCart)
    .delete(cartOrderController.deleteCart);

router.get('/orders/user/:userid',authController.protectRoute, cartOrderController.getOrders);

router.post('/stripe/stripeid/:stripeid',cartOrderController.stripeOrderRequestHandler);

export default router;
