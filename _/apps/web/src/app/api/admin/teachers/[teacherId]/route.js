import sql from "@/app/api/utils/sql";

// تعديل بيانات مدرس
export async function PUT(request, { params }) {
  try {
    const { teacherId } = params;
    const { name, subject, stage, class: teacherClass, image_url } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!name || !subject || !stage || !teacherClass) {
      return Response.json(
        { message: 'الاسم والمادة والمرحلة والصف مطلوبان' },
        { status: 400 }
      );
    }

    // تحديث بيانات المدرس
    await sql`
      UPDATE teachers 
      SET 
        name = ${name},
        subject = ${subject},
        stage = ${stage},
        class = ${teacherClass},
        image_url = ${image_url || null}
      WHERE teacher_id = ${teacherId}
    `;

    return Response.json({
      message: 'تم تحديث بيانات المدرس بنجاح'
    });

  } catch (error) {
    console.error('Teacher update error:', error);
    return Response.json(
      { message: 'حدث خطأ في تحديث بيانات المدرس' },
      { status: 500 }
    );
  }
}

// حذف مدرس
export async function DELETE(request, { params }) {
  try {
    const { teacherId } = params;

    // التحقق من وجود مواد مرتبطة بالمدرس
    const subjects = await sql`
      SELECT COUNT(*) as subject_count 
      FROM subjects 
      WHERE teacher_id = ${teacherId}
    `;

    if (parseInt(subjects[0].subject_count) > 0) {
      return Response.json(
        { message: 'لا يمكن حذف المدرس لوجود مواد مرتبطة به' },
        { status: 400 }
      );
    }

    // حذف المدرس
    await sql`
      DELETE FROM teachers 
      WHERE teacher_id = ${teacherId}
    `;

    return Response.json({
      message: 'تم حذف المدرس بنجاح'
    });

  } catch (error) {
    console.error('Teacher deletion error:', error);
    return Response.json(
      { message: 'حدث خطأ في حذف المدرس' },
      { status: 500 }
    );
  }
}