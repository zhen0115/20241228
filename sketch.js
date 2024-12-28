let sprites = {
  play1: {
    idle: {
      img: null,
      width: 35,
      height: 40,
      frames: 7
    },
    jump: {
      img: null,
      width: 35,
      height: 50,
      frames: 12
    },
    run: {
      img: null,
      width: 42,
      height: 38,
      frames: 12
    }
  },
  play2: {
    idle: {
      img: null,
      width: 38,
      height: 39,
      frames: 13
    },
    jump: {
      img: null,
      width: 37,
      height: 50,
      frames: 12
    },
    run: {
      img: null,
      width: 40,
      height: 38,
      frames: 5
    }
  }
};

let play1, play2;
let backgroundImg;
let fireImg;  // 子彈圖片
let bullets = [];  // 儲存所有子彈的陣列
let gameOver = false;

function preload() {
  // 修正背景圖片載入
  backgroundImg = loadImage('tree.png', 
    () => console.log('背景載入成功'),
    () => console.log('背景載入失敗')
  );
  
  // 載入子彈圖片
  fireImg = loadImage('fire.png');
  
  // 載入精靈圖片並添加錯誤處理
  try {
    sprites.play1.idle.img = loadImage('play1/idle.png');
    sprites.play1.jump.img = loadImage('play1/jump.png');
    sprites.play1.run.img = loadImage('play1/run.png');
    
    sprites.play2.idle.img = loadImage('play2/idle.png');
    sprites.play2.jump.img = loadImage('play2/jump.png');
    sprites.play2.run.img = loadImage('play2/run.png');
  } catch (e) {
    console.error('載入精靈圖片錯誤:', e);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  startNewGame();
}

function startNewGame() {
  const groundY = windowHeight - 50;
  const centerX = windowWidth / 2;
  const spacing = 200;
  
  play1 = new Player(centerX - spacing, groundY, sprites.play1, false);
  play2 = new Player(centerX + spacing, groundY, sprites.play2, true);
  
  bullets = [];  // 清空所有子彈
  gameOver = false;  // 重置遊戲狀態
}

function draw() {
  // 繪製背景
  if (backgroundImg) {
    image(backgroundImg, 0, 0, windowWidth, windowHeight);
  }
  
  // 繪製教育科技文字
  textSize(48);
  textStyle(BOLD);
  fill(255);
  stroke(0);
  strokeWeight(4);
  textAlign(CENTER, CENTER);
  text("教育科技", windowWidth/2, windowHeight/4);
  
  // 繪製操作說明
  drawInstructions();
  
  // 更新和顯示所有子彈
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    if (bullet.update() || bullet.checkHit(play1) || bullet.checkHit(play2)) {
      bullets.splice(i, 1);
    } else {
      bullet.display();
    }
  }
  
  // 更新和顯示角色
  play1.update();
  play1.display();
  play2.update();
  play2.display();
  
  // 只在遊戲進行中處理輸入
  if (!gameOver) {
    handleKeyInput();
    
    // 檢查遊戲是否結束
    if (play1.health <= 0 || play2.health <= 0) {
      gameOver = true;
    }
  }
  
  // 如果遊戲結束，顯示獲勝訊息和重新開始提示
  if (gameOver) {
    textSize(64);
    textAlign(CENTER, CENTER);
    fill(255);
    stroke(0);
    strokeWeight(4);
    
    // 顯示獲勝者
    if (play1.health <= 0) {
      text("Player 2 Wins!", windowWidth/2, windowHeight/2);
    } else {
      text("Player 1 Wins!", windowWidth/2, windowHeight/2);
    }
    
    // 顯示重新開始提示
    textSize(32);
    text("Press 'R' to Restart", windowWidth/2, windowHeight/2 + 80);
  }
}

