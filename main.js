var mainScene = new Phaser.Scene("mainScene");

mainScene.create = function () {
    // 初期設定メソッド呼び出し
    this.config();
    
    // 背景色の設定
    this.cameras.main.setBackgroundColor('#99CCFF');
    
    // 背景のタイルスプライトを設定
    this.background = this.add.tileSprite(0,0,1920,1280,'background01');
    this.background.setOrigin(0,0);
    
    // プレイヤー作成
    this.createPlayer();
    
    // 敵の作成
    this.createEnemyGroup();
    
    // ビームの作成
    this.createBeamGroup();
    
    // UI
    this.createUI();
    
    // パーティクル作成
    this.createParticle();
};

mainScene.update = function() {
    //背景画像の移動で縦スクロールを演出
    this.background.tilePositionY -= 1;
    //プレイヤーの移動
    this.movePlayer();
    //ゲーム空間の領域外に出た敵とビームを削除
    this.checkRemove();
};

mainScene.config = function () {
    // プレイヤーの速度
    this.speed = 150;
    // スコア
    this.score = 0;
    //プレイヤーのhp
    this.hp = 10;
    // 敵タイプの配列
    this.enemyType = ["enemy01","enemy02","enemy03","enemy04","enemy05"];
    // ゲームオーバーフラグ
    this.isGameOver = false;
};

mainScene.createPlayer = function() {
    // プレイヤースプライトの表示
    this.player = this.physics.add.sprite(400, 550, 'player');
    // プレイヤーのサイズ変更
    this.player.setDisplaySize(50,50);
    // プレイヤーの最初のフレーム設定
    this.player.setFrame(1);
    // プレイヤーがゲーム空間の領域と衝突
    this.player.setCollideWorldBounds(true);
    
    //キーを離したときに、プレイヤーの移動停止
    this.input.keyboard.on('keyup',function(event) {
        this.player.setVelocity(0,0);
        this.player.setFrame(1);
    },this);
    //キーを離したときのプログラムはcreatePlayerらしい
    //},this);が必要な時は？
    //スペースキーでビーム発射
    this.input.keyboard.on('keydown-SPACE',function(event){
        this.shoot();
    },this);
};

mainScene.movePlayer = function() {
    var cursors = this.input.keyboard.createCursorKeys();
    if(cursors.right.isDown) {
        //右に移動
        this.player.setVelocityX(this.speed);
        //右向きのフレーム
        this.player.setFrame(2);
    }
    if(cursors.left.isDown) {
        //左に移動
        this.player.setVelocityX(-this.speed);
        //左向きのフレーム
        this.player.setFrame(0);
    }
    if(cursors.up.isDown) {
        //上に移動
        this.player.setVelocityY(-this.speed);
    }
    if(cursors.down.isDown) {
        //下に移動
        this.player.setVelocityY(this.speed);
    }
};

mainScene.createEnemyGroup = function() {
    // 敵グループの作成
    this.enemyGroup = this.physics.add.group();
    //敵とプレイやの衝突
    this.physics.add.overlap(this.player, this.enemyGroup, this.hitEnemy, null,this);
    
    this.time.addEvent({
        delay: 500,
        callback: this.createEnemy,
        loop: true,
        callbackScope: this,
    });
};

