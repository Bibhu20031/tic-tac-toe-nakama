import { Client } from "@heroiclabs/nakama-js";

const client = new Client("defaultkey", "localhost", "7350", false);

let socket = null;
let session = null;

export async function initNakama() {
  try {
    if (socket) {
      return { socket, session };
    }

    const email = "test@test.com";
    const password = "password";

    session = await client.authenticateEmail(email, password, true);

    socket = client.createSocket();
    await socket.connect(session, true);

    console.log("Socket connected");

    return { socket, session };
  } catch (err) {
    console.error("Nakama init error:", err);
  }
}


export function getSocket() {
  return socket;
}


export function getSession() {
  return session;
}