import { ObjectId } from "mongodb";
import { Socket } from "socket.io";

import { userCollection } from "../../lib/mongodb/init";

export const followStatusEmit = (id: string, socket: Socket) => {
  try {
    const changeStream = userCollection.watch([
      {
        $match: {
          "documentKey._id": new ObjectId(id),
        },
      },
    ]);

    changeStream.on("change", (change: any) => {
      if (change.updateDescription?.updatedFields?.followingCount) {
        socket.emit(
          "following",
          change?.updateDescription?.updatedFields?.followingCount
        );
      }

      socket.emit(
        "followers",
        change?.updateDescription?.updatedFields?.followersCount
      );

      console.log(
        ">>>> ",
        change?.updateDescription?.updatedFields?.followingCount
      );
    });
  } catch (e) { }
};
