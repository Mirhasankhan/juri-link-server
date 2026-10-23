import { WebSocket, WebSocketServer } from "ws";
import { Request } from "express";
import jwt from "jsonwebtoken";
import redisClient from "../../utils/redis";
import { parse } from "url";
import config from "../../config";
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
  try {
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

    return await Promise.all(
      conversations.map(async (room: any) => {
        const senderIdStr = room.senderId?.toString?.() ?? String(room.senderId);
        const partnerId = senderIdStr === userId ? room.receiverId : room.senderId;
        const partnerIdStr = partnerId?.toString?.() ?? String(partnerId);
        const partnerObj = userMap.get(partnerIdStr);
        const isActive = connectedUserIds.includes(partnerIdStr);

        const redisKey = `room:${room._id}:messages`;
        const unreadKey = `room:${room._id}:unread:${userId}`;

        let redisRaw: string[] = [];
        let unreadCountStr: string | null = "0";

        if (redisClient.isReady) {
          try {
            redisRaw = await redisClient.lRange(redisKey, 0, -1);
            unreadCountStr = await redisClient.get(unreadKey);
          } catch (err) {
            console.error("Redis read error in formatConversations:", err);
          }
        }

        let latestMessage: { content: string | null; createdAt: string } | null = null;
        if (redisRaw && redisRaw.length > 0) {
          try {
            const messages = redisRaw.map((msg: any) => JSON.parse(msg));
            messages.sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            const latest = messages[0];
            latestMessage = {
              content:
                latest.content ||
                (Array.isArray(latest.fileUrl) && latest.fileUrl.length
                  ? "sent file"
                  : null),
              createdAt: latest.createdAt,
            };
          } catch {}
        }

        // Fallback to MongoDB if Redis message history is empty
        if (!latestMessage) {
          try {
            const latestDb = (await Message.findOne({ roomId: room._id })
              .sort({ createdAt: -1 })
              .lean()) as any;
            if (latestDb) {
              latestMessage = {
                content:
                  latestDb.content ||
                  (Array.isArray(latestDb.fileUrl) && latestDb.fileUrl.length
                    ? "sent file"
                    : null),
                createdAt: latestDb.createdAt
                  ? new Date(latestDb.createdAt).toISOString()
                  : new Date().toISOString(),
              };
            }
          } catch (err) {
            console.error("MongoDB query error in formatConversations:", err);
          }
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
  } catch (err) {
    console.error("Error in formatConversations:", err);
    return [];
  }
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

    if (!authToken && req.headers["authorization"]) {
      const authHeader = req.headers["authorization"] as string;
      authToken = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : authHeader.trim();
    }
    if (!authToken && query["x-token"]) {
      authToken = Array.isArray(query["x-token"])
        ? query["x-token"][0]
        : (query["x-token"] as string);
    }
    if (!authToken && query["token"]) {
      authToken = Array.isArray(query["token"])
        ? query["token"][0]
        : (query["token"] as string);
    }

    if (!authToken || authToken === "null" || authToken === "undefined") {
      ws.send(
        JSON.stringify({ type: "error", message: "Authentication required" })
      );
      return ws.close(1008, "Authentication required");
    }

    // Verify token
    let decoded: JwtPayloadWithId | null = null;
    try {
      decoded = jwt.verify(
        authToken,
        config.jwt.jwt_secret as string
      ) as JwtPayloadWithId;
    } catch {
      ws.send(
        JSON.stringify({ type: "error", message: "Invalid or expired token" })
      );
      return ws.close(1008, "Invalid or expired token");
    }

    const userId = String(decoded.id);
    ws.userId = userId;
    connectedUsers.add(ws);

    let roomId: string | null = null;

    ws.on("error", (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
    });

    // Keep connection alive with ping
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, 30000);

    // Send formatted conversations on connect
    try {
      const formattedConversations = await formatConversations(userId);
      ws.send(
        JSON.stringify({
          type: "member-conversation",
          conversations: formattedConversations,
        })
      );
    } catch (e) {
      console.error("Failed to send initial conversations:", e);
    }

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
            ws.send(
              JSON.stringify({ type: "error", message: "receiverId is required" })
            );
            return;
          }

          let room = await Room.findOne({
            $or: [
              { senderId: userId, receiverId },
              { senderId: receiverId, receiverId: userId },
            ],
          });

          if (!room) {
            try {
              room = await Room.create({ senderId: userId, receiverId });
            } catch {
              room = await Room.findOne({
                $or: [
                  { senderId: userId, receiverId },
                  { senderId: receiverId, receiverId: userId },
                ],
              });
            }
          }

          if (!room) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Failed to establish chat room",
              })
            );
            return;
          }

          roomId = String(room._id);

          const unreadKey = `room:${roomId}:unread:${userId}`;
          if (redisClient.isReady) {
            try {
              await redisClient.set(unreadKey, "0");
            } catch {}
          }

          // Add to roomUsers
          roomUsers.forEach((set) => set.delete(ws));
          if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Set());
          roomUsers.get(roomId)!.add(ws);

          // Retrieve messages: Redis first, MongoDB fallback
          const redisKey = `room:${roomId}:messages`;
          let pastMessages: any[] = [];

          if (redisClient.isReady) {
            try {
              const redisRaw = await redisClient.lRange(redisKey, -30, -1);
              if (redisRaw && redisRaw.length > 0) {
                pastMessages = redisRaw.reverse().map((m) => JSON.parse(m));
              }
            } catch (err) {
              console.error("Redis error fetching past messages:", err);
            }
          }

          // Fallback or complement with MongoDB messages if needed
          if (pastMessages.length < 30) {
            try {
              const dbMsgs = (await Message.find({ roomId })
                .sort({ createdAt: -1 })
                .limit(30)
                .lean()) as any[];

              if (dbMsgs && dbMsgs.length > 0) {
                if (pastMessages.length === 0) {
                  pastMessages = dbMsgs.map((m) => ({
                    ...m,
                    _id: String(m._id),
                    roomId: String(m.roomId),
                    senderId: String(m.senderId),
                    receiverId: String(m.receiverId),
                    createdAt: m.createdAt
                      ? new Date(m.createdAt).toISOString()
                      : new Date().toISOString(),
                  }));
                } else {
                  const existingSet = new Set(
                    pastMessages.map(
                      (m) => `${m.createdAt}_${m.content}_${m.senderId}`
                    )
                  );
                  for (const dm of dbMsgs) {
                    const normalized = {
                      ...dm,
                      _id: String(dm._id),
                      roomId: String(dm.roomId),
                      senderId: String(dm.senderId),
                      receiverId: String(dm.receiverId),
                      createdAt: dm.createdAt
                        ? new Date(dm.createdAt).toISOString()
                        : new Date().toISOString(),
                    };
                    const key = `${normalized.createdAt}_${normalized.content}_${normalized.senderId}`;
                    if (!existingSet.has(key)) {
                      pastMessages.push(normalized);
                      existingSet.add(key);
                    }
                  }
                  pastMessages.sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  );
                }
              }
            } catch (err) {
              console.error("MongoDB error fetching past messages:", err);
            }
          }

          ws.send(
            JSON.stringify({
              type: "past-messages",
              roomId,
              messages: pastMessages,
            })
          );

          // Update conversation list for this user
          const senderConvos = await formatConversations(userId);
          ws.send(
            JSON.stringify({
              type: "member-conversation",
              conversations: senderConvos,
            })
          );
          return;
        }

        // Send a message
        if (type === "member-send-message") {
          if (!receiverId) {
            ws.send(
              JSON.stringify({ type: "error", message: "receiverId is required" })
            );
            return;
          }

          // Ensure room exists between userId and receiverId
          let targetRoom = null;
          if (roomId) {
            try {
              targetRoom = await Room.findById(roomId);
              if (
                !targetRoom ||
                !(
                  (targetRoom.senderId?.toString() === userId &&
                    targetRoom.receiverId?.toString() === receiverId) ||
                  (targetRoom.senderId?.toString() === receiverId &&
                    targetRoom.receiverId?.toString() === userId)
                )
              ) {
                targetRoom = null;
              }
            } catch {
              targetRoom = null;
            }
          }

          if (!targetRoom) {
            targetRoom = await Room.findOne({
              $or: [
                { senderId: userId, receiverId },
                { senderId: receiverId, receiverId: userId },
              ],
            });

            if (!targetRoom) {
              try {
                targetRoom = await Room.create({ senderId: userId, receiverId });
              } catch {
                targetRoom = await Room.findOne({
                  $or: [
                    { senderId: userId, receiverId },
                    { senderId: receiverId, receiverId: userId },
                  ],
                });
              }
            }
          }

          if (!targetRoom) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Could not find or create room",
              })
            );
            return;
          }

          roomId = String(targetRoom._id);

          // Ensure current socket is registered in this room
          if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Set());
          roomUsers.get(roomId)!.add(ws);

          const payload = {
            content: content ?? null,
            senderId: userId,
            receiverId,
            roomId,
            fileUrl: Array.isArray(fileUrl)
              ? fileUrl
              : fileUrl
              ? [fileUrl]
              : [],
            createdAt: new Date().toISOString(),
          };

          // 1. Persist directly to MongoDB (messages are never lost)
          try {
            await Message.create(payload);
          } catch (dbErr) {
            console.error("Failed to persist message to MongoDB:", dbErr);
          }

          // 2. Cache in Redis
          const redisKey = `room:${roomId}:messages`;
          const unreadKey = `room:${roomId}:unread:${receiverId}`;

          if (redisClient.isReady) {
            try {
              await redisClient.rPush(redisKey, JSON.stringify(payload));
              await redisClient.incr(unreadKey);

              // Keep up to 50 recent messages in redis list
              const count = await redisClient.lLen(redisKey);
              if (count > 50) {
                await redisClient.lTrim(redisKey, -50, -1);
              }
            } catch (redisErr) {
              console.error("Redis cache error on send:", redisErr);
            }
          }

          // Update room's updatedAt
          try {
            await Room.findByIdAndUpdate(roomId, { updatedAt: new Date() });
          } catch {}

          // 3. Broadcast message to all target sockets:
          // Room subscribers + any connected sockets for sender or receiver
          const targetSockets = new Set<CustomWebSocket>();
          roomUsers.get(roomId)?.forEach((s) => targetSockets.add(s));

          for (const client of connectedUsers) {
            if (client.userId === userId || client.userId === receiverId) {
              targetSockets.add(client);
            }
          }

          for (const client of targetSockets) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "member-new-message",
                  roomId,
                  message: payload,
                })
              );
            }
          }

          // 4. Send unread increment specifically to receiver sockets not currently focused in this room
          if (redisClient.isReady) {
            try {
              const unreadCount = parseInt(
                (await redisClient.get(unreadKey)) || "1",
                10
              );
              for (const client of connectedUsers) {
                if (
                  client.readyState === WebSocket.OPEN &&
                  client.userId === receiverId &&
                  !roomUsers.get(roomId)?.has(client)
                ) {
                  client.send(
                    JSON.stringify({
                      type: "increment_unread",
                      roomId,
                      unreadCount,
                    })
                  );
                }
              }
            } catch {}
          }

          // 5. Update conversation list only for the relevant users (sender and receiver)
          for (const client of connectedUsers) {
            if (
              client.readyState === WebSocket.OPEN &&
              (client.userId === userId || client.userId === receiverId)
            ) {
              if (client.userId) {
                const convos = await formatConversations(client.userId);
                client.send(
                  JSON.stringify({
                    type: "member-conversation",
                    conversations: convos,
                  })
                );
              }
            }
          }

          return;
        }

        ws.send(JSON.stringify({ type: "error", message: "Invalid message type" }));
      } catch (err) {
        console.error("Error handling websocket message:", err);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message" }));
      }
    });

    // Handle disconnect
    ws.on("close", () => {
      connectedUsers.delete(ws);
      roomUsers.forEach((sockets, rId) => {
        sockets.delete(ws);
        if (sockets.size === 0) {
          roomUsers.delete(rId);
        }
      });
      clearInterval(interval);
    });
  });
}

export const socket = { wss, roomUsers };
