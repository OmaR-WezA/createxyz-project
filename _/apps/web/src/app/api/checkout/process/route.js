import sql from "@/app/api/utils/sql";

// معالجة عملية الدفع والاشتراكات
export async function POST(request) {
  try {
    const { 
      student_id, 
      items, 
      amount_paid, 
      payment_method, 
      coupon_code, 
      staff_id 
    } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!student_id || !items || items.length === 0 || !amount_paid || !payment_method) {
      return Response.json(
        { message: 'بيانات غير مكتملة' },
        { status: 400 }
      );
    }

    // حساب الإجمالي مع الخصم
    let total = items.reduce((sum, item) => sum + parseFloat(item.price), 0);
    let discountAmount = 0;

    // تطبيق الكوبون إن وجد
    if (coupon_code) {
      const coupons = await sql`
        SELECT discount_percent 
        FROM coupons 
        WHERE code = ${coupon_code} AND is_active = true
      `;
      
      if (coupons.length > 0) {
        discountAmount = total * (coupons[0].discount_percent / 100);
        total = total - discountAmount;
      }
    }

    const remainingAmount = Math.max(0, total - parseFloat(amount_paid));

    // معالجة كل عنصر في السلة
    const processedItems = [];
    
    for (const item of items) {
      if (item.type === 'new') {
        // اشتراك جديد
        const enrollmentResult = await sql`
          INSERT INTO enrollments (
            student_id,
            subject_id,
            start_date,
            end_date,
            status,
            created_by_staff_id
          ) VALUES (
            ${student_id},
            ${item.subject_id},
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '6 months',
            'نشط',
            ${staff_id}
          )
          RETURNING enrollment_id
        `;

        const enrollmentId = enrollmentResult[0].enrollment_id;

        // إضافة سجل الدفع
        await sql`
          INSERT INTO payments (
            enrollment_id,
            amount_paid,
            remaining_amount,
            payment_date,
            method,
            staff_id
          ) VALUES (
            ${enrollmentId},
            ${parseFloat(item.price)},
            ${remainingAmount > 0 ? (remainingAmount * (parseFloat(item.price) / total)) : 0},
            CURRENT_DATE,
            ${payment_method},
            ${staff_id}
          )
        `;

        processedItems.push({
          type: 'enrollment',
          enrollment_id: enrollmentId,
          subject_id: item.subject_id
        });

      } else if (item.type === 'renewal') {
        // تجديد اشتراك
        await sql`
          UPDATE enrollments 
          SET end_date = end_date + INTERVAL '1 month',
              status = 'نشط'
          WHERE student_id = ${student_id} 
            AND subject_id = ${item.subject_id}
        `;

        // الحصول على enrollment_id للتجديد
        const enrollments = await sql`
          SELECT enrollment_id 
          FROM enrollments 
          WHERE student_id = ${student_id} 
            AND subject_id = ${item.subject_id}
          LIMIT 1
        `;

        if (enrollments.length > 0) {
          const enrollmentId = enrollments[0].enrollment_id;

          // إضافة سجل الدفع للتجديد
          await sql`
            INSERT INTO payments (
              enrollment_id,
              amount_paid,
              remaining_amount,
              payment_date,
              method,
              staff_id
            ) VALUES (
              ${enrollmentId},
              ${parseFloat(item.price)},
              ${remainingAmount > 0 ? (remainingAmount * (parseFloat(item.price) / total)) : 0},
              CURRENT_DATE,
              ${payment_method},
              ${staff_id}
            )
          `;

          processedItems.push({
            type: 'renewal',
            enrollment_id: enrollmentId,
            subject_id: item.subject_id
          });
        }
      }
    }

    // حفظ سجل عملية الشراء
    const checkoutResult = await sql`
      INSERT INTO checkouts (
        student_id,
        items,
        total_amount,
        applied_coupon,
        staff_id
      ) VALUES (
        ${student_id},
        ${JSON.stringify(items)},
        ${total},
        ${coupon_code || null},
        ${staff_id}
      )
      RETURNING checkout_id
    `;

    return Response.json({
      success: true,
      message: 'تم إتمام عملية الدفع بنجاح',
      checkout_id: checkoutResult[0].checkout_id,
      total_amount: total,
      discount_amount: discountAmount,
      remaining_amount: remainingAmount,
      processed_items: processedItems
    });

  } catch (error) {
    console.error('Checkout process error:', error);
    return Response.json(
      { message: 'حدث خطأ في معالجة عملية الدفع: ' + error.message },
      { status: 500 }
    );
  }
}