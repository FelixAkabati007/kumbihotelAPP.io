import "dotenv/config";
import { db } from "../backend/db/index";
import { users, rooms, settings } from "../backend/db/schema";
import bcrypt from "bcryptjs";

async function run() {
  console.log("Seeding users...");

  // 1. Admin
  const adminPassword = await bcrypt.hash("ZXCVBNM12345", 10);
  await db
    .insert(users)
    .values({
      email: "Admin@kumbiapp.com",
      passwordHash: adminPassword,
      fullName: "System Admin",
      phoneNumber: "+233000000001",
      role: "admin",
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash: adminPassword,
        role: "admin",
        fullName: "System Admin",
      },
    });

  // 2. Manager
  const managerPassword = await bcrypt.hash("Qwerty123!", 10);
  await db
    .insert(users)
    .values({
      email: "Manager@kumbiapp.com",
      passwordHash: managerPassword,
      fullName: "Hotel Manager",
      phoneNumber: "+233535975422",
      role: "manager",
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash: managerPassword,
        role: "manager",
        fullName: "Hotel Manager",
      },
    });

  // 3. Receptionist
  const receptionistPassword = await bcrypt.hash("Receptionist123!", 10);
  await db
    .insert(users)
    .values({
      email: "Receptionist@kumbiapp.com",
      passwordHash: receptionistPassword,
      fullName: "Front Desk",
      phoneNumber: "+233000000002",
      role: "receptionist",
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash: receptionistPassword,
        role: "receptionist",
        fullName: "Front Desk",
      },
    });

  console.log("Users seeded.");

  const seedRooms: {
    roomNumber: string;
    roomType: "single" | "double" | "suite" | "deluxe";
    capacity: number;
    pricePerNight: string;
  }[] = [
    {
      roomNumber: "101",
      roomType: "single",
      capacity: 1,
      pricePerNight: "150.00",
    },
    {
      roomNumber: "102",
      roomType: "double",
      capacity: 2,
      pricePerNight: "220.00",
    },
    {
      roomNumber: "201",
      roomType: "suite",
      capacity: 3,
      pricePerNight: "350.00",
    },
  ];
  for (const r of seedRooms) {
    await db
      .insert(rooms)
      .values({ ...r, amenities: ["wifi", "ac"] })
      .onConflictDoNothing();
  }

  await db
    .insert(settings)
    .values({
      key: "contact_number",
      value: "+233535975422",
      description: "Main hotel contact number displayed in footer",
    })
    .onConflictDoNothing();

  console.log("Seed complete");
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
