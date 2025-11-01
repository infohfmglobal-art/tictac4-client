/* ✅ Neon Dark Theme */

body {
  font-family: 'Poppins', sans-serif;
  background: radial-gradient(circle, #000000, #111111, #000000);
  color: #FFD84D;
  text-align: center;
  padding-top: 20px;
}

h1 {
  font-size: 38px;
  font-weight: 700;
  text-shadow: 0 0 12px #FFD84D, 0 0 25px #FFB800;
  margin-bottom: 5px;
}

.board {
  --cell: 100px;
  width: calc(var(--cell) * 3);
  margin: 25px auto;
  display: grid;
  grid-template-columns: repeat(3, var(--cell));
  grid-template-rows: repeat(3, var(--cell));
  gap: 12px;
}

.cell {
  width: var(--cell);
  height: var(--cell);
  font-size: 55px;
  font-weight: 800;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #FFD84D;
  border: 3px solid #FFD84D;
  background: rgba(255, 216, 77, 0.05);
  box-shadow: 0 0 10px #FFD84D, inset 0 0 8px rgba(0,0,0,0.6);
  transition: 0.15s;
}

.cell:hover {
  box-shadow: 0 0 15px #FFEA6A, inset 0 0 12px rgba(0,0,0,0.8);
  transform: scale(1.05);
}

.cell:active {
  transform: scale(0.92);
}

.btn {
  background: #FFD84D;
  color: #000;
  padding: 12px 18px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  margin: 6px;
  font-size: 16px;
  box-shadow: 0 0 10px #FFD84D;
  transition: 0.2s;
}

.btn:hover {
  box-shadow: 0 0 18px #FFF07D;
  transform: scale(1.08);
}

.btn.red {
  background: #ff3b3b;
  color: white;
  box-shadow: 0 0 10px #ff3b3b;
}

.btn.small {
  padding: 6px 12px;
  font-size: 14px;
}

.badge {
  background: #444;
  padding: 5px 10px;
  border-radius: 6px;
  display: inline-block;
  margin: 2px;
}

.badge.green {
  background: #25D366;
}

.score {
  margin-top: 10px;
