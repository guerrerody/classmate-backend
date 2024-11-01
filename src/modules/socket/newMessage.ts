import { Socket } from "socket.io";
import IO from "./socket";
import { addMessages } from "../../controller/chat/addMessages";
import { getReceiverNotificationToken } from "../../controller/chat/getReceiverNotificationToken";
import Expo from "expo-server-sdk";
import expo from "../../lib/expo/init";
import { onlineState } from "../onlineUsers";

export const newMessage = async (
  data: any,
  socket: Socket,
  id: string,
  userName: string
) => {
  console.log(">>>> file: socket.ts:76 ~ socket.on ~ data:", data);
  IO.to(data.chatId).emit("message", data);
  IO.to(data.chatId).emit("newMsg", data);
  socket.emit("sent", true);
  addMessages(data.message.text, data.chatId, data.id, id).then((e) => {});
  const onlineUsers = onlineState.getValues();

  console.log(">>>> file: newMessage.ts:20 ~ onlineUsers:", onlineUsers);
  getReceiverNotificationToken(data.chatId, id)
    .then((r: any) => {
      console.log(">>>> file: newMessage.ts:26 ~ .then ~ r:", r)
      if (onlineUsers.includes(r.userId)) {
        return;
      }
      console.log(">>>> file: socket.ts:129 ~ .then ~ r:", r);
      if (!Expo.isExpoPushToken(r.notificationId)) {
        return;
      }
      expo.sendPushNotificationsAsync([
        {
          to: r.notificationId,
          sound: "default",
          badge: 1,
          mutableContent:true,
          title: `@${userName}`,
          body: `${data.message.text}`,
          subtitle: "sent a message",
          categoryId:"message",
          data: {
            chatId: data.chatId,
            url: `classmate-lab3://messages/${data.chatId}`,
          },
        },
      ]);
    })
    .catch((e) => console.log(e));
};
