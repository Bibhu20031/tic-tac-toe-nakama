import { Client } from "@heroiclabs/nakama-js";

const client = new Client("defaultkey", "localhost", "7350", false);

let socket = null;
let session = null;
let initPromise = null; // 🔥 key fix

export function initNakama() {
  if (initPromise) return initPromise; // reuse existing init

  initPromise = (async () => {
    const email = "test@test.com";
    const password = "password";

    session = await client.authenticateEmail(email, password, true);

    socket = client.createSocket();
    await socket.connect(session, true);

    console.log("✅ Socket connected");

    return { socket, session };
  })();

  return initPromise;
}

export function getSocket() {
  return socket;
}

export function getSession() {
  return session;
}