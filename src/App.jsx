import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { io as createSocket } from 'socket.io-client';
import { 
  Save, Trash2, Calculator, Settings,
  LayoutDashboard, Edit2, X, Clock, Package, Layers, 
  ChevronRight, ChevronLeft, Plus, Search, FileText, CheckSquare, 
  RefreshCw, Wallet, Eye, FolderOpen, Calendar as CalendarIcon, 
  Users, Lock, LogOut, Key, Mail, Palette, Check, AlignLeft, User,
  MessageSquare, Send, UserPlus, MoreVertical, Paperclip, ImageIcon, File, Download, Bell, Home, ArrowRight,
  Briefcase, Kanban, AlertCircle, ClipboardList, UserCheck, CalendarDays, UserCog, Coins, ChevronDown,
  Archive, RotateCcw
} from 'lucide-react';
import TaskManagement from './TaskManagement.jsx';

// --- 1. TEMA VE YARDIMCI FONKSİYONLAR ---

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    appColor: 'indigo',       
    appText: 'text-slate-800', 
    menuBg: 'bg-slate-900',    
    menuText: 'text-slate-300' 
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const getThemeColors = (colorName) => {
  const colors = {
    indigo: { base: 'indigo', text: 'text-indigo-600', bg: 'bg-indigo-600', bgLight: 'bg-indigo-50', border: 'border-indigo-200', borderStrong: 'border-indigo-600', ring: 'ring-indigo-500', hoverBg: 'hover:bg-indigo-700', hoverText: 'hover:text-indigo-700' },
    blue:   { base: 'blue',   text: 'text-blue-600',   bg: 'bg-blue-600',   bgLight: 'bg-blue-50',   border: 'border-blue-200',   borderStrong: 'border-blue-600',   ring: 'ring-blue-500',   hoverBg: 'hover:bg-blue-700', hoverText: 'hover:text-blue-700' },
    red:    { base: 'red',    text: 'text-red-600',    bg: 'bg-red-600',    bgLight: 'bg-red-50',    border: 'border-red-200',    borderStrong: 'border-red-600',    ring: 'ring-red-500',    hoverBg: 'hover:bg-red-700', hoverText: 'hover:text-red-700' },
    green:  { base: 'green',  text: 'text-green-600',  bg: 'bg-green-600',  bgLight: 'bg-green-50',  border: 'border-green-200',  borderStrong: 'border-green-600',  ring: 'ring-green-500',  hoverBg: 'hover:bg-green-700', hoverText: 'hover:text-green-700' },
    purple: { base: 'purple', text: 'text-purple-600', bg: 'bg-purple-600', bgLight: 'bg-purple-50', border: 'border-purple-200', borderStrong: 'border-purple-600', ring: 'ring-purple-500', hoverBg: 'hover:bg-purple-700', hoverText: 'hover:text-purple-700' },
    orange: { base: 'orange', text: 'text-orange-600', bg: 'bg-orange-600', bgLight: 'bg-orange-50', border: 'border-orange-200', borderStrong: 'border-orange-600', ring: 'ring-orange-500', hoverBg: 'hover:bg-orange-700', hoverText: 'hover:text-orange-700' },
    teal:   { base: 'teal',   text: 'text-teal-600',   bg: 'bg-teal-600',   bgLight: 'bg-teal-50',   border: 'border-teal-200',   borderStrong: 'border-teal-600',   ring: 'ring-teal-500',   hoverBg: 'hover:bg-teal-700', hoverText: 'hover:text-teal-700' },
    cyan:   { base: 'cyan',   text: 'text-cyan-600',   bg: 'bg-cyan-600',   bgLight: 'bg-cyan-50',   border: 'border-cyan-200',   borderStrong: 'border-cyan-600',   ring: 'ring-cyan-500',   hoverBg: 'hover:bg-cyan-700', hoverText: 'hover:text-cyan-700' },
    rose:   { base: 'rose',   text: 'text-rose-600',   bg: 'bg-rose-600',   bgLight: 'bg-rose-50',   border: 'border-rose-200',   borderStrong: 'border-rose-600',   ring: 'ring-rose-500',   hoverBg: 'hover:bg-rose-700', hoverText: 'hover:text-rose-700' },
    amber:  { base: 'amber',  text: 'text-amber-600',  bg: 'bg-amber-600',  bgLight: 'bg-amber-50',  border: 'border-amber-200',  borderStrong: 'border-amber-600',  ring: 'ring-amber-500',  hoverBg: 'hover:bg-amber-700', hoverText: 'hover:text-amber-700' },
  };
  return colors[colorName] || colors.indigo;
};

const formatDate = (dateString) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  try {
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  } catch (e) {
    return dateString;
  }
};

// --- YENİ BİLEŞEN: GENEL ONAY MODALI ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Sil", cancelText = "İptal", type = "danger" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
        <div className="p-6 text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition border-r border-slate-100">{cancelText}</button>
          <button onClick={onConfirm} className={`flex-1 py-3 text-sm font-bold transition ${type === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-blue-600 hover:bg-blue-50'}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

// --- 2. GÖRÜNÜM BİLEŞENLERİ ---

const LoginView = ({ users, onLogin, onCompanyLogin }) => {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme.appColor);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // First try normal login
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        onLogin({ user: data.user, token: data.token });
        return;
      }

      // If normal login fails, try company login
      const companyRes = await fetch('http://localhost:4000/api/settings/company-login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (companyRes.ok) {
        const companyData = await companyRes.json();
        if (companyData.isCompanyLogin) {
          onCompanyLogin();
          return;
        }
      }

      // Both failed
      setError('E-posta adresi veya şifre hatalı!');
    } catch (err) {
      console.error('Login request error:', err);
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6"><div className={`w-16 h-16 ${colors.bgLight} rounded-full flex items-center justify-center`}><Lock className={`w-8 h-8 ${colors.text}`} /></div></div>
          <h2 className={`text-2xl font-bold text-center ${theme.appText} mb-2`}>Panel Girişi</h2>
          <p className={`text-center ${theme.appText} opacity-60 mb-8 text-sm`}>Lütfen hesap bilgilerinizi giriniz.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className={`block text-sm font-medium ${theme.appText} mb-1`}>E-posta Adresi</label><div className="relative"><Mail className="w-5 h-5 absolute left-3 top-3 text-slate-400" /><input type="email" name="email" id="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 ${colors.ring} focus:outline-none`} placeholder="ornek@sirket.com" /></div></div>
            <div><label className={`block text-sm font-medium ${theme.appText} mb-1`}>Şifre</label><div className="relative"><Key className="w-5 h-5 absolute left-3 top-3 text-slate-400" /><input type="password" name="password" id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 ${colors.ring} focus:outline-none`} placeholder="••••••" /></div></div>
            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${colors.bg} ${colors.hoverBg} text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100"><div className="font-bold text-slate-500 mb-1">Test Hesapları:</div><div>admin@sirket.com / 123</div><div>emre@sirket.com / 123</div></div>
      </div>
    </div>
  );
};

// Personnel ID Entry Screen (after company login)
const PersonnelIdEntryView = ({ onPersonnelFound, onBack }) => {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme.appColor);
  const [personnelId, setPersonnelId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!personnelId.trim()) {
      setError('Lütfen personel ID numaranızı girin.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/settings/lookup-personnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personnelId: personnelId.trim() }),
      });

      if (res.ok) {
        const user = await res.json();
        onPersonnelFound(user);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Bu ID ile kayıtlı personel bulunamadı.');
      }
    } catch (err) {
      console.error('Personnel lookup error:', err);
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6"><div className={`w-16 h-16 ${colors.bgLight} rounded-full flex items-center justify-center`}><UserCheck className={`w-8 h-8 ${colors.text}`} /></div></div>
          <h2 className={`text-2xl font-bold text-center ${theme.appText} mb-2`}>Personel Girişi</h2>
          <p className={`text-center ${theme.appText} opacity-60 mb-8 text-sm`}>Lütfen personel ID numaranızı giriniz.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${theme.appText} mb-1`}>Personel ID</label>
              <input 
                type="text" 
                value={personnelId} 
                onChange={(e) => setPersonnelId(e.target.value)} 
                className={`w-full p-4 text-center text-2xl font-mono border border-slate-300 rounded-lg focus:ring-2 ${colors.ring} focus:outline-none`} 
                placeholder="P001" 
                autoFocus
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${colors.bg} ${colors.hoverBg} text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading ? 'Kontrol ediliyor...' : 'Devam Et'}
            </button>
          </form>
          <button onClick={onBack} className={`w-full mt-4 text-sm ${colors.text} hover:underline`}>← Giriş ekranına dön</button>
        </div>
      </div>
    </div>
  );
};

// Request Page (after personnel ID is verified)
const PersonnelRequestView = ({ personnel, onBack }) => {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme.appColor);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({});
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customProduct, setCustomProduct] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch('http://localhost:4000/api/requests/categories');
        if (catRes.ok) {
          const cats = await catRes.json();
          setCategories(cats);
          if (cats.length > 0) setSelectedCategory(cats[0].id);
          // Fetch products for all categories
          const prodMap = {};
          for (const cat of cats) {
            const prodRes = await fetch(`http://localhost:4000/api/requests/categories/${cat.id}/products`);
            if (prodRes.ok) prodMap[cat.id] = await prodRes.json();
          }
          setProducts(prodMap);
        }
      } catch (err) { console.error('Fetch error:', err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(c => c.productId === product.id);
    if (existing) {
      setCart(cart.map(c => c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { productId: product.id, productName: product.name, categoryName: categories.find(c => c.id === product.categoryId)?.name || '', unit: product.unit, quantity: 1, note: '' }]);
    }
  };

  const addCustomToCart = (productName, categoryName) => {
    const customId = `custom_${Date.now()}`;
    setCart([...cart, { productId: customId, productName, categoryName, unit: 'Adet', quantity: 1, note: '', isCustom: true }]);
  };

  const updateCartItem = (productId, field, value) => {
    if (field === 'quantity' && value < 1) {
      setCart(cart.filter(c => c.productId !== productId));
    } else {
      setCart(cart.map(c => c.productId === productId ? { ...c, [field]: value } : c));
    }
  };

  const removeFromCart = (productId) => setCart(cart.filter(c => c.productId !== productId));

  const submitRequest = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:4000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personnelId: personnel.personnelId,
          personnelName: personnel.name,
          personnelSurname: personnel.surname,
          personnelNote: personnel.note || '',
          items: cart.map(c => ({ productId: c.productId, quantity: c.quantity, note: c.note })),
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setCart([]);
      }
    } catch (err) { console.error('Submit error:', err); }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 text-center">
          <div className={`w-20 h-20 ${colors.bgLight} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Check className={`w-10 h-10 ${colors.text}`} />
          </div>
          <h2 className={`text-2xl font-bold ${theme.appText} mb-2`}>Talebiniz Alındı!</h2>
          <p className="text-slate-500 mb-6">Talebiniz yöneticiye iletildi. En kısa sürede işleme alınacaktır.</p>
          <button onClick={onBack} className={`w-full ${colors.bg} ${colors.hoverBg} text-white font-medium py-3 rounded-lg transition`}>Çıkış Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`${colors.bg} text-white p-4 rounded-t-2xl flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">{personnel.name?.charAt(0)}{personnel.surname?.charAt(0)}</div>
            <div><h2 className="font-bold">{personnel.name} {personnel.surname}</h2><p className="text-white/80 text-sm">ID: {personnel.personnelId}</p></div>
          </div>
          <button onClick={onBack} className="text-white/80 hover:text-white text-sm">Çıkış</button>
        </div>

        <div className="bg-white rounded-b-2xl shadow-xl">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Yükleniyor...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center"><AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-2" /><p className="text-slate-500">Henüz talep edilebilir ürün tanımlanmamış.</p></div>
          ) : (
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Categories */}
              <div className="p-4">
                <h3 className="font-bold text-slate-700 mb-3 text-sm">Kategoriler</h3>
                <div className="space-y-1">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${selectedCategory === cat.id ? `${colors.bg} text-white` : 'text-slate-600 hover:bg-slate-100'}`}>
                      <FolderOpen className="w-4 h-4 inline mr-2" />{cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products */}
              <div className="p-4">
                <h3 className="font-bold text-slate-700 mb-3 text-sm">Ürünler</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(products[selectedCategory] || []).map(prod => (
                    <div key={prod.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div><p className="text-sm font-medium text-slate-700">{prod.name}</p><p className="text-xs text-slate-400">{prod.unit}</p></div>
                      <button onClick={() => addToCart(prod)} className={`${colors.bg} ${colors.hoverBg} text-white p-1.5 rounded-lg`}><Plus className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {(products[selectedCategory] || []).length === 0 && <p className="text-slate-400 text-sm text-center py-4">Bu kategoride ürün yok</p>}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-2">Aradığınız ürün yok mu?</p>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Ürün adı yazın..." value={customProduct} onChange={(e) => setCustomProduct(e.target.value)} className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400" />
                    <button onClick={() => { if (customProduct.trim()) { addCustomToCart(customProduct.trim(), categories.find(c => c.id === selectedCategory)?.name || ''); setCustomProduct(''); } }} disabled={!customProduct.trim()} className={`${colors.bg} ${colors.hoverBg} text-white px-3 py-2 rounded-lg disabled:opacity-50`}><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {/* Cart */}
              <div className="p-4 bg-slate-50">
                <h3 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2"><Package className="w-4 h-4" /> Sepet ({cart.length})</h3>
                {cart.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">Sepetiniz boş</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.productId} className="bg-white p-2 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-slate-700">{item.productName}</p>
                          <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateCartItem(item.productId, 'quantity', item.quantity - 1)} className="w-6 h-6 bg-slate-100 rounded text-slate-600 hover:bg-slate-200">-</button>
                          <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartItem(item.productId, 'quantity', item.quantity + 1)} className="w-6 h-6 bg-slate-100 rounded text-slate-600 hover:bg-slate-200">+</button>
                          <span className="text-xs text-slate-400">{item.unit}</span>
                        </div>
                        <input type="text" placeholder="Not (opsiyonel)" value={item.note} onChange={(e) => updateCartItem(item.productId, 'note', e.target.value)} className="w-full mt-2 px-2 py-1 text-xs border border-slate-200 rounded" />
                      </div>
                    ))}
                  </div>
                )}
                {cart.length > 0 && (
                  <button onClick={submitRequest} disabled={submitting} className={`w-full mt-4 ${colors.bg} ${colors.hoverBg} text-white font-medium py-3 rounded-lg transition disabled:opacity-50`}>
                    {submitting ? 'Gönderiliyor...' : 'Talep Gönder'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Request Management View - Admin module for managing requests, categories, and products
const RequestManagementView = ({ authToken }) => {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme.appColor);
  const [activeTab, setActiveTab] = useState('requests'); // requests, categories, products
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState(null);
  
  // Modals
  const [categoryModal, setCategoryModal] = useState({ show: false, category: null });
  const [productModal, setProductModal] = useState({ show: false, product: null });
  const [requestModal, setRequestModal] = useState({ show: false, request: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null, id: null });

  // Socket.io connection for real-time notifications
  useEffect(() => {
    const socket = createSocket('http://localhost:4000');
    socket.emit('requests:join');

    socket.on('requests:new', (newRequest) => {
      // Add new request to the list if on 'all' or 'pending' filter
      if (statusFilter === 'all' || statusFilter === 'pending') {
        setRequests(prev => [newRequest, ...prev]);
      }
      // Show notification
      setNotification({ message: `Yeni talep: ${newRequest.personnelName} ${newRequest.personnelSurname}`, type: 'info' });
      setTimeout(() => setNotification(null), 5000);
    });

    return () => {
      socket.emit('requests:leave');
      socket.disconnect();
    };
  }, [statusFilter]);

  const statusLabels = {
    pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Onaylandı', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-800' },
    partial: { label: 'Kısmi Onay', color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Tamamlandı', color: 'bg-slate-100 text-slate-800' },
  };

  const fetchRequests = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const url = statusFilter === 'all' ? 'http://localhost:4000/api/requests' : `http://localhost:4000/api/requests?status=${statusFilter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${authToken}` } });
      if (res.ok) setRequests(await res.json());
    } catch (err) { console.error('Fetch requests error:', err); }
    setLoading(false);
  };

  const fetchCategories = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('http://localhost:4000/api/requests/categories/all', { headers: { Authorization: `Bearer ${authToken}` } });
      if (res.ok) setCategories(await res.json());
    } catch (err) { console.error('Fetch categories error:', err); }
  };

  const fetchProducts = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('http://localhost:4000/api/requests/products/all', { headers: { Authorization: `Bearer ${authToken}` } });
      if (res.ok) setProducts(await res.json());
    } catch (err) { console.error('Fetch products error:', err); }
  };

  useEffect(() => { fetchRequests(); }, [authToken, statusFilter]);
  useEffect(() => { fetchCategories(); fetchProducts(); }, [authToken]);

  const handleSaveCategory = async (data) => {
    try {
      const isEdit = !!data.id;
      const res = await fetch(`http://localhost:4000/api/requests/categories${isEdit ? `/${data.id}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ name: data.name, description: data.description, isActive: data.isActive }),
      });
      if (res.ok) { fetchCategories(); setCategoryModal({ show: false, category: null }); }
    } catch (err) { console.error('Save category error:', err); }
  };

  const handleSaveProduct = async (data) => {
    try {
      const isEdit = !!data.id;
      const res = await fetch(`http://localhost:4000/api/requests/products${isEdit ? `/${data.id}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ categoryId: data.categoryId, name: data.name, description: data.description, unit: data.unit, isActive: data.isActive }),
      });
      if (res.ok) { fetchProducts(); setProductModal({ show: false, product: null }); }
    } catch (err) { console.error('Save product error:', err); }
  };

  const handleUpdateRequestStatus = async (id, status, adminNote) => {
    try {
      const res = await fetch(`http://localhost:4000/api/requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ status, adminNote }),
      });
      if (res.ok) { fetchRequests(); setRequestModal({ show: false, request: null }); }
    } catch (err) { console.error('Update request status error:', err); }
  };

  const handleDelete = async () => {
    const { type, id } = deleteModal;
    try {
      const endpoint = type === 'category' ? 'categories' : type === 'product' ? 'products' : '';
      await fetch(`http://localhost:4000/api/requests/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (type === 'category') fetchCategories();
      if (type === 'product') fetchProducts();
      setDeleteModal({ show: false, type: null, id: null });
    } catch (err) { console.error('Delete error:', err); }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slideIn">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold">Yeni Talep!</p>
            <p className="text-sm text-white/90">{notification.message}</p>
          </div>
          <button onClick={() => setNotification(null)} className="ml-4 text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
      )}

      <header className={`flex items-center justify-between bg-white p-4 shadow-sm rounded-lg border-l-4 ${colors.borderStrong}`}>
        <div>
          <h1 className={`text-2xl font-bold ${theme.appText} flex items-center gap-2`}><ClipboardList className={`w-6 h-6 ${colors.text}`} /> Talep Yönetimi</h1>
          <p className={`text-sm ${theme.appText} opacity-70`}>Personel taleplerini yönetin, kategoriler ve ürünler oluşturun</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex gap-1">
        {[{ id: 'requests', label: 'Talepler', icon: FileText }, { id: 'categories', label: 'Kategoriler', icon: FolderOpen }, { id: 'products', label: 'Ürünler', icon: Package }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${activeTab === tab.id ? `${colors.bg} text-white` : 'text-slate-600 hover:bg-slate-100'}`}>
            <tab.icon className="w-5 h-5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className={`font-bold ${theme.appText}`}>Personel Talepleri</h2>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
              <option value="all">Tümü</option>
              <option value="pending">Beklemede</option>
              <option value="approved">Onaylandı</option>
              <option value="rejected">Reddedildi</option>
              <option value="completed">Tamamlandı</option>
            </select>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Yükleniyor...</div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Henüz talep yok</div>
            ) : requests.map(req => (
              <div key={req.id} className="p-4 hover:bg-slate-50 cursor-pointer" onClick={() => setRequestModal({ show: true, request: req })}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${colors.bgLight} flex items-center justify-center font-bold ${colors.text}`}>
                      {req.personnelName?.charAt(0)}{req.personnelSurname?.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-medium ${theme.appText}`}>{req.personnelName} {req.personnelSurname}</p>
                      <p className="text-xs text-slate-500">ID: {req.personnelId} • {new Date(req.createdAt).toLocaleDateString('tr-TR')}</p>
                      {req.personnelNote && <p className="text-xs text-slate-400 italic mt-0.5">Not: {req.personnelNote}</p>}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[req.status]?.color}`}>{statusLabels[req.status]?.label}</span>
                </div>
                <div className="ml-13 text-sm text-slate-600">
                  {req.items.slice(0, 2).map((item, i) => <span key={i} className="mr-2">{item.quantity} {item.unit} {item.productName}</span>)}
                  {req.items.length > 2 && <span className="text-slate-400">+{req.items.length - 2} daha</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className={`font-bold ${theme.appText}`}>Talep Kategorileri</h2>
            <button onClick={() => setCategoryModal({ show: true, category: null })} className={`${colors.bg} ${colors.hoverBg} text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2`}><Plus className="w-4 h-4" /> Yeni Kategori</button>
          </div>
          <div className="divide-y divide-slate-100">
            {categories.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Henüz kategori yok</div>
            ) : categories.map(cat => (
              <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${cat.isActive ? colors.bgLight : 'bg-slate-100'} flex items-center justify-center`}>
                    <FolderOpen className={`w-5 h-5 ${cat.isActive ? colors.text : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${theme.appText} ${!cat.isActive && 'opacity-50'}`}>{cat.name}</p>
                    {cat.description && <p className="text-xs text-slate-500">{cat.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!cat.isActive && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Pasif</span>}
                  <button onClick={() => setCategoryModal({ show: true, category: cat })} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteModal({ show: true, type: 'category', id: cat.id })} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className={`font-bold ${theme.appText}`}>Talep Edilebilir Ürünler</h2>
            <button onClick={() => setProductModal({ show: true, product: null })} className={`${colors.bg} ${colors.hoverBg} text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2`} disabled={categories.length === 0}><Plus className="w-4 h-4" /> Yeni Ürün</button>
          </div>
          {categories.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Önce kategori oluşturun</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Henüz ürün yok</div>
              ) : products.map(prod => (
                <div key={prod.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${prod.isActive ? colors.bgLight : 'bg-slate-100'} flex items-center justify-center`}>
                      <Package className={`w-5 h-5 ${prod.isActive ? colors.text : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${theme.appText} ${!prod.isActive && 'opacity-50'}`}>{prod.name}</p>
                      <p className="text-xs text-slate-500">{prod.categoryName} • Birim: {prod.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!prod.isActive && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Pasif</span>}
                    <button onClick={() => setProductModal({ show: true, product: prod })} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteModal({ show: true, type: 'product', id: prod.id })} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Modal */}
      {categoryModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className={`font-bold ${theme.appText}`}>{categoryModal.category ? 'Kategori Düzenle' : 'Yeni Kategori'}</h3>
              <button onClick={() => setCategoryModal({ show: false, category: null })} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); handleSaveCategory({ id: categoryModal.category?.id, name: fd.get('name'), description: fd.get('description'), isActive: fd.get('isActive') === 'on' }); }} className="p-4 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Kategori Adı</label><input name="name" defaultValue={categoryModal.category?.name || ''} required className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Örn: Kırtasiye" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label><input name="description" defaultValue={categoryModal.category?.description || ''} className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Opsiyonel" /></div>
              <label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={categoryModal.category?.isActive !== false} className="w-4 h-4" /> <span className="text-sm text-slate-700">Aktif</span></label>
              <button type="submit" className={`w-full ${colors.bg} ${colors.hoverBg} text-white py-3 rounded-lg font-medium`}>Kaydet</button>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {productModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className={`font-bold ${theme.appText}`}>{productModal.product ? 'Ürün Düzenle' : 'Yeni Ürün'}</h3>
              <button onClick={() => setProductModal({ show: false, product: null })} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); handleSaveProduct({ id: productModal.product?.id, categoryId: fd.get('categoryId'), name: fd.get('name'), description: fd.get('description'), unit: fd.get('unit'), isActive: fd.get('isActive') === 'on' }); }} className="p-4 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label><select name="categoryId" defaultValue={productModal.product?.categoryId || ''} required className="w-full p-3 border border-slate-300 rounded-lg">{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Ürün Adı</label><input name="name" defaultValue={productModal.product?.name || ''} required className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Örn: A4 Kağıdı" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Birim</label><input name="unit" defaultValue={productModal.product?.unit || 'Adet'} className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Adet, Paket, Kutu..." /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label><input name="description" defaultValue={productModal.product?.description || ''} className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Opsiyonel" /></div>
              <label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={productModal.product?.isActive !== false} className="w-4 h-4" /> <span className="text-sm text-slate-700">Aktif</span></label>
              <button type="submit" className={`w-full ${colors.bg} ${colors.hoverBg} text-white py-3 rounded-lg font-medium`}>Kaydet</button>
            </form>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {requestModal.show && requestModal.request && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className={`font-bold ${theme.appText}`}>Talep Detayı</h3>
              <button onClick={() => setRequestModal({ show: false, request: null })} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className={`w-12 h-12 rounded-full ${colors.bgLight} flex items-center justify-center font-bold ${colors.text} text-lg`}>{requestModal.request.personnelName?.charAt(0)}{requestModal.request.personnelSurname?.charAt(0)}</div>
                <div>
                  <p className={`font-bold ${theme.appText}`}>{requestModal.request.personnelName} {requestModal.request.personnelSurname}</p>
                  <p className="text-sm text-slate-500">ID: {requestModal.request.personnelId}</p>
                  {requestModal.request.personnelNote && <p className="text-sm text-slate-500 italic">{requestModal.request.personnelNote}</p>}
                  <p className="text-xs text-slate-400">{new Date(requestModal.request.createdAt).toLocaleString('tr-TR')}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Talep Edilen Ürünler</h4>
                <div className="space-y-2">
                  {requestModal.request.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                      <div><p className="font-medium text-slate-800">{item.productName}</p><p className="text-xs text-slate-500">{item.categoryName}</p></div>
                      <div className="text-right"><p className="font-bold text-slate-800">{item.quantity} {item.unit}</p>{item.note && <p className="text-xs text-slate-500">{item.note}</p>}</div>
                    </div>
                  ))}
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); handleUpdateRequestStatus(requestModal.request.id, fd.get('status'), fd.get('adminNote')); }} className="space-y-4 pt-4 border-t border-slate-100">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Durum</label><select name="status" defaultValue={requestModal.request.status} className="w-full p-3 border border-slate-300 rounded-lg"><option value="pending">Beklemede</option><option value="approved">Onayla</option><option value="rejected">Reddet</option><option value="partial">Kısmi Onay</option><option value="completed">Tamamlandı</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Not (Opsiyonel)</label><textarea name="adminNote" defaultValue={requestModal.request.adminNote || ''} className="w-full p-3 border border-slate-300 rounded-lg" rows={2} placeholder="Personele not bırakın..." /></div>
                <button type="submit" className={`w-full ${colors.bg} ${colors.hoverBg} text-white py-3 rounded-lg font-medium`}>Güncelle</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal isOpen={deleteModal.show} onClose={() => setDeleteModal({ show: false, type: null, id: null })} onConfirm={handleDelete} title={deleteModal.type === 'category' ? 'Kategori Sil' : 'Ürün Sil'} message={deleteModal.type === 'category' ? 'Bu kategoriyi ve içindeki tüm ürünleri silmek istediğinize emin misiniz?' : 'Bu ürünü silmek istediğinize emin misiniz?'} type="danger" />
    </div>
  );
};

