import { db } from "../lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const hashed = await bcrypt.hash("testpass", 12);

  const user = await db.user.upsert({
    where: { username: "testuser" },
    update: {},
    create: {
      username: "testuser",
      password: hashed,
    },
  });

  console.log(`Seed completed. Test user upserted: ${user.id} (${user.username})`);

  await db.$disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
