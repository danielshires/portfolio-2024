/**
 * Minimal canvas Pong for the 404 page — no dependencies.
 */
export function mountNotFoundPong(root: HTMLElement): () => void {
  const canvasNode = root.querySelector<HTMLCanvasElement>('[data-pong-canvas]')
  const scoreNode = root.querySelector<HTMLElement>('[data-pong-score]')
  if (!canvasNode || !scoreNode) return () => {}

  const ctxOrNull = canvasNode.getContext('2d')
  if (!ctxOrNull) return () => {}

  const ctx: CanvasRenderingContext2D = ctxOrNull
  const board = canvasNode
  const scoreEl = scoreNode

  let raf = 0
  let running = true

  let scorePlayer = 0
  let scoreCpu = 0

  const paddleH = 0.22
  const paddleW = 0.014
  const ballR = 0.012
  const cpuSpeed = 0.085

  let ball = { x: 0.5, y: 0.5, vx: 0, vy: 0 }
  let cpuY = 0.5
  let playerY = 0.5

  let keys = { up: false, down: false }

  function colors() {
    const cs = getComputedStyle(document.documentElement)
    const fg = cs.getPropertyValue('--text-color').trim() || 'rgb(9, 9, 11)'
    const sep = cs.getPropertyValue('--background-color').trim() || 'rgb(250, 250, 250)'
    return { fg, sep }
  }

  function resize() {
    const rect = board.getBoundingClientRect()
    const w = Math.max(1, Math.floor(rect.width * window.devicePixelRatio))
    const h = Math.max(1, Math.floor(rect.height * window.devicePixelRatio))
    board.width = w
    board.height = h
  }

  function resetBall(serveRight: boolean) {
    const angle = (Math.random() * 0.5 + 0.25) * Math.PI
    const dir = serveRight ? 1 : -1
    const speed = 0.0065
    ball = {
      x: 0.5,
      y: 0.5,
      vx: Math.cos(angle) * speed * dir,
      vy: (Math.random() * 2 - 1) * speed * 0.75,
    }
  }

  function reflect(onRight: boolean) {
    ball.vx = -ball.vx * 1.04
    const english = onRight ? playerY - ball.y : cpuY - ball.y
    ball.vy += english * 0.01
    const maxV = 0.012
    ball.vy = Math.max(-maxV, Math.min(maxV, ball.vy))
  }

  function syncScore() {
    scoreEl.textContent = `${scoreCpu} — ${scorePlayer}`
  }

  function loop() {
    if (!running) return
    const { width: cw, height: ch } = board
    const { fg, sep } = colors()

    // input: keyboard nudges player target
    let targetY = playerY
    if (keys.up) targetY -= 0.055
    if (keys.down) targetY += 0.055
    targetY = Math.max(paddleH / 2, Math.min(1 - paddleH / 2, targetY))
    playerY += (targetY - playerY) * 0.18

    // cpu chases ball
    const cpuTarget = ball.x < 0.55 ? ball.y : 0.5
    const dy = cpuTarget - cpuY
    cpuY += Math.sign(dy) * Math.min(Math.abs(dy), cpuSpeed)

    // integrate ball
    ball.x += ball.vx
    ball.y += ball.vy

    // top / bottom walls
    if (ball.y < ballR) {
      ball.y = ballR
      ball.vy = -ball.vy
    } else if (ball.y > 1 - ballR) {
      ball.y = 1 - ballR
      ball.vy = -ball.vy
    }

    // paddles
    const px = paddleW + ballR
    if (ball.vx < 0 && ball.x - ballR < px) {
      const half = paddleH / 2
      if (ball.y > cpuY - half && ball.y < cpuY + half) {
        ball.x = px + ballR
        reflect(false)
      }
    }
    if (ball.vx > 0 && ball.x + ballR > 1 - px) {
      const half = paddleH / 2
      if (ball.y > playerY - half && ball.y < playerY + half) {
        ball.x = 1 - px - ballR
        reflect(true)
      }
    }

    // scoring
    if (ball.x < 0) {
      scorePlayer += 1
      syncScore()
      resetBall(false)
    } else if (ball.x > 1) {
      scoreCpu += 1
      syncScore()
      resetBall(true)
    }

    // draw
    ctx.clearRect(0, 0, cw, ch)
    ctx.fillStyle = sep
    ctx.globalAlpha = 0.35
    ctx.fillRect(0, 0, cw, ch)
    ctx.globalAlpha = 1

    ctx.strokeStyle = fg
    ctx.globalAlpha = 0.25
    ctx.setLineDash([6, 10])
    ctx.beginPath()
    ctx.moveTo(cw / 2, 0)
    ctx.lineTo(cw / 2, ch)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1

    const pw = paddleW * cw
    const ph = paddleH * ch
    const bx = ball.x * cw
    const by = ball.y * ch
    const br = ballR * Math.min(cw, ch)

    ctx.fillStyle = fg
    ctx.fillRect(px * cw - pw / 2, cpuY * ch - ph / 2, pw, ph)
    ctx.fillRect((1 - px) * cw - pw / 2, playerY * ch - ph / 2, pw, ph)

    ctx.beginPath()
    ctx.arc(bx, by, br, 0, Math.PI * 2)
    ctx.fill()

    raf = requestAnimationFrame(loop)
  }

  function onPointer(e: PointerEvent) {
    const rect = board.getBoundingClientRect()
    const ny = (e.clientY - rect.top) / rect.height
    playerY = Math.max(paddleH / 2, Math.min(1 - paddleH / 2, ny))
  }

  function onPointerDown(e: PointerEvent) {
    try {
      board.setPointerCapture(e.pointerId)
    } catch {
      /* already captured */
    }
    onPointer(e)
  }

  function onResize() {
    resize()
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      keys.up = true
      e.preventDefault()
    }
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      keys.down = true
      e.preventDefault()
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.up = false
    if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = false
  }

  resetBall(Math.random() > 0.5)
  syncScore()

  resize()
  window.addEventListener('resize', onResize)
  board.addEventListener('pointermove', onPointer)
  board.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  raf = requestAnimationFrame(loop)

  return () => {
    running = false
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    board.removeEventListener('pointermove', onPointer)
    board.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
  }
}
