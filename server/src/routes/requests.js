import express from 'express';
import RequestCategory from '../models/RequestCategory.js';
import RequestProduct from '../models/RequestProduct.js';
import Request from '../models/Request.js';
import { verifyToken, requirePermission } from '../middleware/auth.js';

export default function createRequestsRoutes(io) {
const router = express.Router();

// ============ CATEGORIES ============

// Get all categories (public - for personnel request page)
router.get('/categories', async (req, res) => {
  try {
    const categories = await RequestCategory.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.json(categories.map(c => ({
      id: c._id.toString(),
      name: c.name,
      description: c.description,
      order: c.order,
    })));
  } catch (err) {
    console.error('GET /requests/categories error:', err);
    res.status(500).json({ message: 'Kategoriler alınamadı.' });
  }
});

// Get all categories including inactive (admin only)
router.get('/categories/all', verifyToken, requirePermission('admin_panel'), async (req, res) => {
  try {
    const categories = await RequestCategory.find().sort({ order: 1, name: 1 });
    res.json(categories.map(c => ({
      id: c._id.toString(),
      name: c.name,
      description: c.description,
      isActive: c.isActive,
      order: c.order,
      createdAt: c.createdAt,
    })));
  } catch (err) {
    console.error('GET /requests/categories/all error:', err);
    res.status(500).json({ message: 'Kategoriler alınamadı.' });
  }
});

// Create category (admin only)
router.post('/categories', verifyToken, requirePermission('admin_panel'), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Kategori adı gerekli.' });
    }
    const maxOrder = await RequestCategory.findOne().sort({ order: -1 });
    const category = new RequestCategory({
      name,
      description: description || '',
      order: maxOrder ? maxOrder.order + 1 : 0,
    });
    await category.save();
    res.status(201).json({
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      order: category.order,
    });
  } catch (err) {
    console.error('POST /requests/categories error:', err);
    res.status(500).json({ message: 'Kategori oluşturulamadı.' });
  }
});

// Update category (admin only)
router.put('/categories/:id', verifyToken, requirePermission('admin_panel'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, order } = req.body;
    const category = await RequestCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Kategori bulunamadı.' });
    }
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;
    if (order !== undefined) category.order = order;
    await category.save();
    res.json({
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      order: category.order,
    });
  } catch (err) {
    console.error('PUT /requests/categories/:id error:', err);
    res.status(500).json({ message: 'Kategori güncellenemedi.' });
  }
});

// Delete category (admin only)
router.delete('/categories/:id', verifyToken, requirePermission('admin_panel'), async (req, res) => {
  try {
    const { id } = req.params;
    // Also delete products in this category
    await RequestProduct.deleteMany({ categoryId: id });
    await RequestCategory.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /requests/categories/:id error:', err);
    res.status(500).json({ message: 'Kategori silinemedi.' });
  }
});

// ============ PRODUCTS ============

// Get products by category (public - for personnel request page)
router.get('/categories/:categoryId/products', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await RequestProduct.find({ categoryId, isActive: true }).sort({ order: 1, name: 1 });
    res.json(products.map(p => ({
      id: p._id.toString(),
      categoryId: p.categoryId.toString(),
      name: p.name,
      description: p.description,
      unit: p.unit,
      order: p.order,
    })));
  } catch (err) {
    console.error('GET /requests/categories/:categoryId/products error:', err);
    res.status(500).json({ message: 'Ürünler alınamadı.' });
  }
});

// Get all products (admin only)
router.get('/products/all', verifyToken, requirePermission('admin_panel'), async (req, res) => {
  try {
    const products = await RequestProduct.find().populate('categoryId', 'name').sort({ order: 1, name: 1 });
    res.json(products.map(p => ({
      id: p._id.toString(),
      categoryId: p.categoryId?._id?.toString() || '',
      categoryName: p.categoryId?.name || 'Silinmiş Kategori',
      name: p.name,
      description: p.description,
      unit: p.unit,
      isActive: p.isActive,
      order: p.order,
      createdAt: p.createdAt,
    })));
  } catch (err) {
    console.error('GET /requests/products/all error:', err);
    res.status(500).json({ message: 'Ürünler alınamadı.' });
  }
});

// Create product (admin only)
router.post('/products', verifyToken, requirePermission('admin_panel'), async (req, res) => {
  try {
    const { categoryId, name, description, unit } = req.body;
    if (!categoryId || !name) {
      return res.status(400).json({ message: 'Kategori ve ürün adı gerekli.' });
    }
    const category = await RequestCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Kategori bulunamadı.' });
    }
    const maxOrder = await RequestProduct.findOne({ categoryId }).sort({ order: -1 });
    const product = new RequestProduct({
      categoryId,
      name,
      description: description || '',
      unit: unit || 'Adet',
      order: maxOrder ? maxOrder.order + 1 : 0,
    });
    await product.save();
    res.status(201).json({
      id: product._id.toString(),
      categoryId: product.categoryId.toString(),
      categoryName: category.name,
      name: product.name,
      description: product.description,
      unit: product.unit,
      isActive: product.isActive,
      order: product.order,
    });
  } catch (err) {
    console.error('POST /requests/products error:', err);
    res.status(500).json({ message: 'Ürün oluşturulamadı.' });
  }
});

