import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yetkilendirme tokenı eksik.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verify error:', err);
    return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token.' });
  }
};

export const requirePermission = (permId) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Kimlik doğrulama gerekli.' });
  }
  const perms = req.user.permissions || [];
  if (!perms.includes(permId)) {
    return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' });
  }
  next();
};
