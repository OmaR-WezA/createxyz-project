'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Plus, 
  Search,
  Tag,
  Edit2,
  Trash2,
  Percent,
  ToggleLeft,
  ToggleRight,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function CouponsPage() {
  const [user, setUser] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // بيانات نموذج إضافة/تعديل كوبون
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_percent: '',
    description_ar: '',
    is_active: true
  });

  useEffect(() => {
    // التحقق من المصادقة - المدير فقط
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      window.location.href = '/login';
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      window.location.href = '/students';
      return;
    }

    setUser(userData);
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/admin/coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingCoupon 
        ? `/api/admin/coupons/${editingCoupon.code}`
        : '/api/admin/coupons';
      
      const method = editingCoupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...couponForm,
          created_by_admin_id: user.id
        })
      });

      if (response.ok) {
        setShowAddForm(false);
        setEditingCoupon(null);
        resetForm();
        fetchCoupons();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'حدث خطأ في حفظ البيانات');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('حدث خطأ في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      discount_percent: coupon.discount_percent,
      description_ar: coupon.description_ar || '',
      is_active: coupon.is_active
    });
    setShowAddForm(true);
  };

  const toggleCouponStatus = async (code, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/coupons/${code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      });

      if (response.ok) {
        fetchCoupons();
      } else {
        alert('حدث خطأ في تغيير حالة الكوبون');
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      alert('حدث خطأ في تغيير حالة الكوبون');
    }
  };

  const handleDelete = async (code) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/coupons/${code}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchCoupons();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'حدث خطأ في حذف الكوبون');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('حدث خطأ في حذف الكوبون');
    }
  };

  const resetForm = () => {
    setCouponForm({
      code: '',
      discount_percent: '',
      description_ar: '',
      is_active: true
    });
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingCoupon(null);
    resetForm();
  };

  // تصفية الكوبونات
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (coupon.description_ar && coupon.description_ar.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && coupon.is_active) ||
                         (statusFilter === 'inactive' && !coupon.is_active);
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38C5B0]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex" dir="rtl">
      <Sidebar currentUser={user} />
      
      <div className="flex-1 mr-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo font-bold text-2xl text-[#001D2E]">
                إدارة كوبونات الخصم
              </h1>
              <p className="font-cairo text-gray-600 mt-1">
                إضافة وتعديل وحذف كوبونات الخصم
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-[#38C5B0] to-[#21B89A] text-white px-4 py-2 rounded-lg hover:from-[#32B5A1] hover:to-[#1DA688] transition-all duration-200 flex items-center font-cairo"
            >
              <Plus size={20} className="ml-2" />
              إضافة كوبون جديد
            </button>
          </div>
        </div>

        {/* أدوات البحث والتصفية */}
        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* البحث */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="البحث بالكود أو الوصف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                />
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* تصفية الحالة */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                >
                  <option value="">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
            </div>
          </div>

          {/* بطاقات الكوبونات */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38C5B0] mx-auto"></div>
              <p className="font-cairo text-gray-500 mt-2">جارٍ تحميل البيانات...</p>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-8">
              <Tag size={48} className="mx-auto mb-2 text-gray-400" />
              <p className="font-cairo text-gray-500">لا توجد كوبونات متاحة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoupons.map((coupon) => (
                <div key={coupon.code} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="text-center">
                    {/* رمز الكوبون */}
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag size={24} className="text-white" />
                    </div>
                    
                    {/* معلومات الكوبون */}
                    <h3 className="font-cairo font-semibold text-lg text-[#001D2E] mb-2">
                      {coupon.code}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-center text-2xl font-bold text-green-600">
                        <Percent size={16} className="ml-1" />
                        <span className="font-cairo">{coupon.discount_percent}</span>
                      </div>
                      
                      {coupon.description_ar && (
                        <p className="font-cairo text-sm text-gray-600 px-2">
                          {coupon.description_ar}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-center">
                        {coupon.is_active ? (
                          <span className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-cairo">
                            <CheckCircle size={12} className="ml-1" />
                            نشط
                          </span>
                        ) : (
                          <span className="flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-cairo">
                            <XCircle size={12} className="ml-1" />
                            غير نشط
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Calendar size={14} className="ml-2" />
                        <span className="font-cairo">
                          {new Date(coupon.created_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>
                    
                    {/* أزرار الإجراءات */}
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => toggleCouponStatus(coupon.code, coupon.is_active)}
                        className={`px-3 py-2 rounded text-sm font-cairo transition-colors flex items-center ${
                          coupon.is_active 
                            ? 'bg-orange-500 text-white hover:bg-orange-600' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {coupon.is_active ? (
                          <>
                            <ToggleLeft size={14} className="ml-1" />
                            إلغاء تفعيل
                          </>
                        ) : (
                          <>
                            <ToggleRight size={14} className="ml-1" />
                            تفعيل
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="bg-blue-500 text-white px-3 py-2 rounded text-sm font-cairo hover:bg-blue-600 transition-colors flex items-center"
                      >
                        <Edit2 size={14} className="ml-1" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.code)}
                        className="bg-red-500 text-white px-3 py-2 rounded text-sm font-cairo hover:bg-red-600 transition-colors flex items-center"
                      >
                        <Trash2 size={14} className="ml-1" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* نافذة إضافة/تعديل كوبون */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-cairo font-bold text-xl text-[#001D2E] mb-4">
              {editingCoupon ? 'تعديل بيانات الكوبون' : 'إضافة كوبون جديد'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  كود الكوبون *
                </label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  placeholder="مثال: DISCOUNT10"
                  required
                  disabled={editingCoupon} // منع التعديل عند التحديث
                />
              </div>

              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  نسبة الخصم (%) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="0.01"
                  value={couponForm.discount_percent}
                  onChange={(e) => setCouponForm({...couponForm, discount_percent: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  placeholder="10"
                  required
                />
              </div>

              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  وصف الكوبون
                </label>
                <textarea
                  value={couponForm.description_ar}
                  onChange={(e) => setCouponForm({...couponForm, description_ar: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  rows="3"
                  placeholder="وصف مختصر للكوبون..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={couponForm.is_active}
                  onChange={(e) => setCouponForm({...couponForm, is_active: e.target.checked})}
                  className="ml-2 h-4 w-4 text-[#38C5B0] focus:ring-[#38C5B0] border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="font-cairo font-medium text-gray-700">
                  كوبون نشط
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-cairo hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#38C5B0] to-[#21B89A] text-white rounded-lg font-cairo hover:from-[#32B5A1] hover:to-[#1DA688] transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'جارٍ الحفظ...' : editingCoupon ? 'تحديث' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700&display=swap');
        
        * {
          direction: rtl;
        }
        
        body {
          font-family: 'Cairo', 'Tajawal', sans-serif;
          direction: rtl;
        }
        
        .font-cairo {
          font-family: 'Cairo', 'Tajawal', sans-serif;
        }
      `}</style>
    </div>
  );
}