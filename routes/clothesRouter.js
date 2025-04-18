const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('./cors');

const Clothes = require('../models/clothes');
var authenticate = require('../authenticate');

/* const storageD = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const storageC = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/Category');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const uploadDish = multer({ storage: storageD });
const uploadCat = multer({ storage: storageC }); */

const ClothesRouter = express.Router();

ClothesRouter.use(bodyParser.json());

ClothesRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, async (req, res, next) => {
    try {
        const cloth = await Clothes.find(req.query)
        res.status(200).json(cloth);
    } catch (error) {
        next(error);
    }
})
.post(cors.corsWithOptions, async (req, res) => {
    const { category, name, new: isNew, best, images, color, size, price, discount } = req.body;
  
    const clothingItem = {
      name,
      new: isNew,
      best,
      images: images || new Map(),
      color,
      size,
      price,
      discount,
    };
  
    try {
      // Check if category already exists
      let categoryDoc = await Clothes.findOne({ category });
  
      if (categoryDoc) {
        // Add new item to the existing category
        categoryDoc.items.push(clothingItem);
        await categoryDoc.save();
      } else {
        // Create a new category and add item to it
        categoryDoc = new Clothes({
          category,
          items: [clothingItem],
        });
        await categoryDoc.save();
      }
  
      res.status(200).json({ message: 'Clothing item added successfully', data: categoryDoc });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
})  
.delete(cors.corsWithOptions, async (req, res) => {
    const { _id } = req.body;
    
    try {
        const deletedSunItem = await Sunglasses.findByIdAndDelete(_id);

        if (!deletedSunItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(deletedSunItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

ClothesRouter.route('/:category/:clothesId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, async (req, res, next) => {
    const { category, clothesId } = req.params;

    try {
        const categoryDoc = await Clothes.findOne({ category });

        if (!categoryDoc) {
            const err = new Error(`Category '${category}' not found`);
            err.status = 404;
            return next(err);
        }

        // Find the item in the items array
        const clothingItem = categoryDoc.items.id(clothesId);

        if (!clothingItem) {
            const err = new Error(`Clothing item with ID '${clothesId}' not found in category '${category}'`);
            err.status = 404;
            return next(err);
        }

        res.status(200).json(clothingItem);
    } catch (err) {
        next(err);
    }
})
/* .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    const { glassId } = req.params;

    Sunglasses.findById(glassId)
        .then((sunglasses) => {
            if (sunglasses) {
                // Update the fields
                sunglasses.images = req.body.images || sunglasses.images; // Preserve existing if not provided
                sunglasses.color = req.body.color || sunglasses.color;   // Preserve existing if not provided

                return sunglasses.save(); // Save the updated document
            } else {
                const err = new Error(`Glass ${glassId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .then((updatedSunglasses) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(updatedSunglasses);
        })
        .catch((err) => next(err));
}) */
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Clothes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, { new: true })
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Clothes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = ClothesRouter;