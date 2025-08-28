import sql from "@/app/api/utils/sql";

// جلب سجل حضور الطالب
export async function GET(request, { params }) {
  try {
    const { studentId } = params;

    const attendance = await sql`
      SELECT 
        a.attendance_id,
        a.enrollment_id,
        a.date,
        a.status,
        a.notes,
        s.subject_name_ar,
        t.name as teacher_name
      FROM attendance a
      JOIN enrollments e ON a.enrollment_id = e.enrollment_id
      JOIN subjects s ON e.subject_id = s.subject_id
      JOIN teachers t ON s.teacher_id = t.teacher_id
      WHERE e.student_id = ${studentId}
      ORDER BY a.date DESC
    `;

    return Response.json(attendance);

  } catch (error) {
    console.error('Attendance fetch error:', error);
    return Response.json(
      { message: 'حدث خطأ في جلب سجل الحضور' },
      { status: 500 }
    );
  }
}