import sql from "@/app/api/utils/sql";

// جلب قائمة الكوبونات
export async function GET(request) {
  try {
    const coupons = await sql`
      SELECT 
        c.*,
        u.email as created_by_email
      FROM coupons c
      LEFT JOIN users u ON c.created_by_admin_id = u.id
      ORDER BY c.created_at DESC
    `;

    return Response.json(coupons);

  } catch (error) {
    console.error('Coupons fetch error:', error);
    return Response.json(
      { message: 'حدث خطأ في جلب بيانات الكوبونات' },
      { status: 500 }
    );
  }
}

// إضافة كوبون جديد
export async function POST(request) {
  try {
    const { code, discount_percent, description_ar, is_active, created_by_admin_id } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!code || !discount_percent) {
      return Response.json(
        { message: 'كود الكوبون ونسبة الخصم مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من عدم وجود الكود مسبقاً
    const existingCoupon = await sql`
      SELECT code FROM coupons WHERE code = ${code}
    `;

    if (existingCoupon.length > 0) {
      return Response.json(
        { message: 'كود الكوبون مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // التحقق من صحة نسبة الخصم
    const discountNum = parseFloat(discount_percent);
    if (discountNum < 1 || discountNum > 100) {
      return Response.json(
        { message: 'نسبة الخصم يجب أن تكون بين 1% و 100%' },
        { status: 400 }
      );
    }

    // إضافة الكوبون الجديد
    await sql`
      INSERT INTO coupons (
        code,
        discount_percent,
        description_ar,
        is_active,
        created_by_admin_id
      ) VALUES (
        ${code},
        ${discountNum},
        ${description_ar || null},
        ${is_active !== false},
        ${created_by_admin_id || null}
      )
    `;

    return Response.json({
      message: 'تم إضافة الكوبون بنجاح'
    });

  } catch (error) {
    console.error('Coupon creation error:', error);
    return Response.json(
      { message: 'حدث خطأ في إضافة الكوبون' },
      { status: 500 }
    );
  }
}