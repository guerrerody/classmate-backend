import prisma from "../../lib/prisma/init";

export default async function updateFollowerCounts(userId: string) {
  const [followersCount, followingCount] = await Promise.all([
    prisma.user.count({
      where: { followings: { some: { id: userId } } },
    }),
    prisma.user.count({
      where: { followers: { some: { id: userId } } },
    }),
  ]);

  console.log(">>>> file: updateFollows.ts ~ updateFollowerCounts ~ counts: ",
    { followersCount, followingCount }
  );

  await prisma.user.update({
    where: { id: userId },
    data: { followersCount, followingCount },
  });
}

