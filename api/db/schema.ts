import { pgTable, uuid, varchar, text, integer, decimal, jsonb, timestamp, date, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['guest', 'receptionist', 'manager']);
export const roomTypeEnum = pgEnum('room_type', ['single', 'double', 'suite', 'deluxe']);
export const roomStatusEnum = pgEnum('room_status', ['available', 'occupied', 'maintenance']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'refunded', 'failed']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'mobile_money']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  role: roleEnum('role').default('guest'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('GHS'),
  status: paymentStatusEnum('status').default('pending'),
  method: paymentMethodEnum('method').default('cash'),
  reference: varchar('reference', { length: 128 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
},
  (table) => ({
    paymentsBookingIdx: index('payments_booking_idx').on(table.bookingId),
    paymentsStatusIdx: index('payments_status_idx').on(table.status),
  })
);

export const rooms = pgTable('rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  roomNumber: varchar('room_number', { length: 10 }).unique().notNull(),
  roomType: roomTypeEnum('room_type').notNull(),
  capacity: integer('capacity').notNull(),
  pricePerNight: decimal('price_per_night', { precision: 10, scale: 2 }).notNull(),
  amenities: jsonb('amenities').$type<string[]>().default([]),
  status: roomStatusEnum('status').default('available'),
  images: jsonb('images').$type<string[]>().default([]),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
  checkInDate: date('check_in_date').notNull(),
  checkOutDate: date('check_out_date').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: bookingStatusEnum('status').default('pending'),
  specialRequests: text('special_requests'),
  idempotencyKey: varchar('idempotency_key', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
},
  (table) => ({
    bookingsUserIdx: index('bookings_user_idx').on(table.userId),
    bookingsRoomIdx: index('bookings_room_idx').on(table.roomId),
    bookingsDateIdx: index('bookings_date_idx').on(table.checkInDate, table.checkOutDate),
    idempotencyKeyUnique: uniqueIndex('bookings_idem_key_unique').on(table.idempotencyKey),
  })
);
