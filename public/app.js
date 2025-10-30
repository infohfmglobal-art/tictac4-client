import { Game } from "./game.js";
import { UI } from "./ui.js";

let game, ui;

function startGame() {
    game = new Game();
    ui = new UI(onCellClick);
    ui.updateStatus("Your Turn...");
}

function onCellClick(row, col) {
    if (game.makeMove(row, col)) {
        ui.updateBoard(game.board.cells);

        if (game.isGameOver) {
            ui.updateStatus(`Game Over! Winner: ${game.winner}`);
            return;
        }

        ui.updateStatus(`Turn: ${game.currentPlayer}`);
    }
}

// Start Game
startGame();
