import "dotenv/config";
import { db } from "../backend/db/index";
import { users, rooms, settings } from "../backend/db/schema";
import bcrypt from "bcryptjs";

async function run() {
  const passwordHash = await bcrypt.hash("manager123", 10);

  await db
    .insert(users)
    .values({
      email: "manager@kumbisalyheritagehotel.com",
      passwordHash,
      fullName: "Hotel Manager",
      phoneNumber: "+233535975422",
      role: "manager",
    })
    .onConflictDoNothing();

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
