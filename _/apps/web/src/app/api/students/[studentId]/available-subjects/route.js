import sql from "@/app/api/utils/sql";

// جلب المواد المتاحة للطالب (غير مشترك بها)
export async function GET(request, { params }) {
  try {
    const { studentId } = params;

    // جلب صف الطالب أولاً
    const studentData = await sql`
      SELECT grade_level, class 
      FROM students 
      WHERE student_id = ${studentId}
    `;

    if (studentData.length === 0) {
      return Response.json(
        { message: 'الطالب غير موجود' },
        { status: 404 }
      );
    }

    const student = studentData[0];

    // جلب المواد المتاحة للصف (غير مشترك بها الطالب)
    const availableSubjects = await sql`
      SELECT 
        s.subject_id,
        s.subject_name_ar,
        s.price_per_month,
        s.price_per_lesson,
        t.name as teacher_name,
        c.class_name_ar
      FROM subjects s
      JOIN teachers t ON s.teacher_id = t.teacher_id
      JOIN classes c ON s.class_id = c.class_id
      WHERE c.level = ${student.grade_level}
        AND s.subject_id NOT IN (
          SELECT subject_id 
          FROM enrollments 
          WHERE student_id = ${studentId} 
            AND status = 'نشط'
        )
      ORDER BY s.subject_name_ar
    `;

    return Response.json(availableSubjects);

  } catch (error) {
    console.error('Available subjects fetch error:', error);
    return Response.json(
      { message: 'حدث خطأ في جلب المواد المتاحة' },
      { status: 500 }
    );
  }
}