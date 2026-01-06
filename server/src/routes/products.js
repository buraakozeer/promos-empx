import express from 'express';
import Product from '../models/Product.js';
import { verifyToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requirePermission('products'));

const shapeProduct = (p) => ({
  id: p._id.toString(),
  name: p.name,
  description: p.description,
  materials: p.materials || [],
  salePrice: p.salePrice || 0,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

// Listele
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products.map(shapeProduct));
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).json({ message: 'Ürünler getirilemedi.' });
  }
});

// Oluştur
router.post('/', async (req, res) => {
  try {
    const { name, description, materials, salePrice } = req.body || {};

    if (!name || !Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({ message: 'Ürün adı ve en az bir malzeme zorunludur.' });
    }

    const sanitizedMaterials = materials.map((m) => ({
      id: m.id,
      materialId: m.materialId,
      name: m.name,
      unit: m.unit,
      width: m.width,
      height: m.height,
      currency: m.currency,
      price: m.price,
      area: m.area,
      calculatedPrices: m.calculatedPrices,
      costPerCm2: m.costPerCm2,
      usedQuantity: Number(m.usedQuantity) || 0,
    }));

    if (sanitizedMaterials.some((m) => !m.usedQuantity || m.usedQuantity <= 0)) {
      return res.status(400).json({ message: 'Tüm malzemeler için kullanılan miktar pozitif olmalıdır.' });
    }

    const product = await Product.create({
      name,
      description,
      materials: sanitizedMaterials,
      salePrice: Number(salePrice) || 0,
    });

    res.status(201).json(shapeProduct(product));
  } catch (err) {
    console.error('POST /products error:', err);
    res.status(500).json({ message: err.message || 'Ürün oluşturulamadı.' });
  }
});

// Güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    body.updatedAt = new Date();
    if (body.salePrice !== undefined) {
      body.salePrice = Number(body.salePrice) || 0;
    }
    const product = await Product.findByIdAndUpdate(id, body, { new: true });
    if (!product) return res.status(404).json({ message: 'Ürün bulunamadı.' });
    res.json(shapeProduct(product));
  } catch (err) {
    console.error('PUT /products/:id error:', err);
    res.status(500).json({ message: 'Ürün güncellenemedi.' });
  }
});

// Sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Ürün bulunamadı.' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /products/:id error:', err);
    res.status(500).json({ message: 'Ürün silinemedi.' });
  }
});

export default router;
