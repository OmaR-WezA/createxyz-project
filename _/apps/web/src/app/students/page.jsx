'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Plus, 
  Search, 
  Filter,
  Users,
  BarChart3,
  UserPlus,
  Eye,
  Phone,
  BookOpen
} from 'lucide-react';

export default function StudentsPage() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    attendanceRate: 0
  });

  // بيانات نموذج إضافة طالب جديد
  const [newStudent, setNewStudent] = useState({
    name: '',
    phone: '',
    parent_phone: '',
    grade_level: '',
    class: ''
  });

  useEffect(() => {
    // التحقق من المصادقة
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      window.location.href = '/login';
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin' && userData.role !== 'staff') {
      window.location.href = '/login';
      return;
    }

    setUser(userData);
    fetchStudents();
    fetchStats();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/students/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newStudent,
          created_by_staff_id: user.staff_id || null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShowAddForm(false);
        setNewStudent({
          name: '',
          phone: '',
          parent_phone: '',
          grade_level: '',
          class: ''
        });
        fetchStudents();
        fetchStats();
        
        // إعادة توجيه لصفحة ملف الطالب الجديد
        window.location.href = `/students/${data.student_id}`;
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'حدث خطأ في إضافة الطالب');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('حدث خطأ في إضافة الطالب');
    } finally {
      setLoading(false);
    }
  };

  // تصفية الطلاب
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === '' || student.grade_level === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  // خيارات المراحل الدراسية
  const gradeOptions = [
    { value: '', label: 'جميع المراحل' },
    { value: 'ابتدائي', label: 'ابتدائي' },
    { value: 'إعدادي', label: 'إعدادي' },
    { value: 'ثانوي', label: 'ثانوي' }
  ];

  // خيارات الصفوف حسب المرحلة
  const getClassOptions = (gradeLevel) => {
    switch (gradeLevel) {
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
                إدارة الطلاب
              </h1>
              <p className="font-cairo text-gray-600 mt-1">
                إدارة بيانات الطلاب والاشتراكات والمدفوعات
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-[#38C5B0] to-[#21B89A] text-white px-4 py-2 rounded-lg hover:from-[#32B5A1] hover:to-[#1DA688] transition-all duration-200 flex items-center font-cairo"
            >
              <Plus size={20} className="ml-2" />
              إضافة طالب جديد
            </button>
          </div>
        </div>

        {/* محتوى الصفحة */}
        <div className="p-6">
          {/* الشبكة الرئيسية - 4 أقسام */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* 1. إضافة طالب جديد */}
            <div 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-br from-[#38C5B0] to-[#21B89A] text-white rounded-xl p-6 cursor-pointer hover:from-[#32B5A1] hover:to-[#1DA688] transition-all duration-200"
            >
              <div className="text-center">
                <UserPlus size={48} className="mx-auto mb-3" />
                <h3 className="font-cairo font-semibold text-lg mb-2">
                  إضافة طالب جديد
                </h3>
                <p className="font-cairo text-sm opacity-90">
                  انقر لإضافة طالب جديد للنظام
                </p>
              </div>
            </div>

            {/* 2. البحث عن طالب */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-center">
                <Search size={48} className="mx-auto mb-3 text-[#38C5B0]" />
                <h3 className="font-cairo font-semibold text-lg mb-3 text-[#001D2E]">
                  البحث عن طالب
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="اسم الطالب أو الكود..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo text-sm focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* 3. فلاتر العرض */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-center">
                <Filter size={48} className="mx-auto mb-3 text-[#38C5B0]" />
                <h3 className="font-cairo font-semibold text-lg mb-3 text-[#001D2E]">
                  تصفية حسب المرحلة
                </h3>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo text-sm focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                >
                  {gradeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. الإحصائيات */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-3 text-[#38C5B0]" />
                <h3 className="font-cairo font-semibold text-lg mb-3 text-[#001D2E]">
                  الإحصائيات
                </h3>
                <div className="space-y-2">
                  <p className="font-cairo text-sm">
                    <span className="font-semibold text-[#001D2E]">{stats.totalStudents}</span> طالب
                  </p>
                  <p className="font-cairo text-sm">
                    <span className="font-semibold text-[#001D2E]">{stats.attendanceRate}%</span> معدل حضور
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* جدول الطلاب */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-cairo font-semibold text-lg text-[#001D2E]">
                قائمة الطلاب ({filteredStudents.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38C5B0] mx-auto"></div>
                  <p className="font-cairo text-gray-500 mt-2">جارٍ تحميل البيانات...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto mb-2 text-gray-400" />
                  <p className="font-cairo text-gray-500">لا توجد طلاب متاحون</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">كود الطالب</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">الاسم</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">المرحلة الدراسية</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">الصف</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">هاتف ولي الأمر</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.student_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="font-cairo font-semibold text-[#38C5B0]">
                            {student.student_id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-cairo font-medium text-[#001D2E]">
                            {student.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-cairo text-gray-600">
                            {student.grade_level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-cairo text-gray-600">
                            {student.class}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Phone size={16} className="text-gray-400 ml-2" />
                            <span className="font-cairo text-gray-600">
                              {student.parent_phone}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`/students/${student.student_id}`}
                            className="bg-[#38C5B0] text-white px-3 py-1 rounded text-sm font-cairo hover:bg-[#32B5A1] transition-colors inline-flex items-center"
                          >
                            <Eye size={16} className="ml-1" />
                            عرض الملف
                          </a>
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

      {/* نافذة إضافة طالب جديد */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-cairo font-bold text-xl text-[#001D2E] mb-4">
              إضافة طالب جديد
            </h3>
            
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  اسم الطالب *
                </label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  required
                />
              </div>

              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  هاتف الطالب
                </label>
                <input
                  type="tel"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                />
              </div>

              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  هاتف ولي الأمر *
                </label>
                <input
                  type="tel"
                  value={newStudent.parent_phone}
                  onChange={(e) => setNewStudent({...newStudent, parent_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  required
                />
              </div>

              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  المرحلة الدراسية *
                </label>
                <select
                  value={newStudent.grade_level}
                  onChange={(e) => setNewStudent({...newStudent, grade_level: e.target.value, class: ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  required
                >
                  <option value="">اختر المرحلة</option>
                  <option value="ابتدائي">ابتدائي</option>
                  <option value="إعدادي">إعدادي</option>
                  <option value="ثانوي">ثانوي</option>
                </select>
              </div>

              {newStudent.grade_level && (
                <div>
                  <label className="block font-cairo font-medium text-gray-700 mb-2">
                    الصف *
                  </label>
                  <select
                    value={newStudent.class}
                    onChange={(e) => setNewStudent({...newStudent, class: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                    required
                  >
                    <option value="">اختر الصف</option>
                    {getClassOptions(newStudent.grade_level).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-cairo hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#38C5B0] to-[#21B89A] text-white rounded-lg font-cairo hover:from-[#32B5A1] hover:to-[#1DA688] transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'جارٍ الحفظ...' : 'حفظ'}
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