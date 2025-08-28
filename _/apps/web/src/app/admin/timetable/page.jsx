'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Plus, 
  Search,
  Clock,
  Edit2,
  Trash2,
  Calendar,
  Users,
  BookOpen,
  GraduationCap
} from 'lucide-react';

export default function TimetablePage() {
  const [user, setUser] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // بيانات نموذج إضافة/تعديل جدول
  const [scheduleForm, setScheduleForm] = useState({
    subject_id: '',
    day_of_week_ar: '',
    start_time: '',
    end_time: '',
    group_name_ar: '',
    max_students: 20
  });

  const daysOfWeek = [
    { value: '', label: 'جميع الأيام' },
    { value: 'الأحد', label: 'الأحد' },
    { value: 'الاثنين', label: 'الاثنين' },
    { value: 'الثلاثاء', label: 'الثلاثاء' },
    { value: 'الأربعاء', label: 'الأربعاء' },
    { value: 'الخميس', label: 'الخميس' },
    { value: 'الجمعة', label: 'الجمعة' },
    { value: 'السبت', label: 'السبت' }
  ];

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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [timetableRes, subjectsRes, teachersRes] = await Promise.all([
        fetch('/api/admin/timetable'),
        fetch('/api/admin/subjects'),
        fetch('/api/admin/teachers')
      ]);

      if (timetableRes.ok) {
        const timetableData = await timetableRes.json();
        setTimetable(timetableData);
      }

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingSchedule 
        ? `/api/admin/timetable/${editingSchedule.schedule_id}`
        : '/api/admin/timetable';
      
      const method = editingSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleForm)
      });

      if (response.ok) {
        setShowAddForm(false);
        setEditingSchedule(null);
        resetForm();
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'حدث خطأ في حفظ البيانات');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('حدث خطأ في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      subject_id: schedule.subject_id,
      day_of_week_ar: schedule.day_of_week_ar,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      group_name_ar: schedule.group_name_ar,
      max_students: schedule.max_students
    });
    setShowAddForm(true);
  };

  const handleDelete = async (scheduleId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/timetable/${scheduleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'حدث خطأ في حذف الموعد');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('حدث خطأ في حذف الموعد');
    }
  };

  const resetForm = () => {
    setScheduleForm({
      subject_id: '',
      day_of_week_ar: '',
      start_time: '',
      end_time: '',
      group_name_ar: '',
      max_students: 20
    });
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingSchedule(null);
    resetForm();
  };

  // تصفية الجدول
  const filteredTimetable = timetable.filter(schedule => {
    const matchesSearch = schedule.subject_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.group_name_ar.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = dayFilter === '' || schedule.day_of_week_ar === dayFilter;
    return matchesSearch && matchesDay;
  });

  // ترتيب الجدول حسب اليوم والوقت
  const sortedTimetable = filteredTimetable.sort((a, b) => {
    const dayOrder = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayComparison = dayOrder.indexOf(a.day_of_week_ar) - dayOrder.indexOf(b.day_of_week_ar);
    if (dayComparison !== 0) return dayComparison;
    return a.start_time.localeCompare(b.start_time);
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
                الجدول الدراسي
              </h1>
              <p className="font-cairo text-gray-600 mt-1">
                إدارة أوقات المواد والحصص الدراسية
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-[#38C5B0] to-[#21B89A] text-white px-4 py-2 rounded-lg hover:from-[#32B5A1] hover:to-[#1DA688] transition-all duration-200 flex items-center font-cairo"
            >
              <Plus size={20} className="ml-2" />
              إضافة موعد جديد
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
                  placeholder="البحث بالمادة أو المدرس أو المجموعة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                />
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* تصفية اليوم */}
              <div className="relative">
                <select
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* جدول المواعيد */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-cairo font-semibold text-lg text-[#001D2E]">
                الجدول الدراسي ({sortedTimetable.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38C5B0] mx-auto"></div>
                  <p className="font-cairo text-gray-500 mt-2">جارٍ تحميل البيانات...</p>
                </div>
              ) : sortedTimetable.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto mb-2 text-gray-400" />
                  <p className="font-cairo text-gray-500">لا توجد مواعيد متاحة</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">اليوم</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">الوقت</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">المادة</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">المدرس</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">المجموعة</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">العدد الأقصى</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">المشتركين</th>
                      <th className="px-6 py-3 text-right font-cairo font-semibold text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedTimetable.map((schedule) => (
                      <tr key={schedule.schedule_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Calendar size={16} className="text-gray-400 ml-2" />
                            <span className="font-cairo font-medium text-[#001D2E]">
                              {schedule.day_of_week_ar}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Clock size={16} className="text-gray-400 ml-2" />
                            <span className="font-cairo text-gray-600">
                              {schedule.start_time} - {schedule.end_time}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <BookOpen size={16} className="text-gray-400 ml-2" />
                            <span className="font-cairo text-gray-600">
                              {schedule.subject_name_ar}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <GraduationCap size={16} className="text-gray-400 ml-2" />
                            <span className="font-cairo text-gray-600">
                              {schedule.teacher_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-cairo font-medium text-[#38C5B0]">
                            {schedule.group_name_ar}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-cairo text-gray-600">
                            {schedule.max_students}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Users size={16} className="text-gray-400 ml-2" />
                            <span className="font-cairo text-gray-600">
                              {schedule.enrolled_count || 0}/{schedule.max_students}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(schedule)}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-cairo hover:bg-blue-600 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(schedule.schedule_id)}
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

      {/* نافذة إضافة/تعديل موعد */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-cairo font-bold text-xl text-[#001D2E] mb-4">
              {editingSchedule ? 'تعديل الموعد' : 'إضافة موعد جديد'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  المادة *
                </label>
                <select
                  value={scheduleForm.subject_id}
                  onChange={(e) => setScheduleForm({...scheduleForm, subject_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  required
                >
                  <option value="">اختر المادة</option>
                  {subjects.map(subject => (
                    <option key={subject.subject_id} value={subject.subject_id}>
                      {subject.subject_name_ar} - {subject.teacher_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  اليوم *
                </label>
                <select
                  value={scheduleForm.day_of_week_ar}
                  onChange={(e) => setScheduleForm({...scheduleForm, day_of_week_ar: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  required
                >
                  <option value="">اختر اليوم</option>
                  {daysOfWeek.slice(1).map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-cairo font-medium text-gray-700 mb-2">
                    وقت البداية *
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.start_time}
                    onChange={(e) => setScheduleForm({...scheduleForm, start_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-cairo font-medium text-gray-700 mb-2">
                    وقت النهاية *
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.end_time}
                    onChange={(e) => setScheduleForm({...scheduleForm, end_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  اسم المجموعة *
                </label>
                <input
                  type="text"
                  value={scheduleForm.group_name_ar}
                  onChange={(e) => setScheduleForm({...scheduleForm, group_name_ar: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  placeholder="مثال: المجموعة الأولى"
                  required
                />
              </div>

              <div>
                <label className="block font-cairo font-medium text-gray-700 mb-2">
                  العدد الأقصى للطلاب *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={scheduleForm.max_students}
                  onChange={(e) => setScheduleForm({...scheduleForm, max_students: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  required
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
                  {loading ? 'جارٍ الحفظ...' : editingSchedule ? 'تحديث' : 'حفظ'}
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