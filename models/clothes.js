const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clothesSchema = new Schema({
  category: { type: String, required: true, unique: true },
  items: [
    {
      name: { type: String, default: '' },
      new: { type: Boolean, default: true },
      best: { type: Boolean, default: false },
      images: { 
        type: Map, // dynamic keys
        of: [String]
      },
      color: [String],
      size: [String],
      price: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: null },
    }
  ]
}, { timestamps: true });

const Cloth = mongoose.model('Cloth', clothesSchema);
module.exports = Cloth;
