var subScene = new Phaser.Scene("subScene");
subScene.create = function () {
    this.cameras.main.setBackgroundColor('#99CCFF');
    
    // 背景のタイルスプライトを設定
    this.background = this.add.tileSprite(0,0,1600,1080,'background04');
    this.background.setOrigin(0,0);

    //初期設定メソッドを呼び出し
    this.config();

    //ビームの作成
    this.createBeamGroup();

    //プレイヤー作成
    this.createPlayer();

    //ボスの作成
    this.createBossEnemy();

    //UI
    this.createUI();
    //パーティクル作成
    this.createParticle();
    //ボスパーティクル作成
    this.createBossEnemyParticle();
    this.physics.add.overlap(this.PlayerbeamGroup, this.BossEnemy, this.hitBossEnemy, null,this);
    this.physics.add.overlap(this.BossbeamGroup,this.player,this.hitPlayerBeam,null,this);
    
};
subScene.update = function() {
    //プレイヤーの移動
    this.movePlayer();
    //背景画像の移動で縦スクロールを演出
    this.background.tilePositionY -= 1;
};
subScene.config = function () {
    //プレイヤーの速度
    this.speed = 150;
    //スコア
    this.score = 50;
    //敵タイプ
    this.enemyType = [];
    //ボス登場フラグ
    this.isBoss = false;
    //ボスのHP
    this.BossEnemyHP = 100;
    //プレイヤーのHP
    this.hp = 10;
};
subScene.createPlayer = function() {
    //プレイヤーのスプライト表示
    this.player = this.physics.add.sprite(400,550,'player');
    //プレイヤーのサイズ変更
    this.player.setDisplaySize(50,50);
    //プレイヤーの最初のフレーム設定
    this.player.setFrame(1);
    //プレイヤーがゲーム空間の領域と衝突
    this.player.setCollideWorldBounds(true);
    //キーを離したときに、プレイヤーの移動停止
    this.input.keyboard.on('keyup',function(event) {
        this.player.setVelocity(0,0);
        this.player.setFrame(1);
    },this);
    //スペースキーでビーム発射
    this.input.keyboard.on('keydown-SPACE',function(event) {
        this.shoot();
    },this);
};

subScene.movePlayer = function() {
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
subScene.createBossEnemy = function() {
    //ボスの作成
    this.BossEnemy = this.physics.add.image(400,100,'enemy06');
    //初期位置
    this.BossEnemy.setDisplaySize(200,200);
    this.timeEvent = this.time.addEvent({
        delay: 200,
        callback: this.createBossBeam,
        loop: true,
        callbackScope: this,
    });
};
subScene.createBossBeam = function() {
    //ボスの位置からビームを発射
    var posX = this.BossEnemy.x;
    var posY = this.BossEnemy.y;
    //ビーム作成
    var beam = this.BossbeamGroup.create(posX,posY,'beam01');
    //ビームの速度設定
    beam.setVelocityY(200);
    console.log(beam);
};
subScene.hitBossEnemy = function(BossEnemy,beam) {
    //ビームの消滅
    beam.destroy();
    //ボス敵のHP減少
    this.BossEnemyHP -= 10;
    //ボスのHPが0になったら
    if( this.BossEnemyHP <= 0 ) {
        if(this.isCongratulations) {
            return;
        }
        //ゴールにする
        this.isCongratulations = true;
        //パーティクル開始
        this.BossEnemy.emitter.start();
        //ボスを非表示
        this.BossEnemy.setVisible(false);
        //プレイヤーを非表示
        this.player.setVisible(false);
        //ゴール画面を1秒後に表示
        this.time.addEvent({
            delay: 1000,
            callback: this.Congratulations,
            callbackScope: this,
        });
    }
    
    this.BossEnemyHPText.text = 'ボスのhp:' + this.BossEnemyHP;
};
subScene.createBeamGroup = function() {
    
    //ボスビームグループ作成
    this.BossbeamGroup = this.physics.add.group();
    //プレイヤービームグループ作成
    this.PlayerbeamGroup = this.physics.add.group();
};
subScene.shoot = function() {
    //プレイヤー位置からビーム発射
    var posX = this.player.x;
    var posY = this.player.y;
    //ビーム作成
    var beam = this.PlayerbeamGroup.create(posX,posY,'beam01');
    //ビームの速度設定
    beam.setVelocityY(-200);
};
subScene.hitPlayerBeam = function(player,beam) {
    //ビームの消滅
    beam.destroy();
    
   
    //プレイヤーのHP減少
    this.hp -= 10;
    this.hpText.text = 'hp:' + this.hp;
    
    //HPが0になったら
    if( this.hp <= 0 ) {
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
    
};
subScene.checkRemove = function() {
    //ビームの削除判定
    var beams = this.beamGroup.getChildren();
    for( var b in beams ) {
        if(beams[b].y <= 0) {
            beams[b].destroy();
            break;
        }
    }
    
};
subScene.createUI = function() {
    //hpを文字で表示する
    this.hpText = this.add.text(50,20,'hp:' + this.hp, {
        font: '28px Open Sans',
        fill: '#ff0000'
    
    });
    //ボスのhpを文字で表示する
    this.BossEnemyHPText = this.add.text(600,20,'ボスのhp:' + this.BossEnemyHP, {
        font: '28px Open Sans',
        fill: '#ff0000'
    });
};
subScene.createParticle = function() {
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
subScene.createBossEnemyParticle = function() {
    //敵の爆発パーティクル作成
    var particles = this.add.particles('fire02');
    this.BossEnemy.emitter = particles.createEmitter({
        speed: 100,
        maxParticles: 10,
        blendMode: 'ADD',
        follow: this.BossEnemy,
    });
    //最初はパーティクルは停止
    this.BossEnemy.emitter.stop();
};
subScene.gameOver = function() {
    // ゲームオーバー画像表示
    this.gameover = this.add.image(400,300,'gameover');
    this.gameover.setDisplaySize(500,500);
    //何かのキーをクリックするとスタートシーンを開始
    this.input.keyboard.on('keydown',function(event) {
        this.scene.start("startScene");
    },this);
};
subScene.Congratulations = function() {
    this.Congratulations = this.add.image(400,300,'gameclear');
    this.Congratulations.setDisplaySize(500,500);
    //何かのキーをクリックするとスタートシーンを開始
    this.input.keyboard.on('keydown',function(event) {
        this.scene.start("startScene");
    },this);
}
