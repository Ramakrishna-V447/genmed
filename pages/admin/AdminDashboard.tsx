
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, Settings, LogOut, 
  Plus, Edit2, Trash2, Save, X, Activity, DollarSign, Store, AlertTriangle, FileText,
  Moon, Sun, ShieldCheck, Upload, Beaker, Pill
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { Medicine, Order, MedicineCategory, ActivityLog, MarketRate } from '../../types';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-colors">
    <div className={`p-4 rounded-xl ${color} text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const ActivityLogItem: React.FC<{ log: ActivityLog }> = ({ log }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-slate-700 last:border-0">
    <div className="bg-gray-100 dark:bg-slate-700 p-2 rounded-full mt-1 transition-colors">
      <Activity size={14} className="text-gray-500 dark:text-gray-300" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{log.action}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{log.details}</p>
      <span className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'medicines' | 'orders' | 'settings'>('overview');
  
  // Data State
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState<any>(null);

  // Strict Auth Check for Separation
  useEffect(() => {
    if (!user) {
        navigate('/admin/login');
        return;
    } 
    
    // Strict Single Admin Enforcment
    if (user.role !== 'admin' || user.email !== 'admin@medigen.com') {
        navigate('/'); // Redirect normal users or imposters back to main site
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
    // Only fetch if admin
    if (user && user.role === 'admin' && user.email === 'admin@medigen.com') {
        fetchData();
    }
  }, [user]);

  const handleLogout = () => {
      logout();
      navigate('/admin/login');
  };

  const handleDeleteMed = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
      await db.deleteMedicine(id);
      fetchData();
    }
  };

  const handleSaveMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMed) return;

    const splitStr = (str: any) => typeof str === 'string' ? str.split(',').map((s: string) => s.trim()).filter(Boolean) : (str || []);

    const medToSave: Medicine = {
      id: editingMed.id || `med_${Date.now()}`,
      name: editingMed.name || 'New Medicine',
      brandExample: editingMed.brandExample || '',
      saltComposition: editingMed.saltComposition || '',
      category: editingMed.category || MedicineCategory.PAIN,
      commonUse: Array.isArray(editingMed.commonUse) ? editingMed.commonUse : splitStr(editingMed.commonUse),
      description: editingMed.description || '',
      genericPrice: Number(editingMed.genericPrice) || 0,
      brandedPrice: Number(editingMed.brandedPrice) || 0,
      stock: Number(editingMed.stock) || 0,
      expiryDate: editingMed.expiryDate || '2025-12-31',
      marketRates: editingMed.marketRates || [],
      imageUrl: editingMed.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
      dosage: {
        normal: editingMed.dosage?.normal || '',
        maxSafe: editingMed.dosage?.maxSafe || '',
        overdoseWarning: editingMed.dosage?.overdoseWarning || ''
      },
      details: {
        mechanism: editingMed.details?.mechanism || '',
        storage: editingMed.details?.storage || '',
        sideEffects: Array.isArray(editingMed.details?.sideEffects) ? editingMed.details.sideEffects : splitStr(editingMed.details?.sideEffects),
        contraindications: Array.isArray(editingMed.details?.contraindications) ? editingMed.details.contraindications : splitStr(editingMed.details?.contraindications)
      }
    };

    await db.saveMedicine(medToSave);
    setShowModal(false);
    setEditingMed(null);
    fetchData();
  };

  const openEditModal = (med?: Medicine) => {
    if (med) {
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
        setEditingMed({
            name: '',
            brandExample: '',
            saltComposition: '',
            category: MedicineCategory.FEVER,
            marketRates: [],
            stock: 100,
            expiryDate: '',
            imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
            description: '',
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

  if (loading) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400">
          <div className="animate-spin mb-4"><Package size={32} /></div>
          <p>Initializing Admin Portal...</p>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex font-sans transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 fixed h-full z-20 hidden lg:flex flex-col transition-colors duration-300">
        <div className="h-20 flex items-center px-8 border-b border-gray-100 dark:border-slate-700 gap-2">
           <ShieldCheck size={28} className="text-pastel-primary" />
           <span className="font-bold text-xl text-pastel-primary tracking-tight">MediGen<span className="text-gray-800 dark:text-white">Admin</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'overview' ? 'bg-pastel-primary text-white shadow-lg shadow-teal-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
           >
             <LayoutDashboard size={20} /> Overview
           </button>
           <button 
             onClick={() => setActiveTab('medicines')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'medicines' ? 'bg-pastel-primary text-white shadow-lg shadow-teal-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
           >
             <Package size={20} /> Medicines
           </button>
           <button 
             onClick={() => setActiveTab('orders')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'orders' ? 'bg-pastel-primary text-white shadow-lg shadow-teal-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
           >
             <ShoppingCart size={20} /> Orders
           </button>
           <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-700">
             <button 
               onClick={() => setActiveTab('settings')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'settings' ? 'bg-pastel-primary text-white shadow-lg shadow-teal-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
             >
               <Settings size={20} /> Settings
             </button>
           </div>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-700">
           <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                 AD
              </div>
              <div>
                 <p className="text-sm font-bold text-gray-800 dark:text-white">Super Admin</p>
                 <p className="text-xs text-gray-400">admin@medigen.com</p>
              </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg text-sm font-bold transition-colors">
              <LogOut size={16} /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 flex-1 p-8">
        
        {/* Top Header Mobile */}
        <div className="lg:hidden mb-6 flex justify-between items-center">
            <span className="font-bold text-xl text-pastel-primary">MediGenAdmin</span>
            <button onClick={handleLogout}><LogOut size={20} className="text-gray-500 dark:text-gray-400"/></button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
           <div className="animate-fade-in space-y-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Total Revenue" value={`₹${orders.reduce((acc, o) => acc + o.totalAmount, 0).toFixed(0)}`} icon={DollarSign} color="bg-green-500" />
                 <StatCard title="Total Orders" value={orders.length} icon={ShoppingCart} color="bg-blue-500" />
                 <StatCard title="Medicines" value={medicines.length} icon={Package} color="bg-purple-500" />
                 <StatCard title="Low Stock Alerts" value={medicines.filter(m => m.stock < 20).length} icon={Activity} color="bg-orange-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Recent Orders */}
                 <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 transition-colors">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">Recent Orders</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                         <thead className="bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-300">
                            <tr>
                               <th className="p-3 rounded-l-lg">ID</th>
                               <th className="p-3">Customer</th>
                               <th className="p-3">Amount</th>
                               <th className="p-3 rounded-r-lg">Status</th>
                            </tr>
                         </thead>
                         <tbody className="dark:text-gray-300">
                            {orders.slice(0, 5).map(order => (
                               <tr key={order.id} className="border-b border-gray-50 dark:border-slate-700 last:border-0 hover:bg-gray-50/50 dark:hover:bg-slate-700/50">
                                  <td className="p-3 font-medium text-gray-700 dark:text-white">#{order.id}</td>
                                  <td className="p-3">{order.customerEmail}</td>
                                  <td className="p-3 font-bold">₹{order.totalAmount}</td>
                                  <td className="p-3">
                                     <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
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
                 <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 transition-colors">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">Activity Log</h3>
                    <div className="space-y-1">
                       {logs.length > 0 ? logs.slice(0, 6).map(log => (
                          <ActivityLogItem key={log.id} log={log} />
                       )) : <p className="text-gray-400 text-sm">No activity recorded.</p>}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* Medicines Tab */}
        {activeTab === 'medicines' && (
           <div className="animate-slide-up space-y-6">
              <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Medicine Inventory</h1>
                 <button 
                   onClick={() => openEditModal()}
                   className="bg-pastel-primary text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-pastel-secondary transition-colors shadow-lg shadow-teal-500/20"
                 >
                    <Plus size={18} /> Add Medicine
                 </button>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-300 font-medium">
                          <tr>
                             <th className="p-4">Image</th>
                             <th className="p-4">Name</th>
                             <th className="p-4">Category</th>
                             <th className="p-4">Price</th>
                             <th className="p-4">Stock</th>
                             <th className="p-4">Expiry</th>
                             <th className="p-4 text-center">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-slate-700 dark:text-gray-300">
                          {medicines.map(med => (
                             <tr key={med.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="p-4">
                                   <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600 bg-white">
                                      <img 
                                        src={med.imageUrl} 
                                        alt={med.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Img'; }}
                                      />
                                   </div>
                                </td>
                                <td className="p-4">
                                   <div className="font-bold text-gray-800 dark:text-white">{med.name}</div>
                                   <div className="text-xs text-gray-400">Ex: {med.brandExample}</div>
                                </td>
                                <td className="p-4">
                                   <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-slate-600">{med.category}</span>
                                </td>
                                <td className="p-4">
                                   <div className="font-bold text-green-600 dark:text-green-400">₹{med.genericPrice}</div>
                                   <div className="text-xs text-gray-400 line-through">₹{med.brandedPrice}</div>
                                </td>
                                <td className="p-4">
                                   <span className={`px-2 py-1 rounded-md text-xs font-bold ${med.stock < 20 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                                      {med.stock} Units
                                   </span>
                                </td>
                                <td className="p-4 text-gray-600 dark:text-gray-400">{med.expiryDate}</td>
                                <td className="p-4 flex justify-center gap-2">
                                   <button 
                                     onClick={() => openEditModal(med)}
                                     className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit">
                                      <Edit2 size={16} />
                                   </button>
                                   <button 
                                     onClick={() => handleDeleteMed(med.id)}
                                     className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
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

        {/* Orders Tab */}
        {activeTab === 'orders' && (
           <div className="animate-slide-up space-y-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Order Management</h1>
              
              <div className="space-y-4">
                 {orders.map(order => (
                    <div key={order.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center transition-colors">
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-lg font-bold text-gray-800 dark:text-white">Order #{order.id}</h3>
                             <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Customer: <span className="font-medium text-gray-700 dark:text-gray-200">{order.customerEmail}</span></p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total: <span className="font-bold text-pastel-primary">₹{order.totalAmount}</span> • {order.items.length} Items</p>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <select 
                             value={order.status}
                             onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                             className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-pastel-primary outline-none cursor-pointer"
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
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 transition-colors">
                       <ShoppingCart className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={32} />
                       <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
                    </div>
                 )}
              </div>
           </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
            <div className="animate-slide-up space-y-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Settings</h1>
                
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 transition-colors">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Moon size={20} className="text-pastel-primary" /> Appearance
                    </h3>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-700">
                        <div>
                            <p className="font-medium text-gray-800 dark:text-white">Theme Preference</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode for the admin panel.</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                            </span>
                            <button 
                                onClick={toggleTheme}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pastel-primary focus:ring-offset-2 ${theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-sm flex items-center justify-center ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`}>
                                    {theme === 'dark' ? <Moon size={12} className="text-slate-700" /> : <Sun size={12} className="text-amber-500" />}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 transition-colors">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <ShieldCheck size={20} className="text-green-500" /> Account Security
                    </h3>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" size={18} />
                        <div>
                            <p className="text-sm font-bold text-yellow-800 dark:text-yellow-500">Super Admin Access</p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-600 mt-1">You are logged in as the Super Admin (admin@medigen.com). Ensure you logout when finished to maintain security.</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up transition-colors">
             <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-20">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    {editingMed?.id ? <Edit2 size={24}/> : <Plus size={24}/>}
                    {editingMed?.id ? 'Edit Medicine' : 'Add New Medicine'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <X size={24} />
                </button>
             </div>
             
             <form onSubmit={handleSaveMed} className="p-6 space-y-8">
                {/* 1. Basic Info Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-pastel-primary uppercase tracking-wide border-b border-gray-100 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                        <Package size={16} /> Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Generic Name</label>
                            <input 
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                                value={editingMed?.name || ''}
                                onChange={e => setEditingMed({...editingMed, name: e.target.value})}
                                required
                                placeholder="e.g. Paracetamol 650mg"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Brand Example</label>
                            <input 
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                                value={editingMed?.brandExample || ''}
                                onChange={e => setEditingMed({...editingMed, brandExample: e.target.value})}
                                required
                                placeholder="e.g. Dolo 650"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Salt Composition</label>
                            <input 
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                                value={editingMed?.saltComposition || ''}
                                onChange={e => setEditingMed({...editingMed, saltComposition: e.target.value})}
                                placeholder="e.g. Paracetamol IP 650mg"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Category</label>
                            <select 
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors cursor-pointer"
                                value={editingMed?.category || MedicineCategory.FEVER}
                                onChange={e => setEditingMed({...editingMed, category: e.target.value})}
                            >
                                {Object.values(MedicineCategory).map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2 group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Description</label>
                            <textarea 
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors min-h-[80px]"
                                value={editingMed?.description || ''}
                                onChange={e => setEditingMed({...editingMed, description: e.target.value})}
                                placeholder="Brief description of the medicine..."
                            />
                        </div>
                        <div className="md:col-span-2 group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Common Uses (Comma Separated)</label>
                            <input 
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                                value={editingMed?.commonUse || ''}
                                onChange={e => setEditingMed({...editingMed, commonUse: e.target.value})}
                                placeholder="Fever, Pain, Headache"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Pricing & Stock */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-pastel-primary uppercase tracking-wide border-b border-gray-100 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                        <DollarSign size={16} /> Pricing & Inventory
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Generic Price (₹)</label>
                            <input 
                                type="number"
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                                value={editingMed?.genericPrice || ''}
                                onChange={e => setEditingMed({...editingMed, genericPrice: e.target.value})}
                                required
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Branded Price (₹)</label>
                            <input 
                                type="number"
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                                value={editingMed?.brandedPrice || ''}
                                onChange={e => setEditingMed({...editingMed, brandedPrice: e.target.value})}
                                required
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Stock Units</label>
                            <input 
                                type="number"
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                                value={editingMed?.stock || ''}
                                onChange={e => setEditingMed({...editingMed, stock: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Image URL</label>
                            <div className="flex gap-2">
                                <input 
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                                    value={editingMed?.imageUrl || ''}
                                    onChange={e => setEditingMed({...editingMed, imageUrl: e.target.value})}
                                    placeholder="https://..."
                                />
                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-gray-200 dark:border-slate-600">
                                    {editingMed?.imageUrl && <img src={editingMed.imageUrl} alt="Preview" className="w-full h-full object-cover" />}
                                </div>
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Expiry Date</label>
                            <input 
                                type="date"
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                                value={editingMed?.expiryDate || ''}
                                onChange={e => setEditingMed({...editingMed, expiryDate: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Dosage Details */}
                <div className="space-y-4">
                     <h3 className="text-sm font-bold text-pastel-primary uppercase tracking-wide border-b border-gray-100 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                        <Beaker size={16} /> Dosage & Safety
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Normal Dosage</label>
                            <input 
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                                value={editingMed?.dosage?.normal || ''}
                                onChange={e => setEditingMed({...editingMed, dosage: {...editingMed.dosage, normal: e.target.value}})}
                                placeholder="e.g. 1 tablet every 8 hours"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Max Safe Dose</label>
                                <input 
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                                    value={editingMed?.dosage?.maxSafe || ''}
                                    onChange={e => setEditingMed({...editingMed, dosage: {...editingMed.dosage, maxSafe: e.target.value}})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Overdose Warning</label>
                                <input 
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                                    value={editingMed?.dosage?.overdoseWarning || ''}
                                    onChange={e => setEditingMed({...editingMed, dosage: {...editingMed.dosage, overdoseWarning: e.target.value}})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Medical Details */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-pastel-primary uppercase tracking-wide border-b border-gray-100 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
                        <FileText size={16} /> Medical Details
                    </h3>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Mechanism of Action</label>
                        <textarea 
                            className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                            value={editingMed?.details?.mechanism || ''}
                            onChange={e => setEditingMed({...editingMed, details: {...editingMed.details, mechanism: e.target.value}})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Storage Instructions</label>
                        <input 
                            className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                            value={editingMed?.details?.storage || ''}
                            onChange={e => setEditingMed({...editingMed, details: {...editingMed.details, storage: e.target.value}})}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Side Effects (Comma Separated)</label>
                            <input 
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                                value={editingMed?.details?.sideEffects || ''}
                                onChange={e => setEditingMed({...editingMed, details: {...editingMed.details, sideEffects: e.target.value}})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Contraindications (Comma Separated)</label>
                            <input 
                                className="w-full p-3 bg-gray-50 dark:bg-slate-700 dark:text-white rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-pastel-primary outline-none transition-colors"
                                value={editingMed?.details?.contraindications || ''}
                                onChange={e => setEditingMed({...editingMed, details: {...editingMed.details, contraindications: e.target.value}})}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex gap-3 border-t border-gray-100 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-800 z-10">
                   <button 
                     type="button" 
                     onClick={() => setShowModal(false)}
                     className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     className="flex-1 bg-pastel-primary text-white py-3.5 rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-pastel-secondary transition-all flex justify-center items-center gap-2"
                   >
                     <Save size={18} /> Save Medicine
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
