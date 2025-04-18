const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true }
}, { _id: false }); // ⬅ prevent auto-generating _id for subdocuments if not needed

const orderSchema = new mongoose.Schema({
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  email: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },
  address: { type: String, default: "" },
  order_type: { type: String, enum: ['Online', 'In-Store'], required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
