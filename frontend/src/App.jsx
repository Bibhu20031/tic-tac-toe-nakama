import { useEffect, useState } from "react";
import { initNakama } from "./lib/nakama";

function App() {
  const [socket, setSocket] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState(0);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function start() {
      const { socket } = await initNakama();

      if (!isMounted) return;

      setSocket(socket);

      const match = await socket.createMatch("tic-tac-toe");
      setMatchId(match.match_id);

      console.log("Match created:", match.match_id);

      socket.onmatchdata = (data) => {
        try {
          const decoded = JSON.parse(
            new TextDecoder().decode(data.data)
          );

          console.log("Game update:", decoded);

          // 🔥 ONLY update UI when full game state arrives
          if (decoded.board) {
            setBoard([...decoded.board]); // spread to force re-render
            setTurn(decoded.turn);
            setWinner(decoded.winner);
          }

        } catch (err) {
          console.log("Ignored invalid message");
        }
      };
    }

    start();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleClick(index) {
    if (!socket || !matchId || winner) return;

    socket.sendMatchState(
      matchId,
      1,
      JSON.stringify({ index })
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Tic Tac Toe</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 100px)",
          gap: "5px",
          justifyContent: "center",
        }}
      >
        {board.map((cell, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            style={{
              width: "100px",
              height: "100px",
              background: "#222",
              color: "white",
              fontSize: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {cell}
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: "20px" }}>
        {winner
          ? `Winner: ${winner}`
          : `Turn: ${turn === 0 ? "X" : "O"}`}
      </h3>
    </div>
  );
}

export default App;