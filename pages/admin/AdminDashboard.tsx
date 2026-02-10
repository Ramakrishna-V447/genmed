
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, 
  Plus, Edit2, Trash2, Save, X, Search, ChevronUp, ChevronDown, Activity, DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Medicine, Order, MedicineCategory, ActivityLog } from '../../types';
import { useNavigate } from 'react-router-dom';

// --- Sub-Components for Dashboard ---

const StatCard = ({ title, value, icon: Icon, color }: any) => (
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

const ActivityLogItem = ({ log }: { log: ActivityLog }) => (
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
  const [editingMed, setEditingMed] = useState<Partial<Medicine> | null>(null);

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

    // Basic validation / defaults for new items
    const medToSave: Medicine = {
      id: editingMed.id || `med_${Date.now()}`,
      name: editingMed.name || 'New Medicine',
      brandExample: editingMed.brandExample || 'Brand',
      saltComposition: editingMed.saltComposition || '',
      category: editingMed.category || MedicineCategory.PAIN,
      commonUse: typeof editingMed.commonUse === 'string' ? (editingMed.commonUse as string).split(',') : (editingMed.commonUse || []),
      description: editingMed.description || '',
      genericPrice: Number(editingMed.genericPrice) || 0,
      brandedPrice: Number(editingMed.brandedPrice) || 0,
      marketRates: editingMed.marketRates || [],
      imageUrl: editingMed.imageUrl || 'https://via.placeholder.com/150',
      dosage: editingMed.dosage || { normal: '', maxSafe: '', overdoseWarning: '' },
      details: editingMed.details || { mechanism: '', sideEffects: [], contraindications: [], storage: '' }
    };

    await db.saveMedicine(medToSave);
    setShowModal(false);
    setEditingMed(null);
    fetchData();
  };

  const openEditModal = (med?: Medicine) => {
    setEditingMed(med || {
        category: MedicineCategory.FEVER,
        marketRates: [],
        dosage: { normal: '', maxSafe: '', overdoseWarning: '' },
        details: { mechanism: '', sideEffects: [], contraindications: [], storage: '' }
    });
    setShowModal(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    await db.updateOrderStatus(orderId, status);
    fetchData();
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
                 <StatCard title="Active Users" value="12" icon={Users} color="bg-orange-500" />
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
                             <th className="p-4">Generic Price</th>
                             <th className="p-4">Brand Price</th>
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
                                <td className="p-4 font-bold text-green-600">₹{med.genericPrice}</td>
                                <td className="p-4 text-gray-500">₹{med.brandedPrice}</td>
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-800">{editingMed?.id ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleSaveMed} className="p-6 space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Generic Price (₹)</label>
                      <input 
                        type="number"
                        className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                        value={editingMed?.genericPrice || ''}
                        onChange={e => setEditingMed({...editingMed, genericPrice: Number(e.target.value)})}
                        required
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Branded Price (₹)</label>
                      <input 
                        type="number"
                        className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                        value={editingMed?.brandedPrice || ''}
                        onChange={e => setEditingMed({...editingMed, brandedPrice: Number(e.target.value)})}
                        required
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                   <select 
                      className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none"
                      value={editingMed?.category || MedicineCategory.PAIN}
                      onChange={e => setEditingMed({...editingMed, category: e.target.value as MedicineCategory})}
                   >
                      {Object.values(MedicineCategory).map(cat => (
                         <option key={cat} value={cat}>{cat}</option>
                      ))}
                   </select>
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                    <textarea 
                        className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-pastel-primary outline-none h-24 resize-none"
                        value={editingMed?.description || ''}
                        onChange={e => setEditingMed({...editingMed, description: e.target.value})}
                    />
                </div>

                <div className="pt-4 flex gap-3">
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
