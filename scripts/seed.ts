import "dotenv/config";
import { db } from "../api/db/index.js";
import { users, rooms } from "../api/db/schema.js";

async function run() {
  const [manager] = await db
    .insert(users)
    .values({
      email: "manager@kumbisalyheritagehotel.com",
      passwordHash: "$2a$10$seedseeddummyhashseedseeddummyhashseedseeddum", // placeholder; set manually
      fullName: "Hotel Manager",
      phoneNumber: "+233535975422",
      role: "manager",
    })
    .onConflictDoNothing()
    .returning();

  const seedRooms = [
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
  console.log("Seed complete");
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
