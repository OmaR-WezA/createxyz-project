import sql from "@/app/api/utils/sql";

// جلب قائمة الطلاب
export async function GET(request) {
  try {
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
      ORDER BY created_at DESC
    `;

    return Response.json(students);

  } catch (error) {
    console.error('Students fetch error:', error);
    return Response.json(
      { message: 'حدث خطأ في جلب بيانات الطلاب' },
      { status: 500 }
    );
  }
}

// إضافة طالب جديد
export async function POST(request) {
  try {
    const { name, phone, parent_phone, grade_level, class: studentClass, created_by_staff_id } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!name || !parent_phone || !grade_level || !studentClass) {
      return Response.json(
        { message: 'الاسم وهاتف ولي الأمر والمرحلة والصف مطلوبان' },
        { status: 400 }
      );
    }

    // توليد Student ID تلقائياً
    const lastStudentResult = await sql`
      SELECT student_id 
      FROM students 
      WHERE student_id LIKE 'STD%' 
      ORDER BY student_id DESC 
      LIMIT 1
    `;

    let nextNumber = 1001;
    if (lastStudentResult.length > 0) {
      const lastId = lastStudentResult[0].student_id;
      const lastNumber = parseInt(lastId.substring(3));
      nextNumber = lastNumber + 1;
    }

    const studentId = `STD${nextNumber}`;

    // إدراج الطالب الجديد
    await sql`
      INSERT INTO students (
        student_id, 
        name, 
        phone, 
        parent_phone, 
        grade_level, 
        class, 
        created_by_staff_id
      ) VALUES (
        ${studentId},
        ${name},
        ${phone || null},
        ${parent_phone},
        ${grade_level},
        ${studentClass},
        ${created_by_staff_id || null}
      )
    `;

    return Response.json({
      student_id: studentId,
      message: 'تم إضافة الطالب بنجاح'
    });

  } catch (error) {
    console.error('Student creation error:', error);
    return Response.json(
      { message: 'حدث خطأ في إضافة الطالب' },
      { status: 500 }
    );
  }
}