import sql from "@/app/api/utils/sql";

// جلب سجل مدفوعات الطالب
export async function GET(request, { params }) {
  try {
    const { studentId } = params;

    const payments = await sql`
      SELECT 
        p.payment_id,
        p.enrollment_id,
        p.amount_paid,
        p.remaining_amount,
        p.payment_date,
        p.method,
        s.subject_name_ar,
        t.name as teacher_name
      FROM payments p
      JOIN enrollments e ON p.enrollment_id = e.enrollment_id
      JOIN subjects s ON e.subject_id = s.subject_id
      JOIN teachers t ON s.teacher_id = t.teacher_id
      WHERE e.student_id = ${studentId}
      ORDER BY p.payment_date DESC
    `;

    return Response.json(payments);

  } catch (error) {
    console.error('Payments fetch error:', error);
    return Response.json(
      { message: 'حدث خطأ في جلب سجل المدفوعات' },
      { status: 500 }
    );
  }
}