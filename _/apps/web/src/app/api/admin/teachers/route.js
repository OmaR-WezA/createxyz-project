import sql from "@/app/api/utils/sql";

// جلب قائمة المدرسين مع عدد الطلاب
export async function GET(request) {
  try {
    const teachers = await sql`
      SELECT 
        t.*,
        COUNT(DISTINCT e.student_id) as student_count
      FROM teachers t
      LEFT JOIN subjects s ON t.teacher_id = s.teacher_id
      LEFT JOIN enrollments e ON s.subject_id = e.subject_id AND e.status = 'نشط'
      GROUP BY t.teacher_id, t.name, t.subject, t.stage, t.class, t.image_url, t.created_at
      ORDER BY t.created_at DESC
    `;

    return Response.json(teachers);

  } catch (error) {
    console.error('Teachers fetch error:', error);
    return Response.json(
      { message: 'حدث خطأ في جلب بيانات المدرسين' },
      { status: 500 }
    );
  }
}

// إضافة مدرس جديد
export async function POST(request) {
  try {
    const { name, subject, stage, class: teacherClass, image_url } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!name || !subject || !stage || !teacherClass) {
      return Response.json(
        { message: 'الاسم والمادة والمرحلة والصف مطلوبان' },
        { status: 400 }
      );
    }

    // إضافة المدرس الجديد
    const result = await sql`
      INSERT INTO teachers (
        name, 
        subject, 
        stage, 
        class, 
        image_url
      ) VALUES (
        ${name},
        ${subject},
        ${stage},
        ${teacherClass},
        ${image_url || null}
      )
      RETURNING teacher_id
    `;

    return Response.json({
      teacher_id: result[0].teacher_id,
      message: 'تم إضافة المدرس بنجاح'
    });

  } catch (error) {
    console.error('Teacher creation error:', error);
    return Response.json(
      { message: 'حدث خطأ في إضافة المدرس' },
      { status: 500 }
    );
  }
}