const SettingsView = ({ authToken }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const colors = getThemeColors(theme.appColor);
  const [activePicker, setActivePicker] = useState(null);
  const [companyLogin, setCompanyLogin] = useState({ email: '', password: '', hasPassword: false });
  const [companyLoginStatus, setCompanyLoginStatus] = useState({ loading: false, message: '', error: false });

  useEffect(() => {
    const fetchCompanyLogin = async () => {
      if (!authToken) return;
      try {
        const res = await fetch('http://localhost:4000/api/settings/company-login', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCompanyLogin({ email: data.email || '', password: '', hasPassword: data.hasPassword });
        }
      } catch (err) {
        console.error('Company login fetch error:', err);
      }
    };
    fetchCompanyLogin();
  }, [authToken]);

  const handleSaveCompanyLogin = async () => {
    if (!companyLogin.email) {
      setCompanyLoginStatus({ loading: false, message: 'E-posta adresi gerekli.', error: true });
      return;
    }
    // İlk kayıtta şifre zorunlu
    if (!companyLogin.hasPassword && !companyLogin.password) {
      setCompanyLoginStatus({ loading: false, message: 'Şifre belirlemeniz gerekli.', error: true });
      return;
    }
    setCompanyLoginStatus({ loading: true, message: '', error: false });
    try {
      const bodyData = { email: companyLogin.email };
      if (companyLogin.password) {
        bodyData.password = companyLogin.password;
      }
      const res = await fetch('http://localhost:4000/api/settings/company-login', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(bodyData),
      });
      if (res.ok) {
        setCompanyLoginStatus({ loading: false, message: 'Şirket giriş bilgileri kaydedildi.', error: false });
        setCompanyLogin(prev => ({ ...prev, password: '', hasPassword: true }));
      } else {
        const data = await res.json();
        setCompanyLoginStatus({ loading: false, message: data.message || 'Kaydetme hatası.', error: true });
      }
    } catch (err) {
      setCompanyLoginStatus({ loading: false, message: 'Sunucuya bağlanılamadı.', error: true });
    }
  };

  const appColors = [ { id: 'indigo', hex: 'bg-indigo-600' }, { id: 'blue', hex: 'bg-blue-600' }, { id: 'red', hex: 'bg-red-600' }, { id: 'green', hex: 'bg-green-600' }, { id: 'purple', hex: 'bg-purple-600' }, { id: 'orange', hex: 'bg-orange-600' }, { id: 'teal', hex: 'bg-teal-600' }, { id: 'cyan', hex: 'bg-cyan-600' }, { id: 'rose', hex: 'bg-rose-600' }, { id: 'amber', hex: 'bg-amber-600' } ];
  const bgColors = [ { id: 'bg-slate-900', label: 'Slate 900' }, { id: 'bg-gray-900', label: 'Gray 900' }, { id: 'bg-zinc-900', label: 'Zinc 900' }, { id: 'bg-neutral-900', label: 'Neutral 900' }, { id: 'bg-stone-900', label: 'Stone 900' }, { id: 'bg-red-900', label: 'Red 900' }, { id: 'bg-blue-900', label: 'Blue 900' }, { id: 'bg-indigo-900', label: 'Indigo 900' }, { id: 'bg-violet-900', label: 'Violet 900' }, { id: 'bg-white', label: 'White' }, { id: 'bg-slate-100', label: 'Slate 100' } ];
  const textColors = [ { id: 'text-slate-800', label: 'Koyu Slate' }, { id: 'text-gray-800', label: 'Koyu Gri' }, { id: 'text-zinc-800', label: 'Koyu Zinc' }, { id: 'text-black', label: 'Siyah' }, { id: 'text-blue-900', label: 'Koyu Mavi' }, { id: 'text-slate-600', label: 'Orta Slate' }, { id: 'text-slate-300', label: 'Açık Slate' }, { id: 'text-white', label: 'Beyaz' }, { id: 'text-indigo-200', label: 'Açık İndigo' } ];

  const renderColorPicker = (type, options) => {
    if (activePicker !== type) return null;
    return (
      <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-slate-200 z-50 w-64 grid grid-cols-4 gap-2 animate-fadeIn">
        {options.map((opt) => {
          let previewClass = opt.id;
          if (type === 'app') previewClass = opt.hex;
          else if (type.toLowerCase().includes('text')) previewClass = opt.id.replace('text-', 'bg-');
          else previewClass = opt.id;
          return (
            <button key={opt.id} onClick={() => { setTheme({ ...theme, [type === 'app' ? 'appColor' : type]: opt.id }); setActivePicker(null); }} className={`w-10 h-10 rounded-lg shadow-sm border border-slate-200 hover:scale-110 transition relative ${previewClass}`} title={opt.label || opt.id}>
              {(type === 'app' ? theme.appColor === opt.id : theme[type] === opt.id) && <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md"><Check className="w-5 h-5"/></div>}
            </button>
          )
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full max-w-4xl mx-auto">
      <header className={`flex items-center justify-between bg-white p-4 shadow-sm rounded-lg border-l-4 ${colors.borderStrong} w-full`}><div><h1 className={`text-2xl font-bold ${theme.appText} flex items-center gap-2`}><Settings className={`w-6 h-6 ${colors.text}`} /> Görünüm Ayarları</h1><p className={`text-sm ${theme.appText} opacity-70`}>Uygulama görünümü ve genel yapılandırmalar</p></div></header>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="divide-y divide-slate-100">
          <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition relative"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center text-white shadow-md`}><Palette className="w-6 h-6" /></div><div><h3 className={`font-bold ${theme.appText}`}>Uygulama Vurgu Rengi</h3><p className={`text-sm ${theme.appText} opacity-60`}>Butonlar, ikonlar ve aktif öğeler için ana renk.</p></div></div><div className="relative"><button onClick={() => setActivePicker(activePicker === 'app' ? null : 'app')} className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition shadow-sm font-medium ${theme.appText}`}><div className={`w-4 h-4 rounded-full ${colors.bg}`}></div>Renk Değiştir</button>{renderColorPicker('app', appColors)}</div></div>
          <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition relative"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shadow-md"><AlignLeft className="w-6 h-6" /></div><div><h3 className={`font-bold ${theme.appText}`}>Uygulama Yazı Rengi</h3><p className={`text-sm ${theme.appText} opacity-60`}>Genel içerik ve başlıkların yazı rengi.</p></div></div><div className="relative"><button onClick={() => setActivePicker(activePicker === 'appText' ? null : 'appText')} className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition shadow-sm font-medium ${theme.appText}`}><div className={`w-4 h-4 rounded-full border ${theme.appText.replace('text-', 'bg-')}`}></div>Renk Değiştir</button>{renderColorPicker('appText', textColors.filter(c => !c.id.includes('white')))}</div></div>
          <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition relative"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-full ${theme.menuBg} flex items-center justify-center ${theme.menuText} shadow-md border border-slate-200`}><LayoutDashboard className="w-6 h-6" /></div><div><h3 className={`font-bold ${theme.appText}`}>Menü Arkaplan Rengi</h3><p className={`text-sm ${theme.appText} opacity-60`}>Sol taraftaki menünün zemin rengi.</p></div></div><div className="relative"><button onClick={() => setActivePicker(activePicker === 'menuBg' ? null : 'menuBg')} className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition shadow-sm font-medium ${theme.appText}`}><div className={`w-4 h-4 rounded-full border ${theme.menuBg}`}></div>Renk Değiştir</button>{renderColorPicker('menuBg', bgColors)}</div></div>
          <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition relative"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-full ${theme.menuBg} flex items-center justify-center shadow-md border border-slate-200`}><span className={`font-bold ${theme.menuText}`}>Aa</span></div><div><h3 className={`font-bold ${theme.appText}`}>Menü Yazı Rengi</h3><p className={`text-sm ${theme.appText} opacity-60`}>Sol menüdeki link ve ikonların rengi.</p></div></div><div className="relative"><button onClick={() => setActivePicker(activePicker === 'menuText' ? null : 'menuText')} className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition shadow-sm font-medium ${theme.appText}`}><div className={`w-4 h-4 rounded-full border ${theme.menuText.replace('text-', 'bg-')}`}></div>Renk Değiştir</button>{renderColorPicker('menuText', textColors)}</div></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <h2 className={`text-lg font-bold ${theme.appText} flex items-center gap-2`}><Key className="w-5 h-5" /> Şirket Giriş Ayarları</h2>
          <p className={`text-sm ${theme.appText} opacity-60 mt-1`}>Personellerin ID ile talep oluşturabilmesi için ortak giriş bilgileri</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium ${theme.appText} mb-1`}>Şirket E-posta</label>
            <input type="email" value={companyLogin.email} onChange={(e) => setCompanyLogin(prev => ({ ...prev, email: e.target.value }))} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="ornek@sirket.com" />
          </div>
          <div>
            <label className={`block text-sm font-medium ${theme.appText} mb-1`}>Şifre {companyLogin.hasPassword && <span className="text-green-600 text-xs">(Mevcut şifre var)</span>}</label>
            <input type="password" value={companyLogin.password} onChange={(e) => setCompanyLogin(prev => ({ ...prev, password: e.target.value }))} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder={companyLogin.hasPassword ? "Değiştirmek için yeni şifre girin" : "Şifre belirleyin"} />
          </div>
          {companyLoginStatus.message && (
            <div className={`text-sm p-3 rounded-lg ${companyLoginStatus.error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{companyLoginStatus.message}</div>
          )}
          <button onClick={handleSaveCompanyLogin} disabled={companyLoginStatus.loading} className={`${colors.bg} ${colors.hoverBg} text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50`}>
            {companyLoginStatus.loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserManagementView = ({ users, setUsers, authToken }) => {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme.appColor);
  const [newUser, setNewUser] = useState({ personnelId: '', name: '', surname: '', email: '', password: '', permissions: [] });
  const [editModal, setEditModal] = useState({ show: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const availablePermissions = [ 
    { id: 'home', label: 'Ana Sayfa' }, 
    { id: 'agenda', label: 'Ajanda' }, 
    { id: 'work_tracking', label: 'Kanban' }, 
    { id: 'task_management', label: 'Görev Yönetimi' },
    { id: 'messages', label: 'Mesajlar' }, 
    { id: 'raw_materials', label: 'Ham Maddeler' }, 
    { id: 'products', label: 'Ürünler' }, 
    { id: 'costs', label: 'Maliyetler' }, 
    { id: 'staff', label: 'Personeller' },
    { id: 'timekeeping', label: 'Puantaj' },
    { id: 'admin_panel', label: 'Kullanıcı Yönetimi' },
    { id: 'request_management', label: 'Talep Yönetimi' },
    { id: 'settings', label: 'Ayarlar' } 
  ];

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.name || !newUser.surname) { setError("Tüm alanlar zorunludur."); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(newUser),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'Kullanıcı eklenemedi.');
        return;
      }
      setUsers([...users, data]);
      setNewUser({ personnelId: '', name: '', surname: '', email: '', password: '', permissions: [] });
    } catch (err) {
      console.error('Kullanıcı ekleme hatası:', err);
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditModal({ show: true, user: { ...user } });
  };

  const handleUpdateUser = async () => {
    if (!editModal.user) return;
    try {
      const res = await fetch(`http://localhost:4000/api/users/${editModal.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ permissions: editModal.user.permissions, personnelId: editModal.user.personnelId }),
      });
      if (!res.ok) {
        console.error('Kullanıcı güncellenemedi');
        return;
      }
      const updated = await res.json();
      setUsers(users.map(u => u.id === updated.id ? updated : u));
      setEditModal({ show: false, user: null });
    } catch (err) {
      console.error('Kullanıcı güncelleme hatası:', err);
    }
  };

  const toggleEditPermission = (permId) => {
    setEditModal(prev => {
      const perms = prev.user.permissions.includes(permId) 
        ? prev.user.permissions.filter(p => p !== permId) 
        : [...prev.user.permissions, permId];
      return { ...prev, user: { ...prev.user, permissions: perms } };
    });
  };

  const requestDelete = (id) => setDeleteModal({ show: true, id });
  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`http://localhost:4000/api/users/${deleteModal.id}`, {
        method: 'DELETE',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      if (!res.ok && res.status !== 204) {
        console.error('Kullanıcı silinemedi');
      }
      setUsers(users.filter(u => u.id !== deleteModal.id));
    } catch (err) {
      console.error('Kullanıcı silme hatası:', err);
    } finally {
      setDeleteModal({ show: false, id: null });
    }
  };
  const togglePermission = (permId) => { setNewUser(prev => { const perms = prev.permissions.includes(permId) ? prev.permissions.filter(p => p !== permId) : [...prev.permissions, permId]; return { ...prev, permissions: perms }; }); };

  return (
    <div className="space-y-6 animate-fadeIn w-full">
      <header className={`flex items-center justify-between bg-white p-4 shadow-sm rounded-lg border-l-4 ${colors.borderStrong} w-full`}><div><h1 className={`text-2xl font-bold ${theme.appText} flex items-center gap-2`}><Users className={`w-6 h-6 ${colors.text}`} /> Kullanıcı & Yetki Yönetimi</h1><p className={`text-sm ${theme.appText} opacity-70`}>Sisteme erişebilecek personelleri tanımlayın</p></div></header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h3 className={`font-bold ${theme.appText} mb-4 flex items-center gap-2`}><Plus className="w-5 h-5" /> Yeni Kullanıcı Ekle</h3>
          <div className="space-y-4">
            <div><label className={`block text-xs font-bold ${theme.appText} opacity-70 mb-1`}>Personel ID</label><input type="text" value={newUser.personnelId} onChange={(e) => setNewUser({...newUser, personnelId: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500" placeholder="Örn: P001" /></div>
            <div className="grid grid-cols-2 gap-2"><div><label className={`block text-xs font-bold ${theme.appText} opacity-70 mb-1`}>İsim</label><input type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500" /></div><div><label className={`block text-xs font-bold ${theme.appText} opacity-70 mb-1`}>Soyisim</label><input type="text" value={newUser.surname} onChange={(e) => setNewUser({...newUser, surname: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500" /></div></div>
            <div><label className={`block text-xs font-bold ${theme.appText} opacity-70 mb-1`}>E-posta</label><input type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500" /></div>
            <div><label className={`block text-xs font-bold ${theme.appText} opacity-70 mb-1`}>Şifre</label><input type="text" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500" /></div>
            {error && <div className="text-red-500 text-xs">{error}</div>}
            <div><label className={`block text-xs font-bold ${theme.appText} opacity-70 mb-2`}>Yetkiler</label><div className="space-y-2 max-h-48 overflow-y-auto">{availablePermissions.map(perm => (<label key={perm.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100 transition"><div className={`w-5 h-5 rounded border flex items-center justify-center ${newUser.permissions.includes(perm.id) ? `${colors.bg} ${colors.borderStrong} text-white` : 'border-slate-300'}`}>{newUser.permissions.includes(perm.id) && <CheckSquare className="w-3.5 h-3.5" />}</div><input type="checkbox" className="hidden" checked={newUser.permissions.includes(perm.id)} onChange={() => togglePermission(perm.id)} /><span className={`text-sm ${theme.appText}`}>{perm.label}</span></label>))}</div></div>
            <button onClick={handleAddUser} className={`w-full ${colors.bg} ${colors.hoverBg} text-white py-2 rounded-lg font-medium transition`}>Kaydet</button>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left"><thead className="bg-slate-100 font-semibold"><tr><th className={`px-6 py-3 ${theme.appText}`}>ID</th><th className={`px-6 py-3 ${theme.appText}`}>Kullanıcı</th><th className={`px-6 py-3 ${theme.appText}`}>Yetkiler</th><th className={`px-6 py-3 ${theme.appText} text-right`}>İşlem</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map(user => (<tr key={user.id} className="hover:bg-slate-50"><td className="px-6 py-4"><span className={`font-mono font-bold ${colors.text}`}>{user.personnelId || '-'}</span></td><td className="px-6 py-4"><div className={`font-bold ${theme.appText} flex items-center gap-2`}><User className="w-4 h-4 opacity-50"/> {user.name} {user.surname}</div><div className={`text-xs ${theme.appText} opacity-60 mt-1`}>{user.email}</div>{user.id === 1 && <span className={`inline-block mt-1 px-2 py-0.5 ${colors.bgLight} ${colors.text} text-[10px] rounded font-bold uppercase`}>Süper Admin</span>}</td><td className="px-6 py-4"><div className="flex flex-wrap gap-1">{user.permissions.map(p => <span key={p} className={`px-2 py-1 bg-slate-100 ${theme.appText} opacity-80 text-xs rounded border border-slate-200`}>{availablePermissions.find(ap=>ap.id===p)?.label||p}</span>)}</div></td><td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => openEditModal(user)} className={`${colors.text} hover:opacity-70 p-2 hover:bg-slate-100 rounded-full transition`} title="Düzenle"><Edit2 className="w-4 h-4" /></button>{user.id !== 1 && (<button onClick={() => requestDelete(user.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"><Trash2 className="w-4 h-4" /></button>)}</div></td></tr>))}</tbody></table>
        </div>
      </div>
      <ConfirmationModal isOpen={deleteModal.show} onClose={() => setDeleteModal({show: false})} onConfirm={confirmDelete} title="Kullanıcı Sil" message="Bu kullanıcıyı silmek istediğinize emin misiniz?" />
      
      {editModal.show && editModal.user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className={`font-bold ${theme.appText}`}>Kullanıcı Yetkilerini Düzenle</h3>
              <button onClick={() => setEditModal({ show: false, user: null })} className="text-gray-500 hover:text-red-500"><X /></button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className={`font-bold ${theme.appText}`}>{editModal.user.name} {editModal.user.surname}</div>
                <div className={`text-sm ${theme.appText} opacity-60`}>{editModal.user.email}</div>
              </div>
              <div className="mb-4">
                <label className={`block text-xs font-bold ${theme.appText} opacity-70 mb-1`}>Personel ID</label>
                <input type="text" value={editModal.user.personnelId || ''} onChange={(e) => setEditModal(prev => ({ ...prev, user: { ...prev.user, personnelId: e.target.value } }))} className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500" placeholder="Örn: P001" />
              </div>
              <div>
                <label className={`block text-xs font-bold ${theme.appText} opacity-70 mb-2`}>Yetkiler</label>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availablePermissions.map(perm => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100 transition">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${editModal.user.permissions.includes(perm.id) ? `${colors.bg} ${colors.borderStrong} text-white` : 'border-slate-300'}`}>
                        {editModal.user.permissions.includes(perm.id) && <CheckSquare className="w-3.5 h-3.5" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={editModal.user.permissions.includes(perm.id)} onChange={() => toggleEditPermission(perm.id)} />
                      <span className={`text-sm ${theme.appText}`}>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setEditModal({ show: false, user: null })} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">İptal</button>
              <button onClick={handleUpdateUser} className={`px-4 py-2 ${colors.bg} ${colors.hoverBg} text-white rounded-lg transition`}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- YENİ BİLEŞENLER: PERSONEL VE PUANTAJ ---
const StaffView = ({ staffList, setStaffList, authToken }) => {
    const { theme } = useContext(ThemeContext);
    const colors = getThemeColors(theme.appColor);
    
    const [showModal, setShowModal] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', surname: '', birthDate: '', tcNo: '', startDate: '', manager: '', salary: '', status: 'active' });
    const [editingStaff, setEditingStaff] = useState(null);
    const [detailStaff, setDetailStaff] = useState(null);

    const resetForm = () => {
        setNewStaff({ name: '', surname: '', birthDate: '', tcNo: '', startDate: '', manager: '', salary: '', status: 'active' });
        setEditingStaff(null);
    };

    const handleSaveStaff = async () => {
        if (!newStaff.name || !newStaff.surname || !newStaff.tcNo) return alert("İsim, Soyisim ve TC Kimlik No zorunludur.");

        const payload = {
            ...newStaff,
            salary: newStaff.salary ? parseFloat(newStaff.salary) : 0,
        };

        try {
            if (editingStaff) {
                const res = await fetch(`http://localhost:4000/api/staff/${editingStaff.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                    },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    console.error('Personel güncellenemedi');
                    return;
                }
                const updated = await res.json();
                setStaffList(staffList.map(s => s.id === editingStaff.id ? updated : s));
            } else {
                const res = await fetch('http://localhost:4000/api/staff', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                    },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    console.error('Personel oluşturulamadı');
                    return;
                }
                const created = await res.json();
                setStaffList([...staffList, created]);
            }

            resetForm();
            setShowModal(false);
        } catch (err) {
            console.error('Personel kaydedilirken hata oluştu:', err);
        }
    };

    const handleEditClick = (staff) => {
        setNewStaff({
            name: staff.name || '',
            surname: staff.surname || '',
            birthDate: staff.birthDate || '',
            tcNo: staff.tcNo || '',
            startDate: staff.startDate || '',
            manager: staff.manager || '',
            salary: staff.salary != null ? staff.salary : '',
            status: staff.status || 'active',
        });
        setEditingStaff(staff);
        setShowModal(true);
    };

    const handleDeleteStaff = async (staff) => {
        if (!window.confirm(`"${staff.name} ${staff.surname}" isimli personeli silmek istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch(`http://localhost:4000/api/staff/${staff.id}`, {
                method: 'DELETE',
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            });
            if (!res.ok && res.status !== 404) {
                console.error('Personel silinemedi');
                return;
            }
            setStaffList(staffList.filter(s => s.id !== staff.id));
        } catch (err) {
            console.error('Personel silinirken hata oluştu:', err);
        }
    };

    const handlePrintStaffSummary = () => {
        if (!staffList || staffList.length === 0) {
            window.alert('Yazdırılacak personel bulunamadı.');
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const today = new Date();
        const formattedDate = today.toLocaleString('tr-TR');

        const rowsHtml = staffList.map((s, index) => {
            const startDate = s.startDate ? new Date(s.startDate).toLocaleDateString('tr-TR') : '-';
            const birthDate = s.birthDate ? new Date(s.birthDate).toLocaleDateString('tr-TR') : '-';
            const salary = s.salary ? `${parseFloat(s.salary).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺` : '-';
            const statusText = s.status === 'active' ? 'Çalışıyor' : s.status === 'leave' ? 'İzinli' : 'Ayrıldı';

            return `
              <tr>
                <td>${index + 1}</td>
                <td>${s.name || ''} ${s.surname || ''}</td>
                <td>${s.tcNo || ''}</td>
                <td>${birthDate}</td>
                <td>${startDate}</td>
                <td>${s.manager || ''}</td>
                <td>${salary}</td>
                <td>${statusText}</td>
              </tr>
            `;
        }).join('');

        const html = `
          <html lang="tr">
            <head>
              <meta charSet="utf-8" />
              <title>Personel Özeti</title>
              <style>
                body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 24px; color: #0f172a; }
                h1 { font-size: 20px; margin-bottom: 4px; }
                h2 { font-size: 14px; margin: 0; color: #64748b; }
                table { border-collapse: collapse; width: 100%; margin-top: 16px; font-size: 12px; }
                th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
                th { background: #f3f4f6; font-weight: 600; }
                tr:nth-child(even) { background: #f9fafb; }
                .meta { font-size: 11px; color: #6b7280; margin-top: 4px; }
              </style>
            </head>
            <body>
              <h1>Personel Özeti</h1>
              <div class="meta">Oluşturulma tarihi: ${formattedDate}</div>
              <div class="meta">Toplam personel sayısı: ${staffList.length}</div>

              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ad Soyad</th>
                    <th>TC Kimlik No</th>
                    <th>Doğum Tarihi</th>
                    <th>İşe Başlangıç</th>
                    <th>Yönetici</th>
                    <th>Maaş</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
            </body>
          </html>
        `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const openDetailModal = (staff) => {
        setDetailStaff(staff);
    };

    const closeDetailModal = () => {
        setDetailStaff(null);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className={`${colors.bgLight} p-4 border-b ${colors.border} flex justify-between items-center`}>
                            <h3 className={`font-bold ${theme.appText} flex items-center gap-2`}><UserPlus className="w-5 h-5" /> {editingStaff ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}</h3>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className={`${colors.text} hover:opacity-70`}><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="block text-xs font-bold text-slate-700 mb-1">İsim</label><input type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full p-2 border border-slate-300 rounded" /></div>
                                <div><label className="block text-xs font-bold text-slate-700 mb-1">Soyisim</label><input type="text" value={newStaff.surname} onChange={e => setNewStaff({...newStaff, surname: e.target.value})} className="w-full p-2 border border-slate-300 rounded" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="block text-xs font-bold text-slate-700 mb-1">TC Kimlik No</label><input type="text" maxLength="11" value={newStaff.tcNo} onChange={e => setNewStaff({...newStaff, tcNo: e.target.value})} className="w-full p-2 border border-slate-300 rounded" /></div>
                                <div><label className="block text-xs font-bold text-slate-700 mb-1">Maaş (TL)</label><input type="number" value={newStaff.salary} onChange={e => setNewStaff({...newStaff, salary: e.target.value})} className="w-full p-2 border border-slate-300 rounded" placeholder="0.00" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="block text-xs font-bold text-slate-700 mb-1">Doğum Tarihi</label><input type="date" value={newStaff.birthDate} onChange={e => setNewStaff({...newStaff, birthDate: e.target.value})} className="w-full p-2 border border-slate-300 rounded" /></div>
                                <div><label className="block text-xs font-bold text-slate-700 mb-1">İşe Başlangıç</label><input type="date" value={newStaff.startDate} onChange={e => setNewStaff({...newStaff, startDate: e.target.value})} className="w-full p-2 border border-slate-300 rounded" /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Bağlı Olduğu Yönetici</label>
                                <select value={newStaff.manager} onChange={e => setNewStaff({...newStaff, manager: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white">
                                    <option value="">Seçiniz</option>
                                    {staffList.map(s => (
                                        <option key={s.id} value={`${s.name} ${s.surname}`}>{s.name} {s.surname}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Durum</label>
                                <select value={newStaff.status} onChange={e => setNewStaff({...newStaff, status: e.target.value})} className="w-full p-2 border border-slate-300 rounded bg-white">
                                    <option value="active">Çalışıyor</option>
                                    <option value="leave">İzinli</option>
                                    <option value="quit">Ayrıldı</option>
                                </select>
                            </div>
                            <button onClick={handleSaveStaff} className={`w-full ${colors.bg} ${colors.hoverBg} text-white py-2 rounded font-bold mt-2`}>{editingStaff ? 'Güncelle' : 'Kaydet'}</button>
                        </div>
                    </div>
                </div>
            )}

            {detailStaff && (
                <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className={`${colors.bgLight} p-4 border-b ${colors.border} flex justify-between items-center`}>
                            <h3 className={`font-bold ${theme.appText} flex items-center gap-2`}>
                                <User className="w-5 h-5" /> Personel Detayı
                            </h3>
                            <button onClick={closeDetailModal} className={`${colors.text} hover:opacity-70`}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 text-sm text-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                    {detailStaff.name?.[0]}{detailStaff.surname?.[0]}
                                </div>
                                <div>
                                    <div className="text-base font-semibold text-slate-900">
                                        {detailStaff.name} {detailStaff.surname}
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <UserCog className="w-3 h-3" />
                                        {detailStaff.manager || 'Yönetici belirtilmemiş'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <div>
                                    <div className="text-[11px] text-slate-400 uppercase font-semibold">TC Kimlik No</div>
                                    <div className="font-mono text-slate-800">{detailStaff.tcNo || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Durum</div>
                                    <div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${detailStaff.status === 'active' ? 'bg-green-100 text-green-700' : detailStaff.status === 'leave' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                            {detailStaff.status === 'active' ? 'Çalışıyor' : detailStaff.status === 'leave' ? 'İzinli' : 'Ayrıldı'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Doğum Tarihi</div>
                                    <div className="flex items-center gap-1 text-slate-800">
                                        <CalendarDays className="w-3 h-3 text-slate-400" />
                                        {detailStaff.birthDate ? new Date(detailStaff.birthDate).toLocaleDateString('tr-TR') : '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-slate-400 uppercase font-semibold">İşe Başlangıç</div>
                                    <div className="flex items-center gap-1 text-slate-800">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        {detailStaff.startDate ? new Date(detailStaff.startDate).toLocaleDateString('tr-TR') : '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Maaş</div>
                                    <div className="font-mono text-slate-800">
                                        {detailStaff.salary ? `${parseFloat(detailStaff.salary).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺` : '-'}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={closeDetailModal}
                                    className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                                >
                                    Kapat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <header className={`flex items-center justify-between bg-white p-4 shadow-sm rounded-lg border-l-4 ${colors.borderStrong} w-full`}>
                <div>
                    <h1 className={`text-2xl font-bold ${theme.appText} flex items-center gap-2`}><User className={`w-6 h-6 ${colors.text}`} /> Personeller</h1>
                    <p className={`text-sm ${theme.appText} opacity-60`}>Personel listesi ve detayları</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrintStaffSummary}
                        className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition flex items-center gap-1"
                    >
                        <FileText className="w-4 h-4" />
                        <span>PDF Çıktısı</span>
                    </button>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className={`${colors.bg} ${colors.hoverBg} text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-sm`}><Plus className="w-5 h-5" /> Yeni Personel</button>
                </div>
            </header>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 font-semibold text-slate-600">
                            <tr>
                                <th className="px-6 py-3">Ad Soyad</th>
                                <th className="px-6 py-3">TC No</th>
                                <th className="px-6 py-3">Yönetici</th>
                                <th className="px-6 py-3">Başlangıç</th>
                                <th className="px-6 py-3">Maaş</th>
                                <th className="px-6 py-3">Durum</th>
                                <th className="px-6 py-3 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {staffList.map(staff => (
                                <tr key={staff.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openDetailModal(staff)}
                                            className="flex items-center gap-2 group/button text-left"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold group-hover/button:bg-slate-300">
                                                {staff.name[0]}{staff.surname[0]}
                                            </div> 
                                            <div>
                                                <div className="group-hover/button:underline">
                                                    {staff.name} {staff.surname}
                                                </div>
                                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                                    <CalendarDays className="w-3 h-3"/> {staff.birthDate ? new Date(staff.birthDate).toLocaleDateString('tr-TR') : '-'}
                                                </div>
                                            </div>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono">{staff.tcNo}</td>
                                    <td className="px-6 py-4 text-slate-600 flex items-center gap-1"><UserCog className="w-4 h-4 opacity-50"/> {staff.manager}</td>
                                    <td className="px-6 py-4 text-slate-500">{staff.startDate ? new Date(staff.startDate).toLocaleDateString('tr-TR') : '-'}</td>
                                    <td className="px-6 py-4 text-slate-600 font-mono font-medium">{staff.salary ? parseFloat(staff.salary).toLocaleString('tr-TR') + ' ₺' : '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${staff.status === 'active' ? 'bg-green-100 text-green-700' : staff.status === 'leave' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                            {staff.status === 'active' ? 'Çalışıyor' : staff.status === 'leave' ? 'İzinli' : 'Ayrıldı'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEditClick(staff)} className="text-slate-400 hover:text-slate-600" title="Düzenle"><MoreVertical className="w-5 h-5" /></button>
                                            <button onClick={() => handleDeleteStaff(staff)} className="text-red-400 hover:text-red-600 text-xs font-medium">Sil</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const TimekeepingView = ({ staffList, authToken }) => {
    const { theme } = useContext(ThemeContext);
    const colors = getThemeColors(theme.appColor);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendance, setAttendance] = useState({});

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);

    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    
    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const getDayKey = (staffId, year, month, day) => `${staffId}-${year}-${month}-${day}`;

    // Belirli bir personel + yıl + ay için attendance bilgisini backend'e upsert et
    const upsertTimeEntry = async (staffId, year, month, updatedAttendance) => {
        const perStaffAttendance = {};
        for (let i = 1; i <= daysInMonth; i++) {
            const k = getDayKey(staffId, year, month, i);
            const v = updatedAttendance[k];
            if (v !== undefined) {
                perStaffAttendance[i] = v;
            }
        }

        try {
            await fetch('http://localhost:4000/api/timeentries', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                },
                body: JSON.stringify({
                    staffId,
                    year,
                    month,
                    attendance: perStaffAttendance,
                }),
            });
        } catch (err) {
            console.error('Puantaj kaydedilirken hata oluştu:', err);
        }
    };

    // Durum Kodları: X (Tam), / (Yarım), R (Rapor), I (İzin), HT (Hafta Tatili - Otomatik), BOŞ (Yok)
    const toggleStatus = (staffId, day) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const key = getDayKey(staffId, year, month, day);
        const current = attendance[key] || 'X'; // Varsayılan Tam Gün
        let next = '';
        if (current === 'X') next = '/'; // Yarım
        else if (current === '/') next = 'I'; // İzin
        else if (current === 'I') next = 'R'; // Rapor
        else if (current === 'R') next = ''; // Boş
        else next = 'X'; // Tam Gün

        setAttendance(prev => {
            const updated = { ...prev, [key]: next };
            upsertTimeEntry(staffId, year, month, updated);
            return updated;
        });
    };

    // Hafta sonu kontrolü (Sadece Pazar)
    const isWeekend = (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const d = date.getDay();
        return d === 0; // Sadece Pazar günü (0) hafta tatili, Cumartesi (6) artık iş günü
    };

    // Seçili yıl/ay için mevcut puantaj kayıtlarını backend'den yükle
    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const res = await fetch(`http://localhost:4000/api/timeentries?year=${year}&month=${month}`, {
                    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                });
                if (!res.ok) return;
                const data = await res.json();
                const map = {};
                data.forEach(entry => {
                    const eYear = entry.year;
                    const eMonth = entry.month;
                    const eStaffId = entry.staffId;
                    const att = entry.attendance || {};
                    Object.entries(att).forEach(([dayStr, status]) => {
                        const dayNum = Number(dayStr);
                        const key = getDayKey(eStaffId, eYear, eMonth, dayNum);
                        map[key] = status;
                    });
                });
                setAttendance(map);
            } catch (err) {
                console.error('Puantaj kayıtları alınamadı:', err);
            }
        };

        if (authToken && staffList.length > 0) {
            fetchEntries();
        }
    }, [authToken, staffList, currentDate]);

    // HESAPLAMA METODU
    const calculateStats = (staffId) => {
        let workedDays = 0;
        let leaveDays = 0;
        let reportDays = 0;
        let workedHours = 0;
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        for(let i=1; i<=daysInMonth; i++) {
            const key = getDayKey(staffId, year, month, i);
            const status = attendance[key];
            
            // Eğer veri yoksa ve hafta sonu ise HT say, değilse X (varsayılan geldiğini varsayıyoruz veya boş)
            // Basitlik adına: Eğer veri yoksa ve hafta sonuysa 'HT' kabul edelim.
            const isWe = isWeekend(i);
            
            if (status === 'X') {
                workedDays += 1;
                workedHours += 8;
            } else if (status === '/') {
                workedDays += 0.5;
                workedHours += 4;
            } else if (status === 'I') {
                leaveDays += 1;
            } else if (status === 'R') {
                reportDays += 1;
            } else if (!status && isWe) {
                workedDays += 1;
                workedHours += 8; // Hafta tatili hakedişe dahil
            } else if (!status) {
                workedDays += 1;
                workedHours += 8;
            }
        }

        const staff = staffList.find(s => s.id === staffId);
        const monthlySalary = staff && staff.salary ? parseFloat(staff.salary) || 0 : 0;
        const dailyRate = monthlySalary > 0 ? monthlySalary / 30 : 0;
        const hourlyRate = dailyRate / 8 || 0;

        const estimatedPay = dailyRate * workedDays;

        // Fazla mesai hesabı: örnek olarak 225 saat üzeri 1.5x
        const overtimeThresholdHours = 225;
        const overtimeHours = workedHours > overtimeThresholdHours ? (workedHours - overtimeThresholdHours) : 0;
        const overtimePay = overtimeHours * hourlyRate * 1.5;

        return { workedDays, leaveDays, reportDays, workedHours, estimatedPay, overtimeHours, overtimePay };
    };

    const activeStaff = staffList.filter(s => s.status !== 'quit');

    const monthlyTotals = activeStaff.reduce((acc, staff) => {
        const stats = calculateStats(staff.id);
        acc.hours += stats.workedHours;
        acc.pay += stats.estimatedPay;
        acc.overtimePay += stats.overtimePay;
        return acc;
    }, { hours: 0, pay: 0, overtimePay: 0 });

    return (
    <div className="space-y-6 animate-fadeIn">
        <header className={`flex flex-col md:flex-row items-center justify-between bg-white p-4 shadow-sm rounded-lg border-l-4 ${colors.borderStrong} gap-4`}>
            <div>
                <h1 className={`text-2xl font-bold ${theme.appText} flex items-center gap-2`}><ClipboardList className={`w-6 h-6 ${colors.text}`} /> Puantaj</h1>
                <p className={`text-sm ${theme.appText} opacity-60`}>Personel devam takip çizelgesi</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-100 p-1 rounded-lg">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-md transition shadow-sm"><ChevronLeft className="w-4 h-4"/></button>
                <span className="font-bold text-slate-700 w-32 text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-md transition shadow-sm"><ChevronRight className="w-4 h-4"/></button>
            </div>
        </header>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Toplam Bordro Yükü</div>
                <div className="text-2xl font-bold text-slate-800 mt-1">
                    {monthlyTotals.pay > 0 ? monthlyTotals.pay.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '-'}
                </div>
            </div>
            <div className="flex gap-6 text-xs text-slate-600">
                <div>
                    <div className="text-slate-400">Toplam Çalışma Saati</div>
                    <div className="font-semibold text-slate-800">{monthlyTotals.hours}</div>
                </div>
                <div>
                    <div className="text-slate-400">Fazla Mesai Tutarı</div>
                    <div className="font-semibold text-emerald-700">
                      {monthlyTotals.overtimePay > 0
                        ? monthlyTotals.overtimePay.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                        : '-'}
                    </div>
                </div>
                <div>
                    <div className="text-slate-400">Personel Sayısı</div>
                    <div className="font-semibold text-slate-800">{activeStaff.length}</div>
                </div>
            </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4">
            <div className="flex gap-4 text-xs text-slate-600 flex-wrap">
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> X: Tam Gün</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded-sm"></span> /: Yarım Gün</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-400 rounded-sm"></span> I: İzinli</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-sm"></span> R: Raporlu</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-300 rounded-sm"></span> HT: Hafta Tatili</div>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto pb-2">
            <table className="w-full text-xs text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-slate-100 text-slate-600 h-10">
                        <th className="px-4 border-b border-r border-slate-200 sticky left-0 bg-slate-100 z-10 w-48 font-bold">Personel</th>
                        {days.map(d => {
                             const isWe = isWeekend(d);
                             return (
                                <th key={d} className={`px-1 text-center border-b border-slate-200 min-w-[28px] ${isWe ? 'bg-slate-200 text-slate-500' : ''}`}>
                                    <div className="flex flex-col items-center justify-center">
                                        <span>{d}</span>
                                        <span className="text-[8px] font-normal">{['Pz','Pt','Sa','Ça','Pe','Cu','Ct'][new Date(currentDate.getFullYear(), currentDate.getMonth(), d).getDay()]}</span>
                                    </div>
                                </th>
                             );
                        })}
                        <th className="px-2 border-b border-l border-slate-200 text-center w-16 bg-green-50 text-green-700 font-bold">Hak.</th>
                        <th className="px-2 border-b border-slate-200 text-center w-16 text-slate-600">Saat</th>
                        <th className="px-2 border-b border-slate-200 text-center w-24 text-emerald-700">Hakediş (TL)</th>
                        <th className="px-2 border-b border-slate-200 text-center w-12 text-orange-600">İzin</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {activeStaff.map(staff => {
                        const stats = calculateStats(staff.id);
                        return (
                            <tr key={staff.id} className="hover:bg-slate-50 h-10 group">
                                <td className="px-4 font-medium border-r border-slate-200 sticky left-0 bg-white group-hover:bg-slate-50 z-10 truncate border-b border-slate-100">
                                    {staff.name} {staff.surname}
                                </td>
                                {days.map(d => {
                                    const isWe = isWeekend(d);
                                    const year = currentDate.getFullYear();
                                    const month = currentDate.getMonth() + 1;
                                    const key = getDayKey(staff.id, year, month, d);
                                    const val = attendance[key]; // State'den değeri al
                                    
                                    let content = <span className="text-green-500 font-bold text-[10px]">X</span>; // Varsayılan dolu
                                    let cellClass = "cursor-pointer hover:bg-slate-100 active:bg-slate-200 transition select-none";

                                    if (val === '/') { content = <span className="text-yellow-600 font-bold">/</span>; cellClass+=" bg-yellow-50"; }
                                    else if (val === 'I') { content = <span className="text-orange-600 font-bold">I</span>; cellClass+=" bg-orange-50"; }
                                    else if (val === 'R') { content = <span className="text-red-600 font-bold">R</span>; cellClass+=" bg-red-50"; }
                                    else if (val === '') { content = <span className="text-slate-300">-</span>; cellClass+=" bg-white"; } // Boş
                                    else if (isWe) { content = <span className="text-slate-400 font-bold">HT</span>; cellClass = "bg-slate-100 text-slate-400 cursor-not-allowed"; } // Hafta sonu
                                    
                                    return (
                                        <td key={d} 
                                            onClick={() => !isWe && toggleStatus(staff.id, d)} 
                                            className={`px-0 text-center border-r border-slate-100 border-b ${cellClass}`}
                                        >
                                            {content}
                                        </td>
                                    );
                                })}
                                <td className="px-2 border-l border-slate-200 text-center font-bold text-green-700 bg-green-50/50 border-b border-slate-100">{stats.workedDays}</td>
                                <td className="px-2 border-slate-200 text-center text-slate-700 font-mono border-b border-slate-100">{stats.workedHours}</td>
                                <td className="px-2 border-slate-200 text-center text-emerald-700 font-mono font-semibold border-b border-slate-100">{stats.estimatedPay > 0 ? stats.estimatedPay.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺' : '-'}</td>
                                <td className="px-2 border-slate-200 text-center text-orange-600 font-medium border-b border-slate-100">{stats.leaveDays > 0 ? stats.leaveDays : '-'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        <div className="text-xs text-slate-400 text-right">* Günlere tıklayarak durumunu değiştirebilirsiniz. Sadece Pazar günleri hafta tatilidir (HT).</div>
    </div>
    );
};

// --- 3. İŞLEVSEL MODÜLLER (ORTA KISIM) ---

const WorkTrackingView = ({ authToken }) => {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme.appColor);
  const resolveFileUrl = (url) => {
    if (!url) return '';
    return url.startsWith('/uploads/') ? `http://localhost:4000${url}` : url;
  };
  const isRealFile = (v) => {
    if (!v) return false;
    try {
      return typeof globalThis !== 'undefined' && globalThis.File && v instanceof globalThis.File;
    } catch (e) {
      // Fallback for environments where File is not callable
      return typeof v === 'object' && typeof v.name === 'string' && typeof v.size === 'number' && typeof v.type === 'string';
    }
  };
  const [workspaces, setWorkspaces] = useState([]);
  const [boards, setBoards] = useState([]);
  const [lists, setLists] = useState([]);
  const [cardsByListId, setCardsByListId] = useState({});
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [activeBoard, setActiveBoard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const [error, setError] = useState('');
  const [assignees, setAssignees] = useState([]);
  const [cardModal, setCardModal] = useState({ show: false, listId: null, card: null });
  const [cardForm, setCardForm] = useState({ title: '', description: '', assigneeUserId: '', labelIds: [], dueDate: '' });
  const [activities, setActivities] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [labels, setLabels] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [newLabel, setNewLabel] = useState({ name: '', color: '#3b82f6' });
  const socketRef = useRef(null);
  const [membersModal, setMembersModal] = useState({ show: false, scope: null, id: null });
  const [members, setMembers] = useState([]);
  const [memberForm, setMemberForm] = useState({ userId: '', role: 'viewer' });

  const [addingList, setAddingList] = useState(false);
  const [addingCardToList, setAddingCardToList] = useState(null);
  const [tempInput, setTempInput] = useState('');
  const [tempFile, setTempFile] = useState(null);
  const cardFileInputRef = useRef(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedFromList, setDraggedFromList] = useState(null);
  const [draggedList, setDraggedList] = useState(null);
  
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null, id: null });
  const [showArchiveView, setShowArchiveView] = useState(false);
  const [archivedCards, setArchivedCards] = useState([]);

  const apiFetch = async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };
    const res = await fetch(`http://localhost:4000/api/kanban${path}`, {
      ...options,
      headers,
    });
    return res;
  };

  const fetchWorkspaces = async () => {
    if (!authToken) return;
    try {
      const res = await apiFetch('/workspaces', { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      setWorkspaces(data);
    } catch (err) {
      console.error('Kanban workspaces alınamadı:', err);
    }
  };

  const fetchBoards = async (workspaceId) => {
    if (!authToken || !workspaceId) return;
    try {
      const res = await apiFetch(`/workspaces/${workspaceId}/boards`, { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      setBoards(data);
    } catch (err) {
      console.error('Kanban boards alınamadı:', err);
    }
  };

  const fetchArchivedCards = async () => {
    if (!authToken || !activeWorkspace) return;
    try {
      const res = await apiFetch(`/workspaces/${activeWorkspace.id}/archived-cards`, { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      setArchivedCards(data);
    } catch (err) {
      console.error('Arşivlenmiş kartlar alınamadı:', err);
    }
  };

  const handleRestoreCard = async (cardId) => {
    if (!authToken) return;
    try {
      const res = await apiFetch(`/cards/${cardId}/restore`, { method: 'PUT' });
      if (!res.ok) return;
      await fetchArchivedCards();
      if (activeBoard) await fetchListsAndCards(activeBoard.id);
    } catch (err) {
      console.error('Kart geri yüklenemedi:', err);
    }
  };

  const handlePermanentDeleteCard = async (cardId) => {
    if (!authToken) return;
    if (!window.confirm('Bu kartı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return;
    try {
      const res = await apiFetch(`/cards/${cardId}/permanent`, { method: 'DELETE' });
      if (!res.ok) return;
      await fetchArchivedCards();
    } catch (err) {
      console.error('Kart kalıcı olarak silinemedi:', err);
    }
  };

  const openArchiveView = async () => {
    setShowArchiveView(true);
    await fetchArchivedCards();
  };

  const fetchListsAndCards = async (boardId) => {
    if (!authToken || !boardId) return;
    try {
      const lRes = await apiFetch(`/boards/${boardId}/lists`, { method: 'GET' });
      if (!lRes.ok) return;
      const lData = await lRes.json();
      setLists(lData);

      const cardEntries = await Promise.all(
        lData.map(async (l) => {
          const cRes = await apiFetch(`/lists/${l.id}/cards`, { method: 'GET' });
          if (!cRes.ok) return [l.id, []];
          const cData = await cRes.json();
          return [l.id, cData];
        })
      );
      const map = {};
      for (const [listId, c] of cardEntries) map[listId] = c;
      setCardsByListId(map);
    } catch (err) {
      console.error('Kanban lists/cards alınamadı:', err);
    }
  };

  const fetchActivities = async (boardId) => {
    if (!authToken || !boardId) return;
    try {
      const res = await apiFetch(`/boards/${boardId}/activities?limit=30`, { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.error('Kanban activities alınamadı:', err);
    }
  };

  const fetchMembers = async (scope, id) => {
    if (!authToken || !scope || !id) return;
    try {
      const res = await apiFetch(`/${scope}/${id}/members`, { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Kanban members alınamadı:', err);
    }
  };

  const openMembersModal = async (scope, id) => {
    setMemberForm({ userId: '', role: 'viewer' });
    setMembers([]);
    setMembersModal({ show: true, scope, id });
    await fetchMembers(scope, id);
  };

  const closeMembersModal = () => {
    setMembersModal({ show: false, scope: null, id: null });
    setMembers([]);
    setMemberForm({ userId: '', role: 'viewer' });
  };

  const handleUpsertMember = async () => {
    if (!authToken || !membersModal.show || !membersModal.scope || !membersModal.id) return;
    if (!memberForm.userId || !memberForm.role) return;
    try {
      const res = await apiFetch(`/${membersModal.scope}/${membersModal.id}/members`, {
        method: 'PUT',
        body: JSON.stringify({ userId: memberForm.userId, role: memberForm.role }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
      setMemberForm({ userId: '', role: 'viewer' });
    } catch (err) {
      console.error('Kanban member upsert error:', err);
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!authToken || !membersModal.show || !membersModal.scope || !membersModal.id) return;
    try {
      const res = await apiFetch(`/${membersModal.scope}/${membersModal.id}/members/${memberUserId}`, {
        method: 'DELETE',
      });
      if (!res.ok) return;
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Kanban member remove error:', err);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  useEffect(() => {
    if (!authToken) return;
    if (socketRef.current) return;

    const socket = createSocket('http://localhost:4000', {
      transports: ['websocket'],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('kanban:updated', async (payload) => {
      try {
        if (!payload?.boardId) return;
        if (!activeBoard?.id) return;
        if (payload.boardId !== activeBoard.id) return;
        await fetchListsAndCards(activeBoard.id);
        await fetchActivities(activeBoard.id);
      } catch (err) {
        console.error('Kanban realtime update error:', err);
      }
    });

    return () => {
      try {
        socket.disconnect();
      } catch (e) {
        // ignore
      }
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, activeBoard?.id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    if (activeBoard?.id) {
      socket.emit('kanban:join', { boardId: activeBoard.id });
      fetchActivities(activeBoard.id);
    }

    return () => {
      if (activeBoard?.id) {
        socket.emit('kanban:leave', { boardId: activeBoard.id });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBoard?.id]);

  useEffect(() => {
    const fetchAssignees = async () => {
      if (!authToken) return;
      try {
        const res = await apiFetch('/assignees', { method: 'GET' });
        if (!res.ok) return;
        const data = await res.json();
        setAssignees(data);
      } catch (err) {
        console.error('Kanban assignees alınamadı:', err);
      }
    };
    fetchAssignees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  useEffect(() => {
    if (activeWorkspace?.id) {
      fetchLabels(activeWorkspace.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace?.id]);

  const openCardModal = async (listId, card) => {
    setCardModal({ show: true, listId, card });
    setCardForm({
      title: card?.title || '',
      description: card?.description || '',
      assigneeUserId: card?.assigneeUserId || '',
      labelIds: card?.labelIds || [],
      dueDate: card?.dueDate ? card.dueDate.split('T')[0] : '',
    });
    if (card?.id && authToken) {
      try {
        const [commentsRes, checklistsRes] = await Promise.all([
          apiFetch(`/cards/${card.id}/comments`),
          apiFetch(`/cards/${card.id}/checklists`),
        ]);
        if (commentsRes.ok) setComments(await commentsRes.json());
        if (checklistsRes.ok) setChecklists(await checklistsRes.json());
      } catch (err) {
        console.error('Error fetching card details:', err);
      }
    }
  };

  const closeCardModal = () => {
    setCardModal({ show: false, listId: null, card: null });
    setCardForm({ title: '', description: '', assigneeUserId: '', labelIds: [], dueDate: '' });
    setComments([]);
    setChecklists([]);
    setNewComment('');
  };

  const handleSaveCard = async () => {
    if (!authToken || !cardModal.card || !cardModal.listId) return;
    if (!cardForm.title) return;
    try {
      console.log('Saving card with labelIds:', cardForm.labelIds);
      const res = await apiFetch(`/cards/${cardModal.card.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: cardForm.title,
          description: cardForm.description,
          assigneeUserId: cardForm.assigneeUserId || null,
          labelIds: cardForm.labelIds,
          dueDate: cardForm.dueDate || null,
        }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      console.log('Updated card from backend:', updated);
      setCardsByListId(prev => ({
        ...prev,
        [cardModal.listId]: (prev[cardModal.listId] || []).map(c => (c.id === updated.id ? updated : c)),
      }));
      closeCardModal();
    } catch (err) {
      console.error('Kanban card save error:', err);
    }
  };

  const handleDeleteCard = async () => {
    if (!authToken || !cardModal.card || !cardModal.listId) return;
    try {
      const res = await apiFetch(`/cards/${cardModal.card.id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) return;
      const nextCards = (cardsByListId[cardModal.listId] || []).filter(c => c.id !== cardModal.card.id);
      setCardsByListId(prev => ({
        ...prev,
        [cardModal.listId]: nextCards,
      }));
      await persistCardOrder(cardModal.listId, nextCards);
      closeCardModal();
    } catch (err) {
      console.error('Kanban card delete error:', err);
    }
  };

  const handleAddComment = async () => {
    if (!authToken || !cardModal.card || !newComment.trim()) return;
    try {
      const res = await apiFetch(`/cards/${cardModal.card.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) return;
      const created = await res.json();
      setComments(prev => [...prev, created]);
      setNewComment('');
    } catch (err) {
      console.error('Comment add error:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!authToken) return;
    try {
      const res = await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) return;
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Comment delete error:', err);
    }
  };

  const fetchLabels = async (workspaceId) => {
    if (!authToken || !workspaceId) return;
    try {
      const res = await apiFetch(`/workspaces/${workspaceId}/labels`);
      if (!res.ok) return;
      const data = await res.json();
      setLabels(data);
    } catch (err) {
      console.error('Labels fetch error:', err);
    }
  };

  const handleCreateLabel = async () => {
    if (!authToken || !activeWorkspace) return;
    try {
      const res = await apiFetch(`/workspaces/${activeWorkspace.id}/labels`, {
        method: 'POST',
        body: JSON.stringify({ name: newLabel.name || '', color: newLabel.color }),
      });
      if (!res.ok) return;
      const created = await res.json();
      setLabels(prev => [...prev, created]);
      setNewLabel({ name: '', color: '#3b82f6' });
      setShowLabelModal(false);
    } catch (err) {
      console.error('Label create error:', err);
    }
  };

  const handleDeleteLabel = async (labelId) => {
    if (!authToken) return;
    if (!confirm('Bu etiketi silmek istediğinize emin misiniz? Tüm kartlardan kaldırılacaktır.')) return;
    try {
      const res = await apiFetch(`/labels/${labelId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) return;
      setLabels(prev => prev.filter(l => l.id !== labelId));
      if (cardForm.labelIds.includes(labelId)) {
        setCardForm(prev => ({
          ...prev,
          labelIds: prev.labelIds.filter(id => id !== labelId)
        }));
      }
    } catch (err) {
      console.error('Label delete error:', err);
    }
  };

  const handleAddChecklist = async () => {
    if (!authToken || !cardModal.card) return;
    const title = prompt('Checklist başlığı:');
    if (!title) return;
    try {
      const res = await apiFetch(`/cards/${cardModal.card.id}/checklists`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      if (!res.ok) return;
      const created = await res.json();
      setChecklists(prev => [...prev, created]);
    } catch (err) {
      console.error('Checklist add error:', err);
    }
  };

  const handleUpdateChecklist = async (checklistId, updates) => {
    if (!authToken) return;
    try {
      const res = await apiFetch(`/checklists/${checklistId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setChecklists(prev => prev.map(cl => cl.id === checklistId ? updated : cl));
    } catch (err) {
      console.error('Checklist update error:', err);
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    if (!authToken) return;
    try {
      const res = await apiFetch(`/checklists/${checklistId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) return;
      setChecklists(prev => prev.filter(cl => cl.id !== checklistId));
    } catch (err) {
      console.error('Checklist delete error:', err);
    }
  };

  const handleToggleChecklistItem = async (checklist, itemId) => {
    const updatedItems = checklist.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    await handleUpdateChecklist(checklist.id, { items: updatedItems });
  };

  const handleAddChecklistItem = async (checklist) => {
    const text = prompt('Görev adı:');
    if (!text) return;
    const updatedItems = [...checklist.items, { text, completed: false, order: checklist.items.length }];
    await handleUpdateChecklist(checklist.id, { items: updatedItems });
  };

  const openModal = () => { setNewItemName(''); setNewItemDesc(''); setError(''); setShowModal(true); };
  const handleCreate = () => {
    if (!newItemName) { setError("Lütfen bir isim giriniz."); return; }
    const run = async () => {
      try {
        if (!authToken) return;
        if (activeWorkspace) {
          const res = await apiFetch(`/workspaces/${activeWorkspace.id}/boards`, {
            method: 'POST',
            body: JSON.stringify({ name: newItemName }),
          });
          if (!res.ok) return;
          await fetchBoards(activeWorkspace.id);
        } else {
          const res = await apiFetch('/workspaces', {
            method: 'POST',
            body: JSON.stringify({ name: newItemName, description: newItemDesc }),
          });
          if (!res.ok) return;
          await fetchWorkspaces();
        }
        setShowModal(false);
      } catch (err) {
        console.error('Kanban create error:', err);
      }
    };
    run();
  };

  // Silme İşlemleri (Modal ile)
  const requestDelete = (type, id) => setDeleteModal({ show: true, type, id });
  const confirmDelete = () => {
    const run = async () => {
      try {
        if (!authToken) return;
        if (deleteModal.type === 'workspace') {
          const res = await apiFetch(`/workspaces/${deleteModal.id}`, { method: 'DELETE' });
          if (!res.ok && res.status !== 204) return;
          setActiveWorkspace(null);
          setActiveBoard(null);
          setBoards([]);
          setLists([]);
          setCardsByListId({});
          await fetchWorkspaces();
        } else if (deleteModal.type === 'board') {
          const res = await apiFetch(`/boards/${deleteModal.id}`, { method: 'DELETE' });
          if (!res.ok && res.status !== 204) return;
          setActiveBoard(null);
          setLists([]);
          setCardsByListId({});
          if (activeWorkspace) await fetchBoards(activeWorkspace.id);
        } else if (deleteModal.type === 'list') {
          const res = await apiFetch(`/lists/${deleteModal.id}`, { method: 'DELETE' });
          if (!res.ok && res.status !== 204) return;
          setLists(lists.filter(l => l.id !== deleteModal.id));
          setCardsByListId(prev => {
            const next = { ...prev };
            delete next[deleteModal.id];
            return next;
          });
        }
      } catch (err) {
        console.error('Kanban delete error:', err);
      } finally {
        setDeleteModal({ show: false, type: null, id: null });
      }
    };
    run();
  };

  const handleAddList = () => {
    if (!tempInput) return;
    const run = async () => {
      try {
        if (!authToken || !activeBoard) return;
        const res = await apiFetch(`/boards/${activeBoard.id}/lists`, {
          method: 'POST',
          body: JSON.stringify({ title: tempInput }),
        });
        if (!res.ok) return;
        const created = await res.json();
        setLists(prev => [...prev, created]);
        setCardsByListId(prev => ({ ...prev, [created.id]: [] }));
        setTempInput('');
        setAddingList(false);
      } catch (err) {
        console.error('Kanban add list error:', err);
      }
    };
    run();
  };

  const handleCardFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTempFile(file);
    setTempInput(file.name);
  };

  const handleAddCard = (listId) => {
    if (!tempInput) return;
    const run = async () => {
      try {
        if (!authToken) return;
        const res = await apiFetch(`/lists/${listId}/cards`, {
          method: 'POST',
          body: JSON.stringify({ title: tempInput }),
        });
        if (!res.ok) return;
        const created = await res.json();

        const selectedFile = tempFile;
        const optimisticCard = isRealFile(selectedFile)
          ? { ...created, __uploading: true, fileName: selectedFile.name }
          : created;

        // Optimistic: show card immediately
        setCardsByListId(prev => ({
          ...prev,
          [listId]: [...(prev[listId] || []), optimisticCard],
        }));

        // Close input immediately for better UX
        setTempInput('');
        setAddingCardToList(null);
        setTempFile(null);
        if (cardFileInputRef.current) {
          cardFileInputRef.current.value = '';
        }

        // Upload attachment (if any) and replace created card with updated response
        if (isRealFile(selectedFile)) {
          try {
            const fd = new FormData();
            fd.append('file', selectedFile);
            const upRes = await fetch(`http://localhost:4000/api/kanban/cards/${created.id}/attachment`, {
              method: 'POST',
              headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
              body: fd,
            });

            if (upRes.ok) {
              const updated = await upRes.json();
              setCardsByListId(prev => ({
                ...prev,
                [listId]: (prev[listId] || []).map(c => (c.id === updated.id ? updated : c)),
              }));
            } else {
              const bodyText = await upRes.text().catch(() => '');
              console.error('Kanban attachment upload failed:', upRes.status, bodyText);
              setCardsByListId(prev => ({
                ...prev,
                [listId]: (prev[listId] || []).map(c => (c.id === created.id ? { ...c, __uploading: false } : c)),
              }));
            }
          } catch (err) {
            console.error('Kanban attachment upload error:', err);
            setCardsByListId(prev => ({
              ...prev,
              [listId]: (prev[listId] || []).map(c => (c.id === created.id ? { ...c, __uploading: false } : c)),
            }));
          }
        }
      } catch (err) {
        console.error('Kanban add card error:', err);
      }
    };
    run();
  };
  
  const handleDragStart = (e, cardId, listId) => { setDraggedList(null); setDraggedCard(cardId); setDraggedFromList(listId); e.dataTransfer.effectAllowed = 'move'; };
  const handleListDragStart = (e, listId) => { setDraggedCard(null); setDraggedFromList(null); setDraggedList(listId); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e) => { e.preventDefault(); };

  const persistCardOrder = async (listId, orderedCards) => {
    if (!authToken) return;
    try {
      await apiFetch(`/lists/${listId}/cards/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ orderedCardIds: orderedCards.map(c => c.id) }),
      });
    } catch (err) {
      console.error('Kanban card reorder error:', err);
    }
  };

  const persistListOrder = async (boardId, orderedListIds) => {
    if (!authToken) return;
    try {
      await apiFetch(`/boards/${boardId}/lists/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ orderedListIds }),
      });
    } catch (err) {
      console.error('Kanban list reorder error:', err);
    }
  };

  const moveCard = async (targetListId, targetCardId = null) => {
    if (draggedCard === null || draggedFromList === null) return;
    const sourceListId = draggedFromList;

    const sourceCards = cardsByListId[sourceListId] || [];
    const targetCards = cardsByListId[targetListId] || [];
    const cardToMove = sourceCards.find(c => c.id === draggedCard);
    if (!cardToMove) return;

    // If same list and dropping on itself, do nothing
    if (sourceListId === targetListId && targetCardId === draggedCard) return;

    const sourceWithout = sourceCards.filter(c => c.id !== draggedCard);
    let insertIndex = targetCards.length;
    if (targetCardId) {
      const idx = targetCards.findIndex(c => c.id === targetCardId);
      insertIndex = idx === -1 ? targetCards.length : idx;
    }

    // If moving within same list, adjust index after removal
    let nextTargetCards;
    if (sourceListId === targetListId) {
      const currentIdx = targetCards.findIndex(c => c.id === draggedCard);
      const base = targetCards.filter(c => c.id !== draggedCard);
      const adjustedIndex = currentIdx !== -1 && insertIndex > currentIdx ? insertIndex - 1 : insertIndex;
      nextTargetCards = [...base.slice(0, adjustedIndex), { ...cardToMove, listId: targetListId }, ...base.slice(adjustedIndex)];
    } else {
      nextTargetCards = [...targetCards.slice(0, insertIndex), { ...cardToMove, listId: targetListId }, ...targetCards.slice(insertIndex)];
    }

    // Optimistic UI
    setCardsByListId(prev => {
      const next = { ...prev };
      next[sourceListId] = sourceListId === targetListId ? nextTargetCards : sourceWithout;
      next[targetListId] = nextTargetCards;
      return next;
    });

    try {
      if (authToken && sourceListId !== targetListId) {
        const res = await apiFetch(`/cards/${draggedCard}`, {
          method: 'PUT',
          body: JSON.stringify({ listId: targetListId }),
        });
        if (!res.ok) {
          if (activeBoard) await fetchListsAndCards(activeBoard.id);
          return;
        }
      }

      // Persist order for affected list(s)
      await persistCardOrder(targetListId, nextTargetCards);
      if (sourceListId !== targetListId) {
        await persistCardOrder(sourceListId, sourceWithout);
      }
    } catch (err) {
      console.error('Kanban move/reorder card error:', err);
      if (activeBoard) await fetchListsAndCards(activeBoard.id);
    }
  };

  const handleDrop = (e, targetListId) => {
    e.preventDefault();
    if (draggedCard === null || draggedFromList === null) return;
    
    const run = async () => {
      try {
        await moveCard(targetListId);
      } finally {
        setDraggedCard(null);
        setDraggedFromList(null);
      }
    };
    run();
  };

  const handleDropOnCard = (e, targetListId, targetCardId) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedCard === null || draggedFromList === null) return;
    const run = async () => {
      try {
        await moveCard(targetListId, targetCardId);
      } finally {
        setDraggedCard(null);
        setDraggedFromList(null);
      }
    };
    run();
  };

  const handleListDrop = (e, targetListId) => {
    e.preventDefault();
    if (!draggedList || !activeBoard) return;
    if (draggedList === targetListId) {
      setDraggedList(null);
      return;
    }

    const current = lists.map(l => l.id);
    const fromIdx = current.indexOf(draggedList);
    const toIdx = current.indexOf(targetListId);
    if (fromIdx === -1 || toIdx === -1) {
      setDraggedList(null);
      return;
    }

    const nextIds = [...current];
    nextIds.splice(fromIdx, 1);
    nextIds.splice(toIdx, 0, draggedList);
    const byId = new Map(lists.map(l => [l.id, l]));
    const nextLists = nextIds.map(id => byId.get(id)).filter(Boolean);
    setLists(nextLists);

    const run = async () => {
      try {
        await persistListOrder(activeBoard.id, nextIds);
      } catch (err) {
        console.error('Kanban list reorder error:', err);
        await fetchListsAndCards(activeBoard.id);
      } finally {
        setDraggedList(null);
      }
    };
    run();
  };

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      <header className={`flex items-center justify-between bg-white p-4 shadow-sm rounded-lg border-l-4 ${colors.borderStrong} w-full`}>
        <div className="flex items-center gap-4">
          {(activeWorkspace || activeBoard || showArchiveView) && (<button onClick={() => { if (activeBoard) { setActiveBoard(null); setLists([]); setCardsByListId({}); } else if (showArchiveView) { setShowArchiveView(false); setArchivedCards([]); } else { setActiveWorkspace(null); setBoards([]); } }} className={`${colors.text} hover:bg-slate-50 p-2 rounded-full transition`}><ChevronLeft className="w-6 h-6" /></button>)}
          <div><h1 className={`text-2xl font-bold ${theme.appText} flex items-center gap-2`}>{showArchiveView ? <Archive className={`w-6 h-6 ${colors.text}`} /> : <Briefcase className={`w-6 h-6 ${colors.text}`} />} {showArchiveView ? 'Arşiv' : (activeBoard ? activeBoard.name : (activeWorkspace ? activeWorkspace.name : 'Kanban'))}</h1><div className="flex items-center gap-2 text-sm text-slate-500 opacity-70"><span>Kanban</span>{activeWorkspace && <><ChevronRight className="w-3 h-3"/> <span>{activeWorkspace.name}</span></>}{showArchiveView && <><ChevronRight className="w-3 h-3"/> <span>Arşiv</span></>}{activeBoard && <><ChevronRight className="w-3 h-3"/> <span>{activeBoard.name}</span></>}</div></div>
        </div>
        {activeBoard ? (
          <div className="relative flex items-center gap-2">
            <button onClick={() => openMembersModal('boards', activeBoard.id)} className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium transition hover:bg-slate-50">Üyeler</button>
            {addingList ? (
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-lg absolute right-0 top-0 z-20 w-64 animate-fadeIn"><input autoFocus type="text" className="flex-1 p-1.5 text-sm outline-none" placeholder="Liste adı..." value={tempInput} onChange={(e) => setTempInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddList()} /><button onClick={handleAddList} className={`p-1.5 rounded bg-green-500 text-white`}><Check className="w-4 h-4"/></button><button onClick={() => { setAddingList(false); setTempInput(''); }} className="p-1.5 rounded text-slate-400 hover:bg-slate-100"><X className="w-4 h-4"/></button></div>
            ) : (
              <button onClick={() => setAddingList(true)} className={`${colors.bg} ${colors.hoverBg} text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-sm`}><Plus className="w-5 h-5" /> Liste Ekle</button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {activeWorkspace && <button onClick={() => openMembersModal('workspaces', activeWorkspace.id)} className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium transition hover:bg-slate-50">Üyeler</button>}
            {activeWorkspace && !showArchiveView && <button onClick={openArchiveView} className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium transition hover:bg-slate-50 flex items-center gap-2"><Archive className="w-4 h-4" /> Arşiv</button>}
            <button onClick={openModal} className={`${colors.bg} ${colors.hoverBg} text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-sm`}><Plus className="w-5 h-5" /> {activeWorkspace ? 'Yeni Pano' : 'Çalışma Alanı Ekle'}</button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-auto">
        {activeBoard ? (
          <div className="h-full flex items-start gap-6 pb-4">
            {lists.map(list => (
              <div key={list.id} onDragOver={handleDragOver} onDrop={(e) => { if (draggedList) handleListDrop(e, list.id); else handleDrop(e, list.id); }} className="w-80 flex-shrink-0 bg-slate-100 rounded-xl border border-slate-200 flex flex-col max-h-full shadow-sm transition-colors hover:bg-slate-100/80">
                <div draggable="true" onDragStart={(e) => handleListDragStart(e, list.id)} className="p-3 px-4 font-bold text-slate-700 flex justify-between items-center border-b border-slate-200/50 cursor-grab active:cursor-grabbing">{list.title}<button onClick={() => requestDelete('list', list.id)} className="text-slate-400 hover:text-red-500 p-1 rounded"><Trash2 className="w-3.5 h-3.5"/></button></div>
                <div className="p-2 flex-1 overflow-y-auto space-y-2">
                  {(cardsByListId[list.id] || []).map(card => (
                    <div key={card.id} draggable="true" onDragOver={handleDragOver} onDrop={(e) => handleDropOnCard(e, list.id, card.id)} onDragStart={(e) => handleDragStart(e, card.id, list.id)} className={`bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:border-indigo-300 cursor-grab active:cursor-grabbing group text-sm text-slate-700 relative ${draggedCard === card.id ? 'opacity-50 border-dashed' : ''}`} onClick={() => openCardModal(list.id, card)}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="flex-1">{card.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {card.__uploading && (
                            <span className="text-slate-400" title="Dosya yükleniyor">
                              <Paperclip className="w-4 h-4" />
                            </span>
                          )}
                          {card.fileUrl && card.fileType === 'pdf' && (
                            <button onClick={(e) => { e.stopPropagation(); setPreviewFile({ url: resolveFileUrl(card.fileUrl), type: card.fileType, fileName: card.fileName }); }} className="text-red-500 hover:opacity-80" title="Önizle">
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                          {card.fileUrl && card.fileType === 'image' && (
                            <button onClick={(e) => { e.stopPropagation(); setPreviewFile({ url: resolveFileUrl(card.fileUrl), type: card.fileType, fileName: card.fileName }); }} className="text-green-600 hover:opacity-80" title="Önizle">
                              <ImageIcon className="w-4 h-4" />
                            </button>
                          )}
                          {card.fileUrl && card.fileType === 'file' && (
                            <a
                              href={resolveFileUrl(card.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-500 hover:text-slate-700"
                              title="Dosyayı Aç"
                            >
                              <File className="w-4 h-4" />
                            </a>
                          )}
                          {card.fileUrl && card.fileType !== 'pdf' && card.fileType !== 'image' && card.fileType !== 'file' && (
                            <a
                              href={resolveFileUrl(card.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-500 hover:text-slate-700"
                              title="Dosyayı Aç"
                            >
                              <Paperclip className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      {card.labelIds && card.labelIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {card.labelIds.map(labelId => {
                            const label = labels.find(l => l.id === labelId);
                            if (!label) return null;
                            return (
                              <span key={labelId} className={`${label.name ? 'px-2 py-0.5' : 'w-6 h-2'} rounded-full text-[10px] font-medium`} style={{ backgroundColor: label.color, color: '#fff' }} title={label.name || 'Etiket'}>
                                {label.name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  {addingCardToList === list.id ? (
                    <div className="bg-white p-2 rounded-lg border border-indigo-300 shadow-sm animate-fadeIn">
                      <textarea autoFocus className="w-full text-sm outline-none resize-none h-14 mb-2 border-b border-slate-100" placeholder="Kart başlığı..." value={tempInput} onChange={(e) => setTempInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(list.id); } }} />
                      {tempFile && (<div className="flex items-center gap-1 text-xs text-green-600 mb-2 bg-green-50 p-1 rounded"><FileText className="w-3 h-3"/> {tempFile.name || 'Dosya seçildi'}</div>)}
                      <div className="flex gap-1 items-center justify-between">
                        <div className="flex gap-1"><button onClick={() => handleAddCard(list.id)} className="bg-indigo-600 text-white px-3 py-1.5 text-xs rounded hover:bg-indigo-700">Ekle</button><button onClick={() => { setAddingCardToList(null); setTempInput(''); setTempFile(null); }} className="text-slate-500 px-2 py-1.5 text-xs hover:bg-slate-100 rounded"><X className="w-4 h-4"/></button></div>
                        <div>
                          <input type="file" ref={cardFileInputRef} className="hidden" onChange={handleCardFileSelect} />
                          <button onClick={() => cardFileInputRef.current.click()} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded hover:bg-slate-100" title="Dosya Ekle"><Paperclip className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ) : (<button onClick={() => setAddingCardToList(list.id)} className="w-full py-2 flex items-center gap-2 text-slate-500 hover:bg-slate-200 rounded-lg px-2 transition text-sm"><Plus className="w-4 h-4" /> Kart Ekle</button>)}
                </div>
              </div>
            ))}
            <div className="w-80 flex-shrink-0"><button onClick={() => setAddingList(true)} className="w-full bg-white/50 border-2 border-dashed border-slate-300 rounded-xl p-4 text-slate-500 hover:border-indigo-400 hover:text-indigo-500 transition flex items-center gap-2 justify-center font-medium"><Plus className="w-5 h-5" /> Başka Liste Ekle</button></div>
          </div>
        ) : showArchiveView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedCards.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Arşivlenmiş kart bulunamadı.</p>
              </div>
            ) : (
              archivedCards.map(card => (
                <div key={card.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition group relative overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className={`font-semibold ${theme.appText}`}>{card.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => handleRestoreCard(card.id)} className={`${colors.bg} ${colors.hoverBg} text-white px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1`}>
                          <RotateCcw className="w-3 h-3" /> Geri Yükle
                        </button>
                        <button onClick={() => handlePermanentDeleteCard(card.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Kalıcı Sil
                        </button>
                      </div>
                    </div>
                    {card.description && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{card.description}</p>}
                    {card.labelIds && card.labelIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {card.labelIds.map(labelId => {
                          const label = labels.find(l => l.id === labelId);
                          if (!label) return null;
                          return (
                            <span key={labelId} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: label.color, color: '#fff' }}>
                              {label.name || 'Etiket'}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-500 border-t border-slate-100 pt-3 mt-3">
                      <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {card.listTitle}</span>
                      {card.archivedAt && <span>Arşivlendi: {new Date(card.archivedAt).toLocaleDateString('tr-TR')}</span>}
                    </div>
                    {card.assigneeUserId && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                        <User className="w-3 h-3" />
                        {assignees.find(a => a.id === card.assigneeUserId)?.name || 'Bilinmeyen'} {assignees.find(a => a.id === card.assigneeUserId)?.surname || ''}
                      </div>
                    )}
                    {card.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <CalendarIcon className="w-3 h-3" />
                        Bitiş: {new Date(card.dueDate).toLocaleDateString('tr-TR')}
                      </div>
                    )}
                    {card.fileUrl && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <Paperclip className="w-3 h-3" />
                        {card.fileName || 'Dosya eki var'}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeWorkspace ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boards.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl"><Kanban className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Bu çalışma alanında henüz pano yok.</p><button onClick={openModal} className={`mt-4 text-sm font-medium ${colors.text} hover:underline`}>İlk panoyu oluştur</button></div>
            ) : (
              boards.map(board => (
                <div key={board.id} onClick={async () => { setActiveBoard(board); await fetchListsAndCards(board.id); }} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition group relative h-40 flex flex-col justify-between cursor-pointer"><div><h3 className={`font-bold text-lg ${theme.appText}`}>{board.name}</h3><p className="text-xs text-slate-400 mt-1">{lists.reduce((acc, l) => acc + ((cardsByListId[l.id] || []).length), 0)} Görev</p></div><div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100"><span className={`text-xs font-medium ${colors.text}`}>Panoya Git →</span><button onClick={(e) => { e.stopPropagation(); requestDelete('board', board.id); }} className="text-slate-300 hover:text-red-500 transition"><Trash2 className="w-4 h-4"/></button></div></div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workspaces.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl"><Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Henüz bir çalışma alanı oluşturulmadı.</p></div>
            ) : (
              workspaces.map(ws => (
                <div key={ws.id} onClick={async () => { setActiveWorkspace(ws); await fetchBoards(ws.id); }} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer group relative">
                  <div className="flex justify-between items-start mb-2"><div className={`w-12 h-12 rounded-lg ${colors.bgLight} flex items-center justify-center ${colors.text} mb-4`}><Layers className="w-6 h-6" /></div><button onClick={(e) => { e.stopPropagation(); requestDelete('workspace', ws.id); }} className="text-slate-300 hover:text-red-500 p-2 transition opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button></div><h3 className={`font-bold text-lg ${theme.appText} mb-1`}>{ws.name}</h3><p className={`text-sm ${theme.appText} opacity-60 line-clamp-2`}>{ws.description || 'Açıklama yok.'}</p><div className="mt-4 flex items-center gap-2 text-xs text-slate-400"><Kanban className="w-4 h-4" /> Pano</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {previewFile && (<div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => setPreviewFile(null)}><div className="relative w-full h-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"><div className="absolute top-0 right-0 flex gap-2 z-50 p-4"><a href={previewFile.url} download={previewFile.fileName || 'file'} onClick={(e) => e.stopPropagation()} className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"><Download className="w-6 h-6" /></a><button onClick={() => setPreviewFile(null)} className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"><X className="w-6 h-6" /></button></div>{previewFile.type === 'pdf' ? <iframe src={previewFile.url} className="w-full h-full bg-white rounded shadow-2xl border-none" onClick={(e) => e.stopPropagation()}></iframe> : <img src={previewFile.url} alt="Preview" className="max-w-full max-h-full object-contain rounded shadow-2xl" onClick={(e) => e.stopPropagation()} />}</div></div>) }
      {cardModal.show && (
        <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={closeCardModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className={`${colors.bgLight} p-4 border-b ${colors.border} flex justify-between items-center flex-shrink-0`}>
              <h3 className={`font-bold ${theme.appText} flex items-center gap-2`}>
                <Kanban className="w-5 h-5" /> Kart Detayı
              </h3>
              <button onClick={closeCardModal} className={`${colors.text} hover:opacity-70`}><X className="w-5 h-5"/></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>Başlık</label>
                  <input type="text" value={cardForm.title} onChange={(e) => setCardForm(prev => ({ ...prev, title: e.target.value }))} className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none`} />
                </div>
                <div>
                  <label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>Açıklama</label>
                  <textarea value={cardForm.description} onChange={(e) => setCardForm(prev => ({ ...prev, description: e.target.value }))} className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none h-24 resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>Atanan</label>
                    <select value={cardForm.assigneeUserId || ''} onChange={(e) => setCardForm(prev => ({ ...prev, assigneeUserId: e.target.value }))} className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none bg-white text-sm`}>
                      <option value="">Atanan yok</option>
                      {assignees.map(u => (
                        <option key={u.id} value={u.id}>{u.name} {u.surname}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>Bitiş Tarihi</label>
                    <input type="date" value={cardForm.dueDate} onChange={(e) => setCardForm(prev => ({ ...prev, dueDate: e.target.value }))} className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none text-sm`} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-xs font-bold ${theme.appText} opacity-60`}>Etiketler</label>
                    <button onClick={() => setShowLabelModal(true)} className="text-xs text-indigo-600 hover:underline">+ Yeni Etiket</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {labels.map(label => (
                      <div key={label.id} className="relative group">
                        <button onClick={() => {
                          const isSelected = cardForm.labelIds.includes(label.id);
                          setCardForm(prev => ({
                            ...prev,
                            labelIds: isSelected ? prev.labelIds.filter(id => id !== label.id) : [...prev.labelIds, label.id]
                          }));
                        }} className={`${label.name ? 'px-3 py-1' : 'w-8 h-6'} rounded-full text-xs font-medium transition ${cardForm.labelIds.includes(label.id) ? 'ring-2 ring-offset-1' : 'opacity-60 hover:opacity-100'}`} style={{ backgroundColor: label.color, color: '#fff', ringColor: label.color }} title={label.name || 'Etiket'}>
                          {label.name}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteLabel(label.id); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px] hover:bg-red-600" title="Etiketi Sil">
                          ×
                        </button>
                      </div>
                    ))}
                    {labels.length === 0 && <div className="text-sm text-slate-400">Henüz etiket yok</div>}
                  </div>
                </div>
                {cardModal.card?.fileUrl && (
                  <div>
                    <label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>Ek</label>
                    <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-sm text-slate-700 truncate">{cardModal.card.fileName || 'Dosya'}</div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {(cardModal.card.fileType === 'pdf' || cardModal.card.fileType === 'image') && (
                          <button onClick={() => setPreviewFile({ url: resolveFileUrl(cardModal.card.fileUrl), type: cardModal.card.fileType, fileName: cardModal.card.fileName })} className="bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md text-sm">Aç</button>
                        )}
                        <a href={resolveFileUrl(cardModal.card.fileUrl)} download={cardModal.card.fileName || 'file'} className="bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md text-sm">İndir</a>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-xs font-bold ${theme.appText} opacity-60`}>Checklist</label>
                    <button onClick={handleAddChecklist} className="text-xs text-indigo-600 hover:underline">+ Checklist Ekle</button>
                  </div>
                  {checklists.map(checklist => {
                    const completed = checklist.items.filter(i => i.completed).length;
                    const total = checklist.items.length;
                    return (
                      <div key={checklist.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{checklist.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{completed}/{total}</span>
                            <button onClick={() => handleDeleteChecklist(checklist.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {checklist.items.map(item => (
                            <div key={item.id} className="flex items-center gap-2">
                              <input type="checkbox" checked={item.completed} onChange={() => handleToggleChecklistItem(checklist, item.id)} className="w-4 h-4 rounded" />
                              <span className={`text-sm flex-1 ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.text}</span>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => handleAddChecklistItem(checklist)} className="text-xs text-indigo-600 hover:underline mt-2">+ Görev Ekle</button>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-2`}>Yorumlar ({comments.length})</label>
                  <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
                    {comments.map(comment => (
                      <div key={comment.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="text-xs font-semibold text-slate-700">{comment.user?.name} {comment.user?.surname}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleDateString('tr-TR')}</span>
                            <button onClick={() => handleDeleteComment(comment.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Yorum ekle..." className="flex-1 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm h-20 resize-none" />
                    <button onClick={handleAddComment} className={`${colors.bg} ${colors.hoverBg} text-white px-4 rounded-lg font-medium transition self-end`}>Gönder</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex items-center justify-between flex-shrink-0 bg-slate-50">
              <button onClick={handleDeleteCard} className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2"><Trash2 className="w-4 h-4" /> Sil</button>
              <div className="flex gap-2">
                <button onClick={closeCardModal} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition">İptal</button>
                <button onClick={handleSaveCard} className={`${colors.bg} ${colors.hoverBg} text-white px-4 py-2 rounded-lg font-medium transition`}>Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showLabelModal && (
        <div className="fixed inset-0 bg-black/50 z-[130] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => setShowLabelModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className={`${colors.bgLight} p-4 border-b ${colors.border} flex justify-between items-center`}>
              <h3 className={`font-bold ${theme.appText}`}>Yeni Etiket</h3>
              <button onClick={() => setShowLabelModal(false)} className={`${colors.text} hover:opacity-70`}><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>Etiket Adı (Opsiyonel)</label>
                <input type="text" value={newLabel.name} onChange={(e) => setNewLabel(prev => ({ ...prev, name: e.target.value }))} className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none`} placeholder="Boş bırakabilirsiniz" />
              </div>
              <div>
                <label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>Renk *</label>
                <div className="flex gap-2 flex-wrap">
                  {['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'].map(color => (
                    <button key={color} onClick={() => setNewLabel(prev => ({ ...prev, color }))} className={`w-8 h-8 rounded-full ${newLabel.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              <button onClick={handleCreateLabel} className={`w-full ${colors.bg} ${colors.hoverBg} text-white py-2 rounded-lg font-medium transition`}>Oluştur</button>
            </div>
          </div>
        </div>
      )}
      {membersModal.show && (
        <div className="fixed inset-0 bg-black/50 z-[130] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={closeMembersModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className={`${colors.bgLight} p-4 border-b ${colors.border} flex justify-between items-center`}>
              <h3 className={`font-bold ${theme.appText}`}>Üyeler</h3>
              <button onClick={closeMembersModal} className={`${colors.text} hover:opacity-70`}><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <select value={memberForm.userId} onChange={(e) => setMemberForm((p) => ({ ...p, userId: e.target.value }))} className="p-2 border border-slate-300 rounded bg-white">
                  <option value="">Kullanıcı seç</option>
                  {assignees.map(u => (
                    <option key={u.id} value={u.id}>{u.name} {u.surname} ({u.email})</option>
                  ))}
                </select>
                <select value={memberForm.role} onChange={(e) => setMemberForm((p) => ({ ...p, role: e.target.value }))} className="p-2 border border-slate-300 rounded bg-white">
                  <option value="viewer">Görüntüleyici</option>
                  <option value="editor">Düzenleyici</option>
                  <option value="owner">Sahip</option>
                </select>
                <button onClick={handleUpsertMember} className={`${colors.bg} ${colors.hoverBg} text-white px-4 py-2 rounded-lg font-medium transition`}>Ekle/Güncelle</button>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">Mevcut Üyeler</div>
                <div className="divide-y">
                  {members.length === 0 ? (
                    <div className="p-4 text-sm text-slate-400">Üye yok.</div>
                  ) : (
                    members.map(m => (
                      <div key={m.userId} className="flex items-center justify-between px-4 py-3">
                        <div className="text-sm text-slate-700">
                          <div className="font-medium">{assignees.find(u => u.id === m.userId)?.name || m.userId} {assignees.find(u => u.id === m.userId)?.surname || ''}</div>
                          <div className="text-xs text-slate-400">{m.role === 'viewer' ? 'Görüntüleyici' : m.role === 'editor' ? 'Düzenleyici' : m.role === 'owner' ? 'Sahip' : m.role}</div>
                        </div>
                        <button onClick={() => handleRemoveMember(m.userId)} className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-medium transition">Çıkar</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className={`${colors.bgLight} p-4 border-b ${colors.border} flex justify-between items-center`}><h3 className={`font-bold ${theme.appText} flex items-center gap-2`}>{activeWorkspace ? <Kanban className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />} {activeWorkspace ? 'Yeni Pano Oluştur' : 'Yeni Çalışma Alanı'}</h3><button onClick={() => setShowModal(false)} className={`${colors.text} hover:opacity-70`}><X className="w-5 h-5"/></button></div>
            <div className="p-6 space-y-4">
              <div><label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>İsim</label><input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none`} placeholder={activeWorkspace ? "Pano Adı (Örn: Yazılım Ekibi)" : "Çalışma Alanı Adı (Örn: Pazarlama)"} autoFocus /></div>
              {!activeWorkspace && (<div><label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>Açıklama</label><textarea value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none h-20 resize-none`} placeholder="Bu alan ne için kullanılacak?" ></textarea></div>)}
              {error && <div className="text-red-500 text-xs">{error}</div>}
              <div className="pt-2"><button onClick={handleCreate} className={`w-full ${colors.bg} ${colors.hoverBg} text-white py-2.5 rounded-lg font-bold shadow-lg transition`}>Oluştur</button></div>
            </div>
          </div>
        </div>
      )}
      <ConfirmationModal 
        isOpen={deleteModal.show} 
        onClose={() => setDeleteModal({show:false})} 
        onConfirm={confirmDelete} 
        title={deleteModal.type === 'workspace' ? 'Çalışma Alanı Sil' : deleteModal.type === 'board' ? 'Pano Sil' : 'Liste Sil'} 
        message="Bu öğeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz." 
      />
    </div>
  );
};

const AgendaView = ({ users, currentUser, events, setEvents, authToken }) => {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme.appColor);
  // Değişiklik burada yapıldı: Varsayılan görünüm 'day' olarak ayarlandı.
  const [viewMode, setViewMode] = useState('day');  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);  
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [error, setError] = useState('');
  const [onlyMine, setOnlyMine] = useState(true);

  const [newEvent, setNewEvent] = useState({ title: '', date: new Date().toISOString().split('T')[0], time: '09:00', endTime: '10:00', type: 'meeting', description: '', participants: [] });
  const [participantSearch, setParticipantSearch] = useState('');

  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const weekDaysShort = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const timeSlots = [];
  for (let i = 8; i < 24; i++) { const hour = i < 10 ? `0${i}` : i; timeSlots.push(`${hour}:00`); timeSlots.push(`${hour}:30`); }
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => { let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay(); return day === 0 ? 6 : day - 1; };
  const getWeekDays = (date) => { const curr = new Date(date); const day = curr.getDay(); const diff = curr.getDate() - day + (day === 0 ? -6 : 1); const week = []; for (let i = 0; i < 7; i++) { const d = new Date(curr); d.setDate(diff + i); week.push(d); } return week; };
  const getMinutes = (timeStr) => { const [h, m] = timeStr.split(':').map(Number); return h * 60 + m; };
  const filteredEvents = onlyMine
    ? events.filter(e => e.participants?.includes(currentUser.id))
    : events;
  const handlePrev = () => { const newDate = new Date(currentDate); if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1); else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7); else newDate.setDate(newDate.getDate() - 1); setCurrentDate(newDate); };
  const handleNext = () => { const newDate = new Date(currentDate); if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1); else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7); else newDate.setDate(newDate.getDate() + 1); setCurrentDate(newDate); };
  const handleToday = () => setCurrentDate(new Date());

  const openNewEventModal = (dateStr = null, timeStr = null, eventToEdit = null) => { 
    setError('');
    if (eventToEdit) {
      setEditingEvent(eventToEdit);
      setNewEvent({ ...eventToEdit });
      if (eventToEdit.unreadBy?.includes(currentUser.id)) {
          const updatedUnread = eventToEdit.unreadBy.filter(uid => uid !== currentUser.id);
          const updatedEvents = events.map(ev => ev.id === eventToEdit.id ? { ...ev, unreadBy: updatedUnread } : ev);
          setEvents(updatedEvents);
          // Backend'de de okunmuş olarak işaretle
          if (authToken) {
            fetch(`http://localhost:4000/api/events/${eventToEdit.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({ ...eventToEdit, unreadBy: updatedUnread }),
            }).catch(err => console.error('Etkinlik okunma durumu güncellenemedi:', err));
          }
      }
    } else {
      setEditingEvent(null);
      const defaultDate = dateStr || new Date().toISOString().split('T')[0];
      const defaultTime = timeStr || '09:00';  
      let [h, m] = defaultTime.split(':').map(Number);  
      let endH = h + 1;  
      const defaultEndTime = `${endH < 10 ? '0'+endH : endH}:${m < 10 ? '0'+m : m}`;  
      setNewEvent({ title: '', date: defaultDate, time: defaultTime, endTime: defaultEndTime > '23:59' ? '23:59' : defaultEndTime, type: 'meeting', description: '', participants: [currentUser.id] });
    }
    setParticipantSearch('');  
    setShowEventModal(true);  
  };
  const saveEvent = async () => {  
    if (!newEvent.title) { setError("Lütfen bir başlık giriniz."); return; }
    if (newEvent.endTime <= newEvent.time) { setError("Bitiş saati başlangıç saatinden sonra olmalıdır."); return; }
    
    // Etkinliği güncelleyen veya oluşturan kullanıcıyı unreadBy listesinden çıkar
    const notifyUsers = newEvent.participants.filter(p => p !== currentUser.id);
    
    try {
      if (editingEvent) {
        const res = await fetch(`http://localhost:4000/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({ ...newEvent, unreadBy: notifyUsers }),
        });
        if (!res.ok) {
          console.error('Etkinlik güncellenemedi');
          return;
        }
        const updated = await res.json();
        setEvents(events.map(ev => ev.id === editingEvent.id ? updated : ev));
      } else {
        const res = await fetch('http://localhost:4000/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({ ...newEvent, unreadBy: notifyUsers }),
        });
        if (!res.ok) {
          console.error('Etkinlik oluşturulamadı');
          return;
        }
        const created = await res.json();
        setEvents([...events, created]);
      }
      setShowEventModal(false);  
    } catch (err) {
      console.error('Etkinlik kaydedilirken hata oluştu:', err);
    }
  };
  const requestDeleteEvent = () => setDeleteModal({ show: true, id: editingEvent.id });
  const confirmDeleteEvent = () => {
    const doDelete = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/events/${deleteModal.id}`, {
          method: 'DELETE',
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
        if (!res.ok && res.status !== 404) {
          console.error('Etkinlik silinemedi');
          return;
        }
        setEvents(events.filter(e => e.id !== deleteModal.id));
        setShowEventModal(false);
      } catch (err) {
        console.error('Etkinlik silinirken hata oluştu:', err);
      } finally {
        setDeleteModal({ show: false, id: null });
      }
    };

    doDelete();
  };
  const toggleParticipant = (userId) => { setNewEvent(prev => { const isSelected = prev.participants.includes(userId); if (isSelected) return { ...prev, participants: prev.participants.filter(id => id !== userId) }; return { ...prev, participants: [...prev.participants, userId] }; }); };
  const getParticipantNames = (participantIds) => {
    if (!participantIds || participantIds.length === 0) return '';
    const names = participantIds.map(id => {
      const u = users.find(user => user.id === id);
      return u ? `${u.name} ${u.surname}` : 'Bilinmeyen';
    });
    return names.join(', ');
  };
  const renderMonthView = () => {  
    const daysInMonth = getDaysInMonth(currentDate); const firstDay = getFirstDayOfMonth(currentDate); const blanks = Array(firstDay).fill(null); const days = Array.from({ length: daysInMonth }, (_, i) => i + 1); const totalSlots = [...blanks, ...days];  
    return ( <div className="grid grid-cols-7 gap-2 h-full auto-rows-fr p-2"> {weekDaysShort.map((d, i) => ( <div key={i} className={`text-center py-2 text-xs font-semibold ${theme.appText} opacity-70 bg-slate-50 rounded-lg uppercase`}>{d}</div> ))} {totalSlots.map((day, index) => { if (!day) return <div key={index} className="bg-slate-50/30 rounded-lg border border-transparent"></div>; const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day); const dateKey = new Date(cellDate.getTime() - (cellDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0]; const isToday = new Date().toDateString() === cellDate.toDateString(); 
    const dayEvents = filteredEvents.filter(e => e.date === dateKey);  
    return ( <div key={index} onClick={() => openNewEventModal(dateKey)} className={`min-h-[100px] border rounded-lg p-2 flex flex-col gap-1 cursor-pointer transition ${colors.hoverBg.replace('bg','border').replace('hover:','hover:')} hover:shadow-sm bg-white ${isToday ? `ring-2 ${colors.ring} ${colors.borderStrong}` : 'border-slate-100'}`}> <div className="flex justify-between items-start"> <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? `${colors.bg} text-white` : `${theme.appText}`}`}> {day} </span> </div> <div className="space-y-1 overflow-y-auto max-h-[80px]"> {dayEvents.map(ev => { const hasUnread = ev.unreadBy?.includes(currentUser.id); return ( <div key={ev.id} onClick={(e) => { e.stopPropagation(); openNewEventModal(null, null, ev); }} className={`text-[10px] px-1.5 py-1 rounded border truncate flex flex-col gap-0.5 ${hasUnread ? 'border-l-4 border-l-red-500 bg-red-50' : `${colors.bgLight} ${colors.border}`} ${colors.text}`}> <div className="font-bold">{ev.time} - {ev.endTime}</div> <div className="font-semibold truncate">{ev.title}</div> <div className="truncate opacity-80">{getParticipantNames(ev.participants)}</div> </div> )})} </div> </div> ); })} </div> );  
  };

  const renderTimeView = () => {  
    const daysToShow = viewMode === 'week' ? getWeekDays(currentDate) : [currentDate]; const gridCols = viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-1'; const PIXELS_PER_MINUTE = 48 / 30;  
    return ( <div className="flex flex-col h-full overflow-hidden border border-slate-200 rounded-lg bg-white"> <div className="flex border-b border-slate-200"> <div className="w-16 flex-shrink-0 border-r border-slate-200 bg-slate-50"></div> <div className={`flex-1 grid ${gridCols} divide-x divide-slate-200`}> {daysToShow.map((date, i) => { const isToday = new Date().toDateString() === date.toDateString(); return ( <div key={i} className={`text-center py-3 ${isToday ? colors.bgLight : 'bg-white'}`}> <div className={`text-xs font-semibold uppercase ${isToday ? colors.text : `${theme.appText} opacity-70`}`}> {weekDaysShort[date.getDay() === 0 ? 6 : date.getDay() - 1]} </div> <div className={`text-lg font-bold ${isToday ? colors.text : `${theme.appText}`}`}> {date.getDate()} </div> </div> ); })} </div> </div> <div className="flex-1 overflow-y-auto relative"> <div className="flex"> <div className={`w-16 flex-shrink-0 border-r border-slate-200 bg-slate-50 text-xs ${theme.appText} opacity-70 font-medium`}> {timeSlots.map((time, i) => ( <div key={i} className="h-12 border-b border-slate-200/50 flex items-start justify-center pt-1 relative"> {time.endsWith('00') && <span className="-mt-2.5 bg-slate-50 px-1">{time}</span>} </div> ))} </div> <div className={`flex-1 grid ${gridCols} divide-x divide-slate-200 relative`}> <div className="absolute inset-0 z-0 pointer-events-none w-full"> {timeSlots.map((_, i) => ( <div key={i} className={`h-12 border-b w-full ${i % 2 === 1 ? 'border-slate-100 border-dashed' : 'border-slate-200'}`}></div> ))} </div> {daysToShow.map((date, dayIndex) => { const dateKey = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0]; 
    const rawEvents = filteredEvents.filter(e => e.date === dateKey);  
    const processedEvents = rawEvents.map(ev => ({ ...ev, startMin: getMinutes(ev.time), endMin: getMinutes(ev.endTime || ev.time) })).sort((a, b) => a.startMin - b.startMin); const clusters = []; if (processedEvents.length > 0) { let currentCluster = { events: [processedEvents[0]], end: processedEvents[0].endMin }; for (let i = 1; i < processedEvents.length; i++) { const ev = processedEvents[i]; if (ev.startMin < currentCluster.end) { currentCluster.events.push(ev); currentCluster.end = Math.max(currentCluster.end, ev.endMin); } else { clusters.push(currentCluster); currentCluster = { events: [ev], end: ev.endMin }; } } clusters.push(currentCluster); } const positionedEvents = []; clusters.forEach(cluster => { const count = cluster.events.length; const width = 100 / count; cluster.events.forEach((ev, idx) => { positionedEvents.push({ ...ev, width: width, left: idx * width }); }); }); return ( <div key={dayIndex} className="relative z-10 min-h-full group"> {timeSlots.map((time, slotIndex) => ( <div key={slotIndex} className={`h-12 w-full transition cursor-pointer ${colors.bgLight.replace('bg-','hover:bg-')}/30`} onClick={() => openNewEventModal(dateKey, time)} title={`${time} - Yeni Ekle`} ></div> ))} {positionedEvents.map(ev => { const startMinutes = ev.startMin - 480; if (startMinutes < 0) return null; const topPos = startMinutes * PIXELS_PER_MINUTE; const duration = ev.endMin - ev.startMin; const height = Math.max(duration * PIXELS_PER_MINUTE, 48); const hasUnread = ev.unreadBy?.includes(currentUser.id); return ( <div key={ev.id} className={`absolute rounded border-l-4 p-1 text-[10px] shadow-sm cursor-pointer hover:z-20 hover:shadow-md transition overflow-hidden flex flex-col justify-start ${hasUnread ? 'border-l-red-500 bg-red-50' : `${colors.bgLight} ${colors.borderStrong.replace('border-','border-')}`} ${colors.text}`} style={{ top: `${topPos}px`, height: `${height - 2}px`, left: `${ev.left}%`, width: `${ev.width}%` }} onClick={(e) => { e.stopPropagation(); openNewEventModal(null, null, ev); }}> <div className="font-bold">{ev.time} - {ev.endTime}</div> <div className="font-semibold truncate leading-tight">{ev.title}</div> <div className="truncate opacity-80 leading-tight mt-1">{getParticipantNames(ev.participants)}</div> </div> ); })} </div> ); })} </div> </div> </div> </div> );  
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fadeIn">
      <header className={`flex flex-col md:flex-row items-center justify-between bg-white p-4 shadow-sm rounded-lg border-l-4 ${colors.borderStrong} gap-4`}>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
          <div><h1 className={`text-xl font-bold ${theme.appText} flex items-center gap-2`}><CalendarIcon className={`w-6 h-6 ${colors.text}`} /> Şirket Ajandası</h1><div className={`text-sm ${theme.appText} opacity-70 flex items-center gap-2 mt-1`}><button onClick={handlePrev} className={colors.hoverText}><ChevronLeft className="w-4 h-4"/></button><span className={`font-medium ${theme.appText} w-32 text-center`}>{viewMode === 'month' || viewMode === 'week' ? months[currentDate.getMonth()] : `${currentDate.getDate()} ${months[currentDate.getMonth()]}`} {currentDate.getFullYear()}</span><button onClick={handleNext} className={colors.hoverText}><ChevronRight className="w-4 h-4"/></button><button onClick={handleToday} className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">Bugün</button></div></div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['day', 'week', 'month'].map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition capitalize ${viewMode === m ? `bg-white ${colors.text} shadow-sm` : 'text-slate-500 hover:text-slate-700'}`}
              >
                {m === 'day' ? 'Günlük' : m === 'week' ? 'Haftalık' : 'Aylık'}
              </button>
            ))}
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setOnlyMine(true)}
              className={`px-3 py-1.5 rounded-md font-medium transition ${onlyMine ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sadece Benim
            </button>
            <button
              onClick={() => setOnlyMine(false)}
              className={`px-3 py-1.5 rounded-md font-medium transition ${!onlyMine ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Tüm Etkinlikler
            </button>
          </div>
          <button onClick={() => openNewEventModal()} className={`${colors.bg} ${colors.hoverBg} text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition`}><Plus className="w-4 h-4" /> <span className="hidden sm:inline">Etkinlik Ekle</span></button>
        </div>
      </header>
      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">{viewMode === 'month' ? renderMonthView() : renderTimeView()}</div>
      {showEventModal && (<div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"><div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden max-h-[85vh] flex flex-col"><div className={`${colors.bgLight} p-4 border-b ${colors.border} flex justify-between items-center`}><h3 className={`font-bold ${theme.appText} flex items-center gap-2`}><Clock className="w-5 h-5" /> {editingEvent ? 'Etkinlik Detayı' : 'Yeni Etkinlik Planla'}</h3><button onClick={() => setShowEventModal(false)} className={`${colors.text} hover:opacity-70`}><X className="w-5 h-5"/></button></div><div className="p-6 space-y-4 overflow-y-auto flex-1"><div><label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>Başlık</label><input type="text" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none`} placeholder="Toplantı konusu..." /></div><div className="grid grid-cols-2 gap-4"><div><label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>Tarih</label><input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none`} /></div><div className="grid grid-cols-2 gap-2"><div><label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>Başlangıç</label><input type="time" value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none text-center`} /></div><div><label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>Bitiş</label><input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})} className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none text-center`} /></div></div></div><div><label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>Tür</label><div className="flex gap-2">{['meeting', 'call', 'task'].map(type => (<button key={type} onClick={() => setNewEvent({...newEvent, type})} className={`flex-1 py-2 text-xs font-medium rounded border ${newEvent.type === type ? `${colors.bgLight} ${colors.borderStrong} ${colors.text}` : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{type === 'meeting' ? 'Toplantı' : type === 'call' ? 'Görüşme' : 'Görev'}</button>))}</div></div>
          
          <div>
            <label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-2`}>Katılımcılar</label>
            <div className="relative mb-2"><Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" /><input type="text" placeholder="İsimle ara..." value={participantSearch} onChange={(e) => setParticipantSearch(e.target.value)} className="w-full pl-9 p-2 text-sm border border-slate-200 rounded bg-slate-50 focus:outline-none"/></div>
            <div className="border border-slate-200 rounded-lg max-h-32 overflow-y-auto">{users.filter(u => (u.name.toLowerCase().includes(participantSearch.toLowerCase()) || u.surname.toLowerCase().includes(participantSearch.toLowerCase()))).map(user => (<div key={user.id} onClick={() => toggleParticipant(user.id)} className={`p-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-0 ${newEvent.participants.includes(user.id) ? colors.bgLight : ''}`}><div className="flex items-center gap-2"><div className={`w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600`}>{user.name.charAt(0)}{user.surname.charAt(0)}</div><div className={`text-xs font-medium ${theme.appText}`}>{user.name} {user.surname} {user.id === currentUser.id && '(Sen)'}</div></div><div className={`w-4 h-4 rounded border flex items-center justify-center ${newEvent.participants.includes(user.id) ? `${colors.bg} border-transparent text-white` : 'border-slate-300'}`}>{newEvent.participants.includes(user.id) && <Check className="w-3 h-3" />}</div></div>))}</div>
            <div className="text-xs text-slate-400 mt-1 text-right">{newEvent.participants.length} kişi seçildi</div>
          </div>

          <div><label className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}>Açıklama</label><textarea value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none h-20 resize-none`} placeholder="Detaylar..." ></textarea></div>
          {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
          </div><div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
            {editingEvent && <button onClick={requestDeleteEvent} className="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2.5 rounded-lg font-bold transition">Sil</button>}
            <button onClick={saveEvent} className={`${colors.bg} ${colors.hoverBg} text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-purple-200 transition`}>{editingEvent ? 'Güncelle' : 'Kaydet'}</button></div></div></div>)}
      <ConfirmationModal isOpen={deleteModal.show} onClose={() => setDeleteModal({show:false})} onConfirm={confirmDeleteEvent} title="Etkinlik Sil" message="Bu etkinliği silmek istediğinize emin misiniz?" />
    </div>
  );
};

// ... (HomeView, MessagesView, RawMaterialsView, ProductsView, CostsView aynı kaldı)
const HomeView = ({ currentUser, events, chats, rates, setActivePage, staffCount = 0, productCount = 0, materialCount = 0, unreadNotificationCount = 0 }) => {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme.appColor);

  const unreadMsgCount = chats.filter(c => c.participants.includes(currentUser?.id) && c.unreadBy?.includes(currentUser?.id)).length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = events
    .filter(e => e.participants.includes(currentUser?.id) && e.date >= todayStr)
    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-fadeIn w-full">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className={`text-2xl font-bold ${theme.appText}`}>Hoşgeldin, {currentUser.name}!</h1>
          <p className={`text-sm ${theme.appText} opacity-60 mt-1`}>İşlerinizi organize etmeye hazırsınız.</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-3xl font-light text-slate-300">{new Date().toLocaleDateString('tr-TR', { weekday: 'long' })}</div>
          <div className={`text-sm font-bold ${theme.appText}`}>{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-indigo-500 flex items-center justify-between cursor-pointer hover:shadow-md transition" onClick={() => setActivePage('agenda')}>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase mb-1">Yaklaşan Etkinlik</div>
            <div className="text-2xl font-bold text-slate-800">{upcomingEvents.length}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><CalendarIcon className="w-5 h-5"/></div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500 flex items-center justify-between cursor-pointer hover:shadow-md transition" onClick={() => setActivePage('messages')}>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase mb-1">Okunmamış Mesaj</div>
            <div className="text-2xl font-bold text-slate-800">{unreadMsgCount}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600"><MessageSquare className="w-5 h-5"/></div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase mb-1">Döviz Kurları</div>
            <div className="text-sm font-mono text-slate-600">USD: <span className="text-green-600 font-bold">{rates.USD.toFixed(2)}</span></div>
            <div className="text-sm font-mono text-slate-600">EUR: <span className="text-blue-600 font-bold">{rates.EUR.toFixed(2)}</span></div>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600"><RefreshCw className="w-5 h-5"/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-emerald-500 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase mb-1">Toplam Personel</div>
            <div className="text-2xl font-bold text-slate-800">{staffCount}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><Users className="w-5 h-5"/></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-sky-500 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase mb-1">Toplam Ürün</div>
            <div className="text-2xl font-bold text-slate-800">{productCount}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600"><Package className="w-5 h-5"/></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-amber-500 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase mb-1">Kayıtlı Ham Madde</div>
            <div className="text-2xl font-bold text-slate-800">{materialCount}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><Layers className="w-5 h-5"/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className={`font-bold ${theme.appText} flex items-center gap-2`}><Clock className="w-4 h-4"/> Ajanda Özeti</h3>
            <button onClick={() => setActivePage('agenda')} className="text-xs text-blue-500 hover:underline flex items-center gap-1">Tümü <ArrowRight className="w-3 h-3"/></button>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingEvents.length > 0 ? upcomingEvents.map(ev => (
              <div key={ev.id} className="p-4 hover:bg-slate-50 transition flex gap-3">
                <div className="flex-shrink-0 w-12 text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase">{new Date(ev.date).toLocaleDateString('tr-TR', {month: 'short'})}</div>
                  <div className={`text-lg font-bold ${colors.text}`}>{new Date(ev.date).getDate()}</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-700 text-sm">{ev.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{ev.time} - {ev.endTime}</div>
                </div>
              </div>
            )) : <div className="p-8 text-center text-slate-400 text-sm">Yaklaşan etkinlik yok.</div>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className={`font-bold ${theme.appText} flex items-center gap-2`}><Package className="w-4 h-4"/> Hızlı İşlemler</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <button onClick={() => setActivePage('raw_materials')} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-100 group">
              <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition ${colors.text}`}><LayoutDashboard className="w-5 h-5"/></div>
              <span className="text-xs font-bold text-slate-600">Stok Ekle</span>
            </button>
            <button onClick={() => setActivePage('products')} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-100 group">
              <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition ${colors.text}`}><Package className="w-5 h-5"/></div>
              <span className="text-xs font-bold text-slate-600">Reçete Hazırla</span>
            </button>
            <button onClick={() => setActivePage('costs')} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-100 group">
              <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition ${colors.text}`}><Wallet className="w-5 h-5"/></div>
              <span className="text-xs font-bold text-slate-600">Maliyet Hesapla</span>
            </button>
            <button onClick={() => setActivePage('messages')} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-100 group">
              <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition ${colors.text}`}><MessageSquare className="w-5 h-5"/></div>
              <span className="text-xs font-bold text-slate-600">Mesaj Gönder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessagesView = ({ currentUser, users, chats, setChats, authToken }) => {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme.appColor);
  const [activeChat, setActiveChat] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newChatData, setNewChatData] = useState({ subject: '', selectedUsers: [] });
  const [previewFile, setPreviewFile] = useState(null);
  const [onlyMyChats, setOnlyMyChats] = useState(false);
  const [participantFilter, setParticipantFilter] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat, chats]);

  const handleCreateChat = async () => {
    if (!newChatData.subject) {
      console.error('Lütfen sohbet konusu giriniz.');
      return;
    }
    if (newChatData.selectedUsers.length === 0) {
      console.error('Lütfen en az bir kişi seçiniz.');
      return;
    }

    const payload = {
      subject: newChatData.subject,
      participants: newChatData.selectedUsers,
    };

    try {
      const res = await fetch('http://localhost:4000/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error('Sohbet oluşturulamadı');
        return;
      }
      const created = await res.json();
      setChats([created, ...chats]);
      setActiveChat(created.id);
      setShowNewChatModal(false);
      setNewChatData({ subject: '', selectedUsers: [] });
    } catch (err) {
      console.error('Sohbet oluşturulurken hata oluştu:', err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      let fileType = 'file';
      if (file.type.startsWith('image/')) fileType = 'image';
      else if (file.type === 'application/pdf') fileType = 'pdf';

      const sendFileMessage = async () => {
        if (!activeChat) return;
        try {
          const res = await fetch(`http://localhost:4000/api/chats/${activeChat}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify({
              text: file.name,
              fileUrl: ev.target.result,
              fileType,
              fileName: file.name,
            }),
          });
          if (!res.ok) {
            console.error('Dosya mesajı gönderilemedi');
            return;
          }
          const updatedChat = await res.json();
          setChats((prev) => prev.map((c) => (c.id === updatedChat.id ? updatedChat : c)));
        } catch (err) {
          console.error('Dosya mesajı gönderilirken hata oluştu:', err);
        }
      };

      sendFileMessage();
    };

    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChat) return;
    try {
      const res = await fetch(`http://localhost:4000/api/chats/${activeChat}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ text: messageInput }),
      });
      if (!res.ok) {
        console.error('Mesaj gönderilemedi');
        return;
      }
      const updatedChat = await res.json();
      setChats((prev) => prev.map((c) => (c.id === updatedChat.id ? updatedChat : c)));
      setMessageInput('');
    } catch (err) {
      console.error('Mesaj gönderilirken hata oluştu:', err);
    }
  };

  const handleOpenChat = async (chatId) => {
    setActiveChat(chatId);
    try {
      const res = await fetch(`http://localhost:4000/api/chats/${chatId}/read`, {
        method: 'PUT',
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });
      if (!res.ok) {
        console.error('Okundu bilgisi güncellenemedi');
        return;
      }
      const updatedChat = await res.json();
      setChats((prev) => prev.map((c) => (c.id === updatedChat.id ? updatedChat : c)));
    } catch (err) {
      console.error('Sohbet açılırken hata oluştu:', err);
    }
  };

  const toggleUserSelection = (userId) => {
    setNewChatData((prev) => {
      const isSelected = prev.selectedUsers.includes(userId);
      if (isSelected) {
        return {
          ...prev,
          selectedUsers: prev.selectedUsers.filter((id) => id !== userId),
        };
      }
      return { ...prev, selectedUsers: [...prev.selectedUsers, userId] };
    });
  };

  let userChats = chats.filter((chat) => chat.participants.includes(currentUser.id));

  if (onlyMyChats) {
    userChats = userChats.filter((chat) => (chat.messages || []).some((m) => m.senderId === currentUser.id));
  }

  if (participantFilter) {
    userChats = userChats.filter((chat) => chat.participants.includes(participantFilter));
  }

  const activeChatData = userChats.find((c) => c.id === activeChat);

  return (
    <div className="h-full flex flex-col animate-fadeIn relative">
      <header
        className={`flex items-center justify-between bg-white p-4 shadow-sm rounded-lg border-l-4 ${colors.borderStrong} mb-4`}
      >
        <div>
          <h1 className={`text-2xl font-bold ${theme.appText} flex items-center gap-2`}>
            <MessageSquare className={`w-6 h-6 ${colors.text}`} /> Mesajlar
          </h1>
          <p className={`text-sm ${theme.appText} opacity-70`}>Ekip içi iletişim ve sohbetler</p>
        </div>
        <button
          onClick={() => setShowNewChatModal(true)}
          className={`${colors.bg} ${colors.hoverBg} text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-sm`}
        >
          <Plus className="w-5 h-5" /> Yeni Sohbet Başlat
        </button>
      </header>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex">
        <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative mb-2">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Sohbet ara... (başlık)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 bg-slate-50"
              />
            </div>
            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOnlyMyChats(false)}
                  className={`px-2 py-1 rounded ${!onlyMyChats ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100'}`}
                >
                  Tüm Sohbetler
                </button>
                <button
                  onClick={() => setOnlyMyChats(true)}
                  className={`px-2 py-1 rounded ${onlyMyChats ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100'}`}
                >
                  Sadece Benim
                </button>
              </div>
              <select
                value={participantFilter}
                onChange={(e) => setParticipantFilter(e.target.value)}
                className="border border-slate-200 rounded px-2 py-1 bg-slate-50 text-[11px]"
              >
                <option value="">Tüm Kişiler</option>
                {users
                  .filter((u) => u.id !== currentUser.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.surname}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {userChats.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Henüz sohbet yok.</div>
            ) : (
              userChats
                .filter((chat) => chat.subject.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((chat) => {
                  const hasUnread = chat.unreadBy?.includes(currentUser.id);
                  const lastMsg = chat.messages?.[chat.messages.length - 1];
                  return (
                    <div
                      key={chat.id}
                      onClick={() => handleOpenChat(chat.id)}
                      className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-white transition flex justify-between items-start ${
                        activeChat === chat.id
                          ? `bg-white border-l-4 ${colors.borderStrong} shadow-sm`
                          : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h3
                            className={`font-bold text-sm ${theme.appText} truncate ${
                              hasUnread ? 'font-extrabold' : ''
                            }`}
                          >
                            {chat.subject}
                          </h3>
                          <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                            {lastMsg ? lastMsg.time : 'Yeni'}
                          </span>
                        </div>
                        <p
                          className={`text-xs truncate ${
                            hasUnread ? 'font-semibold text-slate-800' : 'text-slate-500'
                          }`}
                        >
                          {lastMsg
                            ? lastMsg.fileUrl
                              ? '📎 Dosya Eki'
                              : lastMsg.text
                            : 'Mesaj yok...'}
                        </p>
                      </div>
                      {hasUnread && (
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full ml-2 mt-1.5 shadow-sm flex-shrink-0" />
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>

        <div className="w-2/3 flex flex-col bg-white">
          {activeChatData ? (
            <>
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className={`font-bold ${theme.appText}`}>{activeChatData.subject}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {activeChatData.participants.length} Katılımcı
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {activeChatData.messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  const sender = users.find((u) => u.id === msg.senderId);
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] ${
                          isMe
                            ? `${colors.bg} text-white rounded-tl-2xl rounded-bl-2xl rounded-br-lg`
                            : 'bg-white border border-slate-200 rounded-tr-2xl rounded-br-2xl rounded-bl-lg'
                        } p-3 shadow-sm`}
                      >
                        {!isMe && (
                          <div className="text-[10px] font-bold text-slate-500 mb-1">
                            {sender ? `${sender.name} ${sender.surname}` : 'Bilinmiyor'}
                          </div>
                        )}
                        {msg.fileUrl ? (
                          msg.fileType === 'image' ? (
                            <div className="mb-1 relative group">
                              <img
                                src={msg.fileUrl}
                                alt="attachment"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                <button
                                  onClick={() =>
                                    setPreviewFile({
                                      url: msg.fileUrl,
                                      type: 'image',
                                      fileName: msg.fileName,
                                    })
                                  }
                                  className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white transition"
                                  title="Göster"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <a
                                  href={msg.fileUrl}
                                  download={msg.fileName || 'image.png'}
                                  className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white transition"
                                  title="İndir"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          ) : msg.fileType === 'pdf' ? (
                            <div className="mb-1 relative group h-32 w-48 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center p-2">
                              <FileText className="w-12 h-12 text-red-500 mb-2" />
                              <div className="text-[10px] text-slate-500 font-medium truncate w-full text-center">
                                {msg.fileName}
                              </div>
                              <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                <button
                                  onClick={() =>
                                    setPreviewFile({
                                      url: msg.fileUrl,
                                      type: 'pdf',
                                      fileName: msg.fileName,
                                    })
                                  }
                                  className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white transition"
                                  title="Göster"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <a
                                  href={msg.fileUrl}
                                  download={msg.fileName || 'document.pdf'}
                                  className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white transition"
                                  title="İndir"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`flex items-center gap-2 p-2 rounded bg-white/20 border border-white/10 mb-1 ${
                                isMe ? 'text-white' : 'text-slate-700 bg-slate-100 border-slate-200'
                              }`}
                            >
                              <FileText className="w-8 h-8" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold truncate">{msg.fileName}</div>
                                <a
                                  href={msg.fileUrl}
                                  download={msg.fileName}
                                  className="text-[10px] underline opacity-80 hover:opacity-100"
                                >
                                  İndir
                                </a>
                              </div>
                            </div>
                          )
                        ) : (
                          <p className="text-sm">{msg.text}</p>
                        )}
                        <div
                          className={`text-[10px] text-right mt-1 ${
                            isMe ? 'text-white/70' : 'text-slate-400'
                          }`}
                        >
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
                    title="Dosya Ekle"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Bir mesaj yazın..."
                    className={`flex-1 p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 ${colors.ring} bg-slate-50`}
                  />
                  <button
                    onClick={handleSendMessage}
                    className={`${colors.bg} ${colors.hoverBg} text-white p-3 rounded-lg transition shadow-sm`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p>Bir sohbet seçin veya yeni bir tane başlatın.</p>
            </div>
          )}
        </div>
      </div>

      {previewFile && (
        <div
          className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPreviewFile(null)}
        >
          <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center">
            <div className="absolute top-0 right-0 flex gap-2 z-50 p-4">
              <a
                href={previewFile.url}
                download={previewFile.fileName || 'file'}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
              >
                <Download className="w-6 h-6" />
              </a>
              <button
                onClick={() => setPreviewFile(null)}
                className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {previewFile.type === 'image' ? (
              <img
                src={previewFile.url}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : previewFile.type === 'pdf' ? (
              <iframe
                src={previewFile.url}
                className="w-full h-full bg-white rounded shadow-2xl border-none"
                onClick={(e) => e.stopPropagation()}
              ></iframe>
            ) : (
              <div className="text-white text-center">
                <FileText className="w-24 h-24 mx-auto mb-4 opacity-50" />
                <p>Önizleme yapılamıyor.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div
              className={`${colors.bgLight} p-4 border-b ${colors.border} flex justify-between items-center`}
            >
              <h3 className={`font-bold ${theme.appText} flex items-center gap-2`}>
                <UserPlus className="w-5 h-5" /> Yeni Sohbet Başlat
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className={`${colors.text} hover:opacity-70`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label
                  className={`block text-xs font-bold ${theme.appText} opacity-60 mb-1`}
                >
                  Sohbet Konusu
                </label>
                <input
                  type="text"
                  value={newChatData.subject}
                  onChange={(e) =>
                    setNewChatData({ ...newChatData, subject: e.target.value })
                  }
                  className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none`}
                  placeholder="Örn: Pazarlama Ekibi"
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-bold ${theme.appText} opacity-60 mb-2`}
                >
                  Kişi Ekle
                </label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="İsimle ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 p-2 text-sm border border-slate-200 rounded bg-slate-50 focus:outline-none"
                  />
                </div>
                <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                  {users
                    .filter(
                      (u) =>
                        u.id !== currentUser.id &&
                        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.surname.toLowerCase().includes(searchTerm.toLowerCase())),
                    )
                    .map((user) => (
                      <div
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={`p-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-0 ${
                          newChatData.selectedUsers.includes(user.id)
                            ? colors.bgLight
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {user.name.charAt(0)}
                            {user.surname.charAt(0)}
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${theme.appText}`}>
                              {user.name} {user.surname}
                            </div>
                            <div className="text-[10px] text-slate-400">{user.email}</div>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            newChatData.selectedUsers.includes(user.id)
                              ? `${colors.bg} border-transparent text-white`
                              : 'border-slate-300'
                          }`}
                        >
                          {newChatData.selectedUsers.includes(user.id) && (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="text-xs text-slate-400 mt-1 text-right">
                  {newChatData.selectedUsers.length} kişi seçildi
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={handleCreateChat}
                className={`w-full ${colors.bg} ${colors.hoverBg} text-white py-2.5 rounded-lg font-bold shadow-sm transition`}
              >
                Sohbeti Başlat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- ALT BİLEŞEN: HAM MADDE GİRİŞ EKRANI ---
const RawMaterialsView = ({ savedItems, setSavedItems, rates, authToken }) => {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme.appColor);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const initialFormState = {
    name: '',
    unit: 'Adet',
    width: 0,
    height: 0,
    currency: 'TL',
    price: 0
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!amount) return 0;
    
    let amountInTL = 0;
    if (fromCurrency === 'TL') amountInTL = amount;
    else if (fromCurrency === 'USD') amountInTL = amount * rates.USD;
    else if (fromCurrency === 'EUR') amountInTL = amount * rates.EUR;

    if (toCurrency === 'TL') return amountInTL;
    if (toCurrency === 'USD') return amountInTL / rates.USD;
    if (toCurrency === 'EUR') return amountInTL / rates.EUR;
    return 0;
  };

  const calculateArea = () => {
    // Alanı cm^2 cinsinden hesapla
    if (formData.unit === 'Metre' && formData.width > 0 && formData.height > 0) {
      return formData.width * formData.height;
    }
    return 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'width' || name === 'height' ? (value === '' ? 0 : parseFloat(value)) : value
    }));
  };

  const handleEditClick = (item) => {
    setFormData({
      name: item.name,
      unit: item.unit,
      width: item.width || 0,
      height: item.height || 0,
      currency: item.currency,
      price: item.price
    });
    setEditingId(item.id);
  };

  const handleCancelEdit = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.name || formData.price <= 0) {
      // alert yerine konsola hata basabiliriz veya Toast/Modal kullanabiliriz.
      console.error("Lütfen ürün ismi ve geçerli bir fiyat giriniz.");
      return;
    }

    const area = calculateArea();
    
    const calculatedData = {
      area: area,
      calculatedPrices: {
        TL: convertCurrency(formData.price, formData.currency, 'TL'),
        USD: convertCurrency(formData.price, formData.currency, 'USD'),
        EUR: convertCurrency(formData.price, formData.currency, 'EUR')
      },
      costPerCm2: area > 0 ? {
        TL: convertCurrency(formData.price, formData.currency, 'TL') / area,
        USD: convertCurrency(formData.price, formData.currency, 'USD') / area,
        EUR: convertCurrency(formData.price, formData.currency, 'EUR') / area
      } : null
    };

    const payload = {
      ...formData,
      ...calculatedData,
    };

    const saveMaterial = async () => {
      try {
        if (editingId) {
          const res = await fetch(`http://localhost:4000/api/materials/${editingId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            console.error('Malzeme güncellenemedi');
            return;
          }
          const updated = await res.json();
          setSavedItems(savedItems.map(item => item.id === editingId ? updated : item));
          setEditingId(null);
        } else {
          const res = await fetch('http://localhost:4000/api/materials', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            console.error('Malzeme kaydedilemedi');
            return;
          }
          const created = await res.json();
          setSavedItems([created, ...savedItems]);
        }
        setFormData(initialFormState);
      } catch (err) {
        console.error('Malzeme kaydedilirken hata oluştu:', err);
      }
    };

    saveMaterial();
  };

  const requestDelete = (id) => {
    setConfirmationMessage(`"${savedItems.find(i => i.id === id)?.name}" isimli kaydı silmek istediğinize emin misiniz?`);
    setDeleteModal({ show: true, id });
  };
  
  const confirmDelete = () => {
    const doDelete = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/materials/${deleteModal.id}`, {
          method: 'DELETE',
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
        if (!res.ok && res.status !== 404) {
          console.error('Malzeme silinemedi');
          return;
        }
        setSavedItems(savedItems.filter(item => item.id !== deleteModal.id));
        if (editingId === deleteModal.id) handleCancelEdit();
        setDeleteModal({ show: false, id: null });
      } catch (err) {
        console.error('Malzeme silinirken hata oluştu:', err);
      }
    };

    doDelete();
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full">
       <header className={`flex items-center justify-between bg-white p-4 shadow-sm rounded-lg border-l-4 ${colors.borderStrong} w-full`}>
        <div>
          <h1 className={`text-2xl font-bold ${theme.appText} flex items-center gap-2`}>
            <LayoutDashboard className={`w-6 h-6 ${colors.text}`} />
            Ham Madde Yönetimi
          </h1>
          <p className={`text-sm ${theme.appText} opacity-60`}>Stok kartı oluşturma ve düzenleme ekranı</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <div className="lg:col-span-1 space-y-6">
          <div className={`p-6 rounded-xl shadow-sm border transition-colors duration-300 ${editingId ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2 ${editingId ? 'text-orange-700' : `${theme.appText}`}`}>
              {editingId ? <Edit2 className="w-5 h-5" /> : <Settings className={`w-5 h-5 ${colors.text}`} />}
              {editingId ? 'Kaydı Düzenle' : 'Yeni Tanımlama'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme.appText} mb-1`}>Ürün İsmi</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Örn: 18mm MDF Lam" className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none`} />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme.appText} mb-1`}>Birim</label>
                <select name="unit" value={formData.unit} onChange={handleInputChange} className={`w-full p-2 border border-slate-300 rounded focus:ring-2 ${colors.ring} focus:outline-none bg-white`}>
                  <option value="Adet">Adet</option>
                  <option value="Metre">Metre</option>
                </select>
              </div>

              {formData.unit === 'Metre' && (
                <div className={`grid grid-cols-2 gap-4 ${colors.bgLight} p-3 rounded-lg border ${colors.border}`}>
                  <div>
                    <label className={`block text-xs font-medium ${colors.text} mb-1`}>En (cm)</label>
                    <input type="number" name="width" value={formData.width === 0 ? '' : formData.width} onChange={handleInputChange} className={`w-full p-2 border ${colors.border} rounded text-center`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium ${colors.text} mb-1`}>Boy (cm)</label>
                    <input type="number" name="height" value={formData.height === 0 ? '' : formData.height} onChange={handleInputChange} className={`w-full p-2 border ${colors.border} rounded text-center`} />
                  </div>
                  <div className={`col-span-2 text-center text-xs ${colors.text} font-semibold`}>
                    Alan: {calculateArea().toLocaleString()} cm²
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className={`block text-sm font-medium ${theme.appText} mb-1`}>Para Birimi</label>
                  <select name="currency" value={formData.currency} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none bg-white font-bold text-slate-700">
                    <option value="TL">₺ TL</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={`block text-sm font-medium ${theme.appText} mb-1`}>Birim Fiyat</label>
                  <input type="number" name="price" value={formData.price === 0 ? '' : formData.price} onChange={handleInputChange} placeholder="0.00" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none text-right font-mono" />
                </div>
              </div>

              <div className="mt-4 bg-slate-800 text-slate-100 p-4 rounded-lg text-sm space-y-2">
                <div className="flex justify-between border-b border-slate-600 pb-2 mb-2">
                  <span className="text-slate-400">Canlı Çeviri:</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-xs text-slate-400">TL</div><div className="font-mono">{convertCurrency(formData.price, formData.currency, 'TL').toFixed(2)} ₺</div></div>
                  <div><div className="text-xs text-slate-400">USD</div><div className="font-mono">{convertCurrency(formData.price, formData.currency, 'USD').toFixed(2)} $</div></div>
                  <div><div className="text-xs text-slate-400">EUR</div><div className="font-mono">{convertCurrency(formData.price, formData.currency, 'EUR').toFixed(2)} €</div></div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {editingId && (
                  <button onClick={handleCancelEdit} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                    <X className="w-5 h-5" /> İptal
                  </button>
                )}
                <button onClick={handleSave} className={`flex-1 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : `${colors.bg} ${colors.hoverBg}`} text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2`}>
                  <Save className="w-5 h-5" /> {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2 ${theme.appText}`}>
              <Layers className={`w-5 h-5 ${theme.appText} opacity-60`} />
              Kayıtlı Stok Kartları
            </h2>
            {savedItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <p>Henüz kayıt bulunmamaktadır.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 uppercase text-xs font-semibold">
                    <tr>
                      <th className={`px-4 py-3 rounded-l-lg ${theme.appText}`}>Ürün / Tarih</th>
                      <th className={`px-4 py-3 ${theme.appText}`}>Özellikler</th>
                      <th className={`px-4 py-3 text-right ${theme.appText}`}>Fiyat (TL)</th>
                      <th className={`px-4 py-3 text-right ${theme.appText}`}>Fiyat (USD)</th>
                      <th className={`px-4 py-3 text-right ${theme.appText}`}>cm² (TL)</th>
                      <th className={`px-4 py-3 rounded-r-lg w-24 text-center ${theme.appText}`}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {savedItems.map((item) => (
                      <tr key={item.id} className={`hover:bg-slate-50 transition ${editingId === item.id ? 'bg-orange-50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className={`font-medium ${theme.appText}`}>{item.name}</div>
                          <div className={`text-xs ${theme.appText} opacity-60 flex items-center gap-1 mt-1`}>
                              <Clock className="w-3 h-3" /> {formatDate(item.updatedDate)}
                              {item.updatedDate !== item.createdDate && <span className="text-orange-400 ml-1">(Düz.)</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs ${item.unit === 'Metre' ? `${colors.bgLight} ${colors.text}` : 'bg-green-100 text-green-700'}`}>
                            {item.unit}
                          </span>
                          {item.unit === 'Metre' && (
                            <div className="text-xs text-slate-500 mt-1">{item.width}x{item.height} cm ({item.area} cm²)</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">{item.calculatedPrices.TL.toFixed(2)} ₺</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">{item.calculatedPrices.USD.toFixed(2)} $</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-slate-500">{item.costPerCm2 ? item.costPerCm2.TL.toFixed(5) : '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => handleEditClick(item)} className={`${colors.text} ${colors.hoverText} p-1.5 hover:bg-slate-50 rounded transition`}><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => requestDelete(item.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal 
        isOpen={deleteModal.show} 
        onClose={() => setDeleteModal({show:false})} 
        onConfirm={confirmDelete} 
        title="Ham Madde Sil" 
        message={confirmationMessage}
      />
    </div>
  );
};

// --- ALT BİLEŞEN: ÜRÜNLER EKRANI ---
const ProductsView = ({ savedItems, rates, products, setProducts, authToken }) => {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme.appColor);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);  
  const [editingProduct, setEditingProduct] = useState(null);  
  
  const [newProduct, setNewProduct] = useState({ name: '', description: '', salePrice: '' });
  const [recipe, setRecipe] = useState({});
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [confirmationMessage, setConfirmationMessage] = useState('');


  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!amount) return 0;
    
    let amountInTL = 0;
    if (fromCurrency === 'TL') amountInTL = amount;
    else if (fromCurrency === 'USD') amountInTL = amount * rates.USD;
    else if (fromCurrency === 'EUR') amountInTL = amount * rates.EUR;

    if (toCurrency === 'TL') return amountInTL;
    if (toCurrency === 'USD') return amountInTL / rates.USD;
    if (toCurrency === 'EUR') return amountInTL / rates.EUR;
    return 0;
  };

  const calculateTotalCost = (productMaterials) => {
    let totalTL = 0;
    productMaterials.forEach(material => {
      // Malzemeyi savedItems'tan bul (güncel fiyat ve özellikler için)
      const currentItem = savedItems.find(i => i.id === material.id) || material; 

      // Fiyatı TL'ye çevir
      let unitPriceTL = convertCurrency(currentItem.price, currentItem.currency, 'TL');

      let costInTL = 0;
      if (currentItem.unit === 'Metre' && currentItem.area > 0) {
        const costPerCm2 = unitPriceTL / currentItem.area;
        costInTL = costPerCm2 * material.usedQuantity;
      } else {
        costInTL = unitPriceTL * material.usedQuantity;
      }
      totalTL += costInTL;
    });
    return { TL: totalTL, USD: totalTL / rates.USD, EUR: totalTL / rates.EUR };
  };

  const handleSaveProduct = () => {
    if (!newProduct.name) {
      alert('Lütfen ürün ismi giriniz.');
      console.error('Ürün ismi giriniz');
      return;
    }

    const selectedMaterials = Object.entries(recipe)
      .map(([id, quantity]) => {
        const material = savedItems.find(item => String(item.id) === String(id));
        if (!material) return null;
        return {
          // Reçeteye sadece ID ve kullanılan miktarı kaydedip, diğer bilgileri (isim, birim vb.)
          // dinamik olarak çekmek daha iyi bir mimari olacaktır.
          // Ancak mevcut data yapısını koruyarak ilerleyelim:
          ...material,
          usedQuantity: quantity,
        };
      })
      .filter(item => item && item.usedQuantity > 0);

    if (selectedMaterials.length === 0) {
      alert('Lütfen reçeteye en az bir malzeme ekleyip miktar giriniz.');
      console.error('Lütfen reçeteye en az bir malzeme ekleyiniz.');
      return;
    }

    const payload = {
      name: newProduct.name,
      description: newProduct.description,
      salePrice: newProduct.salePrice ? parseFloat(newProduct.salePrice) : 0,
      materials: selectedMaterials,
    };

    const saveProduct = async () => {
      try {
        if (editingProduct) {
          const res = await fetch(`http://localhost:4000/api/products/${editingProduct.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            alert(data.message || 'Ürün güncellenemedi.');
            console.error('Ürün güncellenemedi');
            return;
          }
          const updated = await res.json();
          setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
          setEditingProduct(null);
        } else {
          const res = await fetch('http://localhost:4000/api/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            alert(data.message || 'Ürün kaydedilemedi.');
            console.error('Ürün kaydedilemedi');
            return;
          }
          const created = await res.json();
          setProducts(prev => [created, ...prev]);
        }

        setNewProduct({ name: '', description: '', salePrice: '' });
        setRecipe({});
        setShowCreateForm(false);
      } catch (err) {
        console.error('Ürün kaydedilirken hata oluştu:', err);
      }
    };

    saveProduct();
  };

  const handleEditProductClick = (product) => {
    setNewProduct({
      name: product.name,
      description: product.description,
      salePrice: product.salePrice != null ? product.salePrice : '',
    });
    const currentRecipe = {};
    product.materials.forEach(m => { currentRecipe[m.id] = m.usedQuantity; });
    setRecipe(currentRecipe);
    setEditingProduct(product);
    setShowCreateForm(true);
    setSelectedProduct(null);
  };

  const requestDeleteProduct = (id) => {
    setConfirmationMessage(`"${products.find(p => p.id === id)?.name}" isimli ürünü silmek istediğinize emin misiniz?`);
    setDeleteModal({ show: true, id });
  };
  
  const confirmDeleteProduct = () => {
    const doDelete = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/products/${deleteModal.id}`, {
          method: 'DELETE',
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
        if (!res.ok && res.status !== 404) {
          console.error('Ürün silinemedi');
          return;
        }
        setProducts(prev => prev.filter(p => p.id !== deleteModal.id));
        setDeleteModal({ show: false, id: null });
      } catch (err) {
        console.error('Ürün silinirken hata oluştu:', err);
      }
    };

    doDelete();
  };

  const toggleMaterial = (id) => {
    setRecipe(prev => {
        const newState = { ...prev };
        if (newState[id] !== undefined) delete newState[id];
        else newState[id] = 0;
        return newState;
    });
  };

  const updateQuantity = (id, val) => {
    setRecipe(prev => ({ ...prev, [id]: parseFloat(val) || 0 }));
  };
  
  // Malzeme listesini arama/filtreleme için state
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const filteredMaterials = savedItems.filter(item => 
    item.name.toLowerCase().includes(materialSearchTerm.toLowerCase())
  );
  
  // Anlık maliyet hesaplama: mevcut recipe'den geçici ürün maliyeti
  const currentRecipeMaterials = Object.entries(recipe)
    .map(([id, quantity]) => {
      const material = savedItems.find(item => String(item.id) === String(id));
      if (!material) return null;
      return {
        ...material,
        usedQuantity: quantity,
      };
    })
    .filter(item => item && item.usedQuantity > 0);

  const currentRecipeTotals = currentRecipeMaterials.length > 0
    ? calculateTotalCost(currentRecipeMaterials)
    : null;

  // Formu açıp kaparken temizleme işlemleri
  const handleToggleForm = () => {
    if (showCreateForm) {
      setEditingProduct(null);
      setNewProduct({ name: '', description: '', salePrice: '' });
      setRecipe({});
    }
    setShowCreateForm(!showCreateForm);
  };


  return (
    <div className="space-y-6 animate-fadeIn relative w-full">
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{selectedProduct.name}</h2>
                        <p className="text-slate-500 mt-1">{selectedProduct.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { handleEditProductClick(selectedProduct); }} className={`${colors.bg} ${colors.hoverBg} text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2`}><Edit2 className="w-4 h-4" /> Düzenle</button>
                        <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-slate-100 rounded-full transition bg-slate-50"><X className="w-6 h-6 text-slate-400" /></button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    <table className="w-full text-sm text-left border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-50 text-slate-600 font-semibold">
                            <tr>
                                <th className="px-4 py-3">Malzeme</th>
                                <th className="px-4 py-3">Birim Fiyat</th>
                                <th className="px-4 py-3">Kullanılan Miktar</th>
                                <th className={`px-4 py-3 text-right ${colors.bgLight} ${colors.text.replace('-600','-900')}`}>Maliyet (TL)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {selectedProduct.materials.map((mat, idx) => {
                                // Güncel ham madde bilgilerini (özellikle alanı) savedItems'tan çekiyoruz.
                                const currentItem = savedItems.find(i => i.id === mat.id) || mat;
                                
                                let unitPriceTL = convertCurrency(currentItem.price, currentItem.currency, 'TL');
                                
                                let rowCost = 0;
                                let usageUnit = 'Adet';

                                if(currentItem.unit === 'Metre' && currentItem.area > 0) {
                                  rowCost = (unitPriceTL / currentItem.area) * mat.usedQuantity;
                                  usageUnit = 'cm²';
                                } else {
                                  rowCost = unitPriceTL * mat.usedQuantity;
                                }

                                return (
                                    <tr key={idx}>
                                        <td className="px-4 py-3"><div className="font-medium text-slate-800">{mat.name}</div><div className="text-xs text-slate-400">({currentItem.unit} - {currentItem.currency})</div></td>
                                        <td className="px-4 py-3 font-mono text-slate-600">{currentItem.price.toFixed(2)} {currentItem.currency}</td>
                                        <td className="px-4 py-3"><span className="font-bold text-slate-700">{mat.usedQuantity}</span><span className="text-xs text-slate-500 ml-1">{usageUnit}</span></td>
                                        <td className={`px-4 py-3 text-right font-mono font-medium ${colors.bgLight}/50`}>{rowCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 p-6 border-t border-slate-200">
                   <div className="flex gap-4 justify-end">
                            {(() => {
                                const totals = calculateTotalCost(selectedProduct.materials);
                                return (
                                    <>
                                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-center"><div className="text-xs text-slate-400 mb-1">Toplam (USD)</div><div className="font-bold text-green-600 font-mono text-lg">{totals.USD.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</div></div>
                                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-center"><div className="text-xs text-slate-400 mb-1">Toplam (EUR)</div><div className="font-bold text-blue-600 font-mono text-lg">{totals.EUR.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}</div></div>
                                        <div className={`${colors.bg} px-6 py-2 rounded-lg shadow-md text-center text-white`}><div className="text-xs text-white/70 mb-1">Toplam Maliyet (TL)</div><div className="font-bold font-mono text-2xl">{totals.TL.toLocaleString('tr-TR', {style: 'currency', currency: 'TRY'})}</div></div>
                                    </>
                                );
                            })()}
                        </div>
                </div>
            </div>
        </div>
      )}

      <header className={`flex items-center justify-between bg-white p-4 shadow-sm rounded-lg border-l-4 ${colors.borderStrong} w-full`}>
        <div><h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Package className={`w-6 h-6 ${colors.text}`} /> Ürün Yönetimi</h1><p className="text-sm text-slate-500">Üretim reçeteleri ve maliyet analizleri</p></div>
        <button onClick={handleToggleForm} className={`${showCreateForm ? 'bg-red-50 text-red-600 hover:bg-red-100' : `${colors.bg} ${colors.hoverBg} text-white`} px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-sm`}>{showCreateForm ? <X className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} {showCreateForm ? 'İptal Et' : 'Yeni Ürün Oluştur'}</button>
      </header>

      {showCreateForm && (
        <div className={`${colors.bgLight} border ${colors.border} rounded-xl p-6 animate-fadeIn w-full`}>
            <div className={`flex items-center gap-2 mb-4 ${colors.text.replace('-600','-800')} border-b ${colors.border} pb-2`}><FileText className="w-5 h-5" /><h3 className="font-semibold">{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Reçetesi Oluştur'}</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div><label className="block text-sm font-medium text-slate-900 mb-1">Ürün Adı</label><input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className={`w-full p-2 border border-slate-200 rounded focus:outline-none focus:ring-2 ${colors.ring} bg-white`} placeholder="Örn: Yemek Masası" /></div>
                <div className="md:col-span-1"><label className="block text-sm font-medium text-slate-900 mb-1">Açıklama</label><input type="text" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className={`w-full p-2 border border-slate-200 rounded focus:outline-none focus:ring-2 ${colors.ring} bg-white`} placeholder="Örn: 6 Kişilik Standart" /></div>
                <div><label className="block text-sm font-medium text-slate-900 mb-1">Satış Fiyatı (TL)</label><input type="number" min="0" step="0.01" value={newProduct.salePrice} onChange={(e) => setNewProduct({...newProduct, salePrice: e.target.value})} className={`w-full p-2 border border-slate-200 rounded focus:outline-none focus:ring-2 ${colors.ring} bg-white`} placeholder="0.00" /></div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className={`bg-slate-100 px-4 py-2 font-semibold text-slate-800 text-sm flex justify-between items-center`}><span>Reçete Malzemeleri</span><span className="text-xs font-normal opacity-70">Listeden kullanılacak malzemeleri seçiniz</span></div>
                {savedItems.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">Kayıtlı ham madde bulunamadı.</div> : (
                    <>
                        <div className="p-3 border-b border-slate-100">
                            <div className="relative"><Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" /><input type="text" placeholder="Malzeme ara..." value={materialSearchTerm} onChange={(e) => setMaterialSearchTerm(e.target.value)} className="w-full pl-9 p-2 text-sm border border-slate-200 rounded bg-slate-50 focus:outline-none"/></div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white text-slate-500 sticky top-0 border-b border-slate-100"><tr><th className="px-4 py-2 w-10">Seç</th><th className="px-4 py-2">Malzeme Adı</th><th className="px-4 py-2">Birim</th><th className="px-4 py-2 w-48">Kullanım Miktarı</th></tr></thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredMaterials.map(item => {
                                        const isChecked = recipe[item.id] !== undefined;
                                        const usageUnit = item.unit === 'Metre' ? 'cm²' : 'Adet';
                                        return (
                                            <tr key={item.id} className={`hover:bg-slate-50 transition ${isChecked ? `${colors.bgLight}/50` : ''}`}>
                                                <td className="px-4 py-3 text-center"><button onClick={() => toggleMaterial(item.id)} className={`w-5 h-5 rounded border flex items-center justify-center transition ${isChecked ? `${colors.bg} ${colors.borderStrong} text-white` : 'border-slate-300 text-transparent hover:border-slate-400'}`}><CheckSquare className="w-3.5 h-3.5" /></button></td>
                                                <td className="px-4 py-3 font-medium text-slate-700">{item.name}<div className="text-xs text-slate-400">{item.unit === 'Metre' && `(${item.width}x${item.height} cm)`}</div></td>
                                                <td className="px-4 py-3 text-slate-500"><span className="px-2 py-0.5 rounded bg-slate-100">{item.unit}</span></td>
                                                <td className="px-4 py-3">{isChecked ? (<div className="flex items-center gap-2 animate-fadeIn"><input type="number" step={item.unit === 'Metre' ? "0.01" : "1"} placeholder="0" value={recipe[item.id] === 0 ? '' : recipe[item.id]} onChange={(e) => updateQuantity(item.id, e.target.value)} className={`w-full p-1.5 border border-slate-300 rounded text-center focus:ring-2 ${colors.ring} font-bold`} /><span className="text-xs text-slate-500 w-16">{usageUnit}</span></div>) : <span className="text-xs text-slate-400 italic">--</span>}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {currentRecipeTotals && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-3 text-xs">
                  <div className="text-slate-500 font-semibold mb-1">Birim Maliyet (TL)</div>
                  <div className="text-lg font-bold text-slate-800 font-mono">{currentRecipeTotals.TL.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-3 text-xs hidden md:block">
                  <div className="text-slate-500 font-semibold mb-1">Birim Maliyet (USD)</div>
                  <div className="text-lg font-bold text-green-600 font-mono">{currentRecipeTotals.USD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-3 text-xs hidden md:block">
                  <div className="text-slate-500 font-semibold mb-1">Birim Maliyet (EUR)</div>
                  <div className="text-lg font-bold text-blue-600 font-mono">{currentRecipeTotals.EUR.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                </div>
                <div className="bg-slate-900 text-white rounded-lg p-3 text-xs flex flex-col justify-center">
                  <div className="text-slate-300 font-semibold mb-1">Satış Fiyatı İçin Referans</div>
                  <div className="text-sm">Birim maliyeti baz alarak üstteki <span className="font-bold">Satış Fiyatı (TL)</span> alanını belirleyebilirsiniz.</div>
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
                 <button onClick={handleToggleForm} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium transition">İptal</button>
                <button onClick={handleSaveProduct} className={`${colors.bg} ${colors.hoverBg} text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-sm`}><Save className="w-4 h-4" /> {editingProduct ? 'Güncelle' : 'Kaydet'}</button>
            </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto w-full">
        {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-400"><div className="bg-slate-50 p-4 rounded-full mb-3"><Search className="w-8 h-8 text-slate-300" /></div><p>Henüz tanımlanmış bir ürün yok.</p></div>
        ) : (
             <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-3">Ürün Adı</th>
                      <th className="px-6 py-3">Açıklama</th>
                      <th className="px-6 py-3 text-right">Maliyet (TL)</th>
                      <th className="px-6 py-3 text-right">Satış (TL)</th>
                      <th className="px-6 py-3 text-right">Kâr (TL)</th>
                      <th className="px-6 py-3 text-right">Toplam (USD)</th>
                      <th className="px-6 py-3 text-right">Toplam (EUR)</th>
                      <th className="px-6 py-3 text-center">İşlemler</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {products.map(product => {
                           const totals = calculateTotalCost(product.materials);
                           const profitTL = product.salePrice ? (product.salePrice - totals.TL) : 0;
                           return (
                                <tr key={product.id} className="hover:bg-slate-50 transition group cursor-pointer" onClick={() => setSelectedProduct(product)}>
                                    <td className="px-6 py-4"><div className="font-bold text-slate-800">{product.name}</div><div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(product.createdAt).toLocaleDateString()}</div></td>
                                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{product.description || '-'}</td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-700 font-bold">{totals.TL.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                                    <td className="px-6 py-4 text-right font-mono text-emerald-700">{(product.salePrice || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                                    <td className={`px-6 py-4 text-right font-mono font-bold ${profitTL > 0 ? 'text-emerald-600' : profitTL < 0 ? 'text-red-500' : 'text-slate-400'}`}>{profitTL.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                                    <td className="px-6 py-4 text-right font-mono text-green-600">{totals.USD.toLocaleString('en-US', { minimumFractionDigits: 2 })} $</td>
                                    <td className="px-6 py-4 text-right font-mono text-blue-600">{totals.EUR.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</td>
                                    <td className="px-6 py-4"><div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}><button onClick={(e) => { e.stopPropagation(); requestDeleteProduct(product.id); }} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition" title="Sil"><Trash2 className="w-4 h-4" /></button></div></td>
                                </tr>
                           );
                    })}
                 </tbody>
            </table>
        )}
      </div>
      <ConfirmationModal 
        isOpen={deleteModal.show} 
        onClose={() => setDeleteModal({show:false})} 
        onConfirm={confirmDeleteProduct} 
        title="Ürün Sil" 
        message={confirmationMessage}
      />
    </div>
  );
};

// --- ALT BİLEŞEN: MALİYETLER EKRANI ---
const CostsView = ({ products, savedItems, rates }) => {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme.appColor);

  const [selections, setSelections] = useState({});

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!amount) return 0;
    
    let amountInTL = 0;
    if (fromCurrency === 'TL') amountInTL = amount;
    else if (fromCurrency === 'USD') amountInTL = amount * rates.USD;
    else if (fromCurrency === 'EUR') amountInTL = amount * rates.EUR;

    if (toCurrency === 'TL') return amountInTL;
    if (toCurrency === 'USD') return amountInTL / rates.USD;
    if (toCurrency === 'EUR') return amountInTL / rates.EUR;
    return 0;
  };
  
  const getUnitCost = (product) => {
    let totalTL = 0;
    product.materials.forEach(material => {
      // Malzemeyi savedItems'tan bul (güncel fiyat ve özellikler için)
      const currentItem = savedItems.find(i => i.id === material.id) || material;
      
      let unitPriceTL = convertCurrency(currentItem.price, currentItem.currency, 'TL');

      let costInTL = 0;
      if (currentItem.unit === 'Metre' && currentItem.area > 0) {
        const costPerCm2 = unitPriceTL / currentItem.area;
        costInTL = costPerCm2 * material.usedQuantity;
      } else {
        costInTL = unitPriceTL * material.usedQuantity;
      }
      totalTL += costInTL;
    });
    return { TL: totalTL, USD: totalTL / rates.USD, EUR: totalTL / rates.EUR };
  };

  const toggleSelection = (productId) => {
    setSelections(prev => {
      const current = prev[productId];
      if (current && current.checked) { 
        const newState = { ...prev }; 
        delete newState[productId]; 
        return newState; 
      }
      else { 
        return { ...prev, [productId]: { checked: true, quantity: 1 } }; 
      }
    });
  };

  const updateQuantity = (productId, val) => {
    setSelections(prev => ({ ...prev, [productId]: { ...prev[productId], quantity: parseFloat(val) || 0 } }));
  };

  const grandTotal = products.reduce((acc, product) => {
    const selection = selections[product.id];
    if (selection && selection.checked && selection.quantity > 0) {
      const unitCosts = getUnitCost(product);
      const qty = selection.quantity;

      const totalCostTL = unitCosts.TL * qty;
      const totalSaleTL = (product.salePrice || 0) * qty;
      const totalProfitTL = totalSaleTL - totalCostTL;

      acc.TL += totalCostTL;
      acc.USD += unitCosts.USD * qty;
      acc.EUR += unitCosts.EUR * qty;
      acc.saleTL += totalSaleTL;
      acc.profitTL += totalProfitTL;
    }
    return acc;
  }, { TL: 0, USD: 0, EUR: 0, saleTL: 0, profitTL: 0 });

  return (
    <div className="space-y-6 animate-fadeIn pb-24 w-full"> 
      <header className={`flex items-center justify-between bg-white p-4 shadow-sm rounded-lg border-l-4 ${colors.borderStrong} w-full`}>
        <div><h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Wallet className={`w-6 h-6 ${colors.text}`} /> Maliyet Hesaplama</h1><p className="text-sm text-slate-500">Ürün seçimi yaparak toplam sipariş maliyeti oluşturma</p></div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto w-full">
           {products.length === 0 ? <div className="p-12 text-center text-slate-400"><Package className="w-12 h-12 mx-auto mb-3 text-slate-300"/><p>Hesaplanacak ürün bulunamadı. Önce "Ürünler" menüsünden reçete oluşturunuz.</p></div> : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
                      <tr>
                          {/* Sticky columns for better UX */}
                          <th className="px-4 py-3 w-10 text-center border-r border-slate-100 sticky left-0 bg-slate-50 z-10">Seç</th>
                          <th className="px-4 py-3 min-w-[200px] border-r border-slate-100 sticky left-10 bg-slate-50 z-10">Ürün Adı</th>
                          <th className="px-4 py-3 w-40 text-center border-r border-slate-100">Adet</th>
                          <th className="px-4 py-3 text-right bg-slate-50 border-r border-slate-100 text-slate-500">Birim (TL)</th>
                          <th className="px-4 py-3 text-right bg-slate-50 border-r border-slate-100 text-green-600">Birim (USD)</th>
                          <th className="px-4 py-3 text-right bg-slate-50 border-r border-slate-200 text-blue-600">Birim (EUR)</th>
                          <th className={`px-4 py-3 text-right ${colors.bgLight} border-r border-slate-200 font-bold text-slate-700`}>Toplam (TL)</th>
                          <th className={`px-4 py-3 text-right ${colors.bgLight} border-r border-slate-200 font-bold text-green-700`}>Toplam (USD)</th>
                          <th className={`px-4 py-3 text-right ${colors.bgLight} font-bold text-blue-700`}>Toplam (EUR)</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {products.map(product => {
                          const isChecked = selections[product.id]?.checked;
                          const quantity = selections[product.id]?.quantity || 0;
                          const costs = getUnitCost(product);
                          return (
                              <tr key={product.id} className={`hover:bg-slate-50 transition ${isChecked ? `${colors.bgLight}/50` : ''}`}>
                                  {/* Select Column */}
                                  <td className="px-4 py-4 text-center border-r border-slate-100 sticky left-0 bg-white z-10">
                                      <button onClick={() => toggleSelection(product.id)} className={`w-6 h-6 rounded border flex items-center justify-center transition ${isChecked ? `${colors.bg} ${colors.borderStrong} text-white` : 'border-slate-300 text-transparent hover:border-slate-400'}`}><CheckSquare className="w-4 h-4" /></button>
                                  </td>
                                  {/* Product Name Column */}
                                  <td className="px-4 py-4 font-medium text-slate-700 border-r border-slate-100 sticky left-10 bg-white z-10">{product.name}<div className="text-xs text-slate-400 font-normal mt-0.5 truncate max-w-[180px]">{product.description}</div></td>
                                  {/* Quantity Input */}
                                  <td className="px-4 py-4 border-r border-slate-100">
                                      {isChecked ? (<input type="number" min="0" value={quantity === 0 ? '' : quantity} onChange={(e) => updateQuantity(product.id, e.target.value)} className={`w-full p-3 border-2 ${colors.borderStrong} rounded-lg text-center focus:ring-4 ${colors.ring} focus:outline-none font-bold text-lg bg-white text-slate-900 placeholder-slate-300 shadow-sm`} placeholder="0" />) : (<div className="text-center text-slate-300 font-medium text-lg">-</div>)}
                                  </td>
                                  {/* Unit Costs */}
                                  <td className="px-4 py-4 text-right border-r border-slate-100 font-mono text-sm text-slate-600">{costs.TL.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                                  <td className="px-4 py-4 text-right border-r border-slate-100 font-mono text-sm text-green-600">{costs.USD.toLocaleString('en-US', { minimumFractionDigits: 2 })} $</td>
                                  <td className="px-4 py-4 text-right border-r border-slate-200 font-mono text-sm text-blue-600">{costs.EUR.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</td>
                                  {/* Total Costs */}
                                  <td className={`px-4 py-4 text-right border-r border-slate-200 ${colors.bgLight}/50 font-mono text-sm font-bold text-slate-800`}>{isChecked && quantity > 0 ? (costs.TL * quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺' : '-'}</td>
                                  <td className={`px-4 py-4 text-right border-r border-slate-200 ${colors.bgLight}/50 font-mono text-sm font-bold text-green-700`}>{isChecked && quantity > 0 ? (costs.USD * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' $' : '-'}</td>
                                  <td className={`px-4 py-4 text-right ${colors.bgLight}/50 font-mono text-sm font-bold text-blue-700`}>{isChecked && quantity > 0 ? (costs.EUR * quantity).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €' : '-'}</td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
           )}
      </div>

      {/* Global Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-slate-200 p-4 shadow-lg z-20 flex items-center justify-between animate-slideUp">
        <div className="text-sm text-slate-500 hidden md:block">Seçili ürünlerin toplam sipariş maliyeti ve satış/kâr özeti</div>
        <div className="flex gap-4 md:gap-8 items-center w-full md:w-auto justify-between md:justify-end">
          <div className="text-right hidden md:block"><div className="text-xs text-slate-400">Toplam (USD)</div><div className="font-bold text-green-600 font-mono text-lg">{grandTotal.USD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div></div>
          <div className="text-right hidden md:block"><div className="text-xs text-slate-400">Toplam (EUR)</div><div className="font-bold text-blue-600 font-mono text-lg">{grandTotal.EUR.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div></div>
          <div className="text-right"><div className="text-xs text-slate-400">Maliyet (TL)</div><div className="font-bold font-mono text-lg text-slate-800">{grandTotal.TL.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div></div>
          <div className="text-right"><div className="text-xs text-slate-400">Satış (TL)</div><div className="font-bold font-mono text-lg text-emerald-700">{grandTotal.saleTL.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div></div>
          <div className="text-right bg-slate-800 text-white px-4 py-2 rounded-lg shadow"><div className="text-xs text-slate-400">Kâr (TL)</div><div className="font-bold font-mono text-xl">{grandTotal.profitTL.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div></div>
        </div>
      </div>
    </div>
  );
};

// --- ANA BİLEŞEN (LAYOUT) ---
const MainLayout = () => {
  const { theme } = useContext(ThemeContext);
  const colors = getThemeColors(theme.appColor);

  const [currentUser, setCurrentUser] = useState(null);  
  const [authToken, setAuthToken] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Company login flow states
  const [companyLoginMode, setCompanyLoginMode] = useState(null); // null, 'id_entry', 'request_page'
  const [personnelUser, setPersonnelUser] = useState(null);

  // Global app sync to prevent stale permissions after code updates
  useEffect(() => {
    if (currentUser) {
      const updatedUser = users.find(u => u.id === currentUser.id);
      if (updatedUser && JSON.stringify(updatedUser.permissions) !== JSON.stringify(currentUser.permissions)) {
        setCurrentUser(updatedUser);
      }
    }
  }, [users, currentUser]);

  // Kullanıcı listesini backend'den çek
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/users', {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Kullanıcı listesi alınamadı:', err);
      }
    };
    if (authToken) {
      fetchUsers();
    }
  }, [authToken]);

  // GLOBAL STATE
  const [events, setEvents] = useState([]);
  const [chats, setChats] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [products, setProducts] = useState([]);

  // PERSONEL LİSTESİ (GLOBAL STATE)
  const [staffList, setStaffList] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [activePage, setActivePage] = useState('home');  
  const [isMaliyetMenuOpen, setIsMaliyetMenuOpen] = useState(false);
  const [isPersonnelMenuOpen, setIsPersonnelMenuOpen] = useState(false);
  const [rates, setRates] = useState({ USD: 34.50, EUR: 36.40, TL: 1.00 });
  const [loadingRates, setLoadingRates] = useState(false);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState(new Date().toISOString());
  const [showNotifications, setShowNotifications] = useState(false);

  // Sayfa yenilense bile oturum ve aktif sayfayı korumak için localStorage kullan
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth');
      const storedPage = localStorage.getItem('activePage');
      if (stored && !currentUser && !authToken) {
        const parsed = JSON.parse(stored);
        if (parsed?.user && parsed?.token) {
          setCurrentUser(parsed.user);
          setAuthToken(parsed.token);
          const perms = parsed.user.permissions || [];
          // Eğer daha önce kayıtlı bir sayfa varsa ve yetkisi devam ediyorsa onu aç
          if (storedPage && perms.includes(storedPage)) {
            setActivePage(storedPage);
          } else {
            if (perms.includes('home')) setActivePage('home');
            else if (perms.includes('agenda')) setActivePage('agenda');
            else if (perms.includes('raw_materials')) setActivePage('raw_materials');
            else setActivePage('products');
          }
        }
      }
    } catch (e) {
      console.error('Auth bilgisi okunamadı:', e);
    }
  }, [currentUser, authToken]);

  const handleLogin = ({ user, token }) => {
      setCurrentUser(user);
      setAuthToken(token);
      try {
        localStorage.setItem('auth', JSON.stringify({ user, token }));
      } catch (e) {
        console.error('Auth bilgisi kaydedilemedi:', e);
      }
      if (user.permissions.includes('home')) setActivePage('home');
      else if (user.permissions.includes('agenda')) setActivePage('agenda');
      else if (user.permissions.includes('raw_materials')) setActivePage('raw_materials');
      else setActivePage('products');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    try {
      localStorage.removeItem('auth');
      localStorage.removeItem('activePage');
    } catch (e) {
      console.error('Auth bilgisi silinemedi:', e);
    }
  };

  // Aktif sayfa değiştikçe localStorage'a yaz
  useEffect(() => {
    try {
      if (currentUser && authToken) {
        localStorage.setItem('activePage', activePage);
      }
    } catch (e) {
      console.error('activePage kaydedilemedi:', e);
    }
  }, [activePage, currentUser, authToken]);
  const hasPermission = (permId) => { return currentUser?.permissions?.includes(permId); };
  const hasCostManagementAccess = () => { return hasPermission('raw_materials') || hasPermission('products') || hasPermission('costs'); };
  const hasPersonnelAccess = () => { return hasPermission('staff') || hasPermission('timekeeping'); };
  const unreadAgendaCount = events.filter(e => e.participants.includes(currentUser?.id) && e.unreadBy?.includes(currentUser?.id)).length;
  const unreadMessageCount = chats.filter(c => c.participants.includes(currentUser?.id) && c.unreadBy?.includes(currentUser?.id)).length;

  // Notification API'den gelen bildirimler
  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadChatNotifs = unreadNotifications.filter(n => n.type === 'chat');
  const unreadEventNotifs = unreadNotifications.filter(n => n.type === 'event');
  const totalNotificationCount = unreadNotifications.length;

  // Son 3 günün okunmuş bildirimleri
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const recentReadNotifs = notifications.filter(n => {
    if (!n.read || !n.createdAt) return false;
    const d = new Date(n.createdAt);
    return d >= threeDaysAgo;
  });

  // Ham maddeleri, ürünleri, personeli, etkinlikleri ve sohbetleri backend'den çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const [mRes, pRes, sRes, eRes, cRes] = await Promise.all([
          fetch('http://localhost:4000/api/materials', { headers }),
          fetch('http://localhost:4000/api/products', { headers }),
          fetch('http://localhost:4000/api/staff', { headers }),
          fetch('http://localhost:4000/api/events', { headers }),
          fetch('http://localhost:4000/api/chats', { headers }),
        ]);

        if (mRes.ok) {
          const mats = await mRes.json();
          setSavedItems(mats);
        }
        if (pRes.ok) {
          const prods = await pRes.json();
          setProducts(prods);
        }
        if (sRes.ok) {
          const staff = await sRes.json();
          setStaffList(staff);
        }
        if (eRes.ok) {
          const evt = await eRes.json();
          setEvents(evt);
        }
        if (cRes.ok) {
          const ch = await cRes.json();
          setChats(ch);
        }
      } catch (err) {
        console.error('Malzemeler/ürünler/personel/etkinlikler/sohbetler alınamadı:', err);
      }
    };
    if (authToken) {
      fetchData();
      // Login sonrası kurları da bir kez güncelle
      fetchRates().catch(() => {});
    }
  }, [authToken]);

  // Bildirimleri backend'den çek
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/notifications', {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error('Bildirimler alınamadı:', err);
      }
    };

    if (authToken) {
      fetchNotifications();
    }
  }, [authToken]);

  const fetchRates = async () => {
    setLoadingRates(true);
    try {
      const res = await fetch('http://localhost:4000/api/currency/rates');
      if (!res.ok) {
        console.error('TCMB kur bilgisi alınamadı:', await res.text());
        setLoadingRates(false);
        return;
      }
      const data = await res.json();

      if (data?.rates?.USD && data?.rates?.EUR) {
        setRates({
          USD: data.rates.USD.selling,
          EUR: data.rates.EUR.selling,
          TL: 1.0,
        });

        const dateStr = data.date;
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const apiDate = new Date(`${year}-${month}-${day}`);
        setRatesUpdatedAt(apiDate.toISOString());
      }
    } catch (err) {
      console.error('TCMB kur bilgisi alınırken hata oluştu:', err);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => { 
    fetchRates(); 
    const interval = setInterval(() => fetchRates(), 60000); // Her 60 saniyede bir güncelle
    return () => clearInterval(interval);
  }, []);

  // Company login flow handlers
  const handleCompanyLogin = () => {
    setCompanyLoginMode('id_entry');
  };

  const handlePersonnelFound = (user) => {
    setPersonnelUser(user);
    setCompanyLoginMode('request_page');
  };

  const handleCompanyLogout = () => {
    setCompanyLoginMode(null);
    setPersonnelUser(null);
  };

  // Render company login flow screens
  if (companyLoginMode === 'id_entry') {
    return <PersonnelIdEntryView onPersonnelFound={handlePersonnelFound} onBack={handleCompanyLogout} />;
  }

  if (companyLoginMode === 'request_page' && personnelUser) {
    return <PersonnelRequestView personnel={personnelUser} onBack={handleCompanyLogout} />;
  }

  if (!currentUser) return <LoginView users={users} onLogin={handleLogin} onCompanyLogin={handleCompanyLogin} />;

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800 w-full">
      <style>{`
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <aside className={`w-64 ${theme.menuBg} transition-colors duration-300 flex flex-col shadow-xl sticky top-0 h-screen z-30 flex-shrink-0`}>
        <div className="p-6 border-b border-white/10">
          <div className={`flex items-center gap-3 font-bold text-xl ${theme.menuText}`}>
            <span className="text-2xl font-extrabold tracking-tighter text-white">Empex<span className={`${colors.text.replace('text-','text-').replace('-600','-400')}`}> ProMos</span></span>
          </div>
          <div className={`text-xs mt-2 ${theme.menuText} opacity-70`}>Hoşgeldin, {currentUser.name} {currentUser.surname}</div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {hasPermission('home') && (
              <button onClick={() => setActivePage('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold ${activePage === 'home' ? `${colors.bg} text-white shadow-lg` : `hover:bg-white/10 ${theme.menuText}`}`}>
                <Home className={`w-5 h-5 ${activePage === 'home' ? 'text-white' : theme.menuText}`} /> <span className="flex-1 text-left">Ana Sayfa</span>
              </button>
          )}

          {hasPermission('agenda') && (
              <button onClick={() => setActivePage('agenda')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold relative ${activePage === 'agenda' ? `${colors.bg} text-white shadow-lg` : `hover:bg-white/10 ${theme.menuText}`}`}>
                <CalendarIcon className={`w-5 h-5 ${activePage === 'agenda' ? 'text-white' : theme.menuText}`} /> <span className="flex-1 text-left">Ajanda</span>
                {unreadAgendaCount > 0 && (<span className="absolute right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">{unreadAgendaCount}</span>)}
              </button>
          )}

          {hasPermission('work_tracking') && (
              <button onClick={() => setActivePage('work_tracking')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold ${activePage === 'work_tracking' ? `${colors.bg} text-white shadow-lg` : `hover:bg-white/10 ${theme.menuText}`}`}>
                <Briefcase className={`w-5 h-5 ${activePage === 'work_tracking' ? 'text-white' : theme.menuText}`} /> <span className="flex-1 text-left">Kanban</span>
              </button>
          )}

          {hasPermission('task_management') && (
              <button onClick={() => setActivePage('task_management')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold ${activePage === 'task_management' ? `${colors.bg} text-white shadow-lg` : `hover:bg-white/10 ${theme.menuText}`}`}>
                <CheckSquare className={`w-5 h-5 ${activePage === 'task_management' ? 'text-white' : theme.menuText}`} /> <span className="flex-1 text-left">Görev Yönetimi</span>
              </button>
          )}

          {hasPermission('messages') && (
              <button onClick={() => setActivePage('messages')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold relative ${activePage === 'messages' ? `${colors.bg} text-white shadow-lg` : `hover:bg-white/10 ${theme.menuText}`}`}>
                <MessageSquare className={`w-5 h-5 ${activePage === 'messages' ? 'text-white' : theme.menuText}`} /> 
                <span className="flex-1 text-left">Mesajlar</span>
                {unreadMessageCount > 0 && (<span className="absolute right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">{unreadMessageCount}</span>)}
              </button>
          )}

          {(hasPermission('agenda') || hasPermission('messages')) && (hasCostManagementAccess() || hasPersonnelAccess()) && <div className="border-t border-white/10 my-2"></div>}

          {hasCostManagementAccess() && (
              <>
                <button onClick={() => setIsMaliyetMenuOpen(!isMaliyetMenuOpen)} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/10 ${theme.menuText} transition-all duration-200 font-semibold ${isMaliyetMenuOpen && (activePage.includes('materials') || activePage.includes('products') || activePage.includes('costs')) ? `${colors.text.replace('-600', '-400')} bg-white/10` : ''}`}>
                  <div className="flex items-center gap-3"><FolderOpen className={`w-5 h-5 ${theme.menuText}`} /><span>Maliyet Yönetimi</span></div>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isMaliyetMenuOpen ? 'rotate-90' : ''}`} />
                </button>

                <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isMaliyetMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {hasPermission('raw_materials') && (
                        <button onClick={() => setActivePage('raw_materials')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 pl-12 text-sm ${activePage === 'raw_materials' ? `${colors.bg} text-white shadow-lg` : `${theme.menuText} hover:bg-white/10 opacity-80 hover:opacity-100`}`}>
                          <Package className="w-4 h-4" /> <span className="flex-1 text-left">Ham Maddeler</span>
                        </button>
                    )}
                    {hasPermission('products') && (
                        <button onClick={() => setActivePage('products')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 pl-12 text-sm ${activePage === 'products' ? `${colors.bg} text-white shadow-lg` : `${theme.menuText} hover:bg-white/10 opacity-80 hover:opacity-100`}`}>
                          <Layers className="w-4 h-4" /> <span className="flex-1 text-left">Ürünler</span>
                        </button>
                    )}
                    {hasPermission('costs') && (
                        <button onClick={() => setActivePage('costs')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 pl-12 text-sm ${activePage === 'costs' ? `${colors.bg} text-white shadow-lg` : `${theme.menuText} hover:bg-white/10 opacity-80 hover:opacity-100`}`}>
                          <Wallet className="w-4 h-4" /> <span className="flex-1 text-left">Maliyetler</span>
                        </button>
                    )}
                </div>
              </>
          )}

          {hasPersonnelAccess() && (
              <>
                <button onClick={() => setIsPersonnelMenuOpen(!isPersonnelMenuOpen)} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/10 ${theme.menuText} transition-all duration-200 font-semibold ${isPersonnelMenuOpen && (activePage === 'staff' || activePage === 'timekeeping') ? `${colors.text.replace('-600', '-400')} bg-white/10` : ''}`}>
                  <div className="flex items-center gap-3"><Users className={`w-5 h-5 ${theme.menuText}`} /><span>Personel İşlemleri</span></div>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isPersonnelMenuOpen ? 'rotate-90' : ''}`} />
                </button>

                <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isPersonnelMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {hasPermission('staff') && (
                        <button onClick={() => setActivePage('staff')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 pl-12 text-sm ${activePage === 'staff' ? `${colors.bg} text-white shadow-lg` : `${theme.menuText} hover:bg-white/10 opacity-80 hover:opacity-100`}`}>
                          <User className="w-4 h-4" /> <span className="flex-1 text-left">Personeller</span>
                        </button>
                    )}
                    {hasPermission('timekeeping') && (
                        <button onClick={() => setActivePage('timekeeping')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 pl-12 text-sm ${activePage === 'timekeeping' ? `${colors.bg} text-white shadow-lg` : `${theme.menuText} hover:bg-white/10 opacity-80 hover:opacity-100`}`}>
                          <ClipboardList className="w-4 h-4" /> <span className="flex-1 text-left">Puantaj</span>
                        </button>
                    )}
                </div>
              </>
          )}

          {(hasPermission('admin_panel') || hasPermission('request_management') || hasPermission('settings')) && (
              <>
                <div className="border-t border-white/10 my-2"></div>
                {hasPermission('admin_panel') && (
                    <button onClick={() => setActivePage('admin_panel')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold ${activePage === 'admin_panel' ? `${colors.bg} text-white shadow-lg` : `hover:bg-white/10 ${theme.menuText}`}`}>
                        <Users className={`w-5 h-5 ${activePage === 'admin_panel' ? 'text-white' : theme.menuText}`} /> <span className="flex-1 text-left">Kullanıcı Yönetimi</span>
                    </button>
                )}
                {hasPermission('request_management') && (
                    <button onClick={() => setActivePage('request_management')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold ${activePage === 'request_management' ? `${colors.bg} text-white shadow-lg` : `hover:bg-white/10 ${theme.menuText}`}`}>
                        <ClipboardList className={`w-5 h-5 ${activePage === 'request_management' ? 'text-white' : theme.menuText}`} /> <span className="flex-1 text-left">Talep Yönetimi</span>
                    </button>
                )}
                {hasPermission('settings') && (
                    <button onClick={() => setActivePage('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold ${activePage === 'settings' ? `${colors.bg} text-white shadow-lg` : `hover:bg-white/10 ${theme.menuText}`}`}>
                        <Settings className={`w-5 h-5 ${activePage === 'settings' ? 'text-white' : theme.menuText}`} /> <span className="flex-1 text-left">Ayarlar</span>
                    </button>
                )}
              </>
          )}
        </nav>
        
        <div className="p-4 border-t border-white/10 space-y-4">
            <div className="bg-black/20 rounded-xl p-3 text-xs space-y-2 text-slate-300 shadow-inner">
                <div className="flex justify-between items-center text-slate-400 mb-1">
                  <span>Canlı Kurlar</span>
                  <button
                    onClick={fetchRates}
                    disabled={loadingRates}
                    className="hover:text-white transition p-1 rounded-full -m-1"
                    title="Kurları şimdi güncelle"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingRates ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="flex justify-between"><span>USD:</span> <span className="text-green-400 font-mono">{rates.USD.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>EUR:</span> <span className="text-blue-400 font-mono">{rates.EUR.toFixed(2)}</span></div>
                <div
                  className="pt-1 text-[11px] text-slate-300 border-t border-white/10 mt-1 flex items-center justify-between gap-2"
                  title={ratesUpdatedAt ? new Date(ratesUpdatedAt).toISOString() : ''}
                >
                  <span>Son güncelleme:</span>
                  <span className="font-mono">
                    {ratesUpdatedAt
                      ? new Date(ratesUpdatedAt).toLocaleString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '--'}
                  </span>
                </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white py-2 rounded-lg transition text-sm font-medium"><LogOut className="w-4 h-4" /> Çıkış Yap</button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto h-screen relative w-full">
        <div className="flex justify-end mb-4">
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
            >
              <Bell className="w-5 h-5" />
              {totalNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalNotificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-lg bg-white ring-1 ring-black/5 z-40 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-800">Bildirimler</span>
                  </div>
                  {totalNotificationCount > 0 ? (
                    <button
                      onClick={async () => {
                        try {
                          // Tüm sohbetleri ve bildirimleri okundu işaretle
                          await fetch('http://localhost:4000/api/chats/read-all', {
                            method: 'PUT',
                            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                          })
                            .then(res => res.ok ? res.json() : null)
                            .then(updated => { if (updated) setChats(updated); });

                          await fetch('http://localhost:4000/api/notifications/read-all', {
                            method: 'PUT',
                            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                          });

                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        } catch (err) {
                          console.error('Tüm bildirimler okundu işaretlenemedi:', err);
                        } finally {
                          setShowNotifications(false);
                        }
                      }}
                      className="text-[11px] text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      Tümünü okundu say
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Yeni bildirim yok</span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {unreadChatNotifs.length > 0 && (
                    <div className="bg-orange-50/40">
                      <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-orange-600">
                        <MessageSquare className="w-3 h-3" />
                        Okunmamış Mesajlar
                      </div>
                      {unreadChatNotifs.map(notif => {
                        const createdTime = notif.createdAt
                          ? new Date(notif.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                          : '';
                        return (
                          <button
                            key={notif.id}
                            onClick={async () => {
                              try {
                                await fetch(`http://localhost:4000/api/notifications/${notif.id}/read`, {
                                  method: 'PUT',
                                  headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                                });
                                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                              } catch (err) {
                                console.error('Bildirim okundu işaretlenemedi:', err);
                              } finally {
                                setActivePage('messages');
                                setShowNotifications(false);
                              }
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition flex items-start gap-2 text-xs"
                          >
                            <div className="mt-0.5">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold">
                                {notif.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[170px]">
                                  {notif.title}
                                </span>
                                <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0">
                                  {createdTime}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">
                                {notif.message || 'Yeni mesaj'}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {unreadEventNotifs.length > 0 && (
                    <div className="bg-indigo-50/40">
                      <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-indigo-600">
                        <CalendarIcon className="w-3 h-3" />
                        Yaklaşan Etkinlikler
                      </div>
                      {unreadEventNotifs.map(notif => (
                        <button
                          key={notif.id}
                          onClick={async () => {
                            try {
                              await fetch(`http://localhost:4000/api/notifications/${notif.id}/read`, {
                                method: 'PUT',
                                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                              });
                              setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                            } catch (err) {
                              console.error('Bildirim okundu işaretlenemedi:', err);
                            } finally {
                              setActivePage('agenda');
                              setShowNotifications(false);
                            }
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition flex items-start gap-2 text-xs"
                        >
                          <div className="mt-0.5 text-center">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('tr-TR', { month: 'short' }) : ''}
                            </div>
                            <div className="text-sm font-extrabold text-indigo-600">
                              {notif.createdAt ? new Date(notif.createdAt).getDate() : ''}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 ml-1">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[170px]">
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0">
                                {notif.createdAt
                                  ? new Date(notif.createdAt).toLocaleTimeString('tr-TR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : ''}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {notif.message || 'Ajanda etkinliği'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {recentReadNotifs.length > 0 && (
                    <div className="bg-slate-50/60">
                      <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Clock className="w-3 h-3" />
                        Son 3 Gün (okunmuş)
                      </div>
                      {recentReadNotifs.map(notif => {
                        const createdDate = notif.createdAt ? new Date(notif.createdAt) : null;
                        const dateLabel = createdDate
                          ? createdDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
                          : '';
                        const timeLabel = createdDate
                          ? createdDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                          : '';

                        const handleNavigateFromNotif = () => {
                          const link = notif.link || '';
                          if (link.includes('messages')) setActivePage('messages');
                          else if (link.includes('agenda')) setActivePage('agenda');
                          else if (link.includes('staff')) setActivePage('staff');
                          else if (link.includes('timekeeping')) setActivePage('timekeeping');
                          else if (link.includes('products')) setActivePage('products');
                          else if (link.includes('raw_materials')) setActivePage('raw_materials');
                          else if (link.includes('costs')) setActivePage('costs');
                          else setActivePage('home');
                        };

                        return (
                          <button
                            key={notif.id}
                            type="button"
                            onClick={() => { handleNavigateFromNotif(); setShowNotifications(false); }}
                            className="w-full text-left px-4 py-2.5 flex items-start gap-2 text-xs border-t border-slate-100 hover:bg-slate-100 transition"
                          >
                            <div className="mt-0.5">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                                {notif.title?.charAt(0)?.toUpperCase() || 'N'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[170px]">
                                  {notif.title}
                                </span>
                                <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0">
                                  {dateLabel} {timeLabel}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">
                                {notif.message || 'Bildirim'}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {totalNotificationCount === 0 && recentReadNotifs.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-slate-400">
                      Şu anda yeni bildiriminiz yok.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {activePage === 'home' && hasPermission('home') && <HomeView currentUser={currentUser} events={events} chats={chats} rates={rates} setActivePage={setActivePage} staffCount={staffList.length} productCount={products.length} materialCount={savedItems.length} unreadNotificationCount={notifications.filter(n => !n.read).length} />}
        {activePage === 'agenda' && hasPermission('agenda') && <AgendaView users={users} currentUser={currentUser} events={events} setEvents={setEvents} authToken={authToken} />}
        {activePage === 'messages' && hasPermission('messages') && <MessagesView currentUser={currentUser} users={users} chats={chats} setChats={setChats} authToken={authToken} />}
        {activePage === 'work_tracking' && hasPermission('work_tracking') && <WorkTrackingView authToken={authToken} />}
        {activePage === 'task_management' && hasPermission('task_management') && <TaskManagement authToken={authToken} />}
        {activePage === 'raw_materials' && hasPermission('raw_materials') && <RawMaterialsView savedItems={savedItems} setSavedItems={setSavedItems} rates={rates} authToken={authToken} />}
        {activePage === 'products' && hasPermission('products') && <ProductsView savedItems={savedItems} rates={rates} products={products} setProducts={setProducts} authToken={authToken} />}
        {activePage === 'costs' && hasPermission('costs') && <CostsView products={products} savedItems={savedItems} rates={rates} />}
        {activePage === 'staff' && hasPermission('staff') && <StaffView staffList={staffList} setStaffList={setStaffList} authToken={authToken} />}
        {activePage === 'timekeeping' && hasPermission('timekeeping') && <TimekeepingView staffList={staffList} authToken={authToken} />}
        {activePage === 'admin_panel' && hasPermission('admin_panel') && <UserManagementView users={users} setUsers={setUsers} authToken={authToken} />}
        {activePage === 'request_management' && hasPermission('request_management') && <RequestManagementView authToken={authToken} />}
        {activePage === 'settings' && hasPermission('settings') && <SettingsView authToken={authToken} />}
        
        {!hasPermission(activePage) && (
            <div className="flex items-center justify-center h-full text-slate-400 p-8">
              <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-slate-200">
                <Lock className="w-12 h-12 mx-auto mb-4 text-red-400"/>
                <p className="font-semibold text-lg text-slate-700">Erişim Engellendi</p>
                <p className="text-sm mt-2">Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
                <button onClick={() => setActivePage('home')} className={`mt-4 ${colors.text} font-medium hover:underline flex items-center gap-1 mx-auto`}><ArrowRight className="w-4 h-4 rotate-180"/> Ana Sayfaya Dön</button>
              </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default function App() {
    return (
        <ThemeProvider>
            <MainLayout />
        </ThemeProvider>
    );
}
