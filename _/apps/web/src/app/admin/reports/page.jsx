'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  BarChart3, 
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  BookOpen,
  PieChart,
  Activity
} from 'lucide-react';

export default function ReportsPage() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    activeEnrollments: 0,
    totalTeachers: 0,
    monthlyStats: [],
    subjectStats: [],
    paymentStats: []
  });
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
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
    
    // تعيين التواريخ الافتراضية (آخر 6 أشهر)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    setDateFilter({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dateFilter)
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = () => {
    setLoading(true);
    fetchReportsData();
  };

  const exportReport = async (type) => {
    try {
      const response = await fetch(`/api/admin/reports/export?type=${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dateFilter)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('حدث خطأ في تصدير التقرير');
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
                التقارير والإحصائيات
              </h1>
              <p className="font-cairo text-gray-600 mt-1">
                تقارير شاملة عن أداء السنتر التعليمي
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* مرشحات التاريخ */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Calendar size={20} className="text-[#38C5B0] ml-2" />
                  <span className="font-cairo font-semibold text-[#001D2E]">فترة التقرير</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                />
                <span className="font-cairo text-gray-500">إلى</span>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                />
                <button
                  onClick={handleDateFilterChange}
                  className="bg-[#38C5B0] text-white px-4 py-2 rounded-lg hover:bg-[#32B5A1] transition-colors flex items-center font-cairo"
                >
                  <Filter size={16} className="ml-2" />
                  تطبيق
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38C5B0] mx-auto"></div>
              <p className="font-cairo text-gray-500 mt-2">جارٍ تحميل التقارير...</p>
            </div>
          ) : (
            <>
              {/* إحصائيات عامة */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-cairo text-sm text-gray-600">إجمالي الطلاب</p>
                      <p className="font-cairo text-2xl font-bold text-[#001D2E]">{reports.totalStudents}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users size={24} className="text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-cairo text-sm text-gray-600">إجمالي الإيرادات</p>
                      <p className="font-cairo text-2xl font-bold text-green-600">{reports.totalRevenue} ج.م</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign size={24} className="text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-cairo text-sm text-gray-600">الاشتراكات النشطة</p>
                      <p className="font-cairo text-2xl font-bold text-[#38C5B0]">{reports.activeEnrollments}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#38C5B0] bg-opacity-10 rounded-full flex items-center justify-center">
                      <Activity size={24} className="text-[#38C5B0]" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-cairo text-sm text-gray-600">إجمالي المدرسين</p>
                      <p className="font-cairo text-2xl font-bold text-orange-600">{reports.totalTeachers}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <BookOpen size={24} className="text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* الرسوم البيانية */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* إحصائيات المواد */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-cairo font-semibold text-lg text-[#001D2E]">
                      إحصائيات المواد
                    </h3>
                    <PieChart size={20} className="text-[#38C5B0]" />
                  </div>
                  <div className="space-y-3">
                    {reports.subjectStats.slice(0, 5).map((subject, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-cairo text-sm text-gray-600">{subject.subject_name}</span>
                        <div className="flex items-center">
                          <span className="font-cairo text-sm font-medium text-[#001D2E] ml-2">
                            {subject.enrollment_count}
                          </span>
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-[#38C5B0] rounded-full"
                              style={{ width: `${(subject.enrollment_count / Math.max(...reports.subjectStats.map(s => s.enrollment_count))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* إحصائيات المدفوعات */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-cairo font-semibold text-lg text-[#001D2E]">
                      طرق الدفع
                    </h3>
                    <BarChart3 size={20} className="text-[#38C5B0]" />
                  </div>
                  <div className="space-y-3">
                    {reports.paymentStats.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-cairo text-sm text-gray-600">{payment.method}</span>
                        <div className="flex items-center">
                          <span className="font-cairo text-sm font-medium text-green-600 ml-2">
                            {payment.total_amount} ج.م
                          </span>
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${(payment.total_amount / Math.max(...reports.paymentStats.map(p => p.total_amount))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* الإحصائيات الشهرية */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-cairo font-semibold text-lg text-[#001D2E]">
                    الإيرادات الشهرية
                  </h3>
                  <TrendingUp size={20} className="text-[#38C5B0]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {reports.monthlyStats.map((month, index) => (
                    <div key={index} className="text-center">
                      <div className="font-cairo text-sm text-gray-600 mb-1">
                        {month.month_name}
                      </div>
                      <div className="font-cairo text-lg font-semibold text-[#38C5B0]">
                        {month.total_revenue} ج.م
                      </div>
                      <div className="font-cairo text-xs text-gray-500">
                        {month.student_count} طالب
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* أزرار التصدير */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-cairo font-semibold text-lg text-[#001D2E] mb-4">
                  تصدير التقارير
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => exportReport('students')}
                    className="flex items-center justify-center bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-cairo"
                  >
                    <Download size={20} className="ml-2" />
                    تقرير الطلاب
                  </button>
                  
                  <button
                    onClick={() => exportReport('payments')}
                    className="flex items-center justify-center bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors font-cairo"
                  >
                    <Download size={20} className="ml-2" />
                    تقرير المدفوعات
                  </button>
                  
                  <button
                    onClick={() => exportReport('attendance')}
                    className="flex items-center justify-center bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors font-cairo"
                  >
                    <Download size={20} className="ml-2" />
                    تقرير الحضور
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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