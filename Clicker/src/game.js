//https://gamedevacademy.org/phaser-tutorial-how-to-create-an-idle-clicker-game/

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var MONSTER_CONTAINER_X = 400;
var MONSTER_CONTAINER_Y = 300;
var MONSTER_X = 200;
var MONSTER_Y = 0;

var game = new Phaser.Game(config);
var backgroundSprites;
var monsters;
var currentMonster;
var monsterInfoUI;
var monsterNameText;
var monsterHealthText;
var dmgTextPool;
var player;

var monsterData = [
    {name: 'Aerocephal', image: 'aerocephal', maxHealth: 10},
    {name: 'Arcana Drake', image: 'arcana_drake', maxHealth: 20},
    {name: 'Aurum Drakueli', image: 'aurum-drakueli', maxHealth: 30},
    {name: 'Bat', image: 'bat', maxHealth: 5},
    {name: 'Daemarbora', image: 'daemarbora', maxHealth: 10},
    {name: 'Deceleon', image: 'deceleon', maxHealth: 10},
    {name: 'Demonic Essence', image: 'demonic_essence', maxHealth: 15},
    {name: 'Dune Crawler', image: 'dune_crawler', maxHealth: 8},
    {name: 'Green Slime', image: 'green_slime', maxHealth: 3},
    {name: 'Nagaruda', image: 'nagaruda', maxHealth: 13},
    {name: 'Rat', image: 'rat', maxHealth: 2},
    {name: 'Scorpion', image: 'scorpion', maxHealth: 2},
    {name: 'Skeleton', image: 'skeleton', maxHealth: 6},
    {name: 'Snake', image: 'snake', maxHealth: 4},
    {name: 'Spider', image: 'spider', maxHealth: 4},
    {name: 'Stygian Lizard', image: 'stygian_lizard', maxHealth: 20}
];

function preload() {
    this.load.image('forest-back', 'assets/parallax_forest_pack/layers/parallax-forest-back-trees.png');
    this.load.image('forest-lights', 'assets/parallax_forest_pack/layers/parallax-forest-lights.png');
    this.load.image('forest-front', 'assets/parallax_forest_pack/layers/parallax-forest-front-trees.png');
    this.load.image('forest-middle', 'assets/parallax_forest_pack/layers/parallax-forest-middle-trees.png');

    this.load.spritesheet('aerocephal',
        'assets/allacrost_enemy_sprites/aerocephal.png',
        { frameWidth: 192, frameHeight: 192 }
    );
    this.load.spritesheet('arcana_drake',
        'assets/allacrost_enemy_sprites/arcana_drake.png',
        { frameWidth: 192, frameHeight: 256 }
    );
    this.load.spritesheet('aurum-drakueli',
        'assets/allacrost_enemy_sprites/aurum-drakueli.png',
        { frameWidth: 320, frameHeight: 256 }
    );
    this.load.spritesheet('bat',
        'assets/allacrost_enemy_sprites/bat.png',
        { frameWidth: 128, frameHeight: 128 }
    );
    this.load.spritesheet('daemarbora',
        'assets/allacrost_enemy_sprites/daemarbora.png',
        { frameWidth: 128, frameHeight: 128 }
    );
    this.load.spritesheet('deceleon',
        'assets/allacrost_enemy_sprites/deceleon.png',
        { frameWidth: 256, frameHeight: 256 }
    );
    this.load.spritesheet('demonic_essence',
        'assets/allacrost_enemy_sprites/demonic_essence.png',
        { frameWidth: 128, frameHeight: 192 }
    );
    this.load.spritesheet('dune_crawler',
        'assets/allacrost_enemy_sprites/dune_crawler.png',
        { frameWidth: 64, frameHeight: 64 }
    );
    this.load.spritesheet('green_slime',
        'assets/allacrost_enemy_sprites/green_slime.png',
        { frameWidth: 64, frameHeight: 64 }
    );
    this.load.spritesheet('nagaruda',
        'assets/allacrost_enemy_sprites/nagaruda.png',
        { frameWidth: 192, frameHeight: 256 }
    );
    this.load.spritesheet('rat',
        'assets/allacrost_enemy_sprites/rat.png',
        { frameWidth: 64, frameHeight: 64 }
    );
    this.load.spritesheet('scorpion',
        'assets/allacrost_enemy_sprites/scorpion.png',
        { frameWidth: 64, frameHeight: 64 }
    );
    this.load.spritesheet('skeleton',
        'assets/allacrost_enemy_sprites/skeleton.png',
        { frameWidth: 64, frameHeight: 128 }
    );
    this.load.spritesheet('snake',
        'assets/allacrost_enemy_sprites/snake.png',
        { frameWidth: 128, frameHeight: 64 }
    );
    this.load.spritesheet('spider',
        'assets/allacrost_enemy_sprites/spider.png',
        { frameWidth: 64, frameHeight: 64 }
    );
    this.load.spritesheet('stygian_lizard',
        'assets/allacrost_enemy_sprites/stygian_lizard.png',
        { frameWidth: 192, frameHeight: 192 }
    );
}

