import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting NovaMarket database seeding with single exclusive product...');

  // Clean existing data in reverse order of foreign keys
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.newsletterSubscription.deleteMany();
  await prisma.contactEnquiry.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users (Admin & Customer)
  const passwordSalt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@12345', passwordSalt);
  const customerPasswordHash = await bcrypt.hash('Customer@12345', passwordSalt);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@novamarket.com',
      passwordHash: adminPasswordHash,
      firstName: 'Nova',
      lastName: 'Admin',
      phone: '+1-800-555-0199',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const demoCustomer = await prisma.user.create({
    data: {
      email: 'customer@novamarket.com',
      passwordHash: customerPasswordHash,
      firstName: 'Alex',
      lastName: 'Morgan',
      phone: '+1-555-0144-88',
      role: 'CUSTOMER',
      isActive: true,
      addresses: {
        create: [
          {
            fullName: 'Alex Morgan',
            phone: '+1-555-0144-88',
            addressLine1: '742 Evergreen Terrace',
            addressLine2: 'Suite 4B',
            city: 'Springfield',
            state: 'Oregon',
            postalCode: '97477',
            country: 'United States',
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log('✅ Users seeded:');
  console.log('   Admin: admin@novamarket.com / Admin@12345');
  console.log('   Customer: customer@novamarket.com / Customer@12345');

  // 2. Create Category
  const category = await prisma.category.create({
    data: {
      name: "Men's Grooming & Skincare",
      slug: 'mens-grooming',
      description: 'Artisan post-shave botanical lotions, soothing aloe vera formulations, and skin-friendly daily essentials.',
      image: '/uploads/aftershave-lotion-bottle.png',
      isActive: true,
    },
  });
  console.log(`✅ Seeded category: ${category.name}`);

  // 3. Create the ONE and ONLY Product: Aftershave Lotion – Lavender
  const aftershaveProduct = await prisma.product.create({
    data: {
      name: 'Aftershave Lotion – Lavender (50 mL)',
      slug: 'aftershave-lotion-lavender',
      sku: 'ASL-LAV-050',
      shortDesc: 'Soothe, refresh, and recharge with skin-friendly lavender aftershave lotion enriched with natural aloe vera goodness.',
      description: 'Crafted for the modern gentleman, Aftershave Lotion – Lavender delivers an invigorating, skin-friendly post-shave ritual. Infused with soothing Aloe Vera extract and calming natural lavender botanicals, this premium formula instantly cools razor burn, tightens pores, and restores essential moisture without leaving greasy residue. Formulated to soothe, refresh, and recharge your skin every single day with long-lasting freshness.',
      brand: 'NovaGroom Artisans',
      regularPrice: 250.0,
      sellingPrice: 200.0,
      discountPercent: 20.0,
      isFeatured: true,
      isBestSeller: true,
      isTrending: true,
      status: 'PUBLISHED',
      weight: '50 mL / 75g',
      dimensions: '4.5 x 4.5 x 12.0 cm',
      specifications: JSON.stringify({
        Volume: '50 mL (1.69 fl. oz.)',
        Formulation: 'Ultra-lightweight soothing spray lotion mist',
        'Key Actives': 'Pure Aloe Vera Extract, Natural Lavender Essential Oil, Witch Hazel, Provitamin B5',
        'Skin Compatibility': 'Dermatologically tested & friendly for sensitive skin',
        Benefits: 'Soothe razor burn, refresh skin texture, recharge deep hydration, long-lasting freshness',
        'Fragrance Notes': 'French lavender sprigs, crisp botanical herbal undertones',
        CleanStandards: 'Alcohol-free, Paraben-free, Cruelty-free, 100% Vegan',
      }),
      shippingInfo: 'Complimentary expedited 2-day domestic air shipping on orders over ₹499. Eco-friendly protective packaging.',
      returnWarrantyInfo: '30-Day 100% Satisfaction Guarantee. Risk-free returns if not completely delighted.',
      tags: 'aftershave,lotion,lavender,mens grooming,skincare,aloe vera,post-shave,soothe,refresh,recharge',
      seoTitle: 'Aftershave Lotion – Lavender (50 mL) | NovaMarket Grooming',
      seoDescription: 'Soothe razor burn, refresh pores, and recharge hydration with Aftershave Lotion – Lavender. Features organic aloe vera and calming lavender essence.',
      stockQuantity: 85,
      categoryId: category.id,
      images: {
        create: [
          {
            url: '/uploads/aftershave-lotion-pedestal.png',
            altText: 'Aftershave Lotion Lavender 50 mL on Marble Pedestal with Lavender Botanicals',
            isPrimary: true,
            sortOrder: 0,
          },
          {
            url: '/uploads/aftershave-lotion-lifestyle-man.png',
            altText: 'After Shave Refreshed You - Gentle Care For Modern Men Lifestyle',
            isPrimary: false,
            sortOrder: 1,
          },
          {
            url: '/uploads/aftershave-lotion-aloe-nature.png',
            altText: "Nature's Care For Your Skin - Lavender & Aloe Vera Cooling Care",
            isPrimary: false,
            sortOrder: 2,
          },
          {
            url: '/uploads/aftershave-lotion-water-splash.png',
            altText: 'Stay Fresh Stay Confident - Crystal Water Splash & Ice Refreshment',
            isPrimary: false,
            sortOrder: 3,
          },
          {
            url: '/uploads/aftershave-lotion-features-collage.jpg',
            altText: 'Key Benefits and Features Collage - Soothe, Refresh, Recharge with Aloe Vera',
            isPrimary: false,
            sortOrder: 4,
          },
        ],
      },
      variants: {
        create: [
          {
            name: 'Standard Bottle (50 mL)',
            sku: 'ASL-LAV-050-STD',
            price: 200.0,
            stockQuantity: 55,
            attributes: JSON.stringify({ Size: '50 mL', Pack: 'Single Bottle' }),
          },
          {
            name: 'Duo Value Pack (2 x 50 mL)',
            sku: 'ASL-LAV-050-DUO',
            price: 360.0,
            stockQuantity: 30,
            attributes: JSON.stringify({ Size: '2 x 50 mL', Pack: 'Twin Pack (Save ₹40)' }),
          },
        ],
      },
    },
  });

  // Inventory log for initial stock
  await prisma.inventoryLog.create({
    data: {
      productId: aftershaveProduct.id,
      changeAmount: 85,
      previousStock: 0,
      newStock: 85,
      reason: 'INITIAL_STOCK_SEED',
      referenceId: 'SYSTEM_BOOTSTRAP',
    },
  });

  console.log(`✅ Seeded single exclusive product: ${aftershaveProduct.name} (${aftershaveProduct.sku})`);

  // 4. Create Coupons
  const couponsData = [
    {
      code: 'WELCOME10',
      description: '10% off your entire first order at NovaMarket',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 200,
      maxDiscountAmount: 50,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-12-31'),
      usageLimit: 500,
      usageCount: 14,
      isActive: true,
    },
    {
      code: 'FRESH20',
      description: 'Exclusive 20% discount on botanical grooming care orders over ₹350',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderAmount: 350,
      maxDiscountAmount: 100,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-12-31'),
      usageLimit: 250,
      usageCount: 18,
      isActive: true,
    },
    {
      code: 'SOOTHE50',
      description: 'Instant ₹50 discount on aftershave lotion orders above ₹300',
      discountType: 'FIXED',
      discountValue: 50,
      minOrderAmount: 300,
      maxDiscountAmount: 50,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-12-31'),
      usageLimit: 150,
      usageCount: 9,
      isActive: true,
    },
  ];

  for (const coupon of couponsData) {
    await prisma.coupon.create({ data: coupon });
  }
  console.log(`✅ Seeded ${couponsData.length} promotional coupons.`);

  // 5. Seed Customer Reviews for Aftershave Lotion – Lavender
  await prisma.review.createMany({
    data: [
      {
        productId: aftershaveProduct.id,
        userId: demoCustomer.id,
        userName: 'Alex Morgan',
        rating: 5,
        title: 'Unbelievable cooling and instant razor burn relief!',
        comment: 'I shave daily for work and have always struggled with neck redness. This lavender lotion immediately calms burning within seconds. The subtle natural lavender scent is invigorating without being overpowering.',
        isVerifiedPurchase: true,
        status: 'APPROVED',
      },
      {
        productId: aftershaveProduct.id,
        userName: 'Dr. Marcus Vance',
        rating: 5,
        title: 'Gentle on sensitive skin — pure aloe vera goodness',
        comment: 'As someone with sensitive skin, alcohol-free post-shave products are essential. The hydration lasts all morning, leaving no greasy film. Truly skin friendly.',
        isVerifiedPurchase: true,
        status: 'APPROVED',
      },
      {
        productId: aftershaveProduct.id,
        userName: 'Jordan Blake',
        rating: 5,
        title: 'The spray mist bottle is genius',
        comment: 'The fine mist pump nozzle disperses the lotion evenly across the face. 50 mL is super travel-friendly and lasts well over a month. Best grooming purchase this year.',
        isVerifiedPurchase: true,
        status: 'APPROVED',
      },
    ],
  });
  console.log('✅ Seeded authentic customer reviews.');

  // 6. Seed a sample completed order
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20261022-0001',
      userId: demoCustomer.id,
      customerName: 'Alex Morgan',
      customerEmail: 'customer@novamarket.com',
      customerPhone: '+1-555-0144-88',
      shippingAddress: JSON.stringify({
        fullName: 'Alex Morgan',
        addressLine1: '742 Evergreen Terrace',
        addressLine2: 'Suite 4B',
        city: 'Springfield',
        state: 'Oregon',
        postalCode: '97477',
        country: 'India',
        phone: '+1-555-0144-88',
      }),
      subtotal: 200.0,
      discountTotal: 20.0,
      shippingTotal: 0.0,
      taxTotal: 10.0,
      grandTotal: 190.0,
      couponCode: 'WELCOME10',
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'TEST_CARD',
      paymentId: 'pay_test_seeded990231',
      trackingNumber: 'TRK-NV-889021-IN',
      trackingCarrier: 'BlueDart Express',
      trackingUrl: 'https://bluedart.com/track?id=TRK-NV-889021-IN',
      items: {
        create: [
          {
            productId: aftershaveProduct.id,
            productName: aftershaveProduct.name,
            productSku: aftershaveProduct.sku,
            variantName: 'Standard Bottle (50 mL)',
            unitPrice: 200.0,
            quantity: 1,
            subtotal: 200.0,
          },
        ],
      },
      payments: {
        create: [
          {
            paymentMethod: 'TEST_CARD',
            transactionId: 'txn_mock_9918237',
            amount: 190.0,
            currency: 'INR',
            status: 'SUCCESS',
          },
        ],
      },
    },
  });
  console.log(`✅ Seeded sample order #${sampleOrder.orderNumber}`);

  console.log('🎉 NovaMarket single-product database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
