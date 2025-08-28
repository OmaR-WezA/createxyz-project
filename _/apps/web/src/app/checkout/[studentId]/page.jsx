'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  ShoppingCart, 
  User, 
  CreditCard, 
  Trash2, 
  ArrowLeft,
  Tag,
  Receipt,
  CheckCircle
} from 'lucide-react';

export default function CheckoutPage({ params }) {
  const studentId = params?.studentId;
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // بيانات الدفع
  const [paymentData, setPaymentData] = useState({
    amount_paid: 0,
    payment_method: 'نقد',
    coupon_code: ''
  });

  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

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

    // جلب بيانات السلة
    const storedCart = localStorage.getItem('cart');
    const storedStudentId = localStorage.getItem('cartStudentId');

    if (!storedCart || storedStudentId !== studentId) {
      window.location.href = '/students';
      return;
    }

    const cartData = JSON.parse(storedCart);
    setCart(cartData);

    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setStudent(data);
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!paymentData.coupon_code) {
      setCouponError('');
      setCouponDiscount(0);
      return;
    }

    try {
      const response = await fetch(`/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: paymentData.coupon_code })
      });

      if (response.ok) {
        const data = await response.json();
        setCouponDiscount(data.discount_percent);
        setCouponError('');
      } else {
        const errorData = await response.json();
        setCouponError(errorData.message);
        setCouponDiscount(0);
      }
    } catch (error) {
      setCouponError('حدث خطأ في التحقق من الكوبون');
      setCouponDiscount(0);
    }
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const processCheckout = async () => {
    if (cart.length === 0) {
      alert('السلة فارغة');
      return;
    }

    if (paymentData.amount_paid <= 0) {
      alert('يرجى إدخال المبلغ المدفوع');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          items: cart,
          amount_paid: paymentData.amount_paid,
          payment_method: paymentData.payment_method,
          coupon_code: paymentData.coupon_code || null,
          staff_id: user.staff_id || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(true);
        
        // مسح السلة
        localStorage.removeItem('cart');
        localStorage.removeItem('cartStudentId');
        
        // إعادة توجيه بعد 3 ثوانٍ
        setTimeout(() => {
          window.location.href = `/students/${studentId}`;
        }, 3000);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'حدث خطأ في عملية الدفع');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('حدث خطأ في عملية الدفع');
    } finally {
      setProcessing(false);
    }
  };

  // حساب الإجماليات
  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
  const discountAmount = subtotal * (couponDiscount / 100);
  const total = subtotal - discountAmount;
  const remainingAmount = Math.max(0, total - parseFloat(paymentData.amount_paid || 0));

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38C5B0]"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex" dir="rtl">
        <Sidebar currentUser={user} />
        <div className="flex-1 mr-64 flex items-center justify-center">
          <div className="text-center">
            <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
            <h2 className="font-cairo font-bold text-2xl text-green-600 mb-4">
              تم إتمام الدفع بنجاح!
            </h2>
            <p className="font-cairo text-gray-600 mb-4">
              سيتم إعادة توجيهك لملف الطالب خلال 3 ثوانٍ...
            </p>
            <a 
              href={`/students/${studentId}`}
              className="bg-[#38C5B0] text-white px-4 py-2 rounded-lg font-cairo hover:bg-[#32B5A1] transition-colors"
            >
              العودة لملف الطالب
            </a>
          </div>
        </div>
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
            <div className="flex items-center">
              <a 
                href={`/students/${studentId}`}
                className="flex items-center text-gray-600 hover:text-[#38C5B0] transition-colors ml-4"
              >
                <ArrowLeft size={20} className="ml-2" />
                <span className="font-cairo">العودة لملف الطالب</span>
              </a>
              <div>
                <h1 className="font-cairo font-bold text-2xl text-[#001D2E]">
                  إتمام عملية الدفع
                </h1>
                <p className="font-cairo text-gray-600 mt-1">
                  {student ? `الطالب: ${student.name} (${student.student_id})` : 'جارٍ التحميل...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* محتوى الصفحة */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* عمود السلة */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <ShoppingCart size={24} className="text-[#38C5B0] ml-2" />
                  <h2 className="font-cairo font-semibold text-lg text-[#001D2E]">
                    محتويات السلة ({cart.length})
                  </h2>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart size={48} className="mx-auto mb-2 text-gray-400" />
                    <p className="font-cairo text-gray-500">السلة فارغة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-cairo font-semibold text-[#001D2E]">
                              {item.subject_name}
                            </h4>
                            <p className="font-cairo text-sm text-gray-600">
                              المدرس: {item.teacher_name}
                            </p>
                            <p className="font-cairo text-sm text-gray-600">
                              النوع: {item.type === 'new' ? 'اشتراك جديد' : 'تجديد اشتراك'}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="font-cairo font-semibold text-[#38C5B0] text-lg ml-4">
                              {item.price} ج.م
                            </span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* عمود الدفع */}
            <div className="space-y-6">
              {/* بطاقة بيانات الطالب */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <User size={20} className="text-[#38C5B0] ml-2" />
                  <h3 className="font-cairo font-semibold text-[#001D2E]">بيانات الطالب</h3>
                </div>
                {student && (
                  <div className="space-y-2 text-sm">
                    <p className="font-cairo"><strong>الاسم:</strong> {student.name}</p>
                    <p className="font-cairo"><strong>الكود:</strong> {student.student_id}</p>
                    <p className="font-cairo"><strong>المرحلة:</strong> {student.grade_level}</p>
                    <p className="font-cairo"><strong>الصف:</strong> {student.class}</p>
                  </div>
                )}
              </div>

              {/* كوبون الخصم */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Tag size={20} className="text-[#38C5B0] ml-2" />
                  <h3 className="font-cairo font-semibold text-[#001D2E]">كوبون الخصم</h3>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="أدخل كود الخصم"
                    value={paymentData.coupon_code}
                    onChange={(e) => setPaymentData({...paymentData, coupon_code: e.target.value})}
                    onBlur={applyCoupon}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                  />
                  {couponError && (
                    <p className="font-cairo text-red-500 text-sm">{couponError}</p>
                  )}
                  {couponDiscount > 0 && (
                    <p className="font-cairo text-green-600 text-sm">
                      ✓ تم تطبيق خصم {couponDiscount}%
                    </p>
                  )}
                </div>
              </div>

              {/* ملخص الدفع */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Receipt size={20} className="text-[#38C5B0] ml-2" />
                  <h3 className="font-cairo font-semibold text-[#001D2E]">ملخص الدفع</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between font-cairo text-sm">
                    <span>المجموع الفرعي:</span>
                    <span>{subtotal.toFixed(2)} ج.م</span>
                  </div>
                  
                  {couponDiscount > 0 && (
                    <div className="flex justify-between font-cairo text-sm text-green-600">
                      <span>الخصم ({couponDiscount}%):</span>
                      <span>-{discountAmount.toFixed(2)} ج.م</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-cairo font-semibold text-lg">
                      <span>المجموع الكلي:</span>
                      <span className="text-[#38C5B0]">{total.toFixed(2)} ج.م</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* بيانات الدفع */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <CreditCard size={20} className="text-[#38C5B0] ml-2" />
                  <h3 className="font-cairo font-semibold text-[#001D2E]">بيانات الدفع</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block font-cairo font-medium text-gray-700 mb-2">
                      المبلغ المدفوع *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={total}
                      value={paymentData.amount_paid}
                      onChange={(e) => setPaymentData({...paymentData, amount_paid: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block font-cairo font-medium text-gray-700 mb-2">
                      طريقة الدفع *
                    </label>
                    <select
                      value={paymentData.payment_method}
                      onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-cairo focus:ring-2 focus:ring-[#38C5B0] focus:border-[#38C5B0]"
                    >
                      <option value="نقد">نقد</option>
                      <option value="تحويل بنكي">تحويل بنكي</option>
                      <option value="بطاقة ائتمان">بطاقة ائتمان</option>
                    </select>
                  </div>

                  {remainingAmount > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="font-cairo text-orange-700 text-sm">
                        <strong>المبلغ المتبقي:</strong> {remainingAmount.toFixed(2)} ج.م
                      </p>
                    </div>
                  )}

                  <button
                    onClick={processCheckout}
                    disabled={processing || cart.length === 0}
                    className="w-full bg-gradient-to-r from-[#38C5B0] to-[#21B89A] text-white py-3 px-4 rounded-lg font-cairo font-semibold hover:from-[#32B5A1] hover:to-[#1DA688] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'جارٍ المعالجة...' : 'إتمام الدفع'}
                  </button>
                </div>
              </div>
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