const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');

const Order = require('../models/order'); // adjust path as needed

const orderRouter = express.Router();
var authenticate = require('../authenticate');

orderRouter.use(bodyParser.json());

orderRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, async (req, res, next) => {
    try {
      const orders = await Order.find(req.query)
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
})
.post(cors.corsWithOptions, async (req, res, next) => {
    
    try {
      const newOrder = await Order.create(req.body);
      res.status(201).json(newOrder);
    } catch (error) {
      next(error);
    }
});

module.exports = orderRouter;
