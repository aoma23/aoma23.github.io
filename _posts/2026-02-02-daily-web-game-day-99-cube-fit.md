---
title: "毎日ゲームチャレンジ Day 99: Cube Fit (キューブ・フィット)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

99日目は「Cube Fit」。
3x3x3の立方体を作り上げる3Dパズルゲームです。
指定された6つのピースを組み合わせて、完全な立方体を完成させましょう！簡単そうに見えて意外と難しいはず！

<!--more-->

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

  #game-container {
    font-family: 'Inter', sans-serif;
    width: 100%;
    max-width: 600px;
    height: 500px;
    margin: 0 auto;
    background: #222;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    touch-action: none; /* Prevent scroll on mobile */
  }
  #game-canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
  .ui-overlay {
    position: absolute;
    bottom: 10px;
    right: 10px;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ui-panel {
    pointer-events: auto;
    background: rgba(0,0,0,0.7);
    padding: 10px;
    border-radius: 8px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .btn {
    font-family: 'Inter', sans-serif;
    background: #444;
    color: #fff;
    border: 1px solid #666;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    user-select: none;
  }
  .btn:active {
    background: #666;
  }
  .btn-primary {
    background: #007bff;
    border-color: #0056b3;
  }
  .status-msg {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0,0,0,0.7);
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
    pointer-events: none;
    font-size: 14px;
    font-weight: 500;
  }
  .layer-indicator {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.7);
    color: #4db8ff;
    padding: 5px 15px;
    border-radius: 20px;
    font-weight: bold;
    pointer-events: none;
  }
  .victory-overlay {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.85);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
    z-index: 100;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s;
  }
  .victory-overlay.visible {
    opacity: 1;
    pointer-events: auto;
  }
  .victory-title {
    font-size: 32px;
    font-weight: bold;
    color: #FFD700;
    margin-bottom: 20px;
    text-shadow: 0 0 10px #FFD700;
  }
</style>

<div id="game-container">
  <canvas id="game-canvas"></canvas>
  
  <div class="status-msg" id="status-text">Drag pieces to the Grid</div>
  
  <div class="ui-overlay">
    <div class="ui-panel" style="flex-wrap: nowrap; overflow-x: auto; max-width: 95vw;">
      <button class="btn" onclick="CubeFit.moveHeight(1)">Up</button>
      <button class="btn" onclick="CubeFit.moveHeight(-1)">Down</button>
      <div style="width:1px; height:20px; background:#666; margin:0 5px;"></div>
      <button class="btn" onclick="CubeFit.rotate(90, 0, 0)">Rot X</button>
      <button class="btn" onclick="CubeFit.rotate(0, 90, 0)">Rot Y</button>
      <button class="btn" onclick="CubeFit.rotate(0, 0, 90)">Rot Z</button>
    </div>
  </div>

  <div id="victory-screen" class="victory-overlay">
    <div class="victory-title">COMPLETE!</div>
    <div style="font-size: 18px; margin-bottom: 20px;">Cube Assembled!</div>
    <button class="btn btn-primary" onclick="CubeFit.restart()">Play Again</button>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>

