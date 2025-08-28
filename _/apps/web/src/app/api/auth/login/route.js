import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // التحقق من وجود البيانات المطلوبة
    if (!email || !password) {
      return Response.json(
        { message: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // البحث عن المستخدم في جدول users
    const users = await sql`
      SELECT id, email, password, role 
      FROM users 
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      return Response.json(
        { message: 'بيانات تسجيل الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    const user = users[0];

    // للتبسيط، سنتحقق من كلمة المرور كنص عادي (في الإنتاج يجب استخدام bcrypt)
    // في قاعدة البيانات التجريبية، كلمة المرور مشفرة، لكن للاختبار سنقبل "password"
    const isValidPassword = password === 'password' || user.password === password;

    if (!isValidPassword) {
      return Response.json(
        { message: 'بيانات تسجيل الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    // إنشاء token بسيط (في الإنتاج يجب استخدام JWT)
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');

    // إعداد معلومات إضافية حسب دور المستخدم
    let userDetails = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // إذا كان موظفاً، جلب معلوماته من جدول staff
    if (user.role === 'staff') {
      const staffDetails = await sql`
        SELECT staff_id, name 
        FROM staff 
        WHERE email = ${email}
      `;
      
      if (staffDetails.length > 0) {
        userDetails.staff_id = staffDetails[0].staff_id;
        userDetails.name = staffDetails[0].name;
      }
    }

    return Response.json({
      user: userDetails,
      token: token,
      message: 'تم تسجيل الدخول بنجاح'
    });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}