mainScene.createEnemy = function() {
    // X座標の乱数作成
    var positionX = Phaser.Math.RND.between(100, 700);
    // 敵をランダムに選択
    var enemyType = Phaser.Math.RND.pick(this.enemyType);
    // 敵の作成
    var enemy = this.enemyGroup.create(positionX, 50, enemyType);
    enemy.setDisplaySize(80, 80);
    // 敵の移動方向を乱数で作成
    var speedX = Phaser.Math.RND.between(-200, 200);
    var speedY = Phaser.Math.RND.between( 100, 300);
    // 敵の移動
    enemy.setVelocity(speedX, speedY);
    //パーティクル作成
    this.createEnemyParticle(enemy);
};
mainScene.hitEnemy = function (player, enemy) {
    // プレイヤと敵が衝突
    
    if(!this.isGameOver) {
        //hp減少
        this.hp -= 5;
        enemy.destroy();
        this.hpText.setText('hp:' + this.hp);
    }
    if( this.hp == 0 ) {
        if(this.isGameOver) {
            return;
        }
        //ゲームオーバーにする
        this.isGameOver = true;
        //パーティクル開始
        this.emitter.start();
        //プレイヤーを非表示
        this.player.setVisible(false);
        //ゲームオーバー画面を1秒後に表示
        this.time.addEvent({
            delay: 1000,
            callback: this.gameOver,
            callbackScope: this,
        });
    }
    // //ゲームオーバーにする
    // this.isGameOver = true;
    // //パーティクル開始
    // this.emitter.start();
    // //プレイヤーを非表示
    // this.player.setVisible(false);
    // //ゲームオーバー画面を1秒後に表示
    // this.time.addEvent({
    //     delay: 1000,
    //     callback: this.gameOver,
    //     callbackScope: this,
    // });
};

mainScene.createBeamGroup = function() {
    // ビームグループ作成
    this.beamGroup = this.physics.add.group();
    this.physics.add.overlap(this.beamGroup, this.enemyGroup, this.hitBeam, null, this);
};

mainScene.shoot = function() {
    // プレイヤーの位置からビーム発射
    var posX = this.player.x;
    var posY = this.player.y;
    //ビーム作成
    var beam = this.beamGroup.create(posX,posY,'beam01');
    //ビームの速度設定
    beam.setVelocityY(-100);
};

mainScene.hitBeam = function( beam, enemy) {
    // ビーム消滅
    beam.destroy();
    //敵消滅
    enemy.destroy();
    //敵のパーティクル実行
    enemy.emitter.start();
    //スコアアップ
    this.score += 5;
    this.scoreText.setText('スコア:' + this.score);

    if(this.score >= 50) {
        this.scene.start("subScene", {});
    }
};

mainScene.checkRemove = function() {
    //敵の削除判定
    var enemies = this.enemyGroup.getChildren();
    for( var e in enemies ) {
        if( enemies[e].y >= 600 ) {
            enemies[e].destroy();
            break;
        }
    }
    //ビームの削除判定
    var beams = this.beamGroup.getChildren();
    for( var b in beams ) {
        if(beams[b].y <= 0) {
            beams[b].destroy();
            break;
        }
    }
};

mainScene.createUI = function() {
    // スコアを文字で表示する
    this.scoreText = this.add.text(600,20,'スコア:' + this.score, {
        font: '28px Open Sans',
        fill: '#ff0000'
    });
    //hpを文字で表示する
    this.hpText = this.add.text(50,20,'hp:' + this.hp, {
        font: '28px Open Sans',
        fill: '#ff0000'
    });
};

mainScene.createParticle = function() {
    // プレイヤーの爆発パーティクル作成
    var particles = this.add.particles('fire01');
    this.emitter = particles.createEmitter({
        speed: 200,
        maxParticles: 20,
        blendMode: 'ADD',
        follow: this.player,
    });
    //最初はパーティクルは停止
    this.emitter.stop();
};
mainScene.createEnemyParticle = function(enemy) {
    //敵の爆発パーティクル作成
    var particles = this.add.particles('fire02');
    enemy.emitter = particles.createEmitter({
        speed: 100,
        maxParticles: 10,
        blendMode: 'ADD',
        follow: enemy,
    });
    //最初はパーティクルは停止
    enemy.emitter.stop();
};

mainScene.gameOver = function() {
    // ゲームオーバー画像表示
    this.gameover = this.add.image(400,300,'gameover');
    this.gameover.setDisplaySize(500,500);
    //何かのキーをクリックするとスタートシーンを開始
    this.input.keyboard.on('keydown',function(event) {
        this.scene.start("startScene");
    },this);
};