<script>
const CubeFit = (() => {
  let scene, camera, renderer, controls;
  let raycaster, mouse;
  let gridGroup, piecesInfo = [];
  let selectedPiece = null;
  let isDragging = false;
  let dragPlane;
  let pieces = [];
  let currentLayer = 0; // 0, 1, 2
  
  const GRID_SIZE = 3;
  const CELL_SIZE = 1;
  const GAP = 0.05;
  
  // Piece Definitions (Relative coordinates)
  // Shapes based on user request
  // 1. L-Long (5 blocks): 3 horizontal, 1 down from left, 1 more down
  // User: ■■■ / ■ / ■
  // Coords: (0,0,0), (1,0,0), (2,0,0), (0,-1,0), (0,-2,0)
  // Let's center vaguely.
  const SHAPE_1 = [
    {x:0,y:1,z:0}, {x:1,y:1,z:0}, {x:2,y:1,z:0},
    {x:0,y:0,z:0},
    {x:0,y:-1,z:0}
  ]; // 5 blocks
  
  // 2. S-Shape (4 blocks): ■■ / ■■
  // Coords: (0,0,0), (1,0,0), (1,-1,0), (2,-1,0)
  const SHAPE_2 = [
    {x:0,y:1,z:0}, {x:1,y:1,z:0},
    {x:1,y:0,z:0}, {x:2,y:0,z:0}
  ]; // 4 blocks
  
  // 3. L-Short (4 blocks): ■■■ / ■
  // Coords: (0,0,0), (1,0,0), (2,0,0), (0,-1,0)
  const SHAPE_3 = [
    {x:0,y:1,z:0}, {x:1,y:1,z:0}, {x:2,y:1,z:0},
    {x:0,y:0,z:0}
  ]; // 4 blocks
  
  // 4. L-Short + Z (5 blocks): ■■■ / ■ + Z extrusion on bottom
  // Coords: SHAPE_3 + (0,0,1)
  const SHAPE_4 = [
    {x:0,y:1,z:0}, {x:1,y:1,z:0}, {x:2,y:1,z:0},
    {x:0,y:0,z:0},
    {x:0,y:0,z:1} // Sticks out in Z from the bottom one
  ]; // 5 blocks
  
  // Inventory
  // 2x Shape 1
  // 1x Shape 2
  // 2x Shape 3
  // 1x Shape 4
  // Total: 2 + 1 + 2 + 1 = 6 pieces? 
  // Wait, user said: "Shape1 x2", "Shape2 x1", "Shape3 x2", "Shape4 x1".
  // Let's recount blocks:
  // S1 (5) * 2 = 10
  // S2 (4) * 1 = 4
  // S3 (4) * 2 = 8
  // S4 (5) * 1 = 5
  // Total: 10+4+8+5 = 27. Correct. 6 pieces total.

  function init() {
    const container = document.getElementById('game-container');
    const canvas = document.getElementById('game-canvas');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    
    // Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(8, 8, 10);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);
    
    // Controls
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Drag Plane (invisible floor)
    const planeGeo = new THREE.PlaneGeometry(50, 50);
    const planeMat = new THREE.MeshBasicMaterial({ visible: false });
    dragPlane = new THREE.Mesh(planeGeo, planeMat);
    dragPlane.rotation.x = -Math.PI / 2;
    scene.add(dragPlane);
    
    // Setup Grid
    setupGrid();
    
    // Create Pieces
    createPieces();
    
    // Events
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    
    window.addEventListener('resize', onWindowResize);
    
    animate();
  }
  
  function setupGrid() {
    gridGroup = new THREE.Group();
    // Create 3x3x3 ghost cubes
    const geo = new THREE.BoxGeometry(CELL_SIZE - 0.02, CELL_SIZE - 0.02, CELL_SIZE - 0.02);
    const mat = new THREE.MeshBasicMaterial({ color: 0x444444, wireframe: true, transparent: true, opacity: 0.3 });
    
    for(let x=0; x<GRID_SIZE; x++) {
      for(let y=0; y<GRID_SIZE; y++) {
        for(let z=0; z<GRID_SIZE; z++) {
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(
            x * CELL_SIZE - 1, // Center around 0,0,0 (roughly)
            y * CELL_SIZE + 0.5, // Above ground
            z * CELL_SIZE - 1
          );
          // Store grid coord for easy lookup
          mesh.userData = { isGrid: true, gx: x, gy: y, gz: z };
          gridGroup.add(mesh);
        }
      }
    }
    
    // Grid Base Platform - Removed as requested
    // const baseGeo = new THREE.BoxGeometry(3.2, 0.1, 3.2);
    // ...
    
    scene.add(gridGroup);
    
    // updateGridVisuals(); // Disabled
  }
  
  function createPieces() {
    const definitions = [
      { shape: SHAPE_1, color: 0xE74C3C, count: 2 },
      { shape: SHAPE_2, color: 0x2ECC71, count: 1 },
      { shape: SHAPE_3, color: 0x3498DB, count: 2 },
      { shape: SHAPE_4, color: 0xF1C40F, count: 1 }
    ];
    
    let offset = 0;
    
    definitions.forEach((def, typeIdx) => {
      for(let i=0; i<def.count; i++) {
        const piece = createPieceMesh(def.shape, def.color);
        // Position scattered outside
        const angle = (offset / 6) * Math.PI * 2;
        const radius = 6;
        
        let initialY = 0.5;
        // Lift shape 1 (Red) as requested
        if (typeIdx === 0) initialY = 1.5;
        
        piece.position.set(Math.cos(angle) * radius, initialY, Math.sin(angle) * radius);
        
        // Store logic info
        piece.userData = {
          isPiece: true,
          originalPos: piece.position.clone(),
          blocks: def.shape, // Relative block coords
          id: offset,
          placed: false
        };
        
        scene.add(piece);
        pieces.push(piece);
        offset++;
      }
    });
  }
  
  function createPieceMesh(shape, color) {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(CELL_SIZE - 0.05, CELL_SIZE - 0.05, CELL_SIZE - 0.05);
    const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3 });
    
    shape.forEach(b => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.x * CELL_SIZE, b.y * CELL_SIZE, b.z * CELL_SIZE);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    });
    
    // Helper to calculate center to center pivot
    // For now, pivot is at (0,0,0) of the group which aligns with first block usually
    // We want easier manipulation, but basic group is fine.
    
    return group;
  }
  
  function onPointerDown(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Check intersection with pieces
    const intersects = raycaster.intersectObjects(pieces, true); // recursive
    
    if (intersects.length > 0) {
      // Find the root group
      let obj = intersects[0].object;
      while(obj.parent && !obj.userData.isPiece) {
        obj = obj.parent;
      }
      
      if(obj.userData.isPiece) {
        // Deselect previous if different
        if(selectedPiece && selectedPiece !== obj) {
            highlightPiece(selectedPiece, false);
        }
        
        controls.enabled = false; // Disable orbit
        selectedPiece = obj;
        isDragging = true;
        
        // Update Drag Plane to match current piece height
        // Piece Y is usually 0.5, 1.5, 2.5...
        // Plane needs to be at Y-0.5 so that (PlaneY + 0.5) equals PieceY
        dragPlane.position.y = selectedPiece.position.y - 0.5;
        
        // Lift slightly
        if(!selectedPiece.userData.placed) {
            // selectedPiece.position.y += 1; // already handled by drag visual?
        } else {
            // Picked up from grid
            selectedPiece.userData.placed = false;
        }
        
        highlightPiece(selectedPiece, true);
        checkWin(); // Update status
      }
    } else {
        // Clicked empty space
        if(selectedPiece) {
            highlightPiece(selectedPiece, false);
            selectedPiece = null;
        }
    }
  }
  
  function onPointerMove(event) {
    if (!isDragging || !selectedPiece) return;
    
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(dragPlane);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      selectedPiece.position.set(point.x, point.y + 0.5, point.z);
    }
  }
  
  function onPointerUp() {
    if (isDragging && selectedPiece) {
      isDragging = false;
      controls.enabled = true;
      
      // Try to place
      tryPlacePiece(selectedPiece);
      
      // If placed, deselect. If not, keep selected so we can rotate.
      if (selectedPiece.userData.placed) {
          highlightPiece(selectedPiece, false);
          selectedPiece = null;
      } else {
          // Keep highlighted
          const status = document.getElementById('status-text');
          status.textContent = "Piece Selected. Move or Rotate.";
      }
    }
  }
  

  
  function rotate(x, y, z) {
    if(!selectedPiece || selectedPiece.userData.placed) return;
    
    // Use World Axis Rotation to avoid confusion
    const axis = new THREE.Vector3(x ? 1:0, y ? 1:0, z ? 1:0);
    const angle = Math.PI / 2;
    
    selectedPiece.rotateOnWorldAxis(axis, angle);
    selectedPiece.updateMatrixWorld();
    
    // Strict Snap to Grid Orientation to prevent Gimbal Lock confusion / drift
    snapToGrid(selectedPiece);
    
    // Snap Position Y
    const p = selectedPiece.position;
    selectedPiece.position.y = Math.round(p.y - 0.5) + 0.5;
    
    // Check bounds
    validateBoundsAfterRotate(selectedPiece);
    
    playSound('snap');
  }
  
  function snapToGrid(object) {
      // Extract basis vectors from current rotation
      const mat = new THREE.Matrix4().extractRotation(object.matrix);
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      const fwd = new THREE.Vector3();
      mat.extractBasis(right, up, fwd);
      
      // Helper to snap a vector to nearest world axis
      const snapVec = (v) => {
          const ax = Math.abs(v.x);
          const ay = Math.abs(v.y);
          const az = Math.abs(v.z);
          const max = Math.max(ax, ay, az);
          if (ax === max) return new THREE.Vector3(Math.sign(v.x), 0, 0);
          if (ay === max) return new THREE.Vector3(0, Math.sign(v.y), 0);
          return new THREE.Vector3(0, 0, Math.sign(v.z));
      };
      
      const sRight = snapVec(right);
      // Determine 'up' carefully. If sRight is vertical, we need to handle it.
      // But simpler: Snap Up, then force orthogonality.
      let sUp = snapVec(up);
      
      // If Up and Right are parallel (bad snap?), fallback
      if (sUp.distanceToSquared(sRight) < 0.1 || sUp.distanceToSquared(sRight.clone().negate()) < 0.1) {
          // Recalculate Up from Forward
          const sFwd = snapVec(fwd);
          sUp.crossVectors(sFwd, sRight);
      }
      
      // Ensure strict orthogonality
      const sFwd = new THREE.Vector3().crossVectors(sRight, sUp);
      // Re-cross Up to ensure it's perpendicular to sRight and sFwd
      sUp.crossVectors(sFwd, sRight);
      
      const newMat = new THREE.Matrix4().makeBasis(sRight, sUp, sFwd);
      object.quaternion.setFromRotationMatrix(newMat);
      object.updateMatrixWorld();
  }
  
  function snapTransform(obj) {
      // Just snap Position Y for external calls if needed
      const p = obj.position;
      obj.position.y = Math.round(p.y - 0.5) + 0.5;
  }
  
  function validateBoundsAfterRotate(piece) {
      // Check if any block is below floor or above top
      // Need to re-update world matrix after snap
      piece.updateMatrixWorld();
      
      const blocks = getPieceWorldBlocks(piece);
      let minY = 999, maxY = -999;
      blocks.forEach(b => {
          if(b.y < minY) minY = b.y;
          if(b.y > maxY) maxY = b.y;
      });
      
      // If below -3.5, lift up
      if (minY < -3.5) {
          const lift = Math.ceil(-3.5 - minY);
          piece.position.y += lift;
      }
      // If above 3.5, push down
      if (maxY > 3.5) {
          const drop = Math.ceil(maxY - 3.5);
          piece.position.y -= drop;
      }
      
      // Also Snap Y again just in case
      piece.position.y = Math.round(piece.position.y - 0.5) + 0.5;
  }
  
  function moveHeight(delta) {
    if(!selectedPiece) return;
    
    const currentY = selectedPiece.position.y;
    // Target is next grid step
    const nextY = Math.round((currentY + delta * CELL_SIZE) * 2) / 2; // snap to .5 steps
    
    // Validate bounds
    let canMove = true;
    
    // Check if new position keeps piece fully within grid Y bounds (0 to 3)
    const blocks = selectedPiece.userData.blocks;
    
    selectedPiece.updateMatrixWorld(); // Ensure current state is fresh
    
    // Temporarily apply position to check
    const originalY = selectedPiece.position.y;
    selectedPiece.position.y = nextY;
    selectedPiece.updateMatrixWorld();
    
    for(let b of blocks) {
        const vec = new THREE.Vector3(b.x * CELL_SIZE, b.y * CELL_SIZE, b.z * CELL_SIZE);
        vec.applyMatrix4(selectedPiece.matrixWorld);
        
        // World Y should be around 0.5, 1.5, 2.5
        // Allow buffer.
        // Use -5.6 / 5.6 to allow slight float errors when exactly at -5.5 / 5.5
        if(vec.y < -3.6 || vec.y > 3.6) {
            canMove = false;
            break;
        }
        
        // Check collision with other placed pieces?
        // Let's allow overlap during movement for better UX, or check strict?
        // Strict is better to avoid stuck pieces.
        if (checkCollisionAt(selectedPiece)) {
            canMove = false;
            break;
        }
    }
    
    // Restore or Keep
    if(!canMove) {
        selectedPiece.position.y = originalY;
        // Visual feedback?
    } else {
        dragPlane.position.y = selectedPiece.position.y - 0.5;
        playSound('snap');
    }
  }
  
  function checkCollisionAt(pieceToTest) {
      // Very naive collision check with placed pieces
      const myBlocks = getPieceWorldBlocks(pieceToTest);
      
      for(let other of pieces) {
          if (other === pieceToTest || !other.userData.placed) continue;
          
          const otherWorldBlocks = getPieceWorldBlocks(other);
          for(let mb of myBlocks) {
              for(let ob of otherWorldBlocks) {
                  // Round to nearest int/grid index to compare
                  const dx = Math.abs(mb.x - ob.x);
                  const dy = Math.abs(mb.y - ob.y);
                  const dz = Math.abs(mb.z - ob.z);
                  if (dx < 0.5 && dy < 0.5 && dz < 0.5) return true;
              }
          }
      }
      return false;
  }
  
  function getPieceWorldBlocks(piece) {
      const res = [];
      piece.updateMatrixWorld();
      for(let b of piece.userData.blocks) {
         const v = new THREE.Vector3(b.x, b.y, b.z).applyMatrix4(piece.matrixWorld);
         res.push(v);
      }
      return res;
  }
  
  function updateGridVisuals() {
      // Removed per user request
  }

  function tryPlacePiece(piece) {
    // 1. Get world positions of all blocks in the piece
    // 2. Map to Grid Coordinates (-1 to 1 range usually, mapped to 0..2)
    // 3. Check bounds (0..2)
    // 4. Check collisions with valid placed pieces
    
    const blocks = piece.userData.blocks; // Relative local coords
    const worldBlocks = [];
    
    piece.updateMatrixWorld();
    
    let valid = true;
    let gridPositions = [];

    // Helper to round position
    const getGridPos = (v) => {
        // Grid base is -1, 0.5, -1 for (0,0,0) index
        // Cell size 1.
        // x index = round(v.x + 1)
        // y index = round(v.y - 0.5)
        // z index = round(v.z + 1)
        
        const xi = Math.round(v.x + 1);
        const yi = Math.round(v.y - 0.5);
        const zi = Math.round(v.z + 1);
        return {x: xi, y: yi, z: zi};
    }

    for (let b of blocks) {
        const vec = new THREE.Vector3(b.x * CELL_SIZE, b.y * CELL_SIZE, b.z * CELL_SIZE);
        vec.applyMatrix4(piece.matrixWorld);
        
        const gp = getGridPos(vec);
        gridPositions.push(gp);
        
        // Out of bounds?
        if (gp.x < 0 || gp.x >= GRID_SIZE || 
            gp.y < 0 || gp.y >= GRID_SIZE || 
            gp.z < 0 || gp.z >= GRID_SIZE) {
            valid = false;
        }
    }
    
    if (valid) {
        // Check collision with OTHER placed pieces
        for (let other of pieces) {
            if (other === piece || !other.userData.placed) continue;
            
            // Get other's grid positions
            // Optimization: Store grid positions in userData when placed
            const otherPos = other.userData.gridPositions || [];
            
            for (let op of otherPos) {
                for (let mp of gridPositions) {
                    if (op.x === mp.x && op.y === mp.y && op.z === mp.z) {
                        valid = false; // Collision
                    }
                }
            }
        }
    }
    
    if (valid) {
        // Snap to grid
        // Move piece so its logical center aligns nicely?
        // Actually, just snap the position to nearest grid center offset
        // We need to calculate the difference between current Pos and snapped Pos for the KEY block
        // Easier: Just set position such that the blocks align.
        // We calculated Grid Pos based on current World Pos.
        // Current World = Piece.Pos + LocalRotated
        // Snapped World = GridPos -> World
        // Delta = Snapped - Current
        // Piece.Pos += Delta
        
        // Pick the first block to sync
        const b0 = blocks[0];
        const vec0 = new THREE.Vector3(b0.x, b0.y, b0.z).applyMatrix4(piece.matrixWorld); // Current world of b0 (just rotation ignored pos?) 
        // Wait, applyMatrix4 includes position.
        // We want vector relative to piece center (Object space rotated)
        const vec0_rel = new THREE.Vector3(b0.x, b0.y, b0.z).applyQuaternion(piece.quaternion);
        
        // Target World for b0
        const gp0 = gridPositions[0];
        const targetX = gp0.x * CELL_SIZE - 1;
        const targetY = gp0.y * CELL_SIZE + 0.5;
        const targetZ = gp0.z * CELL_SIZE - 1;
        
        piece.position.set(
            targetX - vec0_rel.x,
            targetY - vec0_rel.y,
            targetZ - vec0_rel.z
        );
        
        piece.userData.placed = true;
        piece.userData.gridPositions = gridPositions;
        
        playSound('snap');
        checkWin();
    } else {
        // Invalid placement
        piece.userData.placed = false;
        // Move back to pseudo-inventory or just stay where dropped (messy)
        // Let's return to original spot if totally out, or just leave it.
        // If it was in inventory, return to inventory spot.
        if (piece.position.y > 3 || piece.position.x > 5 || piece.position.x < -5) {
             // likely outside
        } else {
             // Just leave it loosely?
             // Better: visual feedback red flash?
        }
        // Actually, if it fails to place in grid, does it fall? 
        // For simplicity, let's just let it be loose, but mark unplaced.
    }
  }
  
  function resetPiece() {
      if(selectedPiece) {
          selectedPiece.position.copy(selectedPiece.userData.originalPos);
          selectedPiece.rotation.set(0,0,0);
          selectedPiece.userData.placed = false;
      }
  }
  
  function highlightPiece(piece, active) {
     piece.children.forEach(c => {
         c.material.emissive.setHex(active ? 0x444444 : 0x000000);
     });
     
     // Update UI
     const status = document.getElementById('status-text');
     if(active) {
         status.textContent = "Selected. Use buttons to Rotate.";
     } else {
         status.textContent = "Drag pieces to the Grid";
     }
  }
  
  function checkWin() {
      const placedCount = pieces.filter(p => p.userData.placed).length;
      if (placedCount === pieces.length) {
          // Double check no collisions? (Already checked on place)
          // Display Win
          document.getElementById('victory-screen').classList.add('visible');
          playSound('win');
      }
  }
  
  function restart() {
      pieces.forEach(p => {
          p.position.copy(p.userData.originalPos);
          p.rotation.set(0,0,0);
          p.userData.placed = false;
      });
      document.getElementById('victory-screen').classList.remove('visible');
      controls.reset();
  }
  
  function onWindowResize() {
    const container = document.getElementById('game-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  
  // Simple Audio
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function playSound(type) {
      if(audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if(type === 'snap') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'win') {
          try { localStorage.setItem('aomagame:played:cube-fit', '1'); } catch(e){}
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, audioCtx.currentTime);
          osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.2);
          osc.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.4);
          gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
          gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.0);
          osc.start();
          osc.stop(audioCtx.currentTime + 1.0);
      }
  }

  // Expose
  return {
    rotate,
    moveHeight,
    restart,
    init
  };
})();

// Start when loaded
window.addEventListener('load', CubeFit.init);
</script>

## 遊び方
1. **ピースを選択**: 周りにあるピースをクリック（タップ）して掴みます。
2. **高さ変更**: 画面下部の「Up / Down」ボタンで、ピースを持ち上げたり下げたりします。
3. **移動と回転**:
   - マウス/タッチでドラッグして移動。
   - 画面の「Rot X/Y/Z」ボタンでピースを回転させます。
4. **配置**: 3x3x3のフレームの中にピースをはめ込みます。
5. **クリア**: 6つのピースですべての空間を埋め尽くせばクリア！

## 実装のポイント
- **3D Interaction**: Three.jsを使用して3D空間でのドラッグ＆ドロップを実装。Raycasterによるマウス位置の検出と、グリッドへのスナップ判定を行っています。
- **Soma Cube Logic**: ソーマキューブ（に似た構成）の解法アルゴリズムは実装していませんが、物理的な衝突判定とグリッド座標系を用いてパズル性を再現しました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
