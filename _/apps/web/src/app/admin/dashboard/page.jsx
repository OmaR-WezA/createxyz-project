'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  TrendingUp,
  Calendar,
  DollarSign,
  BookOpen,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    monthlyRevenue: 0,
    activeEnrollments: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // التحقق من المصادقة
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
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38C5B0]"></div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'إجمالي الطلاب',
      value: stats.totalStudents,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'إجمالي المدرسين',
      value: stats.totalTeachers,
      icon: GraduationCap,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'إجمالي الموظفين',
      value: stats.totalStaff,
      icon: UserCheck,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'الإيرادات الشهرية',
      value: `${stats.monthlyRevenue} ج.م`,
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'الاشتراكات النشطة',
      value: stats.activeEnrollments,
      icon: BookOpen,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600'
    },
    {
      title: 'معدل الحضور',
      value: `${stats.attendanceRate}%`,
      icon: Clock,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex" dir="rtl">
      <Sidebar currentUser={user} />
      
      <div className="flex-1 mr-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cairo font-bold text-2xl text-[#001D2E]">
                لوحة تحكم المدير
              </h1>
              <p className="font-cairo text-gray-600 mt-1">
                مرحباً بك في نظام إدارة السنتر التعليمي
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-left">
                <p className="font-cairo text-sm text-gray-500">
                  اليوم
                </p>
                <p className="font-cairo font-semibold text-[#001D2E]">
                  {new Date().toLocaleDateString('ar-EG', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* محتوى الصفحة */}
        <div className="p-6">
          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statsCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-cairo text-sm text-gray-600 mb-2">
                        {card.title}
                      </p>
                      <p className="font-cairo font-bold text-2xl text-[#001D2E]">
                        {loading ? '...' : card.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                      <IconComponent size={24} className={card.textColor} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className={`h-2 bg-gradient-to-l ${card.color} rounded-full opacity-20`}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* الأنشطة الحديثة */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* الاشتراكات الحديثة */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-cairo font-semibold text-lg text-[#001D2E]">
                  الاشتراكات الحديثة
                </h3>
                <a 
                  href="/students"
                  className="font-cairo text-sm text-[#38C5B0] hover:text-[#32B5A1] transition-colors"
                >
                  عرض الكل
                </a>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38C5B0] mx-auto"></div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="font-cairo">لا توجد اشتراكات حديثة</p>
                  </div>
                )}
              </div>
            </div>

            {/* المدفوعات الحديثة */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-cairo font-semibold text-lg text-[#001D2E]">
                  المدفوعات الحديثة
                </h3>
                <a 
                  href="/admin/reports"
                  className="font-cairo text-sm text-[#38C5B0] hover:text-[#32B5A1] transition-colors"
                >
                  عرض التقارير
                </a>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38C5B0] mx-auto"></div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="font-cairo">لا توجد مدفوعات حديثة</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* روابط سريعة */}
          <div className="mt-8">
            <h3 className="font-cairo font-semibold text-lg text-[#001D2E] mb-4">
              الإجراءات السريعة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/admin/teachers"
                className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow duration-200 group"
              >
                <GraduationCap size={32} className="mx-auto mb-2 text-[#38C5B0] group-hover:text-[#32B5A1] transition-colors" />
                <p className="font-cairo font-medium text-[#001D2E]">إدارة المدرسين</p>
              </a>
              <a
                href="/admin/staff"
                className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow duration-200 group"
              >
                <UserCheck size={32} className="mx-auto mb-2 text-[#38C5B0] group-hover:text-[#32B5A1] transition-colors" />
                <p className="font-cairo font-medium text-[#001D2E]">إدارة الموظفين</p>
              </a>
              <a
                href="/students"
                className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow duration-200 group"
              >
                <Users size={32} className="mx-auto mb-2 text-[#38C5B0] group-hover:text-[#32B5A1] transition-colors" />
                <p className="font-cairo font-medium text-[#001D2E]">إدارة الطلاب</p>
              </a>
              <a
                href="/admin/coupons"
                className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow duration-200 group"
              >
                <TrendingUp size={32} className="mx-auto mb-2 text-[#38C5B0] group-hover:text-[#32B5A1] transition-colors" />
                <p className="font-cairo font-medium text-[#001D2E]">إدارة الكوبونات</p>
              </a>
            </div>
          </div>
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