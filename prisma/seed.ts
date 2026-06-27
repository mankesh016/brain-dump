import { db } from "../lib/db";

async function main() {
  const devUserId = process.env.DEV_USER_ID || "dev-user-123";

  const user = await db.user.upsert({
    where: { id: devUserId },
    update: {},
    create: {
      id: devUserId,
      username: "devuser",
      password: "devpassword",
    },
  });

  console.log(`Seed completed. Dev user upserted: ${user.id} (${user.username})`);

  await db.$disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
