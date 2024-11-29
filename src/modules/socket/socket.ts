import { Server } from "socket.io";
import Expo from "expo-server-sdk";
import jwt from "jsonwebtoken";

import app, { sessionMiddleWare } from "../../app";
import { startChatSocket } from "../../controller/chat/startChatSocket";
import { deleteMessage } from "../../controller/chat/deleteMessage";
import { addPhoto } from "../../controller/chat/addPhoto";
import { newMessage } from "./newMessage";
import { onlineState } from "../onlineUsers";
import { followStatusEmit } from "./followStatus";
import { getReceiverNotificationToken } from "../../controller/chat/getReceiverNotificationToken";
import expo from "../../lib/expo/init";

const IO = new Server(app, { cookie: true });
IO.engine.use(sessionMiddleWare);

IO.use((socket, next) => {
  console.log(">>>> Socket handshake headers: ", socket.handshake.headers);

  const token = socket.handshake?.auth?.token;

  console.log(">>>> file: socket.ts ~ IO.use ~ token: ", socket.handshake?.auth);
  if (!token) {
    return next(new Error("Not authorized"));
  }
  const user: any = jwt.verify(token, process.env.SECRET ?? "");
  console.log(">>>> file: socket.ts ~ IO.use ~ user: ", user);

  if (user) {
    socket.data.userId = user.id;
    socket.data.userName = user.email;
    return next();
  }

  next(new Error("Not authorized"));
});

IO.on("connection", async (socket) => {
  console.log(`>>>> ${socket.data.userId} user just connected!`);

  const id = socket.data.userId;
  const userName = socket.data.userName;
  socket.emit("connected", socket.data.userId);
  socket.join(id);

  // if (!isAlreadyLoaded) {
  //   onlineUsers.push(id);
  // }

  onlineState.addValue(id);
  IO.emit("online", onlineState.getValues());

  socket.on("disconnect", async () => {
    socket.disconnect();
    onlineState.deleteValue(id);
    IO.emit("online", onlineState.getValues());
    console.log(">>>> A user disconnected");
  });
  socket.on("followedStatus", () => {
    followStatusEmit(id, socket);
  });
  socket.on("startChat", async (receiverId) => {
    try {
      socket.join(receiverId);
      const chat: any = await startChatSocket(id, receiverId);
      console.log(">>>> file: socket.ts ~ socket.on ~ id: ", id);
      if (chat) {
        IO.to(receiverId).emit("newChat", chat);
      }
    } catch (e) { }
  });

  socket.on("chat", async (id: string[]) => {
    console.log(">>>> file: socket.ts ~ socket.on ~ id: ", id);
    socket.join(id);

    //IO.to(id).emit("isOnline", { id, isOnline: true });
  });
  socket.on(
    "newMessage",
    async (data: { message: { text: string }; chatId: string; id: string }) => {
      newMessage(data, socket, id, userName);
    }
  );
  socket.on("newPhoto", async (data) => {
    const onlineUsers = onlineState.getValues();
    console.log(">>>> file: socket.ts ~ socket.on ~ data: ", data);
    IO.to(data.chatId).emit("message", {
      message: {
        sender: data.message.sender,
        photo: {
          imageUri: data?.message?.photo?.uri,
          imageWidth: data?.message?.photo?.width,
          imageHeight: data?.message?.photo?.height,
        },
        id: data.message?.id,
        createdAt: data?.message?.createdAt
      },
      imageUri: data?.imageUri,
      chatId: data?.chatId,
    });
    socket.emit("sent", true);
    addPhoto(data.message.photo, data.chatId, data.id, id)
      .then((e) => { })
      .catch((e) => { });

    getReceiverNotificationToken(data.chatId, id)
      .then((r: any) => {
        console.log(">>>> file: newMessage.ts ~ .then ~ r: ", r)
        if (onlineUsers.includes(r.userId)) {
          return;
        }
        if (!Expo.isExpoPushToken(r.notificationId)) {
          return;
        }
        expo.sendPushNotificationsAsync([
          {
            to: r.notificationId,
            sound: "default",
            badge: 1,
            mutableContent: true,
            title: `@${userName}`,
            body: `📷 sent a photo`,
            subtitle: "sent a photo",
            categoryId: "message",
            data: {
              chatId: data.chatId,
              url: `classmate-lab3://messages/${data.chatId}`,
            },
          },
        ]);
      })
      .catch((e) => console.log(e));
  });
  socket.on("deleteMessage", async (messageId) => {
    console.log(">>>> file: socket.ts ~ socket.on ~ messageId: ", messageId);
    deleteMessage(messageId, id)
      .then((e) => {
        console.log(e);
      })
      .catch((e) => {
        console.log(e);
      });
  });
  socket.on("initChat", (id) => {
    console.log(">>>> file: socket.ts ~ socket.on ~ id: ", id);
    socket.join(id);
    socket.emit("initChat", { id });
  });
  socket.on("isTyping", async (chatId, isTyping) => {
    IO.to(chatId).emit("isTyping", { id, isTyping });
    console.log(">>>> file: socket.ts ~ socket.on ~ isTyping: ", { id, isTyping });
  });
  socket.on("away", () => {
    console.log(`${id} is now away`);
    onlineState.deleteValue(id);
    IO.emit("online", onlineState.getValues());
  });
  socket.on("online", () => {
    console.log(`${id} is now online`);
    onlineState.addValue(id);
    IO.emit("online", onlineState.getValues());
  });
});

export default IO;
