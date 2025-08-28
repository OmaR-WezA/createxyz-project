import sql from "@/app/api/utils/sql";

// جلب قائمة الموظفين مع عدد الطلاب المُضافين
export async function GET(request) {
  try {
    const staff = await sql`
      SELECT 
        s.*,
        COUNT(DISTINCT st.student_id) as student_count
      FROM staff s
      LEFT JOIN students st ON s.staff_id = st.created_by_staff_id
      GROUP BY s.staff_id, s.name, s.email, s.password, s.created_at
      ORDER BY s.created_at DESC
    `;

    // إخفاء كلمة المرور من النتائج
    const safestStaff = staff.map(staffMember => ({
      ...staffMember,
      password: undefined
    }));

    return Response.json(safestStaff);

  } catch (error) {
    console.error('Staff fetch error:', error);
    return Response.json(
      { message: 'حدث خطأ في جلب بيانات الموظفين' },
      { status: 500 }
    );
  }
}

// إضافة موظف جديد
export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!name || !email || !password) {
      return Response.json(
        { message: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود البريد الإلكتروني مسبقاً
    const existingEmail = await sql`
      SELECT email FROM staff WHERE email = ${email}
      UNION
      SELECT email FROM users WHERE email = ${email}
    `;

    if (existingEmail.length > 0) {
      return Response.json(
        { message: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // توليد Staff ID تلقائياً
    const lastStaffResult = await sql`
      SELECT staff_id 
      FROM staff 
      WHERE staff_id LIKE 'STF%' 
      ORDER BY staff_id DESC 
      LIMIT 1
    `;

    let nextNumber = 1;
    if (lastStaffResult.length > 0) {
      const lastId = lastStaffResult[0].staff_id;
      const lastNumber = parseInt(lastId.substring(3));
      nextNumber = lastNumber + 1;
    }

    const staffId = `STF${nextNumber.toString().padStart(3, '0')}`;

    // بدء معاملة لإضافة الموظف في كلا الجدولين
    const results = await sql.transaction(async (txn) => {
      // إضافة الموظف في جدول staff
      await txn`
        INSERT INTO staff (
          staff_id, 
          name, 
          email, 
          password
        ) VALUES (
          ${staffId},
          ${name},
          ${email},
          ${password} -- في الإنتاج يجب تشفيرها
        )
      `;

      // إضافة الموظف في جدول users
      await txn`
        INSERT INTO users (
          email, 
          password, 
          role
        ) VALUES (
          ${email},
          ${password}, -- في الإنتاج يجب تشفيرها
          'staff'
        )
      `;

      return { staff_id: staffId };
    });

    return Response.json({
      staff_id: results.staff_id,
      message: 'تم إضافة الموظف بنجاح'
    });

  } catch (error) {
    console.error('Staff creation error:', error);
    return Response.json(
      { message: 'حدث خطأ في إضافة الموظف' },
      { status: 500 }
    );
  }
}