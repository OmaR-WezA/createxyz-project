import sql from "@/app/api/utils/sql";

// تعديل بيانات موظف
export async function PUT(request, { params }) {
  try {
    const { staffId } = params;
    const { name, email, password } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!name || !email) {
      return Response.json(
        { message: 'الاسم والبريد الإلكتروني مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من وجود الموظف
    const existingStaff = await sql`
      SELECT email FROM staff WHERE staff_id = ${staffId}
    `;

    if (existingStaff.length === 0) {
      return Response.json(
        { message: 'الموظف غير موجود' },
        { status: 404 }
      );
    }

    const currentEmail = existingStaff[0].email;

    // التحقق من عدم وجود البريد الإلكتروني الجديد (إذا تم تغييره)
    if (email !== currentEmail) {
      const existingEmail = await sql`
        SELECT email FROM staff WHERE email = ${email} AND staff_id != ${staffId}
      `;
      
      const existingUserEmail = await sql`
        SELECT email FROM users WHERE email = ${email} AND email != ${currentEmail}
      `;

      if (existingEmail.length > 0 || existingUserEmail.length > 0) {
        return Response.json(
          { message: 'البريد الإلكتروني مستخدم بالفعل' },
          { status: 400 }
        );
      }
    }

    // تحديث جدول staff
    if (password && password.trim() !== '') {
      // تحديث مع كلمة المرور
      await sql`
        UPDATE staff 
        SET 
          name = ${name},
          email = ${email},
          password = ${password}
        WHERE staff_id = ${staffId}
      `;
    } else {
      // تحديث بدون كلمة المرور
      await sql`
        UPDATE staff 
        SET 
          name = ${name},
          email = ${email}
        WHERE staff_id = ${staffId}
      `;
    }

    // تحديث جدول users
    if (password && password.trim() !== '') {
      await sql`
        UPDATE users 
        SET 
          email = ${email},
          password = ${password}
        WHERE email = ${currentEmail} AND role = 'staff'
      `;
    } else {
      await sql`
        UPDATE users 
        SET email = ${email}
        WHERE email = ${currentEmail} AND role = 'staff'
      `;
    }

    return Response.json({
      message: 'تم تحديث بيانات الموظف بنجاح'
    });

  } catch (error) {
    console.error('Staff update error:', error);
    return Response.json(
      { message: 'حدث خطأ في تحديث بيانات الموظف: ' + error.message },
      { status: 500 }
    );
  }
}

// حذف موظف
export async function DELETE(request, { params }) {
  try {
    const { staffId } = params;

    // التحقق من وجود الموظف
    const existingStaff = await sql`
      SELECT email FROM staff WHERE staff_id = ${staffId}
    `;

    if (existingStaff.length === 0) {
      return Response.json(
        { message: 'الموظف غير موجود' },
        { status: 404 }
      );
    }

    const staffEmail = existingStaff[0].email;

    // التحقق من وجود طلاب مرتبطين بالموظف
    const students = await sql`
      SELECT COUNT(*) as student_count 
      FROM students 
      WHERE created_by_staff_id = ${staffId}
    `;

    if (parseInt(students[0].student_count) > 0) {
      return Response.json(
        { message: 'لا يمكن حذف الموظف لوجود طلاب مرتبطين به' },
        { status: 400 }
      );
    }

    // حذف من جدول staff
    await sql`
      DELETE FROM staff 
      WHERE staff_id = ${staffId}
    `;

    // حذف من جدول users
    await sql`
      DELETE FROM users 
      WHERE email = ${staffEmail} AND role = 'staff'
    `;

    return Response.json({
      message: 'تم حذف الموظف بنجاح'
    });

  } catch (error) {
    console.error('Staff deletion error:', error);
    return Response.json(
      { message: 'حدث خطأ في حذف الموظف: ' + error.message },
      { status: 500 }
    );
  }
}