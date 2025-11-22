const Product = require("./product.model"); // Fixed path
const { v4: uuidv4 } = require("uuid");
const httpResponse = require("../../utils/httpResponse");

const createProduct = async (req, res) => {
  try {
    const { name, sku, category_id, uom } = req.body;

    // Check if product with same SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return httpResponse(req, res, 400, "SKU already exists", null);
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
    return httpResponse(req, res, 201, "Product created successfully", newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    return httpResponse(req, res, 500, "Internal server error", null);
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return httpResponse(req, res, 200, "Products retrieved successfully", products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return httpResponse(req, res, 500, "Internal server error", null);
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ id });

    if (!product) {
      console.error(`Get product failed: No product found with id ${id}`);
      return httpResponse(req, res, 404, "Product not found", null);
    }

    console.log(`Product retrieved successfully: ${id}`);
    return httpResponse(req, res, 200, "Product retrieved successfully", product);
  } catch (error) {
    console.error("Error fetching product:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return httpResponse(req, res, 500, "Error fetching product", null);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, category_id, uom } = req.body;

    // Check if another product with same SKU exists (excluding current product)
    const existingProduct = await Product.findOne({ sku, id: { $ne: id } });
    if (existingProduct) {
      return httpResponse(req, res, 400, "SKU already exists", null);
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
      console.error(`Update product failed: No product found with id ${id}`);
      return httpResponse(req, res, 404, "Product not found", null);
    }

    console.log(`Product updated successfully: ${id}`);
    return httpResponse(req, res, 200, "Product updated successfully", product);
  } catch (error) {
    console.error("Error updating product:", error);
    return httpResponse(req, res, 500, "Internal server error", null);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ id });
    if (!product) {
      console.error(`Delete product failed: No product found with id ${id}`);
      return httpResponse(req, res, 404, "Product not found", null);
    }

    await Product.findOneAndDelete({ id });

    console.log(`Product deleted successfully: ${id}`);
    return httpResponse(req, res, 200, "Product deleted successfully", null);
  } catch (error) {
    console.error("Error deleting product:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return httpResponse(req, res, 500, "Error deleting product", null);
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;

    const products = await Product.find({ category_id });

    if (products.length === 0) {
      return httpResponse(req, res, 200, "No products found for this category", []);
    }

    console.log(`Found ${products.length} products for category ${category_id}`);
    return httpResponse(req, res, 200, "Products retrieved successfully", products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return httpResponse(req, res, 500, "Internal server error", null);
  }
};

const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return httpResponse(req, res, 400, "Search query is required", null);
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } }
      ]
    });

    return httpResponse(req, res, 200, "Search results retrieved successfully", products);
  } catch (error) {
    console.error("Error searching products:", error);
    return httpResponse(req, res, 500, "Internal server error", null);
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