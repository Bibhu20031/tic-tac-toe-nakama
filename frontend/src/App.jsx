import { useEffect } from "react";
import { initNakama } from "./lib/nakama";

function App() {
  useEffect(() => {
    initNakama();
  }, []);

  return <h1>Nakama Ready</h1>;
}

export default App;