function create() {
    backgroundSprites = this.add.group();
    ['forest-back', 'forest-lights', 'forest-middle', 'forest-front']
        .forEach((image) => {
            var bg = this.add.tileSprite(400, 300, game.config.width, game.config.height, image);
            bg.setTileScale(3, 3.75);
            backgroundSprites.add(bg);
        });

    monsters = this.add.container(MONSTER_CONTAINER_X, MONSTER_CONTAINER_Y);
    monsterData.forEach((data) => {
        monsters.add(new Monster(this, 1000, 0, data));
    });


    this.add.text(150, 300, 'Adventure Awaits!', { fontSize: '32px', fill: '#fff'});

    currentMonster = monsters.getRandom();
    currentMonster.setPosition(MONSTER_X, MONSTER_Y);

    monsterInfoUI = this.add.container(monsters.x -220, monsters.y +120);
    monsterNameText = monsterInfoUI.add(
        this.add.text(0, 0, currentMonster.details.name, {
            fontSize: '32px', fill: '#fff', strokeThickness: 4
    }));
    monsterHealthText = monsterInfoUI.add(
        this.add.text(0, 80, currentMonster.health + ' HP', {
            fontSize: '32px', fill: '#ff0000', strokeThickness: 4
    }));

    //set up damage texts
    dmgTextPool = this.add.container(0, 0);
    for (var d=0; d<50; d++) {
        dmgText = this.add.text(0, 0, '1', {
            font: '64px Arial Black',
            fill: '#fff',
            strokeThickness: 4
        });
        // start out not existing, so it isnt drawn yet
        dmgText.exists = false;
        dmgText.alpha = 0;
        
        dmgTextPool.add(dmgText);
    }

    player = {
        clickDmg: 1,
        gold: 0
    };
}

function update() {

}

function replaceMonster() {
    currentMonster.setPosition(1000, 0);
    currentMonster = monsters.getRandom();
    currentMonster.revive();
    currentMonster.setPosition(200, 0);

    monsterInfoUI.first.text = currentMonster.details.name;
    monsterInfoUI.next.text = currentMonster.alive ? currentMonster.health + ' HP' : 'DEAD' ;
}

function updateMonsterInfoUI() {
    monsterInfoUI.last.text = currentMonster.alive ? currentMonster.health + ' HP' : 'DEAD' ;
}

class Monster extends Phaser.GameObjects.Sprite{

    constructor (scene, x, y, monsterData) {
        super(scene, x, y, monsterData.image);

        this.details = monsterData;
        this.health = this.maxHealth = monsterData.maxHealth;
        this.alive = true;

        this.allowClick = true;
        this.setInteractive();
        this.on('pointerdown', (pointer) => this.clicked(pointer));
        this.onKilled = replaceMonster;
        this.onDamaged = updateMonsterInfoUI;
    }

    clicked (pointer){
        //on click code here
        this.damage(player.clickDmg, pointer);
    }

    damage (amount, pointer){
        var dmgText = dmgTextPool.getFirst('exists', false, 0, 49);
        dmgText.setText(amount);
        dmgText.exists = true;
        dmgText.x = pointer.worldX;
        dmgText.y = pointer.worldY;
        dmgText.alpha = 1;
        dmgText.visible = true;

        var tween = this.scene.tweens.add({
            targets: dmgText,
            x: Phaser.Math.Between(MONSTER_CONTAINER_X - MONSTER_X, MONSTER_CONTAINER_X + MONSTER_X),
            y: Phaser.Math.Between(100, 500),
            alpha: 0,
            ease: 'Cubic',
            duration: 1000,
            onComplete: function () {
                dmgText.exists = false;
            }
        });

        this.health -= amount;
        this.alive = this.health > 0;

        if (this.health < 0){
            this.onKilled();
        } else {
            this.onDamaged();
        }
    }

    revive (heal = 0){
        if (heal > 0){
            this.health = heal;
        } else {
            this.health = this.maxHealth;
        }
    }
}


/////////////////////////////////////

// var game = new Phaser.Game(800, 600, Phaser.AUTO, '');
// game.state.add('play', {
//     preload: function() {
//         game.load.image('skeleton', 'assets/allacrost_enemy_sprites/skeleton.png');
//     },
//     create: function() {
//         var skeletonSprite = game.add.sprite(450, 290, 'skeleton');
//         skeletonSprite.anchor.setTo(0.5, 0.5);
//     },
//     render: function() {
//         game.debug.text('Adventure Awaits!', 250, 290);
//     }
// });
// game.state.start('play');