function drawInstructions() {
  // 設置文字樣式
  textAlign(LEFT);
  textSize(20);
  textStyle(BOLD);
  fill(255);  // 白色文字
  stroke(0);  // 黑色邊框
  strokeWeight(3);
  
  // 左側起始位置
  let x = 20;
  let y = 50;
  let lineHeight = 30;  // 行距
  
  // 玩家1說明
  text("Player 1 (左側角色):", x, y);
  y += lineHeight;
  text("移動: W,A,D", x + 20, y);
  y += lineHeight;
  text("跳躍: W", x + 20, y);
  y += lineHeight;
  text("發射火球: F", x + 20, y);
  y += lineHeight;
  text("近戰攻擊: G", x + 20, y);
  
  y += lineHeight * 1.5;  // 加大間距
  
  // 玩家2說明
  text("Player 2 (右側角色):", x, y);
  y += lineHeight;
  text("移動: J,L", x + 20, y);
  y += lineHeight;
  text("跳躍: I", x + 20, y);
  y += lineHeight;
  text("發射火球: U", x + 20, y);
  y += lineHeight;
  text("近戰攻擊: O", x + 20, y);
  
  y += lineHeight * 1.5;  // 加大間距
  
  // 遊戲資訊
  text("遊戲說明:", x, y);
  y += lineHeight;
  text("- 血量歸零即輸", x + 20, y);
  y += lineHeight;
  text("- 按 R 鍵重新開始", x + 20, y);
}

function keyPressed() {
  // 當按下R鍵且遊戲結束時，重新開始遊戲
  if (keyCode === 82 && gameOver) {  // 82是R鍵的keyCode
    startNewGame();
  }
}

class Player {
  constructor(x, y, spriteData, isFlipped) {
    this.x = x;
    this.y = y;
    this.sprites = spriteData;
    this.currentAction = 'idle';
    this.frameIndex = 0;
    this.isFlipped = isFlipped;
    this.frameDelay = 5;
    this.frameCount = 0;
    this.velocityY = 0;
    this.gravity = 0.8;
    this.jumpForce = -15;
    this.isGrounded = false;
    this.speed = 5;
    this.scale = 2.0;
    
    // 血量系統
    this.maxHealth = 100;
    this.health = this.maxHealth;
    
    // 攻擊系統
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.attackDamage = 10;
    this.attackRange = 100;
    
    // 射擊相關屬性
    this.shootCooldown = 0;
    this.shootCooldownTime = 15;  // 射擊冷卻時間
  }
  
  update() {
    // 更新動畫幀
    this.frameCount++;
    if (this.frameCount >= this.frameDelay) {
      this.frameCount = 0;
      this.frameIndex = (this.frameIndex + 1) % this.sprites[this.currentAction].frames;
    }
    
    // 更新位置
    this.velocityY += this.gravity;
    this.y += this.velocityY;
    
    // 地面碰撞
    if (this.y > windowHeight - 50) {
      this.y = windowHeight - 50;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
    
    // 邊界檢查
    if (this.x < 50) this.x = 50;
    if (this.x > windowWidth - 50) this.x = windowWidth - 50;
    
    // 更新攻擊冷卻
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
    
    // 更新射擊冷卻
    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }
  }
  
  display() {
    push();
    
    // 先繪製血條
    this.drawHealthBar();
    
    // 再繪製角色
    translate(this.x, this.y);
    if (this.isFlipped) {
      scale(-1 * this.scale, this.scale);
    } else {
      scale(this.scale);
    }
    
    // 確保精靈圖片存在才繪製
    let sprite = this.sprites[this.currentAction];
    if (sprite && sprite.img) {
      let frameX = this.frameIndex * sprite.width;
      image(sprite.img, 
            -sprite.width/2,
            -sprite.height,
            sprite.width, 
            sprite.height,
            frameX, 0,
            sprite.width,
            sprite.height);
    }
    
    pop();
  }
  
  drawHealthBar() {
    const barWidth = 60;
    const barHeight = 8;
    const x = this.x - barWidth/2;
    const y = this.y - 100;
    
    // 血條外框
    stroke(0);
    strokeWeight(2);
    fill(255, 0, 0);
    rect(x, y, barWidth, barHeight);
    
    // 當前血量
    noStroke();
    fill(0, 255, 0);
    const currentWidth = (this.health / this.maxHealth) * barWidth;
    rect(x, y, currentWidth, barHeight);
    
    // 血量數字
    textAlign(CENTER);
    textSize(12);
    fill(255);
    stroke(0);
    strokeWeight(2);
    text(Math.ceil(this.health), this.x, y - 5);
  }
  
  setAction(action) {
    if (this.currentAction !== action) {
      this.currentAction = action;
      this.frameIndex = 0;
    }
  }
  
  jump() {
    if (this.isGrounded) {
      this.velocityY = this.jumpForce;
      this.isGrounded = false;
    }
  }
  
