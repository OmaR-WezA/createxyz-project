import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    // إجمالي عدد الطلاب
    const totalStudentsResult = await sql`
      SELECT COUNT(*) as total_students 
      FROM students
    `;

    // معدل الحضور (آخر 30 يوم)
    const attendanceResult = await sql`
      SELECT 
        COUNT(CASE WHEN status = 'حاضر' THEN 1 END) as present_count,
        COUNT(*) as total_sessions
      FROM attendance 
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    `;

    const attendanceRate = attendanceResult[0].total_sessions > 0 
      ? Math.round((attendanceResult[0].present_count / attendanceResult[0].total_sessions) * 100)
      : 0;

    const stats = {
      totalStudents: parseInt(totalStudentsResult[0].total_students),
      attendanceRate: attendanceRate
    };

    return Response.json(stats);

  } catch (error) {
    console.error('Students stats error:', error);
    return Response.json(
      { message: 'حدث خطأ في جلب الإحصائيات' },
      { status: 500 }
    );
  }
}