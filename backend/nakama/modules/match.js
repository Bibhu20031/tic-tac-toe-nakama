let InitModule = function (ctx, logger, nk, initializer) {
  initializer.registerMatch("tic-tac-toe", {
    matchInit,
    matchJoinAttempt,
    matchJoin,
    matchLeave,
    matchLoop,
    matchTerminate,
  });
};

// ---------------- INIT ----------------
function matchInit(ctx, logger, nk, params) {
  let state = {
    board: Array(9).fill(null),
    players: [],
    symbols: {},
    turn: 0,
    winner: null,
  };

  return { state, tickRate: 1, label: "tic-tac-toe" };
}

// ---------------- JOIN ATTEMPT ----------------
function matchJoinAttempt(ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
  if (state.players.length >= 2) {
    return { state, accept: false };
  }
  return { state, accept: true };
}

// ---------------- JOIN ----------------
function matchJoin(ctx, logger, nk, dispatcher, tick, state, presences) {
  presences.forEach((p) => {
    if (state.players.length < 2) {
      state.players.push(p);

      const symbol = state.players.length === 1 ? "X" : "O";
      state.symbols[p.userId] = symbol;
    }
  });

  logger.info("Players joined: " + state.players.length);

  // Send player info
  dispatcher.broadcastMessage(2, JSON.stringify({
    players: state.players.map(p => p.userId),
    symbols: state.symbols
  }));

  // 🔥 Send initial game state
  dispatcher.broadcastMessage(1, JSON.stringify({
    board: state.board,
    turn: state.turn,
    winner: state.winner
  }));

  return { state };
}

// ---------------- LEAVE ----------------
function matchLeave(ctx, logger, nk, dispatcher, tick, state, presences) {
  state.players = state.players.filter(
    (p) => !presences.find((leave) => leave.userId === p.userId)
  );

  return { state };
}

// ---------------- GAME LOOP ----------------
function matchLoop(ctx, logger, nk, dispatcher, tick, state, messages) {

  for (const msg of messages) {

    const senderId = msg.sender.userId;
    const currentPlayer = state.players[state.turn];

    // ❌ Not your turn
    if (!currentPlayer || senderId !== currentPlayer.userId) {
      continue;
    }

    let data;
    try {
      data = JSON.parse(nk.binaryToString(msg.data));
    } catch (e) {
      continue;
    }

    const { index } = data;

    // ❌ Invalid move
    if (
      index < 0 ||
      index > 8 ||
      state.board[index] !== null ||
      state.winner
    ) {
      continue;
    }

    // ✅ Apply move
    const symbol = state.symbols[senderId];
    state.board[index] = symbol;

    // ✅ Check winner
    state.winner = checkWinner(state.board);

    // ✅ Switch turn
    state.turn = 1 - state.turn;

    // 🔥 ALWAYS send full state (VERY IMPORTANT)
    dispatcher.broadcastMessage(1, JSON.stringify({
      board: state.board,
      turn: state.turn,
      winner: state.winner
    }));
  }

  return { state };
}

// ---------------- TERMINATE ----------------
function matchTerminate(ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
  return { state };
}

// ---------------- HELPER ----------------
function checkWinner(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

module.exports = { InitModule };