// Update product (admin only)
router.put('/products/:id', verifyToken, requirePermission('admin_panel'), async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, name, description, unit, isActive, order } = req.body;
    const product = await RequestProduct.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı.' });
    }
    if (categoryId !== undefined) product.categoryId = categoryId;
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (unit !== undefined) product.unit = unit;
    if (isActive !== undefined) product.isActive = isActive;
    if (order !== undefined) product.order = order;
    await product.save();
    
    const category = await RequestCategory.findById(product.categoryId);
    res.json({
      id: product._id.toString(),
      categoryId: product.categoryId.toString(),
      categoryName: category?.name || 'Silinmiş Kategori',
      name: product.name,
      description: product.description,
      unit: product.unit,
      isActive: product.isActive,
      order: product.order,
    });
  } catch (err) {
    console.error('PUT /requests/products/:id error:', err);
    res.status(500).json({ message: 'Ürün güncellenemedi.' });
  }
});

// Delete product (admin only)
router.delete('/products/:id', verifyToken, requirePermission('admin_panel'), async (req, res) => {
  try {
    const { id } = req.params;
    await RequestProduct.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /requests/products/:id error:', err);
    res.status(500).json({ message: 'Ürün silinemedi.' });
  }
});

// ============ REQUESTS ============

// Get all requests (admin only)
router.get('/', verifyToken, requirePermission('admin_panel'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    const requests = await Request.find(filter)
      .populate('processedBy', 'name surname')
      .sort({ createdAt: -1 });
    res.json(requests.map(r => ({
      id: r._id.toString(),
      personnelId: r.personnelId,
      personnelName: r.personnelName,
      personnelSurname: r.personnelSurname,
      personnelNote: r.personnelNote,
      items: r.items.map(i => ({
        productId: i.productId?.toString() || null,
        productName: i.productName,
        categoryName: i.categoryName,
        quantity: i.quantity,
        unit: i.unit,
        note: i.note,
        isCustom: i.isCustom || false,
      })),
      status: r.status,
      adminNote: r.adminNote,
      processedBy: r.processedBy ? {
        id: r.processedBy._id.toString(),
        name: r.processedBy.name,
        surname: r.processedBy.surname,
      } : null,
      processedAt: r.processedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })));
  } catch (err) {
    console.error('GET /requests error:', err);
    res.status(500).json({ message: 'Talepler alınamadı.' });
  }
});

// Create request (public - for personnel)
router.post('/', async (req, res) => {
  try {
    const { personnelId, personnelName, personnelSurname, personnelNote, items } = req.body;
    if (!personnelId || !personnelName || !items || items.length === 0) {
      return res.status(400).json({ message: 'Personel bilgisi ve en az bir ürün gerekli.' });
    }
    
    // Validate and enrich items
    const enrichedItems = [];
    for (const item of items) {
      // Handle custom products (not in database)
      if (item.isCustom || item.productId?.startsWith('custom_')) {
        enrichedItems.push({
          productId: null,
          productName: item.productName || 'Özel Ürün',
          categoryName: item.categoryName || 'Diğer',
          quantity: item.quantity || 1,
          unit: item.unit || 'Adet',
          note: item.note || '',
          isCustom: true,
        });
        continue;
      }
      const product = await RequestProduct.findById(item.productId).populate('categoryId', 'name');
      if (!product) {
        return res.status(400).json({ message: `Ürün bulunamadı: ${item.productId}` });
      }
      enrichedItems.push({
        productId: product._id,
        productName: product.name,
        categoryName: product.categoryId?.name || 'Bilinmeyen',
        quantity: item.quantity || 1,
        unit: product.unit,
        note: item.note || '',
      });
    }
    
    const request = new Request({
      personnelId,
      personnelName,
      personnelSurname: personnelSurname || '',
      personnelNote: personnelNote || '',
      items: enrichedItems,
    });
    await request.save();
    
    const responseData = {
      id: request._id.toString(),
      personnelId: request.personnelId,
      personnelName: request.personnelName,
      personnelSurname: request.personnelSurname,
      personnelNote: request.personnelNote,
      items: request.items.map(i => ({
        productId: i.productId?.toString() || null,
        productName: i.productName,
        categoryName: i.categoryName,
        quantity: i.quantity,
        unit: i.unit,
        note: i.note,
        isCustom: i.isCustom || false,
      })),
      status: request.status,
      createdAt: request.createdAt,
    };

    // Emit socket event to notify request management module
    io.to('requests:management').emit('requests:new', responseData);
    
    res.status(201).json(responseData);
  } catch (err) {
    console.error('POST /requests error:', err);
    res.status(500).json({ message: 'Talep oluşturulamadı.' });
  }
});

// Update request status (admin only)
router.put('/:id/status', verifyToken, requirePermission('admin_panel'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Talep bulunamadı.' });
    }
    if (status) request.status = status;
    if (adminNote !== undefined) request.adminNote = adminNote;
    request.processedBy = req.user.id;
    request.processedAt = new Date();
    await request.save();
    
    res.json({
      id: request._id.toString(),
      status: request.status,
      adminNote: request.adminNote,
      processedAt: request.processedAt,
    });
  } catch (err) {
    console.error('PUT /requests/:id/status error:', err);
    res.status(500).json({ message: 'Talep güncellenemedi.' });
  }
});

// Delete request (admin only)
router.delete('/:id', verifyToken, requirePermission('admin_panel'), async (req, res) => {
  try {
    const { id } = req.params;
    await Request.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /requests/:id error:', err);
    res.status(500).json({ message: 'Talep silinemedi.' });
  }
});

return router;
}
