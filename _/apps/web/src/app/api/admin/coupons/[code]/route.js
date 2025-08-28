import sql from "@/app/api/utils/sql";

// تعديل كوبون
export async function PUT(request, { params }) {
  try {
    const { code } = params;
    const body = await request.json();
    const { discount_percent, description_ar, is_active } = body;

    // إذا كان التعديل خاص بالحالة فقط
    if (Object.keys(body).length === 1 && 'is_active' in body) {
      await sql`
        UPDATE coupons 
        SET is_active = ${is_active}
        WHERE code = ${code}
      `;
      
      return Response.json({
        message: 'تم تحديث حالة الكوبون بنجاح'
      });
    }

    // التحقق من وجود الكوبون
    const existingCoupon = await sql`
      SELECT code FROM coupons WHERE code = ${code}
    `;

    if (existingCoupon.length === 0) {
      return Response.json(
        { message: 'الكوبون غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من صحة نسبة الخصم إذا تم تمريرها
    if (discount_percent) {
      const discountNum = parseFloat(discount_percent);
      if (discountNum < 1 || discountNum > 100) {
        return Response.json(
          { message: 'نسبة الخصم يجب أن تكون بين 1% و 100%' },
          { status: 400 }
        );
      }
    }

    // تحديث الكوبون
    await sql`
      UPDATE coupons 
      SET 
        discount_percent = ${discount_percent ? parseFloat(discount_percent) : sql`discount_percent`},
        description_ar = ${description_ar !== undefined ? description_ar : sql`description_ar`},
        is_active = ${is_active !== undefined ? is_active : sql`is_active`}
      WHERE code = ${code}
    `;

    return Response.json({
      message: 'تم تحديث الكوبون بنجاح'
    });

  } catch (error) {
    console.error('Coupon update error:', error);
    return Response.json(
      { message: 'حدث خطأ في تحديث الكوبون' },
      { status: 500 }
    );
  }
}

// حذف كوبون
export async function DELETE(request, { params }) {
  try {
    const { code } = params;

    // التحقق من وجود الكوبون
    const existingCoupon = await sql`
      SELECT code FROM coupons WHERE code = ${code}
    `;

    if (existingCoupon.length === 0) {
      return Response.json(
        { message: 'الكوبون غير موجود' },
        { status: 404 }
      );
    }

    // التحقق من استخدام الكوبون في عمليات شراء سابقة
    const usedCoupons = await sql`
      SELECT COUNT(*) as usage_count 
      FROM checkouts 
      WHERE applied_coupon = ${code}
    `;

    if (parseInt(usedCoupons[0].usage_count) > 0) {
      return Response.json(
        { message: 'لا يمكن حذف الكوبون لأنه مستخدم في عمليات شراء سابقة' },
        { status: 400 }
      );
    }

    // حذف الكوبون
    await sql`
      DELETE FROM coupons 
      WHERE code = ${code}
    `;

    return Response.json({
      message: 'تم حذف الكوبون بنجاح'
    });

  } catch (error) {
    console.error('Coupon deletion error:', error);
    return Response.json(
      { message: 'حدث خطأ في حذف الكوبون' },
      { status: 500 }
    );
  }
}