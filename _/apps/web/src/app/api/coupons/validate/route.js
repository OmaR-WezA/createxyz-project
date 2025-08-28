import sql from "@/app/api/utils/sql";

// التحقق من صحة كوبون الخصم
export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return Response.json(
        { message: 'كود الكوبون مطلوب' },
        { status: 400 }
      );
    }

    const coupons = await sql`
      SELECT code, discount_percent, description_ar, is_active
      FROM coupons 
      WHERE code = ${code}
    `;

    if (coupons.length === 0) {
      return Response.json(
        { message: 'كوبون غير صحيح' },
        { status: 404 }
      );
    }

    const coupon = coupons[0];

    if (!coupon.is_active) {
      return Response.json(
        { message: 'هذا الكوبون غير نشط' },
        { status: 400 }
      );
    }

    return Response.json({
      code: coupon.code,
      discount_percent: coupon.discount_percent,
      description_ar: coupon.description_ar,
      message: 'كوبون صحيح'
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return Response.json(
      { message: 'حدث خطأ في التحقق من الكوبون' },
      { status: 500 }
    );
  }
}