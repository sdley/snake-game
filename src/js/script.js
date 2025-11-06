// Classic Snake — small and dependency-free
(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const highEl = document.getElementById("high");
  const startBtn = document.getElementById("start");
  const pauseBtn = document.getElementById("pause");
  const restartBtn = document.getElementById("restart");
  const wrapCheckbox = document.getElementById("wrap");
  const speedRange = document.getElementById("speed");
  const speedLabel = document.getElementById("speedVal");
  const obstaclesToggle = document.getElementById("obstacles");

  const COLS = 30; // grid columns
  const ROWS = 30; // grid rows
  const CELL = Math.floor(canvas.width / COLS);

  let snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
  let dir = { x: 0, y: 0 };
  let nextDir = { x: 0, y: 0 };
  let food = null;
  let tickInterval = Number((speedRange && speedRange.value) || 110); // ms — smaller is faster
  let timer = null;
  let score = 0;
  let high = Number(localStorage.getItem("snake-high") || 0);
  let running = false;
  let obstacles = [];
  let obstacleCount = 12; // default number of single-cell obstacles

  highEl.textContent = high;
  if (speedLabel) speedLabel.textContent = String(tickInterval);

  // allow runtime adjustment of speed (tick interval in ms)
  if (speedRange) {
    speedRange.addEventListener("input", (e) => {
      const v = Number(e.target.value);
      tickInterval = v;
      if (speedLabel) speedLabel.textContent = String(v);
      // if running, restart timer with new interval
      if (running) startTimer();
    });
  }

  function placeFood() {
    while (true) {
      const x = Math.floor(Math.random() * COLS);
      const y = Math.floor(Math.random() * ROWS);
      if (
        !snake.some((s) => s.x === x && s.y === y) &&
        !obstacles.some((o) => o.x === x && o.y === y)
      ) {
        food = { x, y };
        return;
      }
    }
  }

  function reset() {
    snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
    dir = { x: 0, y: 0 };
    nextDir = { x: 0, y: 0 };
    score = 0;
    tickInterval = Number((speedRange && speedRange.value) || 110);
    running = false;
    scoreEl.textContent = score;
    highEl.textContent = high;
    // place obstacles first (if enabled), then food
    if (obstaclesToggle && obstaclesToggle.checked) placeObstacles();
    else obstacles = [];
    placeFood();
    draw();
    stopTimer();
  }

  function start() {
    if (running) return;
    running = true;
    if (dir.x === 0 && dir.y === 0) {
      dir = { x: 1, y: 0 };
    }
    startTimer();
  }

  function pause() {
    running = false;
    stopTimer();
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(tick, tickInterval);
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function tick() {
    // apply buffered direction but prevent direct reverse
    if (
      (nextDir.x !== -dir.x || nextDir.y !== -dir.y) &&
      (nextDir.x !== 0 || nextDir.y !== 0)
    ) {
      dir = nextDir;
    }
    if (dir.x === 0 && dir.y === 0) return; // not moving yet

    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (wrapCheckbox.checked) {
      head.x = (head.x + COLS) % COLS;
      head.y = (head.y + ROWS) % ROWS;
    } else {
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        return gameOver();
      }
    }

    // self collision
    if (snake.some((s) => s.x === head.x && s.y === head.y)) return gameOver();

    snake.unshift(head);

    // obstacle collision (check after adding head to keep behaviour consistent)
    if (obstaclesToggle && obstaclesToggle.checked) {
      if (obstacles.some((o) => o.x === head.x && o.y === head.y)) {
        console.debug("Obstacle hit at", head);
        return gameOver();
      }
    }

    // eat food
    if (food && head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;
      // speed up every 4 food, but clamp
      if (score % 4 === 0 && tickInterval > 40) {
        tickInterval = Math.max(40, Math.floor(tickInterval * 0.9));
        startTimer();
      }
      placeFood();
      if (score > high) {
        high = score;
        localStorage.setItem("snake-high", String(high));
        highEl.textContent = high;
      }
    } else {
      snake.pop();
    }

    draw();
  }

  function gameOver() {
    running = false;
    stopTimer();
    // draw final frame and a simple overlay
    draw();
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 90);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "22px sans-serif";
    ctx.fillText(
      "Game Over — Score: " + score,
      canvas.width / 2,
      canvas.height / 2
    );
    ctx.font = "14px sans-serif";
    ctx.fillText(
      "Press Restart to play again",
      canvas.width / 2,
      canvas.height / 2 + 28
    );
  }

  function draw() {
    // background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // grid (subtle)
    ctx.fillStyle = "#031018";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // food
    if (food) {
      ctx.fillStyle = "#ff6b6b";
      roundRect(
        ctx,
        food.x * CELL + 6,
        food.y * CELL + 6,
        CELL - 12,
        CELL - 12,
        6
      );
    }

    // obstacles
    if (obstacles && obstacles.length) {
      ctx.fillStyle = "#b45f06"; // obstacle color
      for (const o of obstacles) {
        roundRect(ctx, o.x * CELL + 3, o.y * CELL + 3, CELL - 6, CELL - 6, 4);
      }
    }

    // snake
    for (let i = 0; i < snake.length; i++) {
      const s = snake[i];
      if (i === 0) {
        ctx.fillStyle = "#0bce7c";
      } else {
        ctx.fillStyle = "#047a4c";
      }
      roundRect(ctx, s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4, 6);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function placeObstacles() {
    obstacles = [];
    const maxCells = COLS * ROWS;
    const maxObstacles = Math.min(
      obstacleCount,
      Math.max(0, maxCells - snake.length - 5)
    );
    const maxAttempts = 5000;
    let attempts = 0;
    while (obstacles.length < maxObstacles && attempts < maxAttempts) {
      attempts++;
      const x = Math.floor(Math.random() * COLS);
      const y = Math.floor(Math.random() * ROWS);
      if (
        !snake.some((s) => s.x === x && s.y === y) &&
        !(food && food.x === x && food.y === y) &&
        !obstacles.some((o) => o.x === x && o.y === y)
      ) {
        obstacles.push({ x, y });
      }
    }
  }

  // input handling
  window.addEventListener("keydown", (e) => {
    const key = e.key;
    if (key === "ArrowUp" || key === "w" || key === "W")
      nextDir = { x: 0, y: -1 };
    if (key === "ArrowDown" || key === "s" || key === "S")
      nextDir = { x: 0, y: 1 };
    if (key === "ArrowLeft" || key === "a" || key === "A")
      nextDir = { x: -1, y: 0 };
    if (key === "ArrowRight" || key === "d" || key === "D")
      nextDir = { x: 1, y: 0 };
    if (key === " ") {
      // space toggles pause
      if (running) pause();
      else start();
    }
  });

  // UI buttons
  startBtn.addEventListener("click", () => start());
  pauseBtn.addEventListener("click", () => pause());
  restartBtn.addEventListener("click", () => {
    reset();
    start();
  });

  // initialize game state (place obstacles when enabled, then food)
  reset();

  // expose for debugging in console
  window.Snake = { reset, start, pause };
})();
