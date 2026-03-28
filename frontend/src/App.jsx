import { useEffect } from "react";
import { initNakama, getSocket } from "./lib/nakama";

function App() {
  useEffect(() => {
    async function startMatch() {
      await initNakama();
      const socket = getSocket();

      const match = await socket.createMatch("tic-tac-toe");

      console.log("Match created:", match.match_id);

      socket.onmatchdata = (data) => {
        console.log("Game update:", data);
      };

      // Send test move
      socket.sendMatchState(match.match_id, 1, JSON.stringify({ index: 0 }));
    }

    startMatch();
  }, []);

  return <h1>Match test</h1>;
}

export default App;