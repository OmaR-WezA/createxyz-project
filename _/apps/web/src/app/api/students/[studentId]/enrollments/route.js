import sql from "@/app/api/utils/sql";

// جلب اشتراكات الطالب
export async function GET(request, { params }) {
  try {
    const { studentId } = params;

    const enrollments = await sql`
      SELECT 
        e.enrollment_id,
        e.student_id,
        e.subject_id,
        e.start_date,
        e.end_date,
        e.status,
        s.subject_name_ar,
        s.price_per_month,
        t.name as teacher_name
      FROM enrollments e
      JOIN subjects s ON e.subject_id = s.subject_id
      JOIN teachers t ON s.teacher_id = t.teacher_id
      WHERE e.student_id = ${studentId}
      ORDER BY e.created_at DESC
    `;

    return Response.json(enrollments);

  } catch (error) {
    console.error('Enrollments fetch error:', error);
    return Response.json(
      { message: 'حدث خطأ في جلب الاشتراكات' },
      { status: 500 }
    );
  }
}