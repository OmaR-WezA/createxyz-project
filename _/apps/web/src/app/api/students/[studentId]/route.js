import sql from "@/app/api/utils/sql";

// جلب بيانات طالب محدد
export async function GET(request, { params }) {
  try {
    const { studentId } = params;

    const students = await sql`
      SELECT 
        student_id,
        name,
        phone,
        parent_phone,
        grade_level,
        class,
        created_by_staff_id,
        created_at
      FROM students 
      WHERE student_id = ${studentId}
    `;

    if (students.length === 0) {
      return Response.json(
        { message: 'الطالب غير موجود' },
        { status: 404 }
      );
    }

    return Response.json(students[0]);

  } catch (error) {
    console.error('Student fetch error:', error);
    return Response.json(
      { message: 'حدث خطأ في جلب بيانات الطالب' },
      { status: 500 }
    );
  }
}