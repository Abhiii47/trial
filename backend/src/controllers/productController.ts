import { Request, Response } from 'express';
import Product from '../models/Product';

// @desc    Get all products (or sync)
// @route   GET /products
// @access  Public
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({}).sort({ productName: 1 });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products',
      error: error instanceof Error ? error.message : error,
    });
  }
};

// @desc    Search products on server
// @route   GET /products/search
// @access  Public
export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ success: false, message: 'Please provide a search query' });
      return;
    }

    const searchQuery = q.trim();

    // Find products matching Name, Code, or Barcode (exact)
    const products = await Product.find({
      $or: [
        { productName: { $regex: searchQuery, $options: 'i' } },
        { productCode: { $regex: searchQuery, $options: 'i' } },
        { barcode: searchQuery },
      ],
    }).sort({ productName: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error instanceof Error ? error.message : error,
    });
  }
};

// @desc    Create a product
// @route   POST /products
// @access  Private (Owner only)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productName, productCode, barcode, category, brand, price } = req.body;
    const formattedCode = productCode.toUpperCase().trim();
    const formattedBarcode = barcode && barcode.trim() !== '' ? barcode.trim() : undefined;

    // Mongoose code
    const existingCode = await Product.findOne({ productCode: formattedCode });
    if (existingCode) {
      res.status(400).json({ success: false, message: `Product with code '${productCode}' already exists` });
      return;
    }

    if (formattedBarcode) {
      const existingBarcode = await Product.findOne({ barcode: formattedBarcode });
      if (existingBarcode) {
        res.status(400).json({ success: false, message: `Product with barcode '${barcode}' already exists` });
        return;
      }
    }

    const product = await Product.create({
      productName,
      productCode: formattedCode,
      barcode: formattedBarcode,
      category,
      brand,
      price: Number(price),
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error instanceof Error ? error.message : error,
    });
  }
};

// @desc    Update a product
// @route   PUT /products/:id
// @access  Private (Owner only)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { productName, productCode, barcode, category, brand, price } = req.body;
    const formattedCode = productCode ? productCode.toUpperCase().trim() : undefined;
    const formattedBarcode = barcode !== undefined ? (barcode.trim() !== '' ? barcode.trim() : undefined) : undefined;

    // Mongoose code
    let product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (productCode && productCode.toUpperCase().trim() !== product.productCode) {
      const existingCode = await Product.findOne({
        productCode: productCode.toUpperCase().trim(),
        _id: { $ne: id },
      });
      if (existingCode) {
        res.status(400).json({ success: false, message: `Product with code '${productCode}' already exists` });
        return;
      }
    }

    if (barcode && barcode.trim() !== product.barcode) {
      const existingBarcode = await Product.findOne({
        barcode: barcode.trim(),
        _id: { $ne: id },
      });
      if (existingBarcode) {
        res.status(400).json({ success: false, message: `Product with barcode '${barcode}' already exists` });
        return;
      }
    }

    const updateData: any = {
      productName,
      category,
      brand,
      price: price !== undefined ? Number(price) : undefined,
    };

    if (productCode) {
      updateData.productCode = productCode.toUpperCase().trim();
    }

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updateQuery: any = { $set: updateData };

    if (barcode !== undefined) {
      if (barcode.trim() === '') {
        updateQuery.$unset = { barcode: 1 };
      } else {
        updateQuery.$set.barcode = barcode.trim();
      }
    }

    product = await Product.findByIdAndUpdate(id, updateQuery, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error instanceof Error ? error.message : error,
    });
  }
};

// @desc    Delete a product
// @route   DELETE /products/:id
// @access  Private (Owner only)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error instanceof Error ? error.message : error,
    });
  }
};
