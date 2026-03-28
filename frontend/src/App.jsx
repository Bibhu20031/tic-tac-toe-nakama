import { useEffect } from "react";
import { initNakama } from "./lib/nakama";

function App() {
  useEffect(() => {
    let isMounted = true;

    async function start() {
      const { socket } = await initNakama();

      if (!isMounted) return;

      const match = await socket.createMatch("tic-tac-toe");

      console.log("Match created:", match.match_id);

      socket.onmatchdata = (data) => {
        const decoded = JSON.parse(
          new TextDecoder().decode(data.data)
        );
        console.log("Game update:", decoded);
      };

      socket.sendMatchState(match.match_id, 1, JSON.stringify({ index: 0 }));
    }

    start();

    return () => {
      isMounted = false;
    };
  }, []);

  return <h1>Game</h1>;
}

export default App;