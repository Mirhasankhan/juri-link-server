import { WebSocket, WebSocketServer } from "ws";
import { Request } from "express";
import jwt from "jsonwebtoken";
import redisClient from "../../utils/redis";
import { parse } from "url";
import { Message, Room } from "../message/message.model";
import { User } from "../user/user.model";

interface JwtPayloadWithId {
  id: string;
  [key: string]: any;
}

interface CustomWebSocket extends WebSocket {
  userId?: string;
}

const roomUsers = new Map<string, Set<CustomWebSocket>>();
const connectedUsers = new Set<CustomWebSocket>();
let wss: WebSocketServer | undefined;

/**
 * Format conversations for a user, including last message, unread count, and active status
 */
async function formatConversations(userId: string) {
  const conversations = (await Room.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  })
    .sort({ updatedAt: -1 })
    .lean()) as any[];

  const connectedUserIds = Array.from(connectedUsers)
    .map((w) => w.userId)
    .filter((id): id is string => Boolean(id));

  const partnerIds = conversations.map((room: any) => {
    const senderIdStr = room.senderId?.toString?.() ?? String(room.senderId);
    const partnerId = senderIdStr === userId ? room.receiverId : room.senderId;
    return partnerId?.toString?.() ?? String(partnerId);
  });

  const uniquePartnerIds = [...new Set(partnerIds)];
  const users = await User.find({ _id: { $in: uniquePartnerIds } })
    .select("_id fullName profileImage")
    .lean();
  const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

  return Promise.all(
    conversations.map(async (room: any) => {
      const senderIdStr = room.senderId?.toString?.() ?? String(room.senderId);
      const partnerId = senderIdStr === userId ? room.receiverId : room.senderId;
      const partnerIdStr = partnerId?.toString?.() ?? String(partnerId);
      const partnerObj = userMap.get(partnerIdStr);
      const isActive = connectedUserIds.includes(partnerIdStr);

      const redisKey = `room:${room._id}:messages`;
      const unreadKey = `room:${room._id}:unread:${userId}`;

      const redisRaw = await redisClient.lRange(redisKey, 0, -1);
      const unreadCountStr = await redisClient.get(unreadKey);

      let latestMessage: { content: string | null; createdAt: string } | null = null;
      if (redisRaw.length > 0) {
        const messages = redisRaw.map((msg: any) => JSON.parse(msg));
        messages.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const latest = messages[0];
        latestMessage = {
          content:
            latest.content ||
            (Array.isArray(latest.fileUrl) && latest.fileUrl.length ? "sent file" : null),
          createdAt: latest.createdAt,
        };
      }

      return {
        roomId: String(room._id),
        partner: {
          id: partnerIdStr,
          fullName: partnerObj?.fullName ?? null,
          profileImage: partnerObj?.profileImage ?? null,
        },
        isActive,
        lastMessage: latestMessage,
        unreadCount: parseInt(unreadCountStr || "0", 10),
      };
    })
  );
}

/**
 * Setup WebSocket server
 */
