
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, 
  Plus, Edit2, Trash2, Save, X, Activity, DollarSign, Store, AlertTriangle, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Medicine, Order, MedicineCategory, ActivityLog, MarketRate } from '../../types';
import { useNavigate } from 'react-router-dom';

// --- Sub-Components for Dashboard ---

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-4 rounded-xl ${color} text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const ActivityLogItem: React.FC<{ log: ActivityLog }> = ({ log }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="bg-gray-100 p-2 rounded-full mt-1">
      <Activity size={14} className="text-gray-500" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-800">{log.action}</p>
      <p className="text-xs text-gray-500">{log.details}</p>
      <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
    </div>
  </div>
);

// --- Main Admin Dashboard Component ---

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'medicines' | 'orders'>('overview');
  
  // Data State
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  // Using 'any' for editingMed to allow flexible form handling (e.g. strings for array fields)
  const [editingMed, setEditingMed] = useState<any>(null);

  // Auth Check
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    const [medsData, ordersData, logsData] = await Promise.all([
      db.getMedicines(),
      db.getAllOrders(),
      db.getLogs()
    ]);
    setMedicines(medsData);
    setOrders(ordersData);
    setLogs(logsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteMed = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      await db.deleteMedicine(id);
      fetchData();
    }
  };

  const handleSaveMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMed) return;

    // Helper to safely split comma-separated strings
    const splitStr = (str: any) => typeof str === 'string' ? str.split(',').map(s => s.trim()).filter(Boolean) : (str || []);

    // Build the medicine object
    const medToSave: Medicine = {
      id: editingMed.id || `med_${Date.now()}`,
      name: editingMed.name || 'New Medicine',
      brandExample: editingMed.brandExample || 'Brand',
      saltComposition: editingMed.saltComposition || '',
      category: editingMed.category || MedicineCategory.PAIN,
      commonUse: splitStr(editingMed.commonUse),
      description: editingMed.description || '',
      genericPrice: Number(editingMed.genericPrice) || 0,
      brandedPrice: Number(editingMed.brandedPrice) || 0,
      stock: Number(editingMed.stock) || 0,
      expiryDate: editingMed.expiryDate || '2025-12-31',
      marketRates: editingMed.marketRates || [],
      imageUrl: editingMed.imageUrl || 'https://via.placeholder.com/150',
      dosage: editingMed.dosage || { normal: '', maxSafe: '', overdoseWarning: '' },
      details: {
          mechanism: editingMed.details?.mechanism || '',
          storage: editingMed.details?.storage || '',
          sideEffects: splitStr(editingMed.details?.sideEffects),
          contraindications: splitStr(editingMed.details?.contraindications)
      }
    };

    await db.saveMedicine(medToSave);
    setShowModal(false);
    setEditingMed(null);
    fetchData();
  };

  const openEditModal = (med?: Medicine) => {
    if (med) {
        // Flatten arrays to strings for easier editing
        setEditingMed({
            ...med,
            commonUse: med.commonUse.join(', '),
            details: {
                ...med.details,
                sideEffects: med.details.sideEffects.join(', '),
                contraindications: med.details.contraindications.join(', ')
            }
        });
    } else {
        // Default new medicine structure
        setEditingMed({
            category: MedicineCategory.FEVER,
            marketRates: [],
            stock: 100,
            expiryDate: '',
            imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
            dosage: { normal: '', maxSafe: '', overdoseWarning: '' },
            details: { mechanism: '', sideEffects: '', contraindications: '', storage: '' },
            commonUse: ''
        });
    }
    setShowModal(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    await db.updateOrderStatus(orderId, status);
    fetchData();
  };

  // Market Rate Helpers
  const addMarketRate = () => {
    setEditingMed({
        ...editingMed,
        marketRates: [...(editingMed.marketRates || []), { shopName: '', price: 0, type: 'Branded' }]
    });
  };

  const removeMarketRate = (index: number) => {
    const newRates = [...(editingMed.marketRates || [])];
    newRates.splice(index, 1);
    setEditingMed({ ...editingMed, marketRates: newRates });
  };

  const updateMarketRate = (index: number, field: keyof MarketRate, value: any) => {
    const newRates = [...(editingMed.marketRates || [])];
    newRates[index] = { ...newRates[index], [field]: value };
    setEditingMed({ ...editingMed, marketRates: newRates });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-20 hidden lg:flex flex-col">
        <div className="h-20 flex items-center px-8 border-b border-gray-100">
           <span className="font-bold text-xl text-pastel-primary tracking-tight">Upchar<span className="text-gray-800">Admin</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'overview' ? 'bg-pastel-primary text-white shadow-lg shadow-teal-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <LayoutDashboard size={20} /> Overview
           </button>
           <button 
             onClick={() => setActiveTab('medicines')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'medicines' ? 'bg-pastel-primary text-white shadow-lg shadow-teal-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <Package size={20} /> Medicines
           </button>
           <button 
             onClick={() => setActiveTab('orders')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'orders' ? 'bg-pastel-primary text-white shadow-lg shadow-teal-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <ShoppingCart size={20} /> Orders
           </button>
           <div className="pt-4 mt-4 border-t border-gray-100">
             <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-50 transition-all font-medium">
               <Settings size={20} /> Settings
             </button>
           </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
           <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                 AD
              </div>
              <div>
                 <p className="text-sm font-bold text-gray-800">Super Admin</p>
                 <p className="text-xs text-gray-400">admin@upchar.com</p>
              </div>
           </div>
           <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-red-400 hover:bg-red-50 py-2 rounded-lg text-sm font-bold transition-colors">
              <LogOut size={16} /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 flex-1 p-8">
        
        {/* Top Header Mobile */}
        <div className="lg:hidden mb-6 flex justify-between items-center">
            <span className="font-bold text-xl text-pastel-primary">UpcharAdmin</span>
            <button onClick={logout}><LogOut size={20} className="text-gray-500"/></button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
           <div className="animate-fade-in space-y-6">
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Total Revenue" value={`₹${orders.reduce((acc, o) => acc + o.totalAmount, 0).toFixed(0)}`} icon={DollarSign} color="bg-green-500" />
                 <StatCard title="Total Orders" value={orders.length} icon={ShoppingCart} color="bg-blue-500" />
                 <StatCard title="Medicines" value={medicines.length} icon={Package} color="bg-purple-500" />
                 <StatCard title="Low Stock Alerts" value={medicines.filter(m => m.stock < 20).length} icon={Activity} color="bg-orange-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Recent Orders */}
                 <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Recent Orders</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                         <thead className="bg-gray-50 text-gray-500">
                            <tr>
                               <th className="p-3 rounded-l-lg">ID</th>
                               <th className="p-3">Customer</th>
                               <th className="p-3">Amount</th>
                               <th className="p-3 rounded-r-lg">Status</th>
                            </tr>
                         </thead>
                         <tbody>
                            {orders.slice(0, 5).map(order => (
                               <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                  <td className="p-3 font-medium text-gray-700">#{order.id}</td>
                                  <td className="p-3">{order.customerEmail}</td>
                                  <td className="p-3 font-bold">₹{order.totalAmount}</td>
                                  <td className="p-3">
                                     <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {order.status}
                                     </span>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                    </div>
                 </div>

                 {/* Activity Log */}
                 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Activity Log</h3>
                    <div className="space-y-1">
                       {logs.length > 0 ? logs.slice(0, 6).map(log => (
                          <ActivityLogItem key={log.id} log={log} />
                       )) : <p className="text-gray-400 text-sm">No activity recorded.</p>}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'medicines' && (
           <div className="animate-slide-up space-y-6">
              <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-gray-800">Medicine Inventory</h1>
                 <button 
                   onClick={() => openEditModal()}
                   className="bg-pastel-primary text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-pastel-secondary transition-colors shadow-lg shadow-teal-500/20"
                 >
                    <Plus size={18} /> Add Medicine
                 </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-gray-50 text-gray-500 font-medium">
                          <tr>
                             <th className="p-4">Name</th>
                             <th className="p-4">Category</th>
                             <th className="p-4">Price</th>
                             <th className="p-4">Stock</th>
                             <th className="p-4">Expiry</th>
                             <th className="p-4 text-center">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {medicines.map(med => (
                             <tr key={med.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4">
                                   <div className="font-bold text-gray-800">{med.name}</div>
                                   <div className="text-xs text-gray-400">Ex: {med.brandExample}</div>
                                </td>
                                <td className="p-4">
                                   <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-medium border border-gray-200">{med.category}</span>
                                </td>
                                <td className="p-4">
                                   <div className="font-bold text-green-600">₹{med.genericPrice}</div>
                                   <div className="text-xs text-gray-400 line-through">₹{med.brandedPrice}</div>
                                </td>
                                <td className="p-4">
                                   <span className={`px-2 py-1 rounded-md text-xs font-bold ${med.stock < 20 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                      {med.stock} Units
                                   </span>
                                </td>
                                <td className="p-4 text-gray-600">{med.expiryDate}</td>
                                <td className="p-4 flex justify-center gap-2">
                                   <button 
                                     onClick={() => openEditModal(med)}
                                     className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                      <Edit2 size={16} />
                                   </button>
                                   <button 
                                     onClick={() => handleDeleteMed(med.id)}
                                     className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                      <Trash2 size={16} />
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'orders' && (
           <div className="animate-slide-up space-y-6">
              <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
              
              <div className="space-y-4">
                 {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-lg font-bold text-gray-800">Order #{order.id}</h3>
                             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">Customer: <span className="font-medium text-gray-700">{order.customerEmail}</span></p>
                          <p className="text-sm text-gray-500">Total: <span className="font-bold text-pastel-primary">₹{order.totalAmount}</span> • {order.items.length} Items</p>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <select 
                             value={order.status}
                             onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                             className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pastel-primary outline-none cursor-pointer"
                          >
                             <option value="placed">Placed</option>
                             <option value="packed">Packed</option>
                             <option value="out_for_delivery">Out for Delivery</option>
                             <option value="delivered">Delivered</option>
                          </select>
                       </div>
                    </div>
                 ))}
                 {orders.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                       <ShoppingCart className="mx-auto text-gray-300 mb-2" size={32} />
                       <p className="text-gray-500">No orders found.</p>
                    </div>
                 )}
              </div>
           </div>
        )}

      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-20">
                <h2 className="text-xl font-bold text-gray-800">{editingMed?.id ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleSaveMed} className="p-6 space-y-8">
                
                {/* Section 1: Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-pastel-primary uppercase tracking-wide border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <Package size={16} /> Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Generic Name</label>
                            <input 
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                                value={editingMed?.name || ''}
                                onChange={e => setEditingMed({...editingMed, name: e.target.value})}
                                required
                                placeholder="e.g. Paracetamol 650mg"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand Example</label>
                            <input 
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                                value={editingMed?.brandExample || ''}
                                onChange={e => setEditingMed({...editingMed, brandExample: e.target.value})}
                                required
                                placeholder="e.g. Dolo 650"
                            />
                        </div>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Common Uses (Comma separated)</label>
                         <input 
                            className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                            value={editingMed?.commonUse || ''}
                            onChange={e => setEditingMed({...editingMed, commonUse: e.target.value})}
                            placeholder="e.g. Fever, Pain, Headache"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Salt Composition</label>
                            <input 
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                                value={editingMed?.saltComposition || ''}
                                onChange={e => setEditingMed({...editingMed, saltComposition: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                            <select 
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none cursor-pointer"
                                value={editingMed?.category || MedicineCategory.PAIN}
                                onChange={e => setEditingMed({...editingMed, category: e.target.value as MedicineCategory})}
                            >
                                {Object.values(MedicineCategory).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 2: Pricing & Inventory */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-pastel-primary uppercase tracking-wide border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <DollarSign size={16} /> Pricing & Inventory
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Generic (₹)</label>
                            <input 
                                type="number"
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                                value={editingMed?.genericPrice || ''}
                                onChange={e => setEditingMed({...editingMed, genericPrice: Number(e.target.value)})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Branded (₹)</label>
                            <input 
                                type="number"
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                                value={editingMed?.brandedPrice || ''}
                                onChange={e => setEditingMed({...editingMed, brandedPrice: Number(e.target.value)})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label>
                            <input 
                                type="number"
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                                value={editingMed?.stock || ''}
                                onChange={e => setEditingMed({...editingMed, stock: Number(e.target.value)})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry</label>
                            <input 
                                type="date"
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                                value={editingMed?.expiryDate || ''}
                                onChange={e => setEditingMed({...editingMed, expiryDate: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Medical Details */}
                <div className="space-y-4">
                     <h3 className="text-sm font-bold text-pastel-primary uppercase tracking-wide border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                        <FileText size={16} /> Medical Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Storage Instructions</label>
                             <input 
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                                value={editingMed?.details?.storage || ''}
                                onChange={e => setEditingMed({...editingMed, details: {...editingMed.details, storage: e.target.value}})}
                                placeholder="e.g. Store below 25°C"
                             />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label>
                             <input 
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                                value={editingMed?.imageUrl || ''}
                                onChange={e => setEditingMed({...editingMed, imageUrl: e.target.value})}
                                placeholder="https://..."
                             />
                        </div>
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mechanism of Action</label>
                         <textarea 
                            className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none h-20 resize-none"
                            value={editingMed?.details?.mechanism || ''}
                            onChange={e => setEditingMed({...editingMed, details: {...editingMed.details, mechanism: e.target.value}})}
                            placeholder="How the medicine works..."
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Side Effects (Comma separated)</label>
                             <input 
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                                value={editingMed?.details?.sideEffects || ''}
                                onChange={e => setEditingMed({...editingMed, details: {...editingMed.details, sideEffects: e.target.value}})}
                                placeholder="e.g. Nausea, Headache"
                             />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-red-400 uppercase mb-1">Contraindications (Comma separated)</label>
                             <input 
                                className="w-full p-3 bg-red-50 rounded-xl border-red-100 focus:bg-white focus:ring-2 focus:ring-red-200 outline-none text-red-600 placeholder-red-300"
                                value={editingMed?.details?.contraindications || ''}
                                onChange={e => setEditingMed({...editingMed, details: {...editingMed.details, contraindications: e.target.value}})}
                                placeholder="e.g. Pregnancy, Liver Disease"
                             />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">General Description</label>
                        <textarea 
                            className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none h-20 resize-none"
                            value={editingMed?.description || ''}
                            onChange={e => setEditingMed({...editingMed, description: e.target.value})}
                        />
                    </div>
                </div>

                {/* Section 4: Dosage */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Activity size={14}/> Dosage Guidelines</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input 
                            className="w-full p-2 bg-white rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-pastel-primary"
                            placeholder="Normal Dosage"
                            value={editingMed?.dosage?.normal || ''}
                            onChange={e => setEditingMed({...editingMed, dosage: {...editingMed.dosage!, normal: e.target.value}})}
                        />
                         <input 
                            className="w-full p-2 bg-white rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-pastel-primary"
                            placeholder="Max Safe Limit"
                            value={editingMed?.dosage?.maxSafe || ''}
                            onChange={e => setEditingMed({...editingMed, dosage: {...editingMed.dosage!, maxSafe: e.target.value}})}
                        />
                         <input 
                            className="w-full p-2 bg-white rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-pastel-primary text-red-500 placeholder-red-300"
                            placeholder="Overdose Warning"
                            value={editingMed?.dosage?.overdoseWarning || ''}
                            onChange={e => setEditingMed({...editingMed, dosage: {...editingMed.dosage!, overdoseWarning: e.target.value}})}
                        />
                    </div>
                </div>

                {/* Section 5: Market Rates (Dynamic List) */}
                <div className="space-y-3">
                     <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                        <h3 className="text-sm font-bold text-pastel-primary uppercase tracking-wide flex items-center gap-2">
                            <Store size={16} /> Market Rates
                        </h3>
                        <button type="button" onClick={addMarketRate} className="text-xs bg-pastel-mint text-pastel-primary px-3 py-1.5 rounded-lg font-bold hover:bg-pastel-secondary hover:text-white transition-colors">
                            + Add Rate
                        </button>
                     </div>
                     
                     <div className="space-y-2">
                        {editingMed?.marketRates?.map((rate: MarketRate, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <input 
                                    className="flex-[2] p-2 bg-gray-50 rounded-lg text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                                    placeholder="Shop Name"
                                    value={rate.shopName}
                                    onChange={e => updateMarketRate(idx, 'shopName', e.target.value)}
                                />
                                <input 
                                    type="number"
                                    className="flex-1 p-2 bg-gray-50 rounded-lg text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                                    placeholder="Price"
                                    value={rate.price}
                                    onChange={e => updateMarketRate(idx, 'price', Number(e.target.value))}
                                />
                                <select 
                                    className="flex-1 p-2 bg-gray-50 rounded-lg text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                                    value={rate.type}
                                    onChange={e => updateMarketRate(idx, 'type', e.target.value)}
                                >
                                    <option value="Branded">Branded</option>
                                    <option value="Generic">Generic</option>
                                </select>
                                <button type="button" onClick={() => removeMarketRate(idx)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {(!editingMed?.marketRates || editingMed.marketRates.length === 0) && (
                            <p className="text-xs text-gray-400 italic p-2">No market rates added. Add comparison prices to show savings.</p>
                        )}
                     </div>
                </div>

                {/* Actions */}
                <div className="pt-6 flex gap-3 border-t border-gray-100">
                   <button 
                     type="button" 
                     onClick={() => setShowModal(false)}
                     className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 bg-pastel-primary text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-pastel-secondary transition-all flex justify-center items-center gap-2"
                   >
                     <Save size={18} /> Save Changes
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
