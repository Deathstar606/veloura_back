const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const SSLCommerzPayment = require('sslcommerz-lts');
const cors = require('./cors');

const Order = require('../models/order'); // adjust path as needed

const orderRouter = express.Router();
var authenticate = require('../authenticate');

const store_id = "demo667d30040fbc3";
const store_passwd = "demo667d30040fbc3@ssl";
const is_live = false;

orderRouter.use(bodyParser.json());

orderRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, async (req, res, next) => {
    try {
      const orders = await Order.find(req.query)
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
})
.post(cors.corsWithOptions, async (req, res, next) => {
  try {
    let order = req.body;
    const trans_id = new mongoose.Types.ObjectId().toString();
    const data = {
        total_amount: order.total,
        currency: 'BDT',
        tran_id: trans_id,
        success_url: `http://localhost:9000/orders/success/${trans_id}`, //http://localhost:9000/
        fail_url: 'http://localhost:3030/fail',
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: order.firstName,
        cus_email: order.email,
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);
    let GatewayPageURL = apiResponse.GatewayPageURL;
    
    const finalOrder = {
        firstName: order.firstName,
        lastName: order.lastName,
        address: order.address,
        email: order.email,
        phoneNumber: order.phoneNumber,
        order_stat: order.order_stat,
        total: order.total,
        items: order.items,
        transaction_id: trans_id
    };
    console.log('Redirecting to: ', GatewayPageURL);

    await Order.create(finalOrder);

    res.send({ url: GatewayPageURL });
  } catch (err) {
      console.error('Error during processing:', err);
      next(err);
  }
});

orderRouter.route('/success/:tranId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, async (req, res, next) => {
  console.log("Payment success callback received");
    try {
        const transactionId = req.params.tranId;
        const updatedOrder = await Order.findOneAndUpdate(
            { transaction_id: transactionId },
            { $set: { payment_stat: true } },
            { new: true }
        );

        if (!updatedOrder) {
            console.log("Transaction not found for ID: ", transactionId);
            return res.status(404).json({ message: 'Transaction not found' });
        }

/*         clients.forEach((client) =>
            client.write(`data: ${JSON.stringify(updatedOrder)}\n\n`)
        ); */

        res.redirect(`http://localhost:3000/Veloura#/home/paystat/${transactionId}`);
    } catch (err) {
        console.error("Error processing payment success callback:", err);
        next(err);
    }
});

module.exports = orderRouter;