export function setupWebSocketServer(server: any) {
  wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: CustomWebSocket, req: Request) => {
    // Extract token from header or query
    const { query } = parse(req.url ?? "", true);
    let authToken = req.headers["x-token"] as string | undefined;
    if (!authToken && query["x-token"]) {
      authToken = Array.isArray(query["x-token"])
        ? query["x-token"][0]
        : (query["x-token"] as string);
    }
    if (!authToken) return ws.close();

    // Verify token
    let decoded: JwtPayloadWithId | null = null;
    try {
      decoded = jwt.verify(authToken, process.env.JWT_SECRET as string) as JwtPayloadWithId;
    } catch {
      return ws.close();
    }

    const userId = decoded.id;
    ws.userId = userId;
    connectedUsers.add(ws);

    let roomId: string | null = null;

    // Keep connection alive with ping
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, 30000);

    // Send formatted conversations on connect
    const formattedConversations = await formatConversations(userId);
    ws.send(JSON.stringify({
      type: "member-conversation",
      conversations: formattedConversations,
    }));

    // Handle incoming messages
    ws.on("message", async (raw) => {
      try {
        const parsed = JSON.parse(raw.toString()) as {
          type?: string;
          receiverId?: string;
          content?: string;
          fileUrl?: string[] | string;
        };
        const { type, receiverId, content, fileUrl } = parsed;

        // Subscribe/join a room
        if (type === "member-subscribe") {
          if (!receiverId) {
            ws.send(JSON.stringify({ type: "error", message: "receiverId is required" }));
            return;
          }

          let room =
            (await Room.findOne({
              $or: [
                { senderId: userId, receiverId },
                { senderId: receiverId, receiverId: userId },
              ],
            })) ||
            (await Room.create({ senderId: userId, receiverId }));

          roomId = String(room._id);

          const unreadKey = `room:${roomId}:unread:${userId}`;
          await redisClient.set(unreadKey, "0");

          // Add to roomUsers
          roomUsers.forEach((set) => set.delete(ws));
          if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Set());
          roomUsers.get(roomId)!.add(ws);

          // Send last 30 messages
          const redisKey = `room:${roomId}:messages`;
          const redisRaw = await redisClient.lRange(redisKey, -30, -1);
          ws.send(JSON.stringify({
            type: "past-messages",
            roomId,
            messages: redisRaw.reverse().map((m) => JSON.parse(m)),
          }));

          // Update conversation list
          const senderConvos = await formatConversations(userId);
          ws.send(JSON.stringify({ type: "member-conversation", conversations: senderConvos }));
          return;
        }

        // Send a message
        if (type === "member-send-message") {
          if (!roomId) {
            ws.send(JSON.stringify({ type: "error", message: "Not in a room" }));
            return;
          }
          if (!receiverId) {
            ws.send(JSON.stringify({ type: "error", message: "receiverId is required" }));
            return;
          }

          const payload = {
            content: content ?? null,
            senderId: userId,
            receiverId,
            roomId,
            fileUrl: Array.isArray(fileUrl) ? fileUrl : fileUrl ? [fileUrl] : [],
            createdAt: new Date().toISOString(),
          };

          const redisKey = `room:${roomId}:messages`;
          await redisClient.rPush(redisKey, JSON.stringify(payload));

          // Increment unread for receiver in Redis
          const unreadKey = `room:${roomId}:unread:${receiverId}`;
          await redisClient.incr(unreadKey);

          // Notify online receiver immediately
          for (const client of connectedUsers) {
            if (client.readyState === WebSocket.OPEN && client.userId === receiverId) {
              const unreadCount = parseInt(await redisClient.get(unreadKey) || "0", 10);
              client.send(JSON.stringify({
                type: "increment_unread",
                roomId,
                unreadCount
              }));
            }
          }

          // Trim messages to 30
          const count = await redisClient.lLen(redisKey);
          if (count >= 30) {
            const raw = await redisClient.lRange(redisKey, 0, 14);
            const msgs = raw.map((r) => JSON.parse(r));
            if (msgs.length > 0) await Message.insertMany(msgs);
            await redisClient.lTrim(redisKey, 15, -1);
          }

          await Room.findByIdAndUpdate(roomId, { updatedAt: new Date() });

          // Broadcast new message to room sockets
          roomUsers.get(roomId)?.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "member-new-message", roomId, message: payload }));
            }
          });

          // Update conversation list for all connected users
          const allConnectedUsers = Array.from(connectedUsers);
          for (const client of allConnectedUsers) {
            if (client.readyState === WebSocket.OPEN) {
              const targetUserId = client.userId;
              if (!targetUserId) continue;
              const convos = await formatConversations(targetUserId);
              client.send(JSON.stringify({ type: "member-conversation", conversations: convos }));
            }
          }
          return;
        }

        ws.send(JSON.stringify({ type: "error", message: "Invalid message type" }));
      } catch (err) {
        ws.send(JSON.stringify({ type: "error", message: "Invalid message" }));
      }
    });

    // Handle disconnect
    ws.on("close", () => {
      connectedUsers.delete(ws);
      if (roomId && roomUsers.has(roomId)) {
        roomUsers.get(roomId)?.delete(ws);
        if ((roomUsers.get(roomId) as Set<CustomWebSocket>)?.size === 0)
          roomUsers.delete(roomId);
      }
      clearInterval(interval);
    });
  });
}

export const socket = { wss, roomUsers };
