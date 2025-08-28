'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Plus, 
  Search,
  UserCheck,
  Edit2,
  Trash2,
  Mail,
  Calendar,
  Users
} from 'lucide-react';

export default function StaffPage() {
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // بيانات نموذج إضافة/تعديل موظف
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: ''
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
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/admin/staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingStaff 
        ? `/api/admin/staff/${editingStaff.staff_id}`
        : '/api/admin/staff';
      
      const method = editingStaff ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm)
      });

      if (response.ok) {
        setShowAddForm(false);
        setEditingStaff(null);
        resetForm();
        fetchStaff();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'حدث خطأ في حفظ البيانات');
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('حدث خطأ في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setStaffForm({
      name: staffMember.name,
      email: staffMember.email,
      password: '' // لا نعرض كلمة المرور الحالية
    });
    setShowAddForm(true);
  };

  const handleDelete = async (staffId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/staff/${staffId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchStaff();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'حدث خطأ في حذف الموظف');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('حدث خطأ في حذف الموظف');
    }
  };

  const resetForm = () => {
    setStaffForm({
      name: '',
      email: '',
      password: ''
    });
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingStaff(null);
    resetForm();
  };

  // تصفية الموظفين
  const filteredStaff = staff.filter(staffMember => {
    const matchesSearch = staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.staff_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
                إدارة الموظفين
              </h1>
              <p className="font-cairo text-gray-600 mt-1">
                إضافة وتعديل وحذف حسابات الموظفين
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-[#38C5B0] to-[#21B89A] text-white px-4 py-2 rounded-lg hover:from-[#32B5A1] hover:to-[#1DA688] transition-all duration-200 flex items-center font-cairo"
            >
              <Plus size={20} className="ml-2" />
              إضافة موظف جديد
            </button>
          </div>
        </div>

        {/* أدوات البحث */}
        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="البحث بالاسم أو البريد الإلكتروني أو المعرف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
              />
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* بطاقات الموظفين */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38C5B0] mx-auto"></div>
              <p className="font-cairo text-gray-500 mt-2">جارٍ تحميل البيانات...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck size={48} className="mx-auto mb-2 text-gray-400" />
              <p className="font-cairo text-gray-500">لا توجد موظفون متاحون</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map((staffMember) => (
                <div key={staffMember.staff_id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="text-center">
                    {/* صورة الموظف */}
                    <div className="w-16 h-16 bg-gradient-to-br from-[#38C5B0] to-[#21B89A] rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCheck size={24} className="text-white" />
                    </div>
                    
                    {/* معلومات الموظف */}
                    <h3 className="font-cairo font-semibold text-lg text-[#001D2E] mb-2">
                      {staffMember.name}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <span className="font-cairo font-medium bg-[#38C5B0] bg-opacity-10 text-[#38C5B0] px-2 py-1 rounded">
                          {staffMember.staff_id}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Mail size={14} className="ml-2" />
                        <span className="font-cairo">{staffMember.email}</span>
                      </div>
                      
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Calendar size={14} className="ml-2" />
                        <span className="font-cairo">
                          انضم في {new Date(staffMember.created_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>

                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Users size={14} className="ml-2" />
                        <span className="font-cairo">
                          {staffMember.student_count || 0} طالب مضاف
                        </span>
                      </div>
                    </div>
                    
                    {/* أزرار الإجراءات */}
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => handleEdit(staffMember)}
                        className="bg-blue-500 text-white px-3 py-2 rounded text-sm font-cairo hover:bg-blue-600 transition-colors flex items-center"
                      >
                        <Edit2 size={14} className="ml-1" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(staffMember.staff_id)}
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

      {/* نافذة إضافة/تعديل موظف */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-cairo font-bold text-xl text-[#001D2E] mb-4">
              {editingStaff ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  اسم الموظف *
                </label>
                <input
                  type="text"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({...staffForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  required
                />
              </div>

              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({...staffForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  required
                />
              </div>

              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  كلمة المرور {editingStaff ? '(اتركها فارغة لعدم التغيير)' : '*'}
                </label>
                <input
                  type="password"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({...staffForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  required={!editingStaff}
                  placeholder={editingStaff ? 'اتركها فارغة لعدم التغيير' : ''}
                />
              </div>

              {!editingStaff && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="font-cairo text-blue-700 text-sm">
                    <strong>ملاحظة:</strong> سيتم توليد معرف الموظف (Staff ID) تلقائياً
                  </p>
                </div>
              )}

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
                  {loading ? 'جارٍ الحفظ...' : editingStaff ? 'تحديث' : 'حفظ'}
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