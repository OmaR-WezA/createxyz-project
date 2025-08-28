import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    // التحقق من المصادقة - يجب أن يكون المستخدم مديراً
    const authHeader = request.headers.get('authorization');
    // للتبسيط، سنسمح بالوصول مؤقتاً

    // احصائيات الطلاب
    const studentStats = await sql`
      SELECT COUNT(*) as total_students 
      FROM students
    `;

    // احصائيات المدرسين
    const teacherStats = await sql`
      SELECT COUNT(*) as total_teachers 
      FROM teachers
    `;

    // احصائيات الموظفين
    const staffStats = await sql`
      SELECT COUNT(*) as total_staff 
      FROM staff
    `;

    // الاشتراكات النشطة
    const enrollmentStats = await sql`
      SELECT COUNT(*) as active_enrollments 
      FROM enrollments 
      WHERE status = 'نشط'
    `;

    // الإيرادات الشهرية (الشهر الحالي)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const revenueStats = await sql`
      SELECT COALESCE(SUM(amount_paid), 0) as monthly_revenue
      FROM payments 
      WHERE EXTRACT(MONTH FROM payment_date) = ${currentMonth}
        AND EXTRACT(YEAR FROM payment_date) = ${currentYear}
    `;

    // معدل الحضور (خلال آخر 30 يوم)
    const attendanceStats = await sql`
      SELECT 
        COUNT(CASE WHEN status = 'حاضر' THEN 1 END) as present_count,
        COUNT(*) as total_sessions
      FROM attendance 
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    `;

    const attendanceRate = attendanceStats[0].total_sessions > 0 
      ? Math.round((attendanceStats[0].present_count / attendanceStats[0].total_sessions) * 100)
      : 0;

    const stats = {
      totalStudents: parseInt(studentStats[0].total_students),
      totalTeachers: parseInt(teacherStats[0].total_teachers),
      totalStaff: parseInt(staffStats[0].total_staff),
      activeEnrollments: parseInt(enrollmentStats[0].active_enrollments),
      monthlyRevenue: parseFloat(revenueStats[0].monthly_revenue),
      attendanceRate: attendanceRate
    };

    return Response.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return Response.json(
      { message: 'حدث خطأ في جلب الإحصائيات' },
      { status: 500 }
    );
  }
}