const Product = require("./product.model");
const { v4: uuidv4 } = require("uuid");
const httpResponse = require("../../utils/httpResponse");
const httpError = require("../../utils/httpError");

const createProduct = async (req, res, next) => {
  try {
    const { name, sku, category_id, uom } = req.body;

    // Check if product with same SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
       httpResponse(req, res, 400, "SKU already exists", null);
    }

    // Create new product
    const newProduct = new Product({
      id: uuidv4(),
      name,
      sku,
      category_id,
      uom
    });

    await newProduct.save();
    httpResponse(req, res, 201, "Product created successfully", newProduct);
  } catch (error) {
    httpError(next, error, req, 500);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    httpResponse(req, res, 200, "Products retrieved successfully", products);
  } catch (error) {
    httpError(next, error, req, 500);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ id });

    if (!product) {
       httpResponse(req, res, 404, "Product not found", null);
    }

    httpResponse(req, res, 200, "Product retrieved successfully", product);
  } catch (error) {
    httpError(next, error, req, 500);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sku, category_id, uom } = req.body;

    // Check if another product with same SKU exists (excluding current product)
    const existingProduct = await Product.findOne({ sku, id: { $ne: id } });
    if (existingProduct) {
       httpResponse(req, res, 400, "SKU already exists", null);
    }

    const product = await Product.findOneAndUpdate(
      { id: id },
      { 
        name,
        sku,
        category_id,
        uom,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!product) {
       httpResponse(req, res, 404, "Product not found", null);
    }

    httpResponse(req, res, 200, "Product updated successfully", product);
  } catch (error) {
    httpError(next, error, req, 500);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ id });
    if (!product) {
       httpResponse(req, res, 404, "Product not found", null);
    }

    await Product.findOneAndDelete({ id });
    httpResponse(req, res, 200, "Product deleted successfully", null);
  } catch (error) {
    httpError(next, error, req, 500);
  }
};

const getProductsByCategory = async (req, res, next) => {
  try {
    const { category_id } = req.params;

    const products = await Product.find({ category_id });

    if (products.length === 0) {
       httpResponse(req, res, 200, "No products found for this category", []);
    }

    httpResponse(req, res, 200, "Products retrieved successfully", products);
  } catch (error) {
    httpError(next, error, req, 500);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
       httpResponse(req, res, 400, "Search query is required", null);
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } }
      ]
    });

    httpResponse(req, res, 200, "Search results retrieved successfully", products);
  } catch (error) {
    httpError(next, error, req, 500);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts
};