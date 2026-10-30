import { PrismaClient, UserRole, VendorStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  const tailoring = await prisma.serviceCategory.upsert({
    where: { slug: 'tailoring' }, update: {}, create: { name: 'Tailoring', slug: 'tailoring' },
  });
  const cobbler = await prisma.serviceCategory.upsert({
    where: { slug: 'cobbler' }, update: {}, create: { name: 'Cobbler', slug: 'cobbler' },
  });

  const adminPw = await hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@stitch.dev' }, update: {},
    create: { email: 'admin@stitch.dev', name: 'Admin', passwordHash: adminPw, role: UserRole.ADMIN },
  });

  const custPw = await hash('customer123', 10);
  await prisma.user.upsert({
    where: { email: 'customer@stitch.dev' }, update: {},
    create: { email: 'customer@stitch.dev', name: 'Rahul Sharma', passwordHash: custPw, role: UserRole.CUSTOMER },
  });

  const vendorPw = await hash('vendor123', 10);
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@stitch.dev' }, update: {},
    create: { email: 'vendor@stitch.dev', name: 'Meena Tailors', passwordHash: vendorPw, role: UserRole.VENDOR },
  });

  const vendor = await prisma.vendor.upsert({
    where: { ownerId: vendorUser.id }, update: {},
    create: {
      ownerId: vendorUser.id, businessName: 'Meena Tailors & Alterations', phone: '9876543210',
      addressLine: '45 Commercial Street', city: 'Bangalore', pincode: '560001',
      lat: 12.9716, lng: 77.5946, status: VendorStatus.APPROVED, rating: 4.5,
    },
  });

  const services = [
    { name: 'Pant alteration', basePrice: 15000, turnaround: 2, categoryId: tailoring.id },
    { name: 'Shirt stitching', basePrice: 45000, turnaround: 5, categoryId: tailoring.id },
    { name: 'Shoe sole repair', basePrice: 20000, turnaround: 3, categoryId: cobbler.id },
  ];

  for (const s of services) {
    await prisma.service.create({ data: { ...s, vendorId: vendor.id } });
  }

  console.log('✅ Done. Demo credentials:');
  console.log('   Admin:    admin@stitch.dev / admin123');
  console.log('   Customer: customer@stitch.dev / customer123');
  console.log('   Vendor:   vendor@stitch.dev / vendor123');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
