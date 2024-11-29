import prisma from "../../../lib/prisma/init";

export const followUser = async () => {
  try {
    const userWithFollower = await prisma.post.deleteMany({
      where: {
        photoUri: {
          isEmpty: false,
        },
      },
    });
    console.log(
      ">>>> file: followUser.ts ~ followUser ~ userWithFollower: ",
      userWithFollower
    );
  } catch (e) {
    console.log(e);
  }
};

followUser();
