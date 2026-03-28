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

function matchInit(ctx, logger, nk, params) {
  let state = {
    board: Array(9).fill(null),
    players: [],
    turn: 0,
    winner: null,
  };

  return { state, tickRate: 1, label: "tic-tac-toe" };
}

function matchJoinAttempt(ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
  if (state.players.length >= 2) {
    return { state, accept: false };
  }
  return { state, accept: true };
}

function matchJoin(ctx, logger, nk, dispatcher, tick, state, presences) {
  presences.forEach((p) => {
    state.players.push(p);
  });

  logger.info("Players joined: " + state.players.length);

  return { state };
}

function matchLeave(ctx, logger, nk, dispatcher, tick, state, presences) {
  state.players = state.players.filter(
    (p) => !presences.find((leave) => leave.userId === p.userId)
  );

  return { state };
}

function matchLoop(ctx, logger, nk, dispatcher, tick, state, messages) {
  for (const msg of messages) {
    const senderId = msg.sender.userId;
    const currentPlayer = state.players[state.turn];

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


    if (index < 0 || index > 8 || state.board[index] !== null || state.winner) {
      continue;
    }


    const symbol = state.turn === 0 ? "X" : "O";
    state.board[index] = symbol;


    state.winner = checkWinner(state.board);


    state.turn = 1 - state.turn;

  
    dispatcher.broadcastMessage(1, JSON.stringify({
      board: state.board,
      turn: state.turn,
      winner: state.winner
    }));
  }

  return { state };
}
function matchTerminate(ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
  return { state };
}

