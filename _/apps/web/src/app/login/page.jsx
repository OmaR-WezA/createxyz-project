'use client';
import { useState } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في تسجيل الدخول');
      }

      // حفظ بيانات المستخدم في localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      // إعادة التوجيه حسب دور المستخدم
      if (data.user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else if (data.user.role === 'staff') {
        window.location.href = '/students';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* النصف الأيمن - نموذج تسجيل الدخول */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* الشعار والعنوان */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#38C5B0] to-[#21B89A] rounded-xl flex items-center justify-center mx-auto mb-4">
              <LogIn size={32} className="text-white" />
            </div>
            <h1 className="font-cairo font-bold text-3xl text-[#001D2E] mb-2">
              السنتر التعليمي
            </h1>
            <p className="font-cairo text-[#6B7280] text-lg">
              نظام إدارة المركز التعليمي
            </p>
          </div>

          {/* نموذج تسجيل الدخول */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* رسالة الخطأ */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-cairo text-red-600 text-sm text-center">
                  {error}
                </p>
              </div>
            )}

            {/* حقل البريد الإلكتروني */}
            <div>
              <label className="block font-cairo font-medium text-[#374151] mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="أدخل البريد الإلكتروني"
                className="w-full px-4 py-3 border border-[#D1D5DB] rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0] transition-colors"
                required
                disabled={loading}
              />
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label className="block font-cairo font-medium text-[#374151] mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="أدخل كلمة المرور"
                  className="w-full px-4 py-3 border border-[#D1D5DB] rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0] transition-colors pl-12"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] hover:text-[#374151] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#38C5B0] to-[#21B89A] text-white font-cairo font-semibold py-3 px-4 rounded-lg hover:from-[#32B5A1] hover:to-[#1DA688] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                  جارٍ تسجيل الدخول...
                </>
              ) : (
                <>
                  <LogIn size={20} className="ml-2" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          {/* معلومات تجريبية */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-cairo font-semibold text-sm text-gray-700 mb-2">
              بيانات تجريبية للاختبار:
            </h3>
            <div className="space-y-1 text-xs text-gray-600 font-cairo">
              <p><strong>المدير:</strong> admin@alsenter.com / password</p>
              <p><strong>موظف:</strong> staff1@alsenter.com / password</p>
            </div>
          </div>
        </div>
      </div>

      {/* النصف الأيسر - الخلفية المتدرجة */}
      <div className="flex-1 bg-gradient-to-br from-[#001D2E] via-[#0B3144] to-[#164E63] flex items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="w-32 h-32 bg-white bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn size={64} className="text-white opacity-80" />
          </div>
          <h2 className="font-cairo font-bold text-4xl mb-4">
            مرحباً بك في السنتر
          </h2>
          <p className="font-cairo text-xl opacity-90 max-w-md">
            نظام إدارة شامل للمراكز التعليمية يساعدك على إدارة الطلاب والمدرسين والموظفين بكفاءة عالية
          </p>
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