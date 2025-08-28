'use client';
import { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  GraduationCap, 
  UserCheck, 
  Settings, 
  LogOut,
  ChevronDown,
  Calendar,
  Receipt,
  Tag
} from 'lucide-react';

export default function Sidebar({ currentUser }) {
  const [user, setUser] = useState(currentUser);

  useEffect(() => {
    if (!currentUser) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // قوائم التنقل حسب دور المستخدم
  const adminMenuItems = [
    { 
      icon: Home, 
      label: 'لوحة التحكم', 
      href: '/admin/dashboard',
      active: true 
    },
    { 
      icon: GraduationCap, 
      label: 'المدرسون', 
      href: '/admin/teachers' 
    },
    { 
      icon: UserCheck, 
      label: 'الموظفون', 
      href: '/admin/staff' 
    },
    { 
      icon: Users, 
      label: 'الطلاب', 
      href: '/students' 
    },
    { 
      icon: Calendar, 
      label: 'الجدول الدراسي', 
      href: '/admin/timetable' 
    },
    { 
      icon: Tag, 
      label: 'الكوبونات', 
      href: '/admin/coupons' 
    },
    { 
      icon: Receipt, 
      label: 'التقارير', 
      href: '/admin/reports' 
    }
  ];

  const staffMenuItems = [
    { 
      icon: Users, 
      label: 'إدارة الطلاب', 
      href: '/students',
      active: true 
    }
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : staffMenuItems;

  if (!user) {
    return null;
  }

  return (
    <div className="w-64 bg-[#001D2E] text-white flex flex-col fixed right-0 top-0 h-full font-cairo transition-colors duration-200">
      {/* قسم العلامة التجارية */}
      <div className="p-6">
        <h1 className="font-cairo font-bold text-xl text-white text-center">
          السنتر التعليمي
        </h1>
      </div>

      {/* قسم الملف الشخصي */}
      <div className="flex items-center mb-7 px-6 cursor-pointer hover:bg-white hover:bg-opacity-5 rounded-lg p-2 -m-2 transition-colors duration-200">
        <div className="w-10 h-10 bg-gradient-to-br from-[#38C5B0] to-[#21B89A] rounded-full flex items-center justify-center ml-3">
          <span className="font-cairo font-bold text-white text-sm">
            {user.name ? user.name.charAt(0) : user.email.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="font-cairo font-semibold text-sm text-white">
            {user.name || 'المستخدم'}
          </div>
          <div className="font-cairo font-normal text-xs text-white opacity-70">
            {user.role === 'admin' ? 'مدير النظام' : 'موظف'}
          </div>
        </div>
        <ChevronDown size={18} className="text-white opacity-60" />
      </div>

      {/* القائمة الرئيسية */}
      <div className="flex-1 px-6">
        <h2 className="font-cairo font-semibold text-xs text-white mb-4 opacity-60">
          القائمة الرئيسية
        </h2>
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = window.location.pathname === item.href || item.active;
            
            return (
              <a
                key={index}
                href={item.href}
                className={`
                  flex items-center px-4 py-3 rounded-md transition-colors duration-150 cursor-pointer
                  ${isActive 
                    ? 'bg-[#38C5B0] text-white' 
                    : 'hover:bg-white hover:bg-opacity-10 text-white opacity-70 hover:opacity-100'
                  }
                `}
              >
                <IconComponent size={20} className="ml-3" />
                <span className="font-cairo font-medium text-sm">
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* أزرار الأدوات السفلية */}
      <div className="p-6 border-t border-[#0B3144]">
        <div className="space-y-2">
          <button className="flex items-center w-full px-4 py-2 text-white opacity-70 hover:opacity-100 hover:bg-white hover:bg-opacity-5 rounded transition-colors duration-150">
            <Settings size={18} className="ml-3" />
            <span className="font-cairo font-normal text-sm">الإعدادات</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-white hover:bg-red-500 hover:bg-opacity-20 rounded transition-colors duration-150"
          >
            <LogOut size={18} className="ml-3" />
            <span className="font-cairo font-medium text-sm">تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  );
}