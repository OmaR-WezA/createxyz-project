'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Plus, 
  Search, 
  Filter,
  GraduationCap,
  Edit2,
  Trash2,
  Eye,
  Users,
  BookOpen
} from 'lucide-react';

export default function TeachersPage() {
  const [user, setUser] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // بيانات نموذج إضافة/تعديل مدرس
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    subject: '',
    stage: '',
    class: '',
    image_url: ''
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
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers');
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingTeacher 
        ? `/api/admin/teachers/${editingTeacher.teacher_id}`
        : '/api/admin/teachers';
      
      const method = editingTeacher ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherForm)
      });

      if (response.ok) {
        setShowAddForm(false);
        setEditingTeacher(null);
        resetForm();
        fetchTeachers();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'حدث خطأ في حفظ البيانات');
      }
    } catch (error) {
      console.error('Error saving teacher:', error);
      alert('حدث خطأ في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setTeacherForm({
      name: teacher.name,
      subject: teacher.subject,
      stage: teacher.stage,
      class: teacher.class,
      image_url: teacher.image_url || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (teacherId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المدرس؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchTeachers();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'حدث خطأ في حذف المدرس');
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('حدث خطأ في حذف المدرس');
    }
  };

  const resetForm = () => {
    setTeacherForm({
      name: '',
      subject: '',
      stage: '',
      class: '',
      image_url: ''
    });
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingTeacher(null);
    resetForm();
  };

  // تصفية المدرسين
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === '' || teacher.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  // خيارات المراحل الدراسية
  const stageOptions = [
    { value: '', label: 'جميع المراحل' },
    { value: 'ابتدائي', label: 'ابتدائي' },
    { value: 'إعدادي', label: 'إعدادي' },
    { value: 'ثانوي', label: 'ثانوي' }
  ];

  // خيارات الصفوف حسب المرحلة
  const getClassOptions = (stage) => {
    switch (stage) {
      case 'ابتدائي':
        return [
          { value: 'الصف الأول الابتدائي', label: 'الصف الأول' },
          { value: 'الصف الثاني الابتدائي', label: 'الصف الثاني' },
          { value: 'الصف الثالث الابتدائي', label: 'الصف الثالث' },
          { value: 'الصف الرابع الابتدائي', label: 'الصف الرابع' },
          { value: 'الصف الخامس الابتدائي', label: 'الصف الخامس' },
          { value: 'الصف السادس الابتدائي', label: 'الصف السادس' }
        ];
      case 'إعدادي':
        return [
          { value: 'الصف الأول الإعدادي', label: 'الصف الأول' },
          { value: 'الصف الثاني الإعدادي', label: 'الصف الثاني' },
          { value: 'الصف الثالث الإعدادي', label: 'الصف الثالث' }
        ];
      case 'ثانوي':
        return [
          { value: 'الصف الأول الثانوي', label: 'الصف الأول' },
          { value: 'الصف الثاني الثانوي', label: 'الصف الثاني' },
          { value: 'الصف الثالث الثانوي', label: 'الصف الثالث' }
        ];
      default:
        return [];
    }
  };

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
                إدارة المدرسين
              </h1>
              <p className="font-cairo text-gray-600 mt-1">
                إضافة وتعديل وحذف بيانات المدرسين
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-[#38C5B0] to-[#21B89A] text-white px-4 py-2 rounded-lg hover:from-[#32B5A1] hover:to-[#1DA688] transition-all duration-200 flex items-center font-cairo"
            >
              <Plus size={20} className="ml-2" />
              إضافة مدرس جديد
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
                  placeholder="البحث بالاسم أو المادة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                />
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* تصفية المرحلة */}
              <div className="relative">
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                >
                  {stageOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* جدول المدرسين */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-cairo font-semibold text-lg text-[#001D2E]">
                قائمة المدرسين ({filteredTeachers.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38C5B0] mx-auto"></div>
                  <p className="font-cairo text-gray-500 mt-2">جارٍ تحميل البيانات...</p>
                </div>
              ) : filteredTeachers.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap size={48} className="mx-auto mb-2 text-gray-400" />
                  <p className="font-cairo text-gray-500">لا توجد مدرسون متاحون</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">الصورة</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">الاسم</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">المادة</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">المرحلة</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">الصف</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">عدد الطلاب</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.teacher_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                            {teacher.image_url ? (
                              <img 
                                src={teacher.image_url} 
                                alt={teacher.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <GraduationCap size={20} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-cairo font-medium text-[#001D2E]">
                            {teacher.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-cairo text-gray-600">
                            {teacher.subject}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-cairo text-gray-600">
                            {teacher.stage}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-cairo text-gray-600">
                            {teacher.class}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Users size={16} className="text-gray-400 ml-2" />
                            <span className="font-cairo text-gray-600">
                              {teacher.student_count || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(teacher)}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-cairo hover:bg-blue-600 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(teacher.teacher_id)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-sm font-cairo hover:bg-red-600 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* نافذة إضافة/تعديل مدرس */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-cairo font-bold text-xl text-[#001D2E] mb-4">
              {editingTeacher ? 'تعديل بيانات المدرس' : 'إضافة مدرس جديد'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  اسم المدرس *
                </label>
                <input
                  type="text"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  required
                />
              </div>

              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  المادة *
                </label>
                <input
                  type="text"
                  value={teacherForm.subject}
                  onChange={(e) => setTeacherForm({...teacherForm, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  required
                />
              </div>

              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  المرحلة الدراسية *
                </label>
                <select
                  value={teacherForm.stage}
                  onChange={(e) => setTeacherForm({...teacherForm, stage: e.target.value, class: ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  required
                >
                  <option value="">اختر المرحلة</option>
                  <option value="ابتدائي">ابتدائي</option>
                  <option value="إعدادي">إعدادي</option>
                  <option value="ثانوي">ثانوي</option>
                </select>
              </div>

              {teacherForm.stage && (
                <div>
                  <label className="block font-cairo font-medium text-gray-700 mb-2">
                    الصف *
                  </label>
                  <select
                    value={teacherForm.class}
                    onChange={(e) => setTeacherForm({...teacherForm, class: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                    required
                  >
                    <option value="">اختر الصف</option>
                    {getClassOptions(teacherForm.stage).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  value={teacherForm.image_url}
                  onChange={(e) => setTeacherForm({...teacherForm, image_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  placeholder="https://example.com/image.jpg"
                />
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
                  {loading ? 'جارٍ الحفظ...' : editingTeacher ? 'تحديث' : 'حفظ'}
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