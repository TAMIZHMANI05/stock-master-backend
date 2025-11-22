const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const productSchema = mongoose.Schema(
  {
    id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    category_id: {
      type: String,
      required: true,
    },
    uom: {
      type: String,
      required: true,
    }
  },
  { timestamps: true, versionKey: false }
);


const Product = mongoose.model("Product", productSchema);

module.exports = Product;