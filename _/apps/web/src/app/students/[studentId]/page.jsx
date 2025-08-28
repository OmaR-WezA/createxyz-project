"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  User,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";

export default function StudentProfilePage({ params }) {
  const studentId = params?.studentId;

  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("enrollments");
  const [enrollments, setEnrollments] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // التحقق من المصادقة
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== "admin" && userData.role !== "staff") {
      window.location.href = "/login";
      return;
    }

    setUser(userData);

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      // جلب بيانات الطالب
      const studentResponse = await fetch(`/api/students/${studentId}`);
      if (studentResponse.ok) {
        const studentData = await studentResponse.json();
        setStudent(studentData);
      }

      // جلب الاشتراكات
      const enrollmentsResponse = await fetch(
        `/api/students/${studentId}/enrollments`,
      );
      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json();
        setEnrollments(enrollmentsData);
      }

      // جلب المواد المتاحة
      const subjectsResponse = await fetch(
        `/api/students/${studentId}/available-subjects`,
      );
      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json();
        setAvailableSubjects(subjectsData);
      }

      // جلب الحضور
      const attendanceResponse = await fetch(
        `/api/students/${studentId}/attendance`,
      );
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        setAttendance(attendanceData);
      }

      // جلب المدفوعات
      const paymentsResponse = await fetch(
        `/api/students/${studentId}/payments`,
      );
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (subject, type) => {
    const item = {
      id: `${subject.subject_id}-${type}`,
      subject_id: subject.subject_id,
      subject_name: subject.subject_name_ar,
      teacher_name: subject.teacher_name,
      type: type, // 'new' أو 'renewal'
      price: subject.price_per_month,
    };

    setCart([...cart, item]);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const goToCheckout = () => {
    // حفظ السلة في localStorage للانتقال لصفحة الدفع
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("cartStudentId", studentId);
    window.location.href = `/checkout/${studentId}`;
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38C5B0]"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex" dir="rtl">
        <Sidebar currentUser={user} />
        <div className="flex-1 mr-64 flex items-center justify-center">
          <div className="text-center">
            <User size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="font-cairo font-bold text-xl text-gray-600 mb-2">
              لم يتم العثور على الطالب
            </h2>
            <a
              href="/students"
              className="bg-[#38C5B0] text-white px-4 py-2 rounded-lg font-cairo hover:bg-[#32B5A1] transition-colors"
            >
              العودة لقائمة الطلاب
            </a>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "enrollments", label: "الاشتراكات", icon: BookOpen },
    { id: "available", label: "مواد متاحة", icon: Plus },
    { id: "attendance", label: "الحضور والغياب", icon: Calendar },
    { id: "payments", label: "المدفوعات", icon: DollarSign },
  ];

  // حساب إجمالي المدفوع والمتبقي
  const totalPaid = payments.reduce(
    (sum, payment) => sum + parseFloat(payment.amount_paid),
    0,
  );
  const totalRemaining = payments.reduce(
    (sum, payment) => sum + parseFloat(payment.remaining_amount),
    0,
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex" dir="rtl">
      <Sidebar currentUser={user} />

      <div className="flex-1 mr-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <a
                href="/students"
                className="flex items-center text-gray-600 hover:text-[#38C5B0] transition-colors ml-4"
              >
                <ArrowLeft size={20} className="ml-2" />
                <span className="font-cairo">العودة للطلاب</span>
              </a>
              <div>
                <h1 className="font-cairo font-bold text-2xl text-[#001D2E]">
                  ملف الطالب: {student.name}
                </h1>
                <p className="font-cairo text-gray-600 mt-1">
                  كود الطالب: {student.student_id}
                </p>
              </div>
            </div>

            {/* سلة التسوق */}
            {cart.length > 0 && (
              <div
                className="bg-[#38C5B0] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#32B5A1] transition-colors"
                onClick={goToCheckout}
              >
                <span className="font-cairo font-semibold">
                  السلة ({cart.length}) - المتابعة للدفع
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex">
          {/* الشريط الجانبي - معلومات الطالب */}
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#38C5B0] to-[#21B89A] rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={40} className="text-white" />
              </div>
              <h3 className="font-cairo font-bold text-lg text-[#001D2E] mb-1">
                {student.name}
              </h3>
              <p className="font-cairo text-sm text-gray-600">
                {student.student_id}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Phone size={16} className="text-gray-400 ml-3" />
                <div>
                  <p className="font-cairo text-sm text-gray-600">
                    هاتف ولي الأمر
                  </p>
                  <p className="font-cairo font-semibold text-[#001D2E]">
                    {student.parent_phone}
                  </p>
                </div>
              </div>

              {student.phone && (
                <div className="flex items-center">
                  <Phone size={16} className="text-gray-400 ml-3" />
                  <div>
                    <p className="font-cairo text-sm text-gray-600">
                      هاتف الطالب
                    </p>
                    <p className="font-cairo font-semibold text-[#001D2E]">
                      {student.phone}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <GraduationCap size={16} className="text-gray-400 ml-3" />
                <div>
                  <p className="font-cairo text-sm text-gray-600">
                    المرحلة والصف
                  </p>
                  <p className="font-cairo font-semibold text-[#001D2E]">
                    {student.grade_level} - {student.class}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <DollarSign size={16} className="text-gray-400 ml-3" />
                <div>
                  <p className="font-cairo text-sm text-gray-600">
                    إجمالي المدفوع
                  </p>
                  <p className="font-cairo font-semibold text-green-600">
                    {totalPaid.toFixed(2)} ج.م
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <DollarSign size={16} className="text-red-400 ml-3" />
                <div>
                  <p className="font-cairo text-sm text-gray-600">
                    المبلغ المتبقي
                  </p>
                  <p className="font-cairo font-semibold text-red-600">
                    {totalRemaining.toFixed(2)} ج.م
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* المحتوى الرئيسي */}
          <div className="flex-1">
            {/* التبويبات */}
            <div className="bg-white border-b border-gray-200">
              <nav className="flex">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-6 py-4 border-b-2 font-cairo font-medium transition-colors ${
                        activeTab === tab.id
                          ? "border-[#38C5B0] text-[#38C5B0]"
                          : "border-transparent text-gray-600 hover:text-[#38C5B0]"
                      }`}
                    >
                      <IconComponent size={20} className="ml-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* محتوى التبويبات */}
            <div className="p-6">
              {/* تبويبة الاشتراكات */}
              {activeTab === "enrollments" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-cairo font-semibold text-lg text-[#001D2E]">
                      الاشتراكات الحالية
                    </h3>
                  </div>

                  {enrollments.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen
                        size={48}
                        className="mx-auto mb-2 text-gray-400"
                      />
                      <p className="font-cairo text-gray-500">
                        لا توجد اشتراكات حالياً
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {enrollments.map((enrollment) => (
                        <div
                          key={enrollment.enrollment_id}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-cairo font-semibold text-[#001D2E]">
                                {enrollment.subject_name_ar}
                              </h4>
                              <p className="font-cairo text-sm text-gray-600">
                                المدرس: {enrollment.teacher_name}
                              </p>
                              <p className="font-cairo text-sm text-gray-600">
                                من {enrollment.start_date} إلى{" "}
                                {enrollment.end_date}
                              </p>
                            </div>
                            <div className="text-left">
                              <span
                                className={`px-2 py-1 rounded text-sm font-cairo ${
                                  enrollment.status === "نشط"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {enrollment.status}
                              </span>
                              <button
                                onClick={() => addToCart(enrollment, "renewal")}
                                className="mt-2 block bg-[#38C5B0] text-white px-3 py-1 rounded text-sm font-cairo hover:bg-[#32B5A1] transition-colors"
                              >
                                <RefreshCw size={16} className="inline ml-1" />
                                تجديد
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* تبويبة المواد المتاحة */}
              {activeTab === "available" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-cairo font-semibold text-lg text-[#001D2E]">
                      المواد المتاحة للاشتراك
                    </h3>
                  </div>

                  {availableSubjects.length === 0 ? (
                    <div className="text-center py-8">
                      <Plus size={48} className="mx-auto mb-2 text-gray-400" />
                      <p className="font-cairo text-gray-500">
                        لا توجد مواد متاحة للاشتراك
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {availableSubjects.map((subject) => (
                        <div
                          key={subject.subject_id}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-cairo font-semibold text-[#001D2E]">
                                {subject.subject_name_ar}
                              </h4>
                              <p className="font-cairo text-sm text-gray-600">
                                المدرس: {subject.teacher_name}
                              </p>
                              <p className="font-cairo text-sm text-gray-600">
                                السعر الشهري: {subject.price_per_month} ج.م
                              </p>
                            </div>
                            <button
                              onClick={() => addToCart(subject, "new")}
                              className="bg-[#38C5B0] text-white px-4 py-2 rounded font-cairo hover:bg-[#32B5A1] transition-colors flex items-center"
                            >
                              <Plus size={16} className="ml-1" />
                              اشتراك
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* تبويبة الحضور والغياب */}
              {activeTab === "attendance" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-cairo font-semibold text-lg text-[#001D2E]">
                      سجل الحضور والغياب
                    </h3>
                  </div>

                  {attendance.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar
                        size={48}
                        className="mx-auto mb-2 text-gray-400"
                      />
                      <p className="font-cairo text-gray-500">
                        لا يوجد سجل حضور بعد
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(
                        attendance.reduce((acc, record) => {
                          if (!acc[record.subject_name_ar]) {
                            acc[record.subject_name_ar] = [];
                          }
                          acc[record.subject_name_ar].push(record);
                          return acc;
                        }, {}),
                      ).map(([subjectName, records]) => (
                        <div
                          key={subjectName}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <h4 className="font-cairo font-semibold text-[#001D2E] mb-3">
                            {subjectName}
                          </h4>
                          <div className="grid gap-2">
                            {records.map((record) => (
                              <div
                                key={record.attendance_id}
                                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                              >
                                <span className="font-cairo text-sm text-gray-600">
                                  {record.date}
                                </span>
                                <div className="flex items-center">
                                  {record.status === "حاضر" && (
                                    <CheckCircle
                                      size={16}
                                      className="text-green-500 ml-2"
                                    />
                                  )}
                                  {record.status === "غائب" && (
                                    <XCircle
                                      size={16}
                                      className="text-red-500 ml-2"
                                    />
                                  )}
                                  {record.status === "تأخر" && (
                                    <Clock
                                      size={16}
                                      className="text-yellow-500 ml-2"
                                    />
                                  )}
                                  <span
                                    className={`font-cairo text-sm ${
                                      record.status === "حاضر"
                                        ? "text-green-600"
                                        : record.status === "غائب"
                                          ? "text-red-600"
                                          : "text-yellow-600"
                                    }`}
                                  >
                                    {record.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* تبويبة المدفوعات */}
              {activeTab === "payments" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-cairo font-semibold text-lg text-[#001D2E]">
                      سجل المدفوعات
                    </h3>
                  </div>

                  {payments.length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign
                        size={48}
                        className="mx-auto mb-2 text-gray-400"
                      />
                      <p className="font-cairo text-gray-500">
                        لا توجد مدفوعات بعد
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <div
                          key={payment.payment_id}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-cairo font-semibold text-[#001D2E]">
                                {payment.subject_name_ar}
                              </h4>
                              <p className="font-cairo text-sm text-gray-600">
                                تاريخ الدفع: {payment.payment_date}
                              </p>
                              <p className="font-cairo text-sm text-gray-600">
                                طريقة الدفع: {payment.method}
                              </p>
                            </div>
                            <div className="text-left">
                              <p className="font-cairo font-semibold text-green-600">
                                مدفوع: {payment.amount_paid} ج.م
                              </p>
                              {payment.remaining_amount > 0 && (
                                <p className="font-cairo font-semibold text-red-600">
                                  متبقي: {payment.remaining_amount} ج.م
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