  // 添加受傷方法
  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
  }
  
  // 添加治療方法
  heal(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) this.health = this.maxHealth;
  }
  
  attack(target) {
    // 檢查是否可以攻擊
    if (this.attackCooldown <= 0) {
      // 計算與目標的距離
      let distance = abs(target.x - this.x);
      
      // 檢查是否面向目標
      let correctDirection = (target.x > this.x && !this.isFlipped) || 
                           (target.x < this.x && this.isFlipped);
      
      // 如果在攻擊範圍內且面向正確
      if (distance < this.attackRange && correctDirection) {
        target.takeDamage(this.attackDamage);
        this.attackCooldown = 30; // 設置冷卻時間
        console.log(`Hit! Target health: ${target.health}`);
      }
    }
  }
  
  shoot() {
    if (this.shootCooldown <= 0) {
      // 從角色的適當位置發射
      let bulletX = this.x + (this.isFlipped ? -40 : 40);  // 調整發射位置
      let bulletY = this.y - 40;  // 從角色上半身發射
      bullets.push(new Bullet(bulletX, bulletY, this.isFlipped, this));
      this.shootCooldown = this.shootCooldownTime;
    }
  }
}

class Bullet {
  constructor(x, y, isFlipped, owner) {
    this.x = x;
    this.y = y;
    this.speed = 15;        // 調整子彈速度
    this.isFlipped = isFlipped;
    this.owner = owner;     // 記錄是誰發射的子彈
    this.damage = 10;       // 子彈傷害
    this.width = 30;        // 子彈寬度
    this.height = 30;       // 子彈高度
    this.scale = 1.5;       // 子彈縮放比例
  }
  
  update() {
    // 根據方向移動子彈
    if (this.isFlipped) {
      this.x -= this.speed;
    } else {
      this.x += this.speed;
    }
    
    // 檢查是否超出畫面
    return this.x < 0 || this.x > windowWidth;
  }
  
  display() {
    push();
    translate(this.x, this.y);
    
    // 根據方向翻轉子彈
    if (this.isFlipped) {
      scale(-this.scale, this.scale);
    } else {
      scale(this.scale);
    }
    
    // 繪製子彈
    imageMode(CENTER);
    image(fireImg, 0, 0, this.width, this.height);
    
    pop();
  }
  
  checkHit(player) {
    // 檢查是否擊中玩家
    if (player !== this.owner) {
      let d = dist(this.x, this.y, player.x, player.y - 30);
      if (d < 40) {  // 調整碰撞範圍
        player.takeDamage(this.damage);
        return true;
      }
    }
    return false;
  }
}

function handleKeyInput() {
  // 玩家1控制 (WASD + F,G)
  if (keyIsDown(65)) {  // A鍵 向左
    play1.isFlipped = true;
    play1.setAction('run');
    play1.x -= play1.speed;
  } else if (keyIsDown(68)) {  // D鍵 向右
    play1.isFlipped = false;
    play1.setAction('run');
    play1.x += play1.speed;
  }
  
  if (keyIsDown(87) && play1.isGrounded) {  // W鍵 跳躍
    play1.setAction('jump');
    play1.jump();
  }
  
  // 玩家1技能
  if (keyIsDown(70)) {  // F鍵 發射火球
    play1.shoot();
  }
  if (keyIsDown(71)) {  // G鍵 近戰攻擊
    play1.attack(play2);
  }
  
  // 玩家2控制 (IJKL + U,O)
  if (keyIsDown(74)) {  // J鍵 向左
    play2.isFlipped = true;
    play2.setAction('run');
    play2.x -= play2.speed;
  } else if (keyIsDown(76)) {  // L鍵 向右
    play2.isFlipped = false;
    play2.setAction('run');
    play2.x += play2.speed;
  }
  
  if (keyIsDown(73) && play2.isGrounded) {  // I鍵 跳躍
    play2.setAction('jump');
    play2.jump();
  }
  
  // 玩家2技能
  if (keyIsDown(85)) {  // U鍵 發射火球
    play2.shoot();
  }
  if (keyIsDown(79)) {  // O鍵 近戰攻擊
    play2.attack(play1);
  }
  
  // 設置待機動作
  if (!keyIsDown(65) && !keyIsDown(68) && !keyIsDown(87)) {  // 玩家1不按WAD時
    play1.setAction('idle');
  }
  if (!keyIsDown(74) && !keyIsDown(76) && !keyIsDown(73)) {  // 玩家2不按IJL時
    play2.setAction('idle');
  }
}
