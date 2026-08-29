(function(){
  "use strict";

  var overlay = document.getElementById('qam-overlay');
  var modalTag = document.getElementById('qam-modal-tag');
  var modalTitle = document.getElementById('qam-modal-title');
  var modalDesc = document.getElementById('qam-modal-desc');
  var modalBody = document.getElementById('qam-modal-body');
  var closeBtn = document.getElementById('qam-modal-close');
  var activeCleanup = null;

  var GAME_META = {
    maze:    { tag: 'ARCADE // 01', title: 'Q-Maze Runner', desc: 'Use the arrow keys, WASD, or the on-screen pad to guide the qubit from the top-left to the glowing exit.' },
    circuit: { tag: 'ARCADE // 02', title: 'Circuit Builder', desc: 'Tap gates in order to recreate the target circuit for each level.' },
    cipher:  { tag: 'ARCADE // 03', title: 'Crack the Cipher', desc: 'Drag the slider to shift the letters back until the message makes sense, then submit before time runs out.' },
    chain:   { tag: 'ARCADE // 04', title: 'Chain the Blocks', desc: 'Tap blocks in order to rebuild a valid chain — each block must reference the hash of the one before it.' }
  };

  function openGame(id){
    var meta = GAME_META[id];
    if(!meta) return;
    modalTag.textContent = meta.tag;
    modalTitle.textContent = meta.title;
    modalDesc.textContent = meta.desc;
    modalBody.innerHTML = '';
    if(typeof activeCleanup === 'function'){ try{ activeCleanup(); }catch(e){} }
    activeCleanup = null;

    if(id === 'maze') activeCleanup = renderMaze(modalBody);
    if(id === 'circuit') activeCleanup = renderCircuit(modalBody);
    if(id === 'cipher') activeCleanup = renderCipher(modalBody);
    if(id === 'chain') activeCleanup = renderChain(modalBody);

    overlay.classList.add('qam-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(){
    overlay.classList.remove('qam-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if(typeof activeCleanup === 'function'){ try{ activeCleanup(); }catch(e){} }
    activeCleanup = null;
    modalBody.innerHTML = '';
  }

  document.querySelectorAll('[data-qam-game]').forEach(function(btn){
    btn.addEventListener('click', function(){ openGame(btn.getAttribute('data-qam-game')); });
  });
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && overlay.classList.contains('qam-open')) closeModal(); });

  /* ---------------------------------------------------------------- */
  /* GAME 1: Q-MAZE RUNNER                                             */
  /* ---------------------------------------------------------------- */
  function renderMaze(container){
    var COLS = 9, ROWS = 9;
    container.innerHTML =
      '<div class="qam-maze-wrap">' +
        '<div class="qam-row" style="width:100%;max-width:320px;justify-content:space-between;">' +
          '<span class="qam-pill" id="qam-maze-timer">0.0s</span>' +
          '<button type="button" class="qam-btn qam-btn-ghost" id="qam-maze-reset">New Maze</button>' +
        '</div>' +
        '<canvas class="qam-maze-canvas" id="qam-maze-canvas" width="320" height="320"></canvas>' +
        '<div class="qam-dpad" aria-hidden="false">' +
          '<span class="qam-empty"></span><button type="button" data-dir="up" aria-label="Up">▲</button><span class="qam-empty"></span>' +
          '<button type="button" data-dir="left" aria-label="Left">◀</button><span class="qam-empty"></span><button type="button" data-dir="right" aria-label="Right">▶</button>' +
          '<span class="qam-empty"></span><button type="button" data-dir="down" aria-label="Down">▼</button><span class="qam-empty"></span>' +
        '</div>' +
        '<p class="qam-status" id="qam-maze-status">Reach the orange exit to win.</p>' +
      '</div>';

    var canvas = container.querySelector('#qam-maze-canvas');
    var ctx = canvas.getContext('2d');
    var timerEl = container.querySelector('#qam-maze-timer');
    var statusEl = container.querySelector('#qam-maze-status');
    var cellSize = canvas.width / COLS;
    var player, won, startTime, rafId, tickInterval;

    function makeMaze(){
      var grid = [];
      for(var y=0;y<ROWS;y++){
        var row = [];
        for(var x=0;x<COLS;x++){ row.push({x:x,y:y,walls:{N:true,S:true,E:true,W:true},visited:false}); }
        grid.push(row);
      }
      var stack = [];
      var current = grid[0][0];
      current.visited = true;
      var visitedCount = 1;
      var total = COLS*ROWS;
      function neighbors(cell){
        var list = [];
        var x=cell.x, y=cell.y;
        if(y>0 && !grid[y-1][x].visited) list.push({cell:grid[y-1][x], dir:'N', opp:'S'});
        if(y<ROWS-1 && !grid[y+1][x].visited) list.push({cell:grid[y+1][x], dir:'S', opp:'N'});
        if(x<COLS-1 && !grid[y][x+1].visited) list.push({cell:grid[y][x+1], dir:'E', opp:'W'});
        if(x>0 && !grid[y][x-1].visited) list.push({cell:grid[y][x-1], dir:'W', opp:'E'});
        return list;
      }
      while(visitedCount < total){
        var opts = neighbors(current);
        if(opts.length){
          var pick = opts[Math.floor(Math.random()*opts.length)];
          current.walls[pick.dir] = false;
          pick.cell.walls[pick.opp] = false;
          pick.cell.visited = true;
          visitedCount++;
          stack.push(current);
          current = pick.cell;
        } else if(stack.length){
          current = stack.pop();
        }
      }
      return grid;
    }

    var grid = makeMaze();

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#111';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for(var y=0;y<ROWS;y++){
        for(var x=0;x<COLS;x++){
          var c = grid[y][x];
          var px = x*cellSize, py = y*cellSize;
          if(c.walls.N){ ctx.moveTo(px,py); ctx.lineTo(px+cellSize,py); }
          if(c.walls.W){ ctx.moveTo(px,py); ctx.lineTo(px,py+cellSize); }
          if(x===COLS-1 && c.walls.E){ ctx.moveTo(px+cellSize,py); ctx.lineTo(px+cellSize,py+cellSize); }
          if(y===ROWS-1 && c.walls.S){ ctx.moveTo(px,py+cellSize); ctx.lineTo(px+cellSize,py+cellSize); }
        }
      }
      ctx.stroke();
      // exit
      ctx.fillStyle = 'rgba(245,89,10,0.85)';
      ctx.fillRect((COLS-1)*cellSize+cellSize*0.25, (ROWS-1)*cellSize+cellSize*0.25, cellSize*0.5, cellSize*0.5);
      // player
      ctx.beginPath();
      ctx.fillStyle = '#ffd27a';
      ctx.shadowColor = '#F5590A';
      ctx.shadowBlur = 12;
      ctx.arc(player.x*cellSize+cellSize/2, player.y*cellSize+cellSize/2, cellSize*0.28, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function reset(){
      grid = makeMaze();
      player = {x:0,y:0};
      won = false;
      startTime = Date.now();
      statusEl.textContent = 'Reach the orange exit to win.';
      statusEl.className = 'qam-status';
      draw();
    }

    function move(dir){
      if(won) return;
      var c = grid[player.y][player.x];
      if(dir==='up' && !c.walls.N) player.y--;
      if(dir==='down' && !c.walls.S) player.y++;
      if(dir==='left' && !c.walls.W) player.x--;
      if(dir==='right' && !c.walls.E) player.x++;
      draw();
      if(player.x === COLS-1 && player.y === ROWS-1){
        won = true;
        var secs = ((Date.now()-startTime)/1000).toFixed(1);
        statusEl.textContent = 'Solved in ' + secs + 's! Nice work.';
        statusEl.className = 'qam-status qam-good';
      }
    }

    function keyHandler(e){
      var map = {ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right'};
      if(map[e.key]){ e.preventDefault(); move(map[e.key]); }
    }
    document.addEventListener('keydown', keyHandler);

    container.querySelectorAll('.qam-dpad button').forEach(function(btn){
      btn.addEventListener('click', function(){ move(btn.getAttribute('data-dir')); });
    });
    container.querySelector('#qam-maze-reset').addEventListener('click', reset);

    tickInterval = setInterval(function(){
      if(!won) timerEl.textContent = ((Date.now()-startTime)/1000).toFixed(1) + 's';
    }, 100);

    reset();

    return function cleanup(){
      document.removeEventListener('keydown', keyHandler);
      clearInterval(tickInterval);
      if(rafId) cancelAnimationFrame(rafId);
    };
  }

  /* ---------------------------------------------------------------- */
  /* GAME 2: CIRCUIT BUILDER                                            */
  /* ---------------------------------------------------------------- */
  function renderCircuit(container){
    var LEVELS = [
      { target: ['H','X'], hint: 'Hadamard puts the qubit into superposition, then Pauli-X flips it.', gates: ['H','X','Z','CX'] },
      { target: ['X','H','Z'], hint: 'Flip, superpose, then apply a phase shift.', gates: ['H','X','Z','CX'] },
      { target: ['H','CX','X','Z'], hint: 'Entangle two qubits after superposition, then flip and phase-shift.', gates: ['H','X','Z','CX'] }
    ];
    var levelIndex = 0;
    var current = [];

    function el(){
      return {
        row: container.querySelector('#qam-circuit-track'),
        pal: container.querySelector('#qam-circuit-palette'),
        status: container.querySelector('#qam-circuit-status'),
        hint: container.querySelector('#qam-circuit-hint'),
        level: container.querySelector('#qam-circuit-level')
      };
    }

    function renderLevel(){
      var lvl = LEVELS[levelIndex];
      current = [];
      container.innerHTML =
        '<div class="qam-row"><span class="qam-pill" id="qam-circuit-level">Level ' + (levelIndex+1) + ' / ' + LEVELS.length + '</span>' +
        '<span class="qam-pill">Target length: ' + lvl.target.length + '</span></div>' +
        '<p class="qam-hint" id="qam-circuit-hint">' + lvl.hint + '</p>' +
        '<div class="qam-circuit-track" id="qam-circuit-track"></div>' +
        '<div class="qam-palette" id="qam-circuit-palette"></div>' +
        '<div class="qam-row">' +
          '<button type="button" class="qam-btn qam-btn-ghost" id="qam-circuit-clear">Clear</button>' +
          '<button type="button" class="qam-btn" id="qam-circuit-check">Check circuit</button>' +
        '</div>' +
        '<p class="qam-status" id="qam-circuit-status"></p>';

      var refs = el();
      lvl.gates.forEach(function(g){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'qam-gate-btn';
        b.textContent = g;
        b.addEventListener('click', function(){
          if(current.length >= lvl.target.length) return;
          current.push(g);
          drawTrack();
        });
        refs.pal.appendChild(b);
      });

      container.querySelector('#qam-circuit-clear').addEventListener('click', function(){ current = []; drawTrack(); refs.status.textContent=''; refs.status.className='qam-status'; });
      container.querySelector('#qam-circuit-check').addEventListener('click', function(){
        var refs2 = el();
        var ok = current.length === lvl.target.length && current.every(function(g,i){ return g === lvl.target[i]; });
        if(ok){
          refs2.status.textContent = levelIndex === LEVELS.length-1 ? 'All levels cleared! You built a full circuit set.' : 'Correct! Moving to the next level…';
          refs2.status.className = 'qam-status qam-good';
          if(levelIndex < LEVELS.length-1){
            levelIndex++;
            setTimeout(renderLevel, 900);
          } else {
            setTimeout(function(){
              levelIndex = 0;
              refs2.status.textContent += ' Tap Clear or replay anytime.';
            }, 50);
          }
        } else {
          refs2.status.textContent = 'Not quite — sequence doesn\'t match the target yet.';
          refs2.status.className = 'qam-status qam-bad';
        }
      });

      drawTrack();
    }

    function drawTrack(){
      var lvl = LEVELS[levelIndex];
      var refs = el();
      refs.row.innerHTML = '';
      for(var i=0;i<lvl.target.length;i++){
        if(current[i]){
          var chip = document.createElement('div');
          chip.className = 'qam-gate-chip';
          chip.textContent = current[i];
          refs.row.appendChild(chip);
        } else {
          var slot = document.createElement('div');
          slot.className = 'qam-slot-empty';
          refs.row.appendChild(slot);
        }
      }
    }

    renderLevel();
    return function cleanup(){};
  }

  /* ---------------------------------------------------------------- */
  /* GAME 3: CRACK THE CIPHER                                           */
  /* ---------------------------------------------------------------- */
  function renderCipher(container){
    var PHRASES = ['SHOR BREAKS RSA', 'USE LATTICE CRYPTO', 'QUBITS NEED ECC', 'HASH THE BLOCK'];
    var ROUND_TIME = 30;
    var round = 0, score = 0, shift = 0, timeLeft = ROUND_TIME, interval, plaintext, ciphertext, answered;

    function shiftText(text, s){
      return text.replace(/[A-Z]/g, function(ch){
        var code = ((ch.charCodeAt(0) - 65 + s) % 26 + 26) % 26;
        return String.fromCharCode(code + 65);
      });
    }

    function newRound(){
      plaintext = PHRASES[round % PHRASES.length];
      var encodeShift = 1 + Math.floor(Math.random()*25);
      ciphertext = shiftText(plaintext, encodeShift);
      shift = 0;
      timeLeft = ROUND_TIME;
      answered = false;
      draw();
      clearInterval(interval);
      interval = setInterval(function(){
        timeLeft -= 0.2;
        if(timeLeft <= 0){
          timeLeft = 0;
          clearInterval(interval);
          if(!answered) finishRound(false, true);
        }
        updateTimerBar();
      }, 200);
    }

    function updateTimerBar(){
      var bar = container.querySelector('#qam-cipher-timerfill');
      if(bar) bar.style.width = Math.max(0,(timeLeft/ROUND_TIME*100)) + '%';
      var pill = container.querySelector('#qam-cipher-time');
      if(pill) pill.textContent = Math.max(0,timeLeft).toFixed(0) + 's';
    }

    function draw(){
      container.innerHTML =
        '<div class="qam-row"><span class="qam-pill">Round ' + (round+1) + ' / ' + PHRASES.length + '</span><span class="qam-pill" id="qam-cipher-time">' + ROUND_TIME + 's</span></div>' +
        '<div class="qam-timerbar-track"><div class="qam-timerbar-fill" id="qam-cipher-timerfill"></div></div>' +
        '<div class="qam-cipher-text">' + ciphertext + '</div>' +
        '<input type="range" min="0" max="25" value="0" class="qam-slider" id="qam-cipher-slider" aria-label="Shift amount">' +
        '<div class="qam-preview" id="qam-cipher-preview">' + ciphertext + '</div>' +
        '<div class="qam-row">' +
          '<span class="qam-pill">Score: ' + score + '</span>' +
          '<button type="button" class="qam-btn" id="qam-cipher-submit">Submit</button>' +
        '</div>' +
        '<p class="qam-status" id="qam-cipher-status">Shift the slider until the message reads clearly.</p>';

      container.querySelector('#qam-cipher-slider').addEventListener('input', function(e){
        shift = parseInt(e.target.value, 10);
        container.querySelector('#qam-cipher-preview').textContent = shiftText(ciphertext, shift);
      });
      container.querySelector('#qam-cipher-submit').addEventListener('click', function(){
        if(answered) return;
        var guess = shiftText(ciphertext, shift);
        finishRound(guess === plaintext, false);
      });
      updateTimerBar();
    }

    function finishRound(correct, timedOut){
      answered = true;
      clearInterval(interval);
      var status = container.querySelector('#qam-cipher-status');
      if(correct){
        score++;
        status.textContent = 'Cracked it! The message was: ' + plaintext;
        status.className = 'qam-status qam-good';
      } else if(timedOut){
        status.textContent = 'Time\'s up. The message was: ' + plaintext;
        status.className = 'qam-status qam-bad';
      } else {
        status.textContent = 'Not quite. The message was: ' + plaintext;
        status.className = 'qam-status qam-bad';
      }
      var submitBtn = container.querySelector('#qam-cipher-submit');
      if(submitBtn){
        submitBtn.textContent = round < PHRASES.length-1 ? 'Next round' : 'See results';
        submitBtn.onclick = function(){
          round++;
          if(round < PHRASES.length){ newRound(); }
          else { showResults(); }
        };
      }
    }

    function showResults(){
      clearInterval(interval);
      container.innerHTML =
        '<p class="qam-status qam-good" style="font-size:1rem;">You cracked ' + score + ' out of ' + PHRASES.length + ' ciphers.</p>' +
        '<button type="button" class="qam-btn" id="qam-cipher-replay">Play again</button>';
      container.querySelector('#qam-cipher-replay').addEventListener('click', function(){
        round = 0; score = 0; newRound();
      });
    }

    newRound();
    return function cleanup(){ clearInterval(interval); };
  }

  /* ---------------------------------------------------------------- */
  /* GAME 4: CHAIN THE BLOCKS                                           */
  /* ---------------------------------------------------------------- */
  function renderChain(container){
    var NAMES = ['Genesis', 'Block A', 'Block B', 'Block C', 'Block D'];
    var blocks, order, placed;

    function randHash(){
      var chars = '0123456789abcdef';
      var s = '';
      for(var i=0;i<8;i++) s += chars[Math.floor(Math.random()*16)];
      return s;
    }

    function setup(){
      blocks = NAMES.map(function(name, i){ return { name: name, hash: randHash(), prevHash: null, index: i }; });
      blocks[0].prevHash = '00000000';
      for(var i=1;i<blocks.length;i++){ blocks[i].prevHash = blocks[i-1].hash; }
      order = blocks.slice().sort(function(){ return Math.random()-0.5; });
      placed = [];
      draw();
    }

    function draw(){
      container.innerHTML =
        '<div class="qam-row"><span class="qam-pill">Tap blocks to place them in order</span></div>' +
        '<div class="qam-chain-slots" id="qam-chain-slots"></div>' +
        '<div class="qam-chain-pool" id="qam-chain-pool"></div>' +
        '<div class="qam-row">' +
          '<button type="button" class="qam-btn qam-btn-ghost" id="qam-chain-undo">Undo last</button>' +
          '<button type="button" class="qam-btn qam-btn-ghost" id="qam-chain-shuffle">Shuffle again</button>' +
        '</div>' +
        '<p class="qam-status" id="qam-chain-status">The first block always points to prev-hash 00000000.</p>';

      var slotsEl = container.querySelector('#qam-chain-slots');
      for(var i=0;i<blocks.length;i++){
        var slot = document.createElement('div');
        slot.className = 'qam-slot';
        if(placed[i]){
          slot.classList.add('qam-slot-filled');
          var b = placed[i];
          var isGood = (i===0 && b.prevHash === '00000000') || (i>0 && placed[i-1] && b.prevHash === placed[i-1].hash);
          slot.classList.add(isGood ? 'qam-slot-good' : 'qam-slot-bad');
          slot.innerHTML = '<span class="qam-block-name">' + b.name + '</span>&nbsp;<span class="qam-block-hash">hash:' + b.hash + ' · prev:' + b.prevHash + '</span>';
        } else {
          slot.innerHTML = '<span class="qam-block-hash">Slot ' + (i+1) + '</span>';
        }
        slotsEl.appendChild(slot);
      }

      var poolEl = container.querySelector('#qam-chain-pool');
      order.forEach(function(b){
        var used = placed.indexOf(b) !== -1;
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'qam-block' + (used ? ' qam-block-used' : '');
        el.innerHTML = '<span class="qam-block-name">' + b.name + '</span><span class="qam-block-hash">hash:' + b.hash + ' · prev:' + b.prevHash + '</span>';
        el.disabled = used;
        el.addEventListener('click', function(block){
          return function(){
            if(placed.length >= blocks.length) return;
            placed.push(block);
            draw();
            checkWin();
          };
        }(b));
        poolEl.appendChild(el);
      });

      container.querySelector('#qam-chain-undo').addEventListener('click', function(){
        placed.pop();
        draw();
      });
      container.querySelector('#qam-chain-shuffle').addEventListener('click', setup);
    }

    function checkWin(){
      if(placed.length !== blocks.length) return;
      var allGood = placed.every(function(b,i){
        return (i===0 && b.prevHash === '00000000') || (i>0 && b.prevHash === placed[i-1].hash);
      });
      var status = container.querySelector('#qam-chain-status');
      if(allGood){
        status.textContent = 'Chain valid! Every block correctly references the one before it.';
        status.className = 'qam-status qam-good';
      } else {
        status.textContent = 'All blocks placed, but the chain is broken somewhere — try Undo or Shuffle again.';
        status.className = 'qam-status qam-bad';
      }
    }

    setup();
    return function cleanup(){};
  }

})();
