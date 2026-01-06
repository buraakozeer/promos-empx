import express from 'express';
import Material from '../models/Material.js';
import { verifyToken, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requirePermission('raw_materials'));

const shapeMaterial = (m) => ({
  id: m._id.toString(),
  name: m.name,
  unit: m.unit,
  width: m.width,
  height: m.height,
  currency: m.currency,
  price: m.price,
  area: m.area,
  calculatedPrices: m.calculatedPrices,
  costPerCm2: m.costPerCm2,
  createdDate: m.createdDate || m.createdAt,
  updatedDate: m.updatedDate || m.updatedAt,
});

// Listele
router.get('/', async (req, res) => {
  try {
    const mats = await Material.find().sort({ createdAt: -1 });
    res.json(mats.map(shapeMaterial));
  } catch (err) {
    console.error('GET /materials error:', err);
    res.status(500).json({ message: 'Malzemeler getirilemedi.' });
  }
});

// Oluştur
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const mat = await Material.create(body);
    res.status(201).json(shapeMaterial(mat));
  } catch (err) {
    console.error('POST /materials error:', err);
    res.status(500).json({ message: 'Malzeme oluşturulamadı.' });
  }
});

// Güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    body.updatedDate = new Date();
    const mat = await Material.findByIdAndUpdate(id, body, { new: true });
    if (!mat) return res.status(404).json({ message: 'Malzeme bulunamadı.' });
    res.json(shapeMaterial(mat));
  } catch (err) {
    console.error('PUT /materials/:id error:', err);
    res.status(500).json({ message: 'Malzeme güncellenemedi.' });
  }
});

// Sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Material.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Malzeme bulunamadı.' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /materials/:id error:', err);
    res.status(500).json({ message: 'Malzeme silinemedi.' });
  }
});

export default router;
