import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock orders...');

  // Get a user and a product to use
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No users found. Please create a user first.');
    return;
  }

  const product = await prisma.product.findFirst();
  if (!product) {
    console.error('No products found. Please create a product first.');
    return;
  }

  // Create Order 1
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: user.id,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: 'COD',
      totalAmount: 1200.50,
      shippingAddress: {
        street: '123 Ayurveda Lane',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
      billingAddress: {
        street: '123 Ayurveda Lane',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
      items: {
        create: [
          {
            productId: product.id,
            quantity: 2,
            price: 600.25,
            total: 1200.50,
          }
        ]
      }
    }
  });

  console.log('Created order:', order1.orderNumber);

  // Create Order 2
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: user.id,
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'UPI',
      totalAmount: 450.00,
      shippingAddress: {
        street: '45 Wellness Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      },
      billingAddress: {
        street: '45 Wellness Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      },
      items: {
        create: [
          {
            productId: product.id,
            quantity: 1,
            price: 450.00,
            total: 450.00,
          }
        ]
      }
    }
  });

  console.log('Created order:', order2.orderNumber);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
