'use strict';

const detectionDevice = function() {
    if (typeof cordova === "object") {
        return (window.cordova.platformId === "android");
    } else {
        return false;
    }
};

const setCookies = function(name, value, days) {
    if(detectionDevice()){
        localStorage.setItem(name, value);
    } else {
        let expires;
        if (days) {
            const data = new Date();
            data.setTime(data.getTime()+(days*24*60*60*1000));
            //data.setTime(data.getTime()+(2*60*1000));     // na dwie minuty
            expires = "; expires="+data.toGMTString();
        } else {
            expires = "";
        }

        document.cookie = name+"=" + value + expires + "; path=/";
    }
};

const removeCookies = function(name) {
    if(detectionDevice()){
        localStorage.removeItem(name);
    } else {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
};

const getCookies = function(name,array) {
    if(detectionDevice()) {
        if(array) {
            return JSON.parse(localStorage.getItem(name));
        } else {
            return localStorage.getItem(name);
        }
    } else {
        if (document.cookie !== "") {
            const cookies=document.cookie.split(/; */);
            for (let i=0; i<cookies.length; i++) {
                const nameCookie=cookies[i].split("=")[0];
                const valueCookie=cookies[i].split("=")[1];
                if (nameCookie===decodeURIComponent(name)) {
                    return decodeURIComponent(valueCookie);
                }
            }
        }
    }
};

var isEven=function(n) {
    return n == parseFloat(n)? !(n%2) : void 0;
};

/* full screen test
var onFullScreenEnter=function() {
  console.log("Entered fullscreen!");
  elem.onwebkitfullscreenchange = onFullScreenExit;
  elem.onmozfullscreenchange = onFullScreenExit;
};

var enterFullscreen=function() {
  //console.log("enterFullscreen()");
  var elem = document.querySelector(document.webkitExitFullscreen ? "body" : "body");
  elem.onwebkitfullscreenchange = onFullScreenEnter;
  elem.onmozfullscreenchange = onFullScreenEnter;
  elem.onfullscreenchange = onFullScreenEnter;
  if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else {
    if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else {
      elem.requestFullscreen();
    }
  }
}
document.getElementById("full-screen").onclick=function(){
	enterFullscreen();
};
/* end full screen test */

var inArrayObject=function(nameArray,myArray,myValue){
	var inArrayObject=false;
	for(var i=0, iLength=myArray.length; i<iLength; i++){
		if(nameArray=="intruzi")
		{
			if(myArray[i].randomMove==myValue) inArrayObject=true;
		}
		else if(nameArray=="kladki")
		{
			if(myArray[i].isUp==myValue) inArrayObject=true;
		}
	}
	return inArrayObject;
};

var inArray=function(myArray,myValue){
    var inArray = false;
    myArray.map(function(key){
        if (key === myValue){
            inArray=true;
        }
    });
    return inArray;
};

var removeA=function(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
};

var randZakres=function( min, max ){
    min = parseInt( min, 10 );
    max = parseInt( max, 10 );

    if ( min > max ){
        var tmp = min;
        min = max;
        max = tmp;
    }

    return Math.floor( Math.random() * ( max - min + 1 ) + min );
};


// jQuery(window).on("load", function() {
//     var list='---'+"\n";
//     if(detectionDevice()) {
//         jQuery.each(localStorage, function(key, value){
//             list += key + " -> " + value + "\n";
//         });
//     } else {
//         var theCookies = document.cookie.split(';');
//         for (var i = 1 ; i <= theCookies.length; i++) {
//             list += i + ' ' + theCookies[i-1] + "\n";
//         }
//     }
//     alert(list);
// });

//alert("aktualnie unlockLevels: " + getCookies("unlock-levels") + " - powinno sie rownac: " + ((parseInt(getCookies("unlock-levels"))>1)?getCookies("unlock-levels"):1));
var map,
	unlockLevels,
	amountLevels,
	bgMenu,
	levelFile={name:'level1', activeIdLevel:1, readyLoad:false, blockedKeys:false, backgroundLevel:false, backgroundColor:false, backgroundParallax:false},
	tileSize=16,
	layer,
    layerFront,
    layerObjects,
	fispeed=[80,100,120],
	wspInkub=[],
	facing = 'right',
	cursors,
	jumpButton,
	fireButton,
	bg,
	bg2,
	oFog,
	ground,
	playGame={main:false},
	timeLoop = 1,
	timer,
	timerTotal = 0,
    timerLimit = false,
	fpsTest=0,
	saveX = 0,
	saveY = 0,
	jumpKillF=false,
	jumpKillY=false,
    proportiesMap=[],
    oneHP=0,
    keys=0,
    amountMainLife=3,
    amountLife=3,
    amountBullet=60,
    theEndCredits=false,
    moveX,
    moveY,
    playerScaleBig = 1.08,
    playerJumpVelocityNormalBig = 520,
    playerJumpVelocityNormalSmall = 430,
    playerJumpVelocityWaterBig = 290,
    playerJumpVelocityWaterSmall = 200;

var triggerKeyboardEvent = function(el,keyC,typeKey){
	var eventObj=document.createEvent("Events");

	eventObj.initEvent(typeKey, true, true);
	eventObj.keyCode = keyC;
	eventObj.which = keyC;

	el.dispatchEvent(eventObj);   
}; 

// popinac ewentualnei do przycisku z przeladowaniem strony
var clearGameCache=function() {
    game.cache = new Phaser.Cache(game);
    game.load.reset();
    game.load.removeAll();
}
//clearGameCache();

var preload;
preload = function () {

    game.load.tilemap('level1', 'images/level1.json', null, Phaser.Tilemap.TILED_JSON);

    // example full options:
    // proportiesMap[1] = {
    //     background:"background1",
    //     backgroundSecond:"background1_1",
    //     backgroundColor:"#f3f5ff",
    //     fog:"yellowFog",
    //     fogStop: false,
    //     fogPositionY:520,
    //     fogSpeed:0.25,
    //     positionGround:672,
    //     parallax:true,
    //     timeLimit: 120, // sec
    //     bgAudio: 'bg1'
    // };

    proportiesMap[1] = {
        background: "background4",
        //backgroundSecond:"background1_1",
        backgroundColor: "#f3f5ff",
        fog: "yellowFog",
        fogPositionY: 520,
        fogSpeed: 0, //0.25,
        positionGround: 672,
        parallax: true,
        timeLimit: 480, // sec
        bgAudio: 'bg1'
    };

    game.load.tilemap('level2', 'images/level2.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[2] = {
        background: "background2",
        backgroundColor: "#f3f5ff",
        fog: "whiteFog",
        fogSpeed: 2,
        positionGround: true,
        parallax: true
    };

    game.load.tilemap('level3', 'images/level3.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[3] = {
        background: "background3",
        backgroundColor: "#def7c3",
        fog: "yellowFog",
        fogPositionY: 0,
        positionGround: true,
        parallax: false
    };


    game.load.tilemap('level4', 'images/level4.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[4] = {
        background: "background1",
        backgroundSecond: "background1_1",
        backgroundColor: "#f3f5ff",
        fog: "yellowFog",
        positionGround: true,
        parallax: true
    };

    game.load.tilemap('level5', 'images/level5.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[5] = {
        background: "background1",
        backgroundColor: "#ffffff",
        fog: "yellowFog",
        positionGround: true,
        parallax: true
    };

    game.load.tilemap('level6', 'images/level6.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[6] = {
        background: "background1",
        backgroundColor: "#f3f5ff",
        fog: "yellowFog",
        positionGround: true,
        parallax: true
    };

    game.load.tilemap('level7', 'images/level7.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[7] = {
        background: "background4",
        //backgroundSecond:"background1_1",
        backgroundColor: "#f3f5ff",
        fog: "yellowFog",
        fogSpeed: 0,
        positionGround: true,
        parallax: true
    };

    game.load.tilemap('level8', 'images/level8.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[8] = {
        background: "background1",
        backgroundSecond: "background1_1",
        backgroundColor: "#f3f5ff",
        fog: "yellowFog",
        positionGround: true,
        parallax: true
    };

    game.load.tilemap('level9', 'images/level9.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[9] = {
        background: "background3",
        backgroundColor: "#def7c3",
        fog: "yellowFog",
        positionGround: true,
        parallax: false
    };

    game.load.tilemap('level10', 'images/level10.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[10] = {
        background: "background4",
        //backgroundSecond:"background1_1",
        backgroundColor: "#f3f5ff",
        fog: "yellowFog",
        fogPositionY: tileSize,
        positionGround: 7 * tileSize,
        parallax: true
    };

    game.load.tilemap('level11', 'images/level11.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[11] = {
        background: "background4",
        //backgroundSecond:"background1_1",
        backgroundColor: "#f3f5ff",
        fog: "yellowFog",
        fogPositionY: tileSize,
        positionGround: 7 * tileSize,
        parallax: true
    };

    game.load.tilemap('level12', 'images/level12.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[12] = {
        background: "background4",
        //backgroundSecond:"background1_1",
        backgroundColor: "#f3f5ff",
        fog: "yellowFog",
        fogPositionY: tileSize,
        positionGround: 7 * tileSize,
        parallax: true
    };

    game.load.tilemap('level13', 'images/level13.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[13] = {
        background: "background4",
        //backgroundSecond:"background1_1",
        backgroundColor: "#f3f5ff",
        fog: "yellowFog",
        fogPositionY: tileSize,
        positionGround: 7 * tileSize,
        parallax: true
    };

    game.load.tilemap('level14', 'images/level14.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[14] = {
        background: "background4",
        //backgroundSecond:"background1_1",
        backgroundColor: "#f3f5ff",
        fog: "yellowFog",
        fogPositionY: tileSize,
        positionGround: 7 * tileSize,
        parallax: true
    };

    game.load.tilemap('level15', 'images/level15.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[15] = {
        background: "background4",
        //backgroundSecond:"background1_1",
        backgroundColor: "#f3f5ff",
        fog: "yellowFog",
        fogPositionY: tileSize,
        positionGround: 7 * tileSize,
        parallax: true
    };

    game.load.tilemap('level16', 'images/level16.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[16] = {
        background: "background4",
        //backgroundSecond:"background1_1",
        backgroundColor: "#f3f5ff",
        fog: "yellowFog",
        fogPositionY: tileSize,
        positionGround: 7 * tileSize,
        parallax: true
    };

    game.load.tilemap('level17', 'images/level17.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[17] = {
        background: "background4",
        //backgroundSecond:"background1_1",
        backgroundColor: "#f3f5ff",
        fog: "yellowFog",
        fogPositionY: tileSize,
        positionGround: 7 * tileSize,
        parallax: true
    };

    game.load.tilemap('level18', 'images/level18.json', null, Phaser.Tilemap.TILED_JSON);
    proportiesMap[18] = {
        background: "the-end",
        backgroundColor: "#000000",
        fog: false,
        positionGround: false,
        parallax: false
    };


    game.load.image('tiles-1', 'images/tiles-1.png');

    game.load.image('blank-tile', 'images/blank-tile.png');

    //game.load.spritesheet('dude', 'images/, 35, 48);
    game.load.spritesheet('dude', 'images/players1.png', 48, 64);
    game.load.spritesheet('intruder1', 'images/intruders4.png', 48, 64);
    game.load.spritesheet('intruder2', 'images/intruders2.png', 48, 64);
    game.load.spritesheet('intruder3', 'images/intruders3.png', 48, 64);
    game.load.spritesheet('intruder4', 'images/snakeX2.png', 71, 37);
    //game.load.spritesheet('intruder', 'images/intruder2.png', 48, 48);
    game.load.image('backgroundMenu', 'images/menu.png');
    game.load.image('boxMenu', 'images/box-menu4.png', 640, 290);
    game.load.image('boxTopMenu', 'images/top-menu.png');
    game.load.image('background1', 'images/background1.png');
    game.load.image('background1_1', 'images/background1_1.png');
    game.load.image('background2', 'images/background2_1.png');
    game.load.image('background3', 'images/background3.png');
    game.load.image('background4', 'images/background4.png');
    game.load.image('tile-size-black', 'images/tile-size-black.png');
    game.load.image('the-end', 'images/the-end.png');


    game.load.spritesheet('buttonsWindowMenu', 'images/buttons.png', 112, 48);

    game.load.spritesheet('buttonsIcons', 'images/icons.png', 48, 48);
    game.load.spritesheet('buttonLevel', 'images/button-level.png', 64, 64);
    game.load.spritesheet('buttonNavigation', 'images/navigations1.png', 112, 112);
    game.load.image('buttonPause', 'images/pause.png');

    game.load.spritesheet('log', 'images/log.png', 16, 16);

    game.load.image('yellowFog', 'images/fog-yellow.png');
    game.load.image('whiteFog', 'images/fog-white.png');
    game.load.image('ground', 'images/ground.png');

    //game.load.spritesheet('coin', 'images/nu1.png', 24,32);
    game.load.spritesheet('coin', 'images/nu3.png', 16, 24);
    game.load.spritesheet('Life', 'images/LifeFull.png', 16, 31);
    game.load.spritesheet('Life2', 'images/LifeSingle.png', 16, 24);
    game.load.spritesheet('key', 'images/key.png', 16, 43);
    game.load.spritesheet('door', 'images/door2.png', 16, 128);
    game.load.image('lock', 'images/lock1.png');

    game.load.image('cactus', 'images/cactus.png');
    game.load.image('grassLr', 'images/grass_lr.png');

    game.load.image('bullet', 'images/bullet.png');
    game.load.spritesheet('bullets_gun', 'images/gun-bullets6.png', 20, 28);
    game.load.spritesheet('end_level', 'images/end_level.png', 100, 130);
    game.load.spritesheet('save_level', 'images/save_level.png', 100, 130);

    game.load.spritesheet('fire_up', 'images/fire_up3.png', 24, 24);
    game.load.spritesheet('fire_down', 'images/fire_down3.png', 24, 24);
    game.load.spritesheet('fire_left', 'images/fire_left3.png', 24, 24);
    game.load.spritesheet('fire_right', 'images/fire_right3.png', 24, 24);

    game.load.spritesheet('windmill', 'images/windmill_2.png', 120, 322);

    game.load.image('windmill_1_new', 'images/windmill_1_5_new.png');
    game.load.image('windmill_2_new', 'images/windmill_2_5_new.png');

    game.load.image('gun', 'images/gun2.png');

    game.load.image('cave', 'images/cave.png');
    game.load.image('building1', 'images/building1.png');
    game.load.image('building2', 'images/building2p.png');
    game.load.image('building3', 'images/building3p.png');


    game.load.spritesheet('mine-part-2', 'images/mine-part2-4.png', 175, 331);
    game.load.image('mine-part-1', 'images/mine-part1-6.png');

    //game.load.spritesheet('water', 'images/water_2.png', 128, 32);
    //game.load.spritesheet('water', 'images/water_3.png', 192, 32);
    game.load.spritesheet('water-red', 'images/water_red6.png', 256, 32);
    game.load.spritesheet('water', 'images/water_4.png', 256, 32);
    game.load.spritesheet('splash', 'images/splash7.png', 84, 38);
    game.load.spritesheet('splash-water-red', 'images/splash-red9.png', 84, 38);
    game.load.spritesheet('fireb', 'images/fish7.png', 16, 40);
    game.load.spritesheet('fireb2', 'images/fireb.png', 16, 16);

    game.load.image('kladka', 'images/kladka.png');
    game.load.image('kladka-short', 'images/kladka-short.png');


    // audio
    game.load.audio('footstep', 'audio/footstep.mp3'); // licence no ok
    game.load.audio('coin', 'audio/coin.mp3'); // licence ok
    game.load.audio('shoot', 'audio/shoot2.mp3'); // licence ok
    game.load.audio('bullets', 'audio/bullets3.mp3');
    game.load.audio('explosion-intruder', 'audio/explosion-intruder.mp3');
    game.load.audio('break-bones', 'audio/break-bones.mp3');
    game.load.audio('scream', 'audio/scream.mp3'); // licence ok
    game.load.audio('splash', 'audio/splash.mp3'); // licence ok
    game.load.audio('life', 'audio/life.mp3'); // licence ok
    game.load.audio('key', 'audio/key.mp3'); // licence no ok
    game.load.audio('break-ground', 'audio/break.mp3'); // licence ok
    game.load.audio('quake', 'audio/quake.mp3'); // licence ok
    game.load.audio('door-lift', 'audio/door-lift.mp3'); // licence ok
    game.load.audio('bg1', 'audio/bg.mp3'); // licence ok


    //this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    //this.scale.pageAlignHorizontally = true;
    //this.scale.pageAlignVertically = true;

    //this.scale.updateLayout;

    this.scale.maxWidth = 800;
    this.scale.maxHeight = 450;
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.windowConstraints.bottom = "visual";
    //this.scale.setScreenSize();
};

//FPS
var FrameCounter = {
    lastFrameTime: new Date().getTime(),
    updateFPS: function(){
        var currentTime = new Date().getTime();
        fpsTest = Math.floor(1000/(currentTime-this.lastFrameTime),2)+'fps';
        this.lastFrameTime = currentTime;
    }
};

// nowy uklad gry - tu dodawac opcje!
var toolsGame={
    resetGameCookies: function(type) {
        if(type==="all") {
            removeCookies("unlock-levels");
            unlockLevels = 1;

            removeCookies('coins-procent-last-memory');
            removeCookies('id-level-last-memory');

            for(var i=1; i<=amountLevels; i++) {
                removeCookies('coins-' + i);
                removeCookies('coins-procent-' + i);
            }
        }
        removeCookies('bullets');
        removeCookies('coins');
        removeCookies('Lifes');
        removeCookies('main-Lifes');
    },
    bgSet:function(bgColor) {
        game.stage.backgroundColor = bgColor;
    },
    // slider: {
    //     bounds: false,
    //     min: false,
    //     slider: false,
    //     show: function() { // toolsGame.slider.show();
    //         //define the boundary of the handler
    //         this.bounds= new Phaser.Rectangle(100,100,500,80);
    //         var graphics = game.add.graphics(this.bounds.x, this.bounds.y);
    //         graphics.beginFill(0x000077);
    //         graphics.drawRect(0, 0, this.bounds.width, this.bounds.height);
    //         graphics.fixedToCamera = true;
    //
    //
    //         //add empty sprite for input detection
    //         this.slider = game.add.sprite(100, 100,'bullet');
    //         this.slider.fixedToCamera = true;
    //         this.slider.scale.setTo(1);
    //         this.slider.inputEnabled = true;
    //         this.slider.input.enableDrag(false,false,false,255,this.bounds);
    //         this.slider.input.allowVerticalDrag = false;
    //         this.slider.events.onDragStop.add(function(){
    //             var that = toolsGame.slider;
    //             if(that.slider.x>(that.bounds.width/2)+that.bounds.x){
    //                 that.min=((that.bounds.width+that.bounds.x-that.slider.x-that.slider.width)/(that.bounds.width+that.bounds.x-that.slider.width))*100;
    //             }
    //             if(that.slider.x<(that.bounds.width/2)+that.bounds.x){
    //                 that.min=((that.bounds.width+that.bounds.x-that.slider.x)/(that.bounds.width))*100;
    //             }
    //             console.log(that.min);
    //         }, game);
    //         this.min=1;
    //     },
    //     hide: function () {
    //
    //     }
    // },
    audio: {
        mute: false,
        footStep: function (volume) { // toolsGame.audio.footStep();
            if(!this.mute && !this.a1) {
                var footstep = game.add.audio('footstep');
                    footstep.play('',false,volume ? volume : 0.2);
                    //footstep.volume = 0.05;
                this.a1= true;
                footstep.onStop.addOnce(function() {
                    this.a1=false;
                }, this);
            }
        },
        coin: function (volume) { // toolsGame.audio.footStep();
            if(!this.mute) {
                var coin = game.add.audio('coin');
                coin.play('',false,volume ? volume : 0.2);
            }
        },
        shoot: function (volume) { // toolsGame.audio.footStep();
            if(!this.mute) {
                var shoot = game.add.audio('shoot');
                shoot.play('', false, volume ? volume : 0.2);
            }
        },
        bullets: function (volume) { // toolsGame.audio.footStep();
            if(!this.mute) {
                var bullets = game.add.audio('bullets');
                bullets.play('', false, volume ? volume : 0.2);
            }
        },
        explosionIntruder: function () { // toolsGame.audio.footStep();
            if(!this.mute) {
                var explosionIntruder = game.add.audio('explosion-intruder');
                explosionIntruder.play('', false, 0.5);
            }
        },
        breakBones: function (volume) { // toolsGame.audio.footStep();
            if(!this.mute) {
                var breakBones = game.add.audio('break-bones');
                breakBones.play('', false, volume ? volume : 0.2);
            }
        },
        scream: function (volume) { // toolsGame.audio.footStep();
            if(!this.mute) {
                var scream = game.add.audio('scream');
                scream.play('', false, volume ? volume : 0.2);
            }
        },
        splash: function (volume) { // toolsGame.audio.footStep();
            // var splash = game.add.audio('splash');
            // splash.play('',false,volume?volume:0.2);

            if(!this.mute && !this.aSplash) {
                var splash = game.add.audio('splash');
                splash.play('',false,0.1);
                //footstep.volume = 0.05;
                this.aSplash= true;
                setTimeout(function(that){
                    that.aSplash=false;
                },500,this);
                // splash.onStop.addOnce(function() {
                //     this.aSplash=false;
                // }, this);
            }
        },
        life: function (volume) { // toolsGame.audio.footStep();
            if(!this.mute) {
                var life = game.add.audio('life');
                life.play('', false, volume ? volume : 0.2);
            }
        },
        key: function (volume) { // toolsGame.audio.footStep();
            if(!this.mute) {
                var key = game.add.audio('key');
                key.play('', false, volume ? volume : 0.2);
            }
        },
        breakGround: function (volume) { // toolsGame.audio.footStep();
            if(!this.mute) {
                var breakGround = game.add.audio('break-ground');
                breakGround.play('', false, volume ? volume : 0.2);
            }
        },
        quake: function (volume) { // toolsGame.audio.footStep();
            if(!this.mute) {
                var quake = game.add.audio('quake');
                quake.play('', false, volume ? volume : 0.2);
            }
        },
        doorLift: function (volume) { // toolsGame.audio.footStep();
            if(!this.mute) {
                var doorLift = game.add.audio('door-lift');
                doorLift.play('', false, volume ? volume : 0.2);
            }
        },
        bg: {
            obj: false,
            play:function (volume,bg) {
                if(bg) {
                    if(this.obj) this.obj.destroy();
                    this.obj = game.add.audio(bg);
                    this.obj.play('', false, volume ? volume : 0.2, true);
                }
            },
            stop:function () {
                if(this.obj) this.obj.stop();
            }
        }

    },
    preloader: {
        obj: true,
        add: function(x,y,lastMap) {
            //alert(theEndCredits);

            toolsGame.bgSet('#000000');
            toolsGame.preloader.obj = game.add.group();
            toolsGame.preloader.obj.enableBody = true;

            if(!theEndCredits) {
                var w =  this.obj.create(x*tileSize, y*tileSize, 'windmill_1_new'), theEnd=false;
                w.anchor.setTo(0.5, 0.5);
                w.body.allowGravity = false;
                w.fixedToCamera = true;

                this.interval = setInterval(function () {
                    w.angle += 1;
                    //console.log("preloader works");
                },10);
            }
            toolsGame.text.show('center',0,0,0.9,theEndCredits?(lastMap?'Congratulations!...' + "\n" + "The End":''):("Level " + levelFile.activeIdLevel + "\n" + 'Loading...'),'bold 46px Arial','#ffffff',true,'loading');
        },
        hide: function () {
            this.obj.destroy();
            toolsGame.text.hide('loading');
            clearInterval(this.interval);
        }
    },
	windows:{
        boxTopMenu: {
            positionBar: function (type) {
                if(toolsGame.windows.boxMenu.obj || type==='inside-boxMenu') {
                    moveY = 6*tileSize+8;
                    moveX = 7*tileSize;
                } else {
                    moveX = -1*tileSize;
                    moveY = -1*tileSize+2;
                }
            },
            const: {
                show: function (type) { // toolsGame.windows.boxTopMenu.const.show()
                    /**/
                    toolsGame.windows.boxTopMenu.positionBar(type);
                    if(!theEndCredits) {
                        toolsGame.windows.boxTopMenu.positionBar();

                        toolsGame.image.show(
                            (toolsGame.windows.boxMenu.obj)?14*tileSize+moveX:29*tileSize+moveX,
                            (toolsGame.windows.boxMenu.obj)?1.5*tileSize+moveY:1.5*tileSize+moveY,
                            'Life','Life1',1,1,.8,.8,8
                        );

                        toolsGame.image.show(
                            (toolsGame.windows.boxMenu.obj)?18*tileSize+moveX:33*tileSize+moveX,
                            (toolsGame.windows.boxMenu.obj)?1.5*tileSize+moveY:1.5*tileSize+moveY,
                            'Life2','Life2',1,1,.8,.8,3
                        );

                        toolsGame.image.show(
                            (toolsGame.windows.boxMenu.obj)?22*tileSize+moveX:37*tileSize+moveX,
                            (toolsGame.windows.boxMenu.obj)?1.5*tileSize+moveY:1.5*tileSize+moveY,
                            'coin','coin',1,1,.8,.8,3
                        );

                        toolsGame.image.show(
                            (toolsGame.windows.boxMenu.obj)?28.4*tileSize+moveX:43.4*tileSize+moveX,
                            (toolsGame.windows.boxMenu.obj)?1.5*tileSize+moveY-4:1.5*tileSize+moveY-4,
                            'bullets_gun','bullets_gun',1,1,.75,.75,0
                        );

                        toolsGame.image.show(
                            (toolsGame.windows.boxMenu.obj)?32.5*tileSize+moveX:47.5*tileSize+moveX,
                            (toolsGame.windows.boxMenu.obj)?1.5*tileSize+moveY-2:1.5*tileSize+moveY-2,
                            'key','key',1,1,.7,.5,5
                        );
                    }
                    /**/
                }, //  toolsGame.windows.boxTopMenu.const.hide();
                hide: function () {
                    if(!theEndCredits) {
                        var hideArray = ['Life1','Life2','coin','bullets_gun','key'];
                        for(var i=0, iLnegth=hideArray.length; i<iLnegth; i++ ){
                            toolsGame.image.hide(hideArray[i]);
                        }
                    }
                }
            },
            letAlways: {
                show: function () {
                    toolsGame.windows.boxTopMenu.positionBar();

                    if(proportiesMap[levelFile.activeIdLevel].timeLimit) {
                        if(timerTotal === proportiesMap[levelFile.activeIdLevel].timeLimit) {
                            toolsGame.windows.boxMenu.show('time-over');
                           //toolsGame.windows.boxMenu.show();
                        }
                        timerLimit=proportiesMap[levelFile.activeIdLevel].timeLimit-timerTotal;
                    }

                    toolsGame.text.show(false,
                        (toolsGame.windows.boxMenu.obj)?4*tileSize+moveX:4*tileSize+moveX,
                        (toolsGame.windows.boxMenu.obj)?1.5*tileSize+moveY:1.5*tileSize+moveY,
                        1,('Level ' + levelFile.activeIdLevel + ' / Time: ' +
                        (proportiesMap[levelFile.activeIdLevel].timeLimit?timerLimit:timerTotal)) + 's',
                        '700 15px Arial' ,'#ded4b8',true,'level_text',true
                    );
                }
            },
            let: {
                show: function () { //  toolsGame.windows.boxTopMenu.let.show();
                    toolsGame.windows.boxTopMenu.positionBar();

                    toolsGame.text.show(false,
                        (toolsGame.windows.boxMenu.obj)?15*tileSize+moveX:30*tileSize+moveX,
                        (toolsGame.windows.boxMenu.obj)?1.5*tileSize+moveY:1.5*tileSize+moveY,
                        1,('x ' + toolsGame.mainElements.player.numberMainLifes),'700 15px Arial' ,'#ded4b8',true,'number_main_Lifes_text',true
                    );

                    toolsGame.text.show(false,
                        (toolsGame.windows.boxMenu.obj)?19*tileSize+moveX:34*tileSize+moveX,
                        (toolsGame.windows.boxMenu.obj)?1.5*tileSize+moveY:1.5*tileSize+moveY,
                        1,('x ' + toolsGame.mainElements.player.numberLifes),'700 15px Arial' ,'#ded4b8',true,'number_Lifes_text',true
                    );

                    toolsGame.text.show(false,
                        (toolsGame.windows.boxMenu.obj)?23*tileSize+moveX:38*tileSize+moveX,
                        (toolsGame.windows.boxMenu.obj)?1.5*tileSize+moveY:1.5*tileSize+moveY,
                        1,('x ' + toolsGame.mainElements.player.numberCoins + ' (' + toolsGame.mainElements.player.numberCoinsLevelProcent + '%)'),'700 15px Arial' ,'#ded4b8',true,'coinstext',true
                    );

                    toolsGame.text.show(false,
                        (toolsGame.windows.boxMenu.obj)?29.5*tileSize+moveX:44.5*tileSize+moveX,
                        (toolsGame.windows.boxMenu.obj)?1.5*tileSize+moveY:1.5*tileSize+moveY,
                        1,('x ' + toolsGame.mainElements.player.countBullets),'700 15px Arial' ,'#ded4b8',true,'bullets_gun_text',true
                    );

                    toolsGame.text.show(false,
                        (toolsGame.windows.boxMenu.obj)?33.5*tileSize+moveX:48.5*tileSize+moveX,
                        (toolsGame.windows.boxMenu.obj)?1.5*tileSize+moveY:1.5*tileSize+moveY,
                        1,('x ' + keys),'700 15px Arial' ,'#ded4b8',true,'key_text',true
                    );
                }
            }
        },
		boxMenu:{
			obj:false,
            bg:function(type){
                if(this.obj) this.obj.destroy();
                this.obj=game.add.image(tileSize*2, tileSize*2, 'boxMenu');
                this.obj.alpha = 0;
                this.obj.fixedToCamera = true;
                if(!type){
                    game.add.tween(this.obj).to({alpha: 0.7}, 180, Phaser.Easing.Linear.None, true);
                } else {
                    this.obj.alpha = 0.7;
                }
                // game.physics.arcade.enable(this.obj);
                // console.log(this.obj);
                // game.add.tween(this.obj).to( { x: 200 }, 300, Phaser.Easing.Exponential.Out, true);
                // console.log("x");
            },
			show:function(type){
				//console.log(toolsGame.windows.boxMenu.obj);
				//console.log(this.obj);
		    	toolsGame.buttons.openBoxMenu.hide();

				//boxMenu.
				// if(this.obj) this.obj.destroy();
                // this.obj=game.add.image(tileSize*2, tileSize*2, 'boxMenu');
                // this.obj.alpha = 0.8;
                // this.obj.fixedToCamera = true;
                this.bg(type); // toolsGame.windows.boxMenu.bg();

			    toolsGame.buttons.end.show();
                toolsGame.buttons.startFromBeginning.show();
                toolsGame.buttons.reset.show();
                toolsGame.buttons.mute.show(getCookies('mute')?10:9);

                if(playGame.main) {
                    toolsGame.buttons.navigations.hide();
                    toolsGame.image.hide('boxTopMenu',true);
                    toolsGame.windows.boxTopMenu.const.hide();
                    toolsGame.windows.boxTopMenu.const.show('inside-boxMenu');

                    setTimeout(function(){
                        game.paused = true;
                    },210);
                }
                else
                {
                    toolsGame.buttons.levels.hide();
                    toolsGame.buttons.play.hide();
                    toolsGame.buttons.quit.hide();
                }



                //toolsGame.buttons.closeBoxMenu.show();
			    if(type === 'game-complete') {
                    toolsGame.text.show('center',0,0,0.6,"Thank you for playing",'bold 46px Arial','#ffffff',true,'game-complite');
				} else if(type === 'game-over') {
                    toolsGame.text.show('center', 0, 0, 0.6, "Game Over!", 'bold 46px Arial', '#ffffff', true, 'game-complite');
                } else if(type === 'time-over')  {
                    toolsGame.text.show('center', 0, 0, 0.6, "Time Over!", 'bold 46px Arial', '#ffffff', true, 'game-complite');
                } else {
                    toolsGame.buttons.closeBoxMenu.show();
                    toolsGame.buttons.resume.show();
				}
                toolsGame.windows.boxTopMenu.f=false;

			},
			hide:function(){
				//if(game.paused)
				//{
                    var hide = game.add.tween(this.obj).to({alpha: 0}, 200, Phaser.Easing.Linear.None, true);
                    hide.onComplete.add(function(o){
                        o.destroy();
                    }, this);
					//this.obj.destroy();
					this.obj=false;
					toolsGame.buttons.end.hide();
                    toolsGame.buttons.startFromBeginning.hide();
                    toolsGame.buttons.reset.hide();
                    toolsGame.buttons.resume.hide();
                    toolsGame.buttons.mute.hide();
					toolsGame.buttons.closeBoxMenu.hide();
					//game.input.onDown.removeAll();
					game.paused = false;
			    	if(playGame.main) {
			    	    if(!theEndCredits) {
                            toolsGame.buttons.navigations.show();
                            toolsGame.image.show(
                                (toolsGame.windows.boxMenu.obj)?0:0,
                                (toolsGame.windows.boxMenu.obj)?0:0,
                                'boxTopMenu','boxTopMenu',.85,1,false,false,false,true
                            );
                            toolsGame.windows.boxTopMenu.const.show();
                        }
                        toolsGame.buttons.openBoxMenu.show('play-game');
			    	}
					else 
					{
                        toolsGame.buttons.openBoxMenu.show();
						toolsGame.buttons.levels.show();
						toolsGame.buttons.play.show();
                        toolsGame.buttons.quit.show();
					}
                    toolsGame.windows.boxTopMenu.f=false;
				//}

			}
		}
	},
	buttons:{
		openBoxMenu:{
			obj:false,
			show:function(type){
				//x
				//buttonPauseMenu
				//console.log(toolsGame.buttons.openBoxMenu);
				//console.log(this);
				
				if(this.obj) this.obj.destroy();
				if(type==='play-game') {
                    this.obj = game.add.button(0, 0, 'buttonPause', function(){
                        toolsGame.windows.boxMenu.show();
                    }, this,0,0);
                } else {
                    this.obj = game.add.button(tileSize, tileSize, 'buttonsWindowMenu', function(){
                        toolsGame.windows.boxMenu.show();
                    }, this,2,2);
                }
                if(type==='play-game') {
                    this.obj.alpha = .8;
                } else {
                    this.obj.alpha = 0.6;
                }
			    this.obj.fixedToCamera = true;	
			},
			hide:function(){
			    if(typeof this.obj === "object") {
                    this.obj.destroy();
                }
				//toolsGame.buttons.openBoxMenu.obj.visible = false;
			}
		},
		//buttonsIcons
		closeBoxMenu:{
			obj:false,
			show:function(){
				//buttonPauseMenu
				//console.log(toolsGame.buttons.openBoxMenu);
				//console.log(this);

				if(this.obj) this.obj.destroy();
			    this.obj = game.add.button(44*tileSize, 3*tileSize, 'buttonsIcons', function(){
			        toolsGame.windows.boxMenu.hide();
                }, this,3,2);
			    this.obj.alpha = 0.4;
			    this.obj.fixedToCamera = true;
			},
			hide:function(){
				if(typeof this.obj === 'object') {
                    this.obj.destroy();
				}
				//toolsGame.buttons.closeBoxMenu.obj.visible = false;
			}			
		},
		play: { //toolsGame.buttons.play.show()
			obj:false,
			show:function(){
				//buttonPlay
				if(this.obj) this.obj.destroy();
			    this.obj = game.add.button(9*tileSize, tileSize, 'buttonsWindowMenu', function(){
                    startGame('continuation');
                }, this);
			    this.obj.alpha = 0.6;
			    this.obj.fixedToCamera = true;
			},
			hide:function(){
                if(this.obj) {
                    //this.obj.y=2*tileSize;
                    //console.log(this.obj.position.y);
                    // var hidePlay = game.add.tween(this.obj).to({alpha: 0}, 300, Phaser.Easing.Linear.None, true);
                    // hidePlay.onComplete.add(function(o){
                    //     o.destroy();
                    // }, this);

                    this.obj.destroy();

                }
				//toolsGame.buttons.play.obj.visible = false;
			}
		},
        quit: { //toolsGame.buttons.quit.show()
            obj:false,
            show:function(){
                //buttonQuit
                if(this.obj) this.obj.destroy();
                this.obj = game.add.button(17*tileSize, 1*tileSize, 'buttonsWindowMenu', function(){
                    //alert("Quit game!");
                    //toolsGame.windows.boxMenu.show('quite');
                    toolsGame.windows.boxMenu.bg();
                    toolsGame.text.show('center',0,-10,0.9,'Are you sure you want to quit the game?','bold 26px Arial','#ffffff',true,'quit-1');

                    toolsGame.buttons.yes.show(16,16,'quit');
                    toolsGame.buttons.no.show(27,16,'quit');

                    toolsGame.buttons.openBoxMenu.hide();
                    toolsGame.buttons.levels.hide();
                    toolsGame.buttons.play.hide();
                    toolsGame.buttons.quit.hide();
                }, this,6,6);
                this.obj.alpha = 0.6;
                this.obj.fixedToCamera = true;
            },
            hide:function(){
                if(this.obj) this.obj.destroy();
                //toolsGame.buttons.play.obj.visible = false;
            }
        },
		end: {
			obj:false,
			show:function(){
				//buttonEnd
				if(this.obj) this.obj.destroy();
			    this.obj = game.add.button(3*tileSize, 3*tileSize, 'buttonsWindowMenu', function(){
			    	//game.paused = false;
			    	//closeMenu();
			    	toolsGame.windows.boxMenu.hide();
                    correctCookiesProcent();
			    	endGame(); 
			    	levelFile.name='level1';
			    	levelFile.activeIdLevel=1; 
			    }, this,1,1);
			    this.obj.alpha = 0.4;
			    this.obj.fixedToCamera = true;
			},
			hide:function(){
                if(this.obj) this.obj.destroy();
				//toolsGame.buttons.end.obj.visible = false;
			}
		},
        startFromBeginning: {
            obj:false,
            show:function(){
                //buttonStartFromBeginning
                if(this.obj) this.obj.destroy();
                this.obj = game.add.button(11*tileSize, 3*tileSize, 'buttonsWindowMenu', function(){
                    toolsGame.windows.boxMenu.hide();

                    toolsGame.mainElements.player.numberMainLifes=amountMainLife;
                    toolsGame.mainElements.player.numberLifes=amountLife;
                    toolsGame.mainElements.player.countBullets=amountBullet;
                    toolsGame.mainElements.player.numberCoins = 0;

                    endGame();
                    //alert(levelFile.activeIdLevel + " - " + unlockLevels + " - " + amountLevels);
                    if(levelFile.activeIdLevel<amountLevels) {
                        levelFile.name='level'+levelFile.activeIdLevel;
                        levelFile.activeIdLevel=levelFile.activeIdLevel;
                    } else {
                        levelFile.name='level1';
                        levelFile.activeIdLevel=1;
                    }
                    //toolsGame.resetGameCookies("all");

                    startGame();
                }, this,3,3);
                this.obj.alpha = 0.4;
                this.obj.fixedToCamera = true;
            },
            hide:function(){
                if(this.obj) this.obj.destroy();
            }
        },
        reset: {
            obj:false,
            show:function(){
                //buttonResetFromBeginning
                if(this.obj) this.obj.destroy();
                this.obj = game.add.button(19*tileSize, 3*tileSize, 'buttonsWindowMenu', function(){
                    toolsGame.windows.boxMenu.hide();
                    levelFile.name='level1';
                    levelFile.activeIdLevel=1;
                    toolsGame.resetGameCookies("all");
                    endGame();
                    toolsGame.buttons.levels.hide();
                    toolsGame.buttons.levels.show();
                }, this,4,4);
                this.obj.alpha = 0.4;
                this.obj.fixedToCamera = true;
            },
            hide:function(){
                if(this.obj) this.obj.destroy();
            }
        },
        resume: {
            obj:false,
            show:function(){
                //buttonResume
                if(this.obj) this.obj.destroy();
                this.obj = game.add.button(36*tileSize, 3*tileSize, 'buttonsWindowMenu', function(){
                    toolsGame.windows.boxMenu.hide();
                    if(!playGame.main) {
                        startGame('continuation');
                    }
                }, this,5,5);
                this.obj.alpha = 0.4;
                this.obj.fixedToCamera = true;
            },
            hide:function(){
                if(this.obj) this.obj.destroy();
            }
        },
        mute: {
            obj:false,
            show:function(frames){
                //buttonResume
                if(this.obj) this.obj.destroy();
                this.obj = game.add.button(3*tileSize, 7*tileSize, 'buttonsWindowMenu', function(){
                    if(game.paused) {
                        game.paused = false;
                        clearTimeout(this.t);
                        this.t = setTimeout(function(){
                            game.paused = true;
                        },25);
                    }
                    this.obj.destroy();
                    if(getCookies('mute')) {
                        toolsGame.buttons.mute.show(9);
                        game.sound.mute = false;
                        removeCookies('mute');
                    } else {
                        toolsGame.buttons.mute.show(10);
                        game.sound.mute = true;
                        setCookies('mute',1);
                    }
                }, this,frames,frames);
                this.obj.alpha = 0.4;
                this.obj.fixedToCamera = true;
            },
            hide:function(){
                if(this.obj) this.obj.destroy();
            }
        },
        yes: { // toolsGame.buttons.yes.show(x,y,'quit');
            obj:false,
            show:function(x,y,type){
                if(this.obj) this.obj.destroy();
                this.obj = game.add.button(x*tileSize, y*tileSize, 'buttonsWindowMenu', function(){
                    if(type==='quit') {
                        if(detectionDevice()){
                            navigator.app.exitApp();
                        } else {
                            //alert('This option doesn\'t work in the browser');
                            location.reload();
                        }
                    }
                }, this,7,7);
                this.obj.alpha = 0.4;
                this.obj.fixedToCamera = true;
            },
            hide:function(){
                if(this.obj) this.obj.destroy();
            }
        },
        no: { // toolsGame.buttons.no.show(x,y,'quit');
            obj:false,
            show:function(x,y,type){
                if(this.obj) this.obj.destroy();
                this.obj = game.add.button(x*tileSize, y*tileSize, 'buttonsWindowMenu', function(){
                    if(type==='quit') {
                        toolsGame.buttons.no.hide();
                        toolsGame.buttons.yes.hide();
                        //toolsGame.windows.boxMenu.obj.destroy();
                        if(this.obj) {
                            var hide = game.add.tween(toolsGame.windows.boxMenu.obj).to({alpha: 0}, 200, Phaser.Easing.Linear.None, true);
                            hide.onComplete.add(function(o){
                                o.destroy();
                            }, this);
                        }
                        toolsGame.windows.boxMenu.obj = false;
                        toolsGame.text.hide('quit-1');

                        toolsGame.buttons.openBoxMenu.show();
                        toolsGame.buttons.levels.show();
                        toolsGame.buttons.play.show();
                        toolsGame.buttons.quit.show();

                    }
                }, this,8,8);
                this.obj.alpha = 0.4;
                this.obj.fixedToCamera = true;
            },
            hide:function(){
                if(this.obj) this.obj.destroy();
            }
        },


		navigations: {
			left:false,
			right:false,
			up:false,
			shot:false,
			show:function(){
				if(this.left) this.left.destroy();
			    this.left = game.add.button(0,(game.height-(7*tileSize)), 'buttonNavigation', function(){}, this,0,0); //#
			    this.left.alpha = 0.1;
			    this.left.fixedToCamera = true;
				this.left.onInputDown.add(function(){ triggerKeyboardEvent(window,37,"keydown"); });
				this.left.onInputUp.add(function(){ triggerKeyboardEvent(window,37,"keyup"); });

				if(this.right) this.right.destroy();
			    this.right = game.add.button(6*tileSize,game.height-(7*tileSize), 'buttonNavigation', function(){}, this,1,1); //#
			    this.right.alpha = 0.1;
			    this.right.fixedToCamera = true;
				this.right.onInputDown.add(function(){ triggerKeyboardEvent(window,39,"keydown"); });
				this.right.onInputUp.add(function(){ triggerKeyboardEvent(window,39,"keyup"); });

				/////
				if(this.shot) this.shot.destroy();
				this.shot = game.add.button((game.width-(7*tileSize)),(game.height-(13*tileSize)), 'buttonNavigation', function(){}, this,3,3); //#
				this.shot.alpha = toolsGame.mainElements.player.countBullets ? 0.1 : 0; // toolsGame.buttons.navigations.show.shot.alpha
                this.shot.inputEnabled = toolsGame.mainElements.player.countBullets ? true : false;
				this.shot.fixedToCamera = true;
				this.shot.onInputDown.add(function(){
					triggerKeyboardEvent(window,17,"keydown");
				});
				this.shot.onInputUp.add(function(){
					triggerKeyboardEvent(window,17,"keyup");
				});

                if(this.up) this.up.destroy();
                this.up = game.add.button((game.width-(7*tileSize)),(game.height-(7*tileSize)), 'buttonNavigation', function(){}, this,2,2); //#
                this.up.alpha = 0.1;
                this.up.fixedToCamera = true;
                this.up.onInputDown.add(function(){ triggerKeyboardEvent(window,38,"keydown"); });
                this.up.onInputUp.add(function(){ triggerKeyboardEvent(window,38,"keyup"); });

			},
			hide:function(){
                if(typeof this.left === "object" &&
                    typeof this.right === "object" &&
                    typeof this.up === "object" &&
                    typeof this.shot === "object"
                ) {
                    this.left.destroy();
                    this.right.destroy();
                    this.up.destroy();
                    this.shot.destroy();
                }
			}
		},
		levels: {
			obj:[],
			text:[],
            text2: [],
			show:function(){
				//toolsGame.buttons.levels
				var item=0, itemMoveX=0, itemMoveY=0, theEnd=false;
				//alert(levelFile.activeIdLevel + " =? " + unlockLevels + " =? " + getCookies("unlock-levels"));

                //console.log(Object.keys(game.cache._cacheMap[7]).length);
				for (var key in game.cache._cacheMap[7]) {
					if (game.cache._cacheMap[7].hasOwnProperty(key)) {
						item++;
						//console.log(key + " - " + item);
						this.obj.push(item);
						this.text.push(item);
                        this.text2.push(item);

                        if(item>9) {
                            itemMoveX=45*tileSize;
                            itemMoveY=5*tileSize;
                        }

                        theEnd=false;
                        if(item === Object.keys(game.cache._cacheMap[7]).length) {
                            theEnd = '?'
                        }
                        if(item<=unlockLevels || theEnd) {
                            this.obj[item] = game.add.button(5*tileSize*(item-1)+(3*tileSize)-itemMoveX, 17*tileSize+itemMoveY, 'buttonLevel', function(){
                                //console.log(this);
                                levelFile.name='level'+this;
                                levelFile.activeIdLevel=this;
                                //alert(toolsGame.mainElements.player.numberLifes);
                                toolsGame.resetGameCookies();
                                startGame();
                            }, item, 0);
                            this.text2[item] = game.add.text(0, 0, (theEnd)?'Credits':"(" + (getCookies('coins-procent-'+item)?getCookies('coins-procent-'+item):0) +"%)" , {font: "12px Arial", fill: "#ffffff", boundsAlignH: "center", boundsAlignV: "middle"});
                            this.text2[item].setTextBounds(0, 0, 4*tileSize, 7*tileSize);
                            this.obj[item].addChild(this.text2[item]);
                        } else {
                            this.obj[item] = game.add.button(5*tileSize*(item-1)+(3*tileSize)-itemMoveX, 17*tileSize+itemMoveY, 'buttonLevel', function(){
                                // nothing to do
                            }, item, 1, 1);
                        }

                        this.text[item] = game.add.text(0, 0, (theEnd)?theEnd:item, {font: "24px Arial", fill: "#ffffff", boundsAlignH: "center", boundsAlignV: "middle"});
                        this.text[item].setTextBounds(0, 0, 4*tileSize, 4.5*tileSize);
                        this.obj[item].alpha = 0.8;
                        this.obj[item].addChild(this.text[item]);
                        this.obj[item].fixedToCamera = true;

					}
				}
                amountLevels = item;
				//console.log("levels: " + amountLevels);
				//alert(this.start.length);
			},
			hide:function(){
				//alert(toolsGame.buttons.levels.obj.length);
				for(var i=1, iLength=this.obj.length; i<iLength; i++) {
					//console.log(this.obj[i]);
					this.obj[i].destroy();
				}
				this.obj=[];
				this.text=[];
                this.text2=[];

			}
		}
	},
	text: {
		obj: [],
		show: function(typeText,x,y,opacitySpec,textSpec,fontSpec,colorSpec,cameraFixed,idName,textShadow){
			if(this.obj[idName]) this.obj[idName].destroy();
			this.obj.push(idName);
			if(typeText === 'center')
			{
			    this.obj[idName] = game.add.text(x, y, textSpec, { font: fontSpec, fill: colorSpec, boundsAlignH: "center", boundsAlignV: "middle"  });
			    this.obj[idName].setTextBounds(x, y, game.width, game.height);
			}
			else 
			{
				this.obj[idName] = game.add.text(x, y, textSpec, { font: fontSpec, fill: colorSpec });			
			}		
		    this.obj[idName].alpha = opacitySpec;
		    this.obj[idName].fixedToCamera = cameraFixed;
		    if(textShadow) {
                this.obj[idName].setShadow(1, -1, 'rgba(0,0,0,1)', 0);
            }
            if(typeText === 'add-point') {
                //game.physics.arcade.enable([ this.obj[idName] ]);
		        //console.log(this.obj[idName]);
                //this.obj[idName].enableBody = true;
                //this.obj[idName].body.allowGravity = false;
                //this.obj[idName].body.velocity.y=-50;
                game.add.tween(this.obj[idName]).to({y: (y-48)}, 900, Phaser.Easing.Linear.None, true);

                game.time.events.add(600,
                    function() {
                        var tween = game.add.tween(this.obj[idName]).to({alpha: 0}, 300, Phaser.Easing.Linear.None, true);
                        tween.onComplete.add(function(o){
                            o.destroy();
                        }, this);
                    }, this
                );
            }

		},
		hide: function(idName){
			this.obj[idName].destroy();
		}
	},
    image: {
        obj: [],
        show: function(x,y,nameSpriteOrImage,idName,opacitySpec,cameraFixed,scaleW,scaleH,frame,fade){
            if(this.obj[idName]) this.obj[idName].destroy();
            this.obj.push(idName);
            this.obj[idName] = game.add.image(x, y, nameSpriteOrImage);
            if(opacitySpec) this.obj[idName].alpha = opacitySpec;
            if(cameraFixed) this.obj[idName].fixedToCamera = cameraFixed;
            if(scaleW && scaleH) this.obj[idName].scale.setTo(scaleW,scaleH);﻿
            if(frame) this.obj[idName].frame = frame;﻿
            if(fade) {
                this.obj[idName].alpha=0;
                game.add.tween(this.obj[idName]).to({alpha: opacitySpec?opacitySpec:1}, 200, Phaser.Easing.Linear.None, true);
            }

        },
        hide: function(idName,fade){
            if(this.obj[idName]) {
                if(fade) {
                    var hide = game.add.tween(this.obj[idName]).to({alpha: 0}, 200, Phaser.Easing.Linear.None, true);
                    hide.onComplete.add(function(o){
                        o.destroy();
                    }, this);
                } else {
                    this.obj[idName].destroy();
                }
            }
        }
    },

	createCenterObject: function(thatObj,x,y,name,type) {
		var width = game.cache.getImage(name).width,
            height = game.cache.getImage(name).height;
		if(type === "sprite") {
			width = game.cache._cache.image[name].frameWidth;
            height = game.cache._cache.image[name].frameHeight;
		}
        return thatObj.create(x+(2*tileSize)-(width﻿/2+tileSize+tileSize/2), y-height, name);
	},
    createLeftObject: function(thatObj,x,y,name,type) {
        var height = game.cache.getImage(name).height;
        if(type == "sprite") {
            height = game.cache._cache.image[name].frameHeight;
        }
        return thatObj.create((x*tileSize), (y*tileSize)-(height-2*tileSize), name);
    },
    checkSpecialBlankBlockElement: function(lay) {
        if(lay.index === 51) {
            lay.collideDown=true;
            lay.collideUp=true;
            lay.collideLeft=true;
            lay.collideRight=true;
        }
    },
	mainElements: {
		player:{
		    detectionHoldOnObject:function(o,numberAlgo) { // toolsGame.mainElements.player.detectionHoldOnObject()
                if(this.obj.position.x>o.position.x-game.width/numberAlgo &&
                    this.obj.position.x<o.position.x+game.width/numberAlgo &&
                    this.obj.position.y>o.position.y-game.height/numberAlgo &&
                    this.obj.position.y<o.position.y+game.height/numberAlgo) {
                    return true;
                } else {
                    return false;
                }
            },
            detectionHoldOnTile:function(x,y,numberAlgo) { // toolsGame.mainElements.player.detectionHoldOnObject()
                if(this.obj.position.x>x*tileSize-game.width/numberAlgo &&
                    this.obj.position.x<x*tileSize+game.width/numberAlgo &&
                    this.obj.position.y>y*tileSize-game.height/numberAlgo &&
                    this.obj.position.y<y*tileSize+game.height/numberAlgo) {
                    return true;
                } else {
                    return false;
                }
            },
            countLifes:function(){ // toolsGame.mainElements.player.countLifes.f()
                //\\//
                if(!getCookies('Lifes')) {
                    toolsGame.mainElements.player.numberLifes = amountLife;
                } else {
                    toolsGame.mainElements.player.numberLifes = parseInt(getCookies('Lifes'));
                }

                if(!getCookies('main-Lifes')) {
                    toolsGame.mainElements.player.numberMainLifes = amountMainLife;
                } else {
                    toolsGame.mainElements.player.numberMainLifes = parseInt(getCookies('main-Lifes'));
                }

			},
            countCoins:function(){ // toolsGame.mainElements.player.countCoints.f()
                //\\//
                if(!getCookies('coins')) {
                    toolsGame.mainElements.player.numberCoins = 0;
                } else {
                    toolsGame.mainElements.player.numberCoins = parseInt(getCookies('coins'));
                }




                if(getCookies('coins-procent-' + levelFile.activeIdLevel)>0) {
                    toolsGame.mainElements.player.numberCoinsLevelProcentLastMemory = getCookies('coins-procent-' + levelFile.activeIdLevel);
                }
                else {
                    toolsGame.mainElements.player.numberCoinsLevelProcentLastMemory = 0;
                }

                toolsGame.mainElements.player.numberCoinsLevel = 0;
                toolsGame.mainElements.player.numberCoinsLevelProcent = 0;
                toolsGame.mainElements.logs.lengthBonusCoins = 0;

                //alert(getCookies('Lifes'));
                //toolsGame.mainElements.player.numberCoins = parseInt(getCookies('coins'));
            },
            lostLife: function(player,amount) {
				if(!player.holdLostLife) {
					player.holdLostLife = true;
					if (!levelFile.blockedKeys && toolsGame.mainElements.player.numberLifes > 0) {
						toolsGame.mainElements.player.numberLifes -= amount?amount:1;
						toolsGame.audio.scream();
                        player.scale.setTo(1,1);
                        this.scale(); // same === toolsGame.mainElements.player.scale();
					}
                    if (toolsGame.mainElements.player.numberLifes < 1) {


                        if(!levelFile.blockedKeys && !toolsGame.mainElements.player.gameOver) {
                            // player.body.x=saveX;
                            // player.body.y=saveY;

                            // shake durning lost Life
                            game.camera.shake(0.02, 450, true, Phaser.Camera.SHAKE_VERTICAL);
                            toolsGame.audio.quake(1);
                            levelFile.blockedKeys = true;
                            toolsGame.mainElements.player.numberLifes=0;

                            // animation kill player
                            //console.log(toolsGame.mainElements.player.obj); //.events.onAnimationComplete
                            toolsGame.mainElements.player.obj.animations.play('kill-right');

                            toolsGame.mainElements.player.numberMainLifes--;
                            console.log("kill...");
                        }
                        if(toolsGame.mainElements.player.numberMainLifes === 0) {
                            toolsGame.mainElements.player.gameOver = true;
                            // game over
                            setTimeout(function(){
                                toolsGame.windows.boxMenu.show('game-over');
                                toolsGame.mainElements.player.gameOver = false;
                            },600);
                        } else {
                            setTimeout(function(){
                                toolsGame.mainElements.player.numberLifes=amountLife;
                                toolsGame.windows.boxTopMenu.f=false;
                                setTimeout(function () {
                                    levelFile.blockedKeys = false;
                                    facing = 'idle';
                                },1000);
                            },1200);
                        }
					}

					clearTimeout(player.timeoutKill);
					player.timeoutKill = setTimeout(function () {
						player.holdLostLife = false;
						player.alpha = 1;
						//if(levelFile.blockedKeys) player.alpha = 0;
						clearInterval(player.fltTime);
					}, 800);

					// postac miga podczas kolizji z imtruzem/layerem z duzej wysokosci ubytek zycia
					player.fltTime = setInterval(function () {
						player.alpha = (player.alpha === 0.4) ?  1 : 0.4;
					},50);
				}
                toolsGame.windows.boxTopMenu.f=false;
            },
            checkIfWasKilledAndOther: function(player,type){
                if(!theEndCredits) {
                    if(player.touchGround) { // toolsGame.mainElements.player.obj.touchGround
                        clearTimeout(player.touchGroundTime);
                        player.touchGround=false;
                    }

                    // fix foe kladki-poziom - dopracowac
                    if(type==='kladki-poziom') {
                        player.onGround = true;
                    }
                    player.t1=true;
                    if(!player.onGround) {
                        toolsGame.audio.footStep();
                        console.log("step");
                        player.onGround=true;
                    }

                    if(cursors.left.isDown || cursors.right.isDown) {
                        toolsGame.audio.footStep();
                    }

                    //console.log(toolsGame.mainElements.player.obj.body.y);
                    //console.log(toolsGame.mainElements.player.obj.body.blocked.left);

                    //przetestować jeszcze
                    if(jumpKillF && !toolsGame.mainElements.player.obj.body.blocked.left && !toolsGame.mainElements.player.obj.body.blocked.right) {
                        if(toolsGame.mainElements.player.obj.body.y-jumpKillY > 250) {
                            game.camera.shake(0.02, 250, true, Phaser.Camera.SHAKE_VERTICAL);
                            toolsGame.audio.quake(1);
                        }
                        if(toolsGame.mainElements.player.obj.body.y-jumpKillY > 400) {
                            //alert("kill");
                            toolsGame.mainElements.player.lostLife(player,3);
                        }
                        //console.log('coordination: ' + jumpKillY + ' / ' + toolsGame.mainElements.player.obj.body.y);
                        jumpKillF = false;
                    }
                }

            },
			gun:{
				obj: false, //toolsGame.mainElements.player.gun.obj
				startGun: false, //toolsGame.mainElements.player.gun.startGun
				bullets:{
					obj: false, // toolsGame.mainElements.player.gun.bullets.obj
					restartBullets:function(){ // toolsGame.mainElements.player.gun.bullets.restartBullets()
						if(this.obj === true) 
						{
							this.obj.z=0;
							this.obj.destroy(true);
						}
					    this.obj = game.add.group();
					    this.obj.enableBody = true;
					    this.obj.createMultiple(9, 'bullet');
					    this.obj.setAll('anchor.x', 0.5);
					    this.obj.setAll('anchor.y', 1);
					}
				},
				visualGun:function(player){ // toolsGame.mainElements.player.gun.visualGun()
					if(this.obj)
					{
				    	if ((player.obj.frame>=6 && player.obj.frame<=11) || cursors.left.isDown)
						{
						    this.obj.scale.x = -1;
						    this.obj.reset(player.obj.x + 18, player.obj.y + 38);
				    	}
				    	else if ((player.obj.frame>=0 && player.obj.frame<=5) || cursors.right.isDown)
						{
						    this.obj.scale.x = 1;
								this.obj.reset(player.obj.x + 18, player.obj.y + 38);
				    	}
				    }
				},
				shot:function(player){ // toolsGame.mainElements.player.gun.shot()
			        if (fireButton.isDown)
			        {
					    if (player.countBullets > 0 && game.time.now > player.bulletTime)
					    {
					        //  Grab the first bullet we can from the pool
					        player.bullet = player.gun.bullets.obj.getFirstExists(false);

					        if (player.bullet)
					        {
					        	/////
                                //console.log("shot");
                                player.countBulletsF = true;
					    		player.countBullets--;
                                toolsGame.windows.boxTopMenu.f=false;
                                toolsGame.audio.shoot();

					        	clearTimeout(player.gun.startGun);
								if(!player.gun.obj)
								{ 
									player.gun.obj = game.add.image(player.obj.x, player.obj.y, "gun");
								}

					        	player.gun.startGun=setTimeout(function(){
					        		if(player.gun.obj)
					        		{
						        		player.gun.obj.destroy();
						        		player.gun.obj=false;
						        		clearTimeout(player.gun.startGun);
						        	}
					        	},1000);


						    	if ((player.obj.frame>=6 && player.obj.frame<=11) || cursors.left.isDown)
								{
									player.bullet.reset(player.obj.x + 10, player.obj.y + 42);
						    		player.bullet.body.velocity.x = -1400;
						    	}
						    	else if ((player.obj.frame>=0 && player.obj.frame<=5) || cursors.right.isDown)
								{
									player.bullet.reset(player.obj.x + 30, player.obj.y + 42);
						    		player.bullet.body.velocity.x = 1400;
						    	}
						    	//bullet.body.allowGravity = false;
					            player.bulletTime = game.time.now + 200;
					            //console.log(bullet.z);
					        }
					        else
					        {
					        	player.bullet=0;
					        	player.gun.bullets.restartBullets();
					        }
					    }
			        }
				}
			},
			bullet: false,//toolsGame.mainElements.player.bullet
			bulletTime: 0,//toolsGame.mainElements.player.bulletTime
            countBulletsF: false,
			countBullets: 6, //toolsGame.mainElements.player.countBullets
			jumpTimer: 0, //toolsGame.mainElements.player.jumpTimer
			obj: false,
			add:function(x,y){ //add visual player
				if(this.obj==false)
				{
					//toolsGame.mainElements.player.obj =  player
				    this.obj = game.add.sprite(x, (y-(4*tileSize)), 'dude');
				    game.physics.enable(this.obj, Phaser.Physics.ARCADE);
				    this.obj.body.bounce.y = 0.3;
				    this.obj.body.collideWorldBounds = true;
                    this.obj.animations.add('idle-right', [0, 1, 2, 3, 4, 5,0, 1, 2, 3, 4, 5,0, 1, 33, 3, 4, 5], 6, true);
                    this.obj.animations.add('idle-left', [6, 7, 8, 9, 10, 11, 6, 7, 8, 9, 10, 11, 6, 7, 34, 9, 10, 11], 6, true);

                    this.obj.animations.add('end-level', [38, 37, 36, 37, 38], 10, true); // false - animacja konczy sie na ostatnim slajdzie

                    this.obj.animations.add('jump-right', [25], 20, true);
                    this.obj.animations.add('jump-left', [26], 20, true);

                    this.obj.animations.add('kill-right', [28,29,30,31,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32], 16, false).onComplete.add(function(){
                    	toolsGame.mainElements.player.generateAgain = true;
                    	}, this);

				    this.obj.animations.add('left', [18, 19, 20, 21, 22, 23], 20, true);
				    this.obj.animations.add('right', [12, 13, 14, 15, 16, 17], 20, true);
				    //this.obj.body.allowGravity = false;
				    //game.camera.follow(this.obj);
				    game.camera.follow(this.obj, Phaser.Camera.FOLLOW_LOCKON, 0.1,0.1);
				    //console.log(game.camera.lerp);

				    this.gun.bullets.restartBullets();
				    if(!getCookies('bullets')) {
                        this.countBullets=amountBullet;
					} else {
                        this.countBullets=parseInt(getCookies('bullets'));
                    }
				    this.gun.obj=false;
                    saveX = x*tileSize;
                    saveY = y*tileSize;
                    //console.log(x + " x " + y);
				}
			},
            velocityNormal: playerJumpVelocityNormalSmall,
            velocityWater: playerJumpVelocityWaterSmall,
            scale: function(){ // toolsGame.mainElements.player.scale();
                var playerScale = toolsGame.mainElements.player.obj.scale.y !== 1;
                this.velocityNormal = (playerScale)?playerJumpVelocityNormalBig:playerJumpVelocityNormalSmall; // 530:430
                this.velocityWater = (playerScale)?playerJumpVelocityWaterBig:playerJumpVelocityWaterSmall; // 300:200
            }
		},
		intruzi:{ // toolsGame.mainElements.intruzi
			obj: true,
            id: 0,
			add: function(x,y,type) {
				//toolsGame.mainElements.intruzi.obj =  intruzi
                if(!this.typeIntruder || this.typeIntruder===3) {
                    this.typeIntruder=1;
                } else if(this.typeIntruder===1) {
                    this.typeIntruder=2;
                } else if(this.typeIntruder===2) {
                    this.typeIntruder=3;
                }
                //var typeIntruder = Math.floor(Math.random() * 3)+1; // 3 typy intruzów
                //console.log(this.typeIntruder);
				var intruz = this.obj.create(x, y-(2*tileSize), 'intruder'+type);
                intruz.type = type;
				game.physics.enable(intruz, Phaser.Physics.ARCADE);
				intruz.body.bounce.y = 0.4;
				intruz.body.collideWorldBounds = true;
				// intruz.animations.add('left', [6, 7, 8, 9, 10, 11], 10, true); //12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22
				// intruz.animations.add('right', [0, 1, 2, 3, 4, 5], 10, true);
                intruz.randomSpeed=fispeed[Math.floor(Math.random() * fispeed.length)];
                if(type===4) {
                    intruz.animations.add('left', [14,15,16,17,18,19,20,21,22,23,24,25,26,27], intruz.randomSpeed/8, true); //12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22
                    intruz.animations.add('right', [0,1,2,3,4,5,6,7,8,9,10,11,12,13], intruz.randomSpeed/8, true);
                    intruz.animations.add('idle-right', [6], 6, true);
                    intruz.animations.add('idle-left', [20], 6, true);
                    intruz.animations.add('kill', [28,29,30,31,32,33,34,35], 15, false);
                    intruz.animations.add('turn-left', [40,37], 5, false);
                    intruz.animations.add('turn-right', [41,37], 5, false);
                } else {
                    intruz.animations.add('left', [18, 19, 20, 21, 22, 23], intruz.randomSpeed/8, true); //12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22
                    intruz.animations.add('right', [12, 13, 14, 15, 16, 17], intruz.randomSpeed/8, true);
                    intruz.animations.add('idle-right', [0, 1, 2, 3, 4, 5,0, 1, 2, 3, 4, 5,0, 1, 33, 3, 4, 5], 6, true);
                    intruz.animations.add('idle-left', [6, 7, 8, 9, 10, 11, 6, 7, 8, 9, 10, 11, 6, 7, 34, 9, 10, 11], 6, true);
                    intruz.animations.add('kill', [28, 29, 30, 31, 32,39,40,41,42,43,44,45,46,47], 20, false);
                }
				intruz.randomMove=parseInt(Math.random() * 2) ?  'intruzRight' : 'intruzLeft';
				//console.log("c i");
			},
            collisionIntruz: function(intruz,destiny){ // toolsGame.mainElements.intruzi.collisionIntruz

                if(intruz.randomMove==='intruzRight' || intruz.randomMove==='intruzLeft') {
                    intruz.saveRandom = intruz.randomMove;
                } else {
                    intruz.saveRandom = 'intruzRight';
                }

			    var ftf=setInterval(function(){
                    if(isEven(Math.ceil(game.time.now/100)))
                    {
                        //if(destiny=="total-kill") intruz.alpha=0.2;
                        intruz.body.velocity.y = -30;
                    }
                    else
                    {
                        //intruz.alpha=1;
                    }
                    //intruz.scale.setTo(0.5,0.5);
                    if(destiny!=="total-kill")
                    {
                        if(intruz.type === 4) {
                            if(intruz.randomMove=='intruzRight') {
                                intruz.frame = 38;
                            }
                            else if(intruz.randomMove=='intruzLeft') {
                                intruz.frame = 39;
                            }
                        }

                        if(intruz.randomMove=='intruzRight' || intruz.randomMove=='intruzLeft')
                        {
                            intruz.randomMove='intruzStop';
                            toolsGame.mainElements.player.obj.body.velocity.y = -350;
                        }
                    }

                },1000/60);
                if(destiny==="total-kill")
                {
                    if(intruz.type===4) {
                        intruz.animations.add('left', [28,29,30,31,32,33,34,35], 15, false);
                        intruz.animations.add('right', [28,29,30,31,32,33,34,35], 15, false);
                    } else {
                        intruz.animations.add('left', [28, 29, 30, 31, 32,39,40,41,42,43,44,45,46,47], 20, false);
                        intruz.animations.add('right', [28, 29, 30, 31, 32,39,40,41,42,43,44,45,46,47], 20, false);
                    }
                    intruz.randomSpeed=0;
                    setTimeout(function(){
                        clearInterval(ftf);

                        intruz.randomSpeed=fispeed[Math.floor(Math.random() * fispeed.length)];
                        if(intruz.type===4) {
                            intruz.animations.add('left', [14,15,16,17,18,19,20,21,22,23,24,25,26,27], intruz.randomSpeed/8, true); //12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22
                            intruz.animations.add('right', [0,1,2,3,4,5,6,7,8,9,10,11,12,13], intruz.randomSpeed/8, true);
                        } else {
                            intruz.animations.add('left', [18, 19, 20, 21, 22, 23], intruz.randomSpeed / 8, true); //12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22
                            intruz.animations.add('right', [12, 13, 14, 15, 16, 17], intruz.randomSpeed / 8, true);
                        }
                        intruz.randomMove='intruzDelete';
                        //intruz.kill();
                    },500);
                }
                else
                {
                    setTimeout(function(){
                        clearInterval(ftf);
                        //intruz.randomMove='intruzRight'
                        console.log(intruz.saveRandom);
                        intruz.randomMove=intruz.saveRandom;
                        //intruz.alpha=1;
                    },100);
                }
                toolsGame.mainElements.player.obj.body.overlapY=0;
            },
            collisionBack: function(i) {
                if(!i.checkPosition) {
                    i.checkPosition = i.body.position.x;
                    setTimeout(function () {
                        //console.log(i.checkPosition + " - " + i.body.position.x);
                        if(Math.abs(i.checkPosition-i.body.position.x)<2) {
                            //console.log("stoi w miejscu");
                            if(i.randomMove === 'intruzRight') i.randomMove='intruzLeft';
                            else i.randomMove='intruzRight';
                        }
                        i.checkPosition = false;
                    },600);
                }
            }
		},
		coins:{
			obj: true,
			add: function(x,y) {
				//toolsGame.mainElements.coins.obj = coins
		        var coin = this.obj.create(x, y, 'coin');
				coin.animations.add('run',[0,1,2,3,4,5,6,7,8,8,7,6,5,4,3,2,1,0]);
				coin.animations.play('run', 18, true);


                // var fun = function () {
                //     var tween = game.add.tween(coin).to({y: (y*tileSize-16)}, 900, Phaser.Easing.Linear.None, true);
                //     //console.log(tween);
                //     tween.onComplete.add(function(){
                //         tween = game.add.tween(coin).to({y: (y*tileSize)}, 900, Phaser.Easing.Linear.None, true);
                //         tween.onComplete.add(fun, this);
                //     }, this);
                // };
                // fun();


				coin.body.allowGravity = false;
			}
		},

        logs:{
            obj: true,
            lengthBonusCoins: 0,
            add: function(x,y,isCoin) {
                //toolsGame.mainElements.log.obj = logs
                var log = this.obj.create(x, y-tileSize, 'log');
                log.animations.add('run');
                game.physics.enable(log, Phaser.Physics.ARCADE);
                //log.animations.play('run', 15, true);
                log.body.allowGravity = false;
                log.body.collideWorldBounds = true;
                log.body.immovable = true;
                if(isCoin) {
                    log.coin = true;
                }
            }
        },

        Lifes:{ //toolsGame.mainElements.Lifes.obj = Lifes
            obj: true,
            add: function(x,y) {
                //toolsGame.mainElements.Lifes.obj = Lifes
                var Life = this.obj.create(x, y, 'Life');
                Life.animations.add('run',[2,3,4,5,6,7,8,8,7,6,5,4,3,2,1,0,0,1]);
                Life.animations.play('run', 18, true);
                Life.body.allowGravity = false;
            }
        },
        LifeSingleS:{ //toolsGame.mainElements.Lifes.obj = Lifes
            obj: true,
            add: function(x,y) {
                var Life = this.obj.create(x, y, 'Life2');
                Life.animations.add('run',[4,5,6,7,8,8,7,6,5,4,3,2,1,0,0,1,2,3]);
                Life.animations.play('run', 18, true);
                Life.body.allowGravity = false;
            }
        },
		bulletsGuns:{
			obj: true,
			add: function(x,y) {
				//toolsGame.mainElements.bulletsGuns.obj = bullets_guns
		        var bullets_gun = this.obj.create(Math.round(x-5), Math.round(y-5), 'bullets_gun');
				bullets_gun.animations.add('run',[8,7,6,5,4,3,2,1,0,0,1,2,3,4,5,6,7,8]);
				bullets_gun.animations.play('run', 18, true);
				bullets_gun.body.allowGravity = false;
			}
		},
        keys: {
            obj: true,
            add: function(x,y) {
                var key = this.obj.create((x*tileSize), (y*tileSize), 'key');
                key.animations.add('run',[7,8,8,7,6,5,4,3,2,1,0,0,1,2,3,4,5,6]);
                key.animations.play('run', 18, true);
                key.body.allowGravity = false;
            }
        },
        locks: {
            obj: true,
            add: function(x,y,reverse) {
                var lock = this.obj.create((x*tileSize)+(reverse?tileSize:0), (y*tileSize), 'lock');
                if(reverse) lock.scale.x *= -1;
                lock.body.allowGravity = false;
            }
        },
        doors: {
            obj: true,
            add: function(x,y) {
                var door = toolsGame.createCenterObject(this.obj,x,y,"door");
                door.animations.add('run');
                //door.animations.play('run', 15, true);

                game.physics.enable(door, Phaser.Physics.ARCADE);
                //log.animations.play('run', 15, true);
                door.body.allowGravity = false;
                door.body.collideWorldBounds = true;
                door.body.immovable = true;
            }
        },
		cacti:{
			obj: true,
			add: function(x,y) {
                var cactus = toolsGame.createCenterObject(this.obj,x,y,"cactus");
				cactus.body.allowGravity = false;
			}
		},
		grassLeft: {
            obj: true,
            add: function(x,y) {
                var grass = toolsGame.createLeftObject(this.obj,x,y,"grassLr");
                grass.body.allowGravity = false;
            }
		},
        grassRight: {
            obj: true,
            add: function(x,y) {
                var grass = toolsGame.createLeftObject(this.obj,x,y,"grassLr");
                grass.body.allowGravity = false;
                grass.scale.x *= -1;
            }
        },
		caves:{
			obj: true,
			add: function(x,y) {
		        var cave = this.obj.create((x*tileSize)+(2*tileSize), (y*tileSize)-240, 'cave');
				cave.body.allowGravity = false;
			}
		},
        // blankTileS:{
        //     obj: true,
        //     add: function(x,y) {
        //         var blankTile = this.obj.create((x*tileSize), (y*tileSize), 'blank-tile');
        //
        //         game.physics.enable(blankTile, Phaser.Physics.ARCADE);
        //         blankTile.body.collideWorldBounds = true;
        //         blankTile.body.immovable = true;
        //
        //         blankTile.body.allowGravity = false;
        //     }
        // },
        building1s:{
            obj: true,
            add: function(x,y) {
                var building = toolsGame.createCenterObject(this.obj,x,y,"building1"); //this.obj.create((x*tileSize)+(2*tileSize)-(game.cache.getImage("building1").width﻿/2), (y*tileSize)-(game.cache.getImage("building1").height-tileSize), 'building1');
                building.body.allowGravity = false;
            }
        },
        building2s:{
            obj: true,
            add: function(x,y) {
                var building = toolsGame.createCenterObject(this.obj,x,y,"building2"); //this.obj.create((x*tileSize)+(2*tileSize)-(game.cache.getImage("building2").width﻿/2), (y*tileSize)-(game.cache.getImage("building2").height-tileSize), 'building2');
                building.body.allowGravity = false;
            }
        },
        building3s:{
            obj: true,
            add: function(x,y) {
                var building = toolsGame.createCenterObject(this.obj,x,y,"building3");
                building.body.allowGravity = false;
            }
        },
        mines:{
            obj: true,
            add: function(x,y) {
                var building2 = toolsGame.createCenterObject(this.obj,x+6.5,y,"mine-part-2","sprite");
                building2.animations.add('run',[0,1,2,3,4,5,4,3,2,1,0,6,7,8,9,10,9,8,7,6]);
                building2.animations.play('run', 12, true);

                building2.body.allowGravity = false;
                var building1 = toolsGame.createCenterObject(this.obj,x-0.2,y,"mine-part-1");
                building1.body.allowGravity = false;
            }
        },
        waters:{
            obj: true,
            add: function(x,y,type) {
                var water = toolsGame.createLeftObject(this.obj,x,y,type?type:"water","sprite");
                water.animations.add('run');
                water.animations.play('run', 16, true);
                water.body.allowGravity = false;
                water.alpha = type?.7:.7;
                if(type==='water-red') {
                    water.type='water-red';
                }
            }
        },
        firebs:{
            obj: true,
            add: function(x,y,randomStart,typeFire) {
                var fireb = toolsGame.createLeftObject(this.obj,x,y,typeFire?"fireb2":"fireb","sprite");
                if(!typeFire) {
                    fireb.animations.add('run1',[0,1,2,1]);
                    fireb.animations.add('run2',[3,4,5,4]);
                } else {
                    fireb.typeFire=true;
                }
                fireb.body.allowGravity = false;
                fireb.alpha = 0;
                fireb.randomStart = randomStart;
            }
        },
        splashs:{
            obj: true,
            add: function(x,y,type) {
                var splash = toolsGame.createCenterObject(this.obj,x,y,type?type:"splash","sprite");
                splash.animations.add('run').onComplete.add(function(s){
                    //toolsGame.mainElements.player.obj.gForceWaterOnlyeOne = false;
                    s.kill();
                }, this);
                splash.animations.play('run', 30, false);
                splash.body.allowGravity = false;
                splash.alpha = .6;
                toolsGame.audio.splash();
            }
        },
		endLevelS:{ //end_level_s
            obj: true, // toolsGame.mainElements.endLevelS.obj = end_level_s
            add: function(x,y) {

                var end_level = toolsGame.createCenterObject(this.obj,x,y,"end_level","sprite");
                //var end_level = this.obj.create((x*tileSize)-42, (y*tileSize)-110, 'end_level');
                end_level.animations.add('run');
                end_level.animations.play('run', 17, true);
                end_level.body.allowGravity = false;
            }
        },
        saveLevelS:{
            obj: true, // toolsGame.mainElements.endLevelS.obj = end_level_s
            add: function(x,y) {

                var save_level = toolsGame.createCenterObject(this.obj,x,y,"save_level","sprite");
                //var save_level = this.obj.create((x*tileSize)-42, (y*tileSize)-110, 'save_level');
                save_level.animations.add('run1',[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
                save_level.animations.add('run2',[18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]);
                save_level.animations.play('run1', 17, true);
                save_level.body.allowGravity = false;
            }
        },
		fire: {
            fireAnimation: function(that,x,y,type) {
                var fire = that.obj.create(x, y, type);
                fire.animations.add('run');
                fire.animations.play('run', randZakres(24,30), true);
                fire.alpha = .8;
                fire.body.allowGravity = false;
            },
            fireUpS:{
                obj: true,
                add: function(x,y) {
                    toolsGame.mainElements.fire.fireAnimation(this,(x*tileSize)-4,(y*tileSize)-8,'fire_up');
                }
            },
            fireDownS:{
                obj: true,
                add: function(x,y) {
                    toolsGame.mainElements.fire.fireAnimation(this,(x*tileSize)-4,(y*tileSize),'fire_down');
                }
            },
            fireLeftS:{
                obj: true,
                add: function(x,y) {
                    toolsGame.mainElements.fire.fireAnimation(this,(x*tileSize)-8,(y*tileSize)-4,'fire_left');
                }
            },
            fireRightS:{
                obj: true,
                add: function(x,y) {
                    toolsGame.mainElements.fire.fireAnimation(this,(x*tileSize),(y*tileSize)-4,'fire_right');
                }
            },
		},
        windmills:{
            obj: true,
            add: function(x,y) {
            	//alert(game.cache._cache.image["windmill"].frameWidth);
            	// console.log(game.cache);
            	// alert(game.cache.getImage("windmill"));
                var windmill = toolsGame.createCenterObject(this.obj,x,y,"windmill","sprite"); //  this.obj.create((x*tileSize)-52, (y*tileSize)-306, 'windmill');
                windmill.animations.add('run');
                windmill.animations.play('run', 20, true);
                windmill.body.allowGravity = false;
            }
        },
        windmillNewS:{ // toolsGame.mainElements.windmillNewS.obj
            obj1: true,
            obj2: true,
            add: function(x,y) {
                var w2 = toolsGame.createCenterObject(this.obj2,x,y,"windmill_2_new"); //this.obj2.create((x*tileSize), (y*tileSize)-200, 'windmill_2_new');
                w2.body.allowGravity = false;

                var w1 =  this.obj1.create(x+9, y-240, 'windmill_1_new'); //  this.obj.create((x*tileSize)-52, (y*tileSize)-306, 'windmill');
                w1.anchor.setTo(0.5, 0.5);
                w1.body.allowGravity = false;
            },
        },
		kladki:{
			kladkaPlayerBounceReset: true, // toolsGame.mainElements.kladki.kladkaPlayerBounceReset
			poziom: {
				obj: true, // toolsGame.mainElements.kladki.poziom.obj = kladki
				add: function(x,y){
			        var kladkaPoz = this.obj.create(x, y, 'kladka-short');
			        game.physics.enable(kladkaPoz, Phaser.Physics.ARCADE);
			        kladkaPoz.body.collideWorldBounds = true;
					kladkaPoz.body.allowGravity = false;
					kladkaPoz.body.immovable = true;
				}
			},
			//\\
            run: { // for vertical only
				startCollision: function (player,type) { // toolsGame.mainElements.kladki.run.startCollision(player,type)
                    if(!player.lock) {
                        if(!player.back) {
                            if(type === 'pionTopBack' || type === 'pionTop') player.body.velocity.y = 150;
                            else if(type === 'pionBottomBack' || type === 'pionBottom') player.body.velocity.y = -150;
                        } else {
                            if(type === 'pionTopBack' || type === 'pionTop') player.body.velocity.y = -150;
                            else if(type === 'pionBottomBack' || type === 'pionBottom') player.body.velocity.y = 150;
                        }
                    }
                    //console.log("player uderza w kladke");
                    player.isUp=true;
                    toolsGame.mainElements.player.obj.body.bounce.y = 0;
                    setTimeout(function(){
                        player.isUp=false;
                    },300);
                },
				endCollision: function (player,type) { // toolsGame.mainElements.kladki.run.endCollision(kladka,type)
                    player.lock = true;
                    //console.log("kladka uderza w layer");
                    clearTimeout(player.resetart1);
                    player.resetart1=setTimeout(function(){
                        if(type === 'pionTopBack') {
                            if(!player.back) player.body.velocity.y = -150;
						} else if(type === 'pionBottomBack') {
                            if(!player.back) player.body.velocity.y = 150;
                        }
                        player.back = player.back?false:true;
                        player.lock = false;
                    },2500);
                }
			},
			pionTopBack: {
				obj: true, // toolsGame.mainElements.kladki.pionTopBack.obj = pionTopBack
				add: function(x,y){
			        var kladkapionTopBack = this.obj.create(x, y, 'kladka-short');
			        game.physics.enable(kladkapionTopBack, Phaser.Physics.ARCADE);
                    kladkapionTopBack.body.collideWorldBounds = true;
                    kladkapionTopBack.body.allowGravity = false;
                    kladkapionTopBack.body.immovable = true;
                    kladkapionTopBack.body.orginalY=y;
				}
			},
            pionBottomBack: {
                obj: true, // toolsGame.mainElements.kladki.pionBottomBack.obj = pionBottomBack
                add: function(x,y){
                    var kladkapionBottomBack = this.obj.create(x, y, 'kladka-short');
                    game.physics.enable(kladkapionBottomBack, Phaser.Physics.ARCADE);
                    kladkapionBottomBack.body.collideWorldBounds = true;
                    kladkapionBottomBack.body.allowGravity = false;
                    kladkapionBottomBack.body.immovable = true;
                    kladkapionBottomBack.body.orginalY=y;
                }
            },
			pionTop: {
                obj: true, // toolsGame.mainElements.kladki.pionTop.obj = kladkipionTop
                add: function(x,y){
                    var kladkaPionTop = this.obj.create(x, y, 'kladka-short');
                    game.physics.enable(kladkaPionTop, Phaser.Physics.ARCADE);
                    kladkaPionTop.body.collideWorldBounds = true;
                    kladkaPionTop.body.allowGravity = false;
                    kladkaPionTop.body.immovable = true;
                    kladkaPionTop.body.orginalY=y;
                }
            },
            pionBottom: {
                obj: true, // toolsGame.mainElements.kladki.pionBottom.obj = kladkipionBottom
                add: function(x,y){
                    var kladkaPionBottom = this.obj.create(x, y, 'kladka-short');
                    game.physics.enable(kladkaPionBottom, Phaser.Physics.ARCADE);
                    kladkaPionBottom.body.collideWorldBounds = true;
                    kladkaPionBottom.body.allowGravity = false;
                    kladkaPionBottom.body.immovable = true;
                    kladkaPionBottom.body.orginalY=y;
                }
            }
		}
	},
	intruzCollisonBack: function (intruz) {  // toolsGame.intruzCollisonBack(intruz);
        var jumpTimerIntruz=0;
        if (intruz.body.onFloor() && game.time.now > jumpTimerIntruz)
        {
            intruz.body.velocity.y = -350;
            jumpTimerIntruz = game.time.now + 350;
        }
        if(jumpTimerIntruz!==0)
        {
            if(intruz.randomMove=='intruzLeft') intruz.randomMove='intruzRight';
            else if(intruz.randomMove=='intruzRight') intruz.randomMove='intruzLeft';
        }
    },
    intruzCollisonNoBack: function (intruz) {  // toolsGame.intruzCollisonBack(intruz);
        var jumpTimerIntruz=0;
        if (intruz.body.onFloor() && game.time.now > jumpTimerIntruz)
        {
            intruz.body.velocity.y = -350;
            jumpTimerIntruz = game.time.now + 350;
        }
    },
    addPoint: function (x,y,idName,text) {
        toolsGame.text.show('add-point',
           x,y,1,text, '700 15px Arial' ,'#ded4b8',false,idName,true
        );
        // to jest zbedne usuwanie jest zalatwiane po przez onComplete w show
        // setTimeout(function(idN){
        //     toolsGame.text.hide(idN);
        // },900,idName);
    }
}


var startGame=function(type,lastMap) {
    levelFile.readyLoad=false;
    levelFile.blockedKeys=false;

	if(type==="continuation") {
        levelFile.name='level'+unlockLevels;
        levelFile.activeIdLevel = parseInt(unlockLevels);
	}


	game.physics.startSystem(Phaser.Physics.ARCADE);

    // wykrywanie otatniego levelu dla Credits
    theEndCredits = false;
    if(Object.keys(game.cache._cacheMap[7]).length === levelFile.activeIdLevel) {
        theEndCredits = true;
    }

    toolsGame.preloader.add(13,14,lastMap);

	//odmierzanie czasu co 1s
	timer = game.time.create(false);
	timerTotal=0;
	timer.loop(1000, function(){
	    timerTotal++
    }, this);
	timer.start();

	game.time.advancedTiming = true;
    game.time.desiredFps = ($(window).width()<800)?40:50;
    //game.time.desiredFps = 60;

	//reset inkubatorow
    wspInkub=[];

    //reset klucza/y
    keys=0;

	//usuwanie przyciskow leveli
	toolsGame.buttons.levels.hide();

	//usuwanie logo text
	toolsGame.text.hide('logoText');

	// usuwanie tla menu
	bgMenu.destroy();

	//usuwanie przycisku menu
	toolsGame.buttons.openBoxMenu.hide();

    //game.time.slowMotion = 1.0;

	//cookies Lifes
    toolsGame.mainElements.player.countLifes();

    //cookies coins
    toolsGame.mainElements.player.countCoins();

    var loaderSpeed = 300;
    if(theEndCredits) {
        if(lastMap) {
            loaderSpeed = 2000;
        } else {
            loaderSpeed = 0;
        }
    }

    setTimeout(function(){

	    map = game.add.tilemap(levelFile.name);
	    map.addTilesetImage('tiles-1');
        levelFile.blockedKeys=false;
        
	    //console.log(proportiesMap[levelFile.activeIdLevel]);


	    // map.setTileIndexCallback(9, function(objectCollision,mapElement){
	    // 	if(objectCollision.key=="dude")
	    // 	{
	    // 		//objectCollision.alpha=0.5; // to jest player
	    // 		//console.log(objectCollision.key);
	    // 		//console.log(map);
	    // 		//console.log(map + " | " + map.getTile(65, 75, layer, true).index);
	    // 	}
	    // }, this);

		// ta funkcja dziala tak ze player calkowicie pozbawiany jest blkowania przy tej kolizji
        // map.setTileIndexCallback([109,110,111,112], function(objectCollision,mapElement){
        //     if(objectCollision.key==="dude")
        //     {
        //         console.log("test collision");
        //     }
        //     return false;
        // }, this);

	    map.setCollisionByExclusion(
	        [101, 102, 205, 206, 207, 201, 202, 203,
                301, 302, 303, 304, 305, 306,
                401, 402, 403, 404, 405, 406, 407, 451, 452, 453, 454, 455, 456, 457, 459,
                552,
                651,652,653,654,655,656,657,658,659,660,661,662,
                701,702,703,704,705,706,707,708,
                751,752,753,754,755,756,757,758,
                801,802,803,804,805,806,
                807,808,809,810,811,812,813,814,815,816,817,818,819,820,821,822,823,824,825,
                857,858,859,860,861,862,863,864,865,866,867,868,869,870,871,872,873,874,875,
                851,852,853,854,855,856,
                901,902,903,904,905,906,
                209,210,211,212,259,260,261,262,
                309,310,311,312,
                1013,1014,1015]);

		//ladowanie background tla dla daenj mapy z jsona
		if(proportiesMap[levelFile.activeIdLevel].backgroundColor)
		{
			levelFile.backgroundColor=proportiesMap[levelFile.activeIdLevel].backgroundColor;
		}
		else
		{
			levelFile.backgroundColor='#4488AA';
		}
        toolsGame.bgSet(levelFile.backgroundColor);


	    if(!proportiesMap[levelFile.activeIdLevel].background)
	    {
	    	levelFile.backgroundLevel='none';
	    }
	    else // jesli jest to laduje obrazek
	    {
	        var credits=false;

            if(Object.keys(game.cache._cacheMap[7]).length === levelFile.activeIdLevel) {
                credits=true;
            }

	    	levelFile.backgroundLevel=proportiesMap[levelFile.activeIdLevel].background;
		    // obrazek o rozmiarze 1600px specjalnie pod parallaxe...
		    bg = game.add.sprite(0, credits?0:(game.height-game.cache.getImage(levelFile.backgroundLevel).height), levelFile.backgroundLevel);
		    bg.width=game.cache.getImage(levelFile.backgroundLevel).width﻿; //100*tileSize;
		    bg.height=game.cache.getImage(levelFile.backgroundLevel).height﻿; //28.125*tileSize;
		    bg.fixedToCamera = credits?false:true;

            if(proportiesMap[levelFile.activeIdLevel].backgroundSecond) {
                bg2 = game.add.sprite(0, (game.height-game.cache.getImage(proportiesMap[levelFile.activeIdLevel].backgroundSecond).height), proportiesMap[levelFile.activeIdLevel].backgroundSecond);
                bg2.width=game.cache.getImage(proportiesMap[levelFile.activeIdLevel].backgroundSecond).width﻿;
                bg2.height=game.cache.getImage(proportiesMap[levelFile.activeIdLevel].backgroundSecond).height﻿;
                bg2.fixedToCamera = true;
			}

			if(proportiesMap[levelFile.activeIdLevel].parallax)
			{
				levelFile.backgroundParallax=true;
			}
			else
			{
				levelFile.backgroundParallax=false;
			}

	    }
		
	    //alert(map.width + ' x ' + map.height);
	    if(proportiesMap[levelFile.activeIdLevel].fog)
	    {
	    	var heightLessForGround=tileSize*4; // default
	    	var algoPosit=25/(tileSize/10);
	    	var moveY = proportiesMap[levelFile.activeIdLevel].fogPositionY?proportiesMap[levelFile.activeIdLevel].fogPositionY:0; // default 0

			oFog = game.add.tileSprite(-(map.width*tileSize), ((map.height-algoPosit)*tileSize)-heightLessForGround-moveY, ((2*map.width)*tileSize), (algoPosit*tileSize), proportiesMap[levelFile.activeIdLevel].fog);
            //oFog.fixedToCamera = true;
	    }

	    if(proportiesMap[levelFile.activeIdLevel].positionGround) {
            var positionGround = 6*tileSize; // default
            if(Number.isInteger(proportiesMap[levelFile.activeIdLevel].positionGround)) {
                positionGround = proportiesMap[levelFile.activeIdLevel].positionGround;
            }
            ground = game.add.tileSprite(-(map.width*tileSize), (map.height*tileSize)-positionGround-1, ((2*map.width)*tileSize), map.height*tileSize, 'ground');
        }

	    //layer = map.createLayer('Tile Layer 1');
	    //console.log(map + " | " + map.getTile(65, 75, layer, true).index);
	    //  Un-comment this on to see the collision tiles
	    // layer.debug = true;
	    //layer.resizeWorld();

		//console.log(game.world.width + "x" + game.world.height);

	    game.physics.arcade.gravity.y = 750;

	    cursors = game.input.keyboard.createCursorKeys();
	    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.UP);
	    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);



	    //ustawianie obiektow wg indexow mapy
	    //kolejnosc wyznacza z-index warstwy

		toolsGame.mainElements.caves.obj = game.add.group();
		toolsGame.mainElements.caves.obj.enableBody = true;

        toolsGame.mainElements.building1s.obj = game.add.group();
        toolsGame.mainElements.building1s.obj.enableBody = true;

        toolsGame.mainElements.building2s.obj = game.add.group();
        toolsGame.mainElements.building2s.obj.enableBody = true;

        toolsGame.mainElements.building3s.obj = game.add.group();
        toolsGame.mainElements.building3s.obj.enableBody = true;

        toolsGame.mainElements.mines.obj = game.add.group();
        toolsGame.mainElements.mines.obj.enableBody = true;

		toolsGame.mainElements.cacti.obj = game.add.group();
		toolsGame.mainElements.cacti.obj.enableBody = true;

        toolsGame.mainElements.grassLeft.obj = game.add.group();
        toolsGame.mainElements.grassLeft.obj.enableBody = true;

        toolsGame.mainElements.grassRight.obj = game.add.group();
        toolsGame.mainElements.grassRight.obj.enableBody = true;

	    toolsGame.mainElements.endLevelS.obj = game.add.group();
	    toolsGame.mainElements.endLevelS.obj.enableBody = true;


        layer = map.createLayer('levels');
        layer.resizeWorld();
        console.log(map);

        map.layers.forEach(function(m){
            // console.log(m.name);
            if(m.name === 'levels-front') {
                layerFront = map.createLayer('levels-front');
                layerFront.resizeWorld();
            }
        });


        toolsGame.mainElements.keys.obj = game.add.group();
        toolsGame.mainElements.keys.obj.enableBody = true;

        toolsGame.mainElements.locks.obj = game.add.group();
        toolsGame.mainElements.locks.obj.enableBody = true;

        toolsGame.mainElements.doors.obj = game.add.group();
        toolsGame.mainElements.doors.obj.enableBody = true;

        toolsGame.mainElements.saveLevelS.obj = game.add.group();
        toolsGame.mainElements.saveLevelS.obj.enableBody = true;

        toolsGame.mainElements.fire.fireUpS.obj = game.add.group();
        toolsGame.mainElements.fire.fireUpS.obj.enableBody = true;

        toolsGame.mainElements.fire.fireDownS.obj = game.add.group();
        toolsGame.mainElements.fire.fireDownS.obj.enableBody = true;

        toolsGame.mainElements.fire.fireLeftS.obj = game.add.group();
        toolsGame.mainElements.fire.fireLeftS.obj.enableBody = true;

        toolsGame.mainElements.fire.fireRightS.obj = game.add.group();
        toolsGame.mainElements.fire.fireRightS.obj.enableBody = true;

        toolsGame.mainElements.windmills.obj = game.add.group();
        toolsGame.mainElements.windmills.obj.enableBody = true;

        toolsGame.mainElements.windmillNewS.obj2 = game.add.group();
        toolsGame.mainElements.windmillNewS.obj2.enableBody = true;

        toolsGame.mainElements.windmillNewS.obj1 = game.add.group();
        toolsGame.mainElements.windmillNewS.obj1.enableBody = true;

		toolsGame.mainElements.bulletsGuns.obj = game.add.group();
		toolsGame.mainElements.bulletsGuns.obj.enableBody = true;

        toolsGame.mainElements.logs.obj = game.add.group();
        toolsGame.mainElements.logs.obj.enableBody = true;

        toolsGame.mainElements.Lifes.obj = game.add.group();
        toolsGame.mainElements.Lifes.obj.enableBody = true;

        toolsGame.mainElements.LifeSingleS.obj = game.add.group();
        toolsGame.mainElements.LifeSingleS.obj.enableBody = true;

        toolsGame.mainElements.coins.obj = game.add.group();
        toolsGame.mainElements.coins.obj.enableBody = true;

        toolsGame.mainElements.intruzi.obj = game.add.group();
        toolsGame.mainElements.intruzi.obj.enableBody = true;

        toolsGame.mainElements.kladki.poziom.obj = game.add.group();
        toolsGame.mainElements.kladki.poziom.obj.enableBody = true;

        toolsGame.mainElements.kladki.pionTopBack.obj = game.add.group();
        toolsGame.mainElements.kladki.pionTopBack.obj.enableBody = true;

        toolsGame.mainElements.kladki.pionBottomBack.obj = game.add.group();
        toolsGame.mainElements.kladki.pionBottomBack.obj.enableBody = true;

        toolsGame.mainElements.kladki.pionTop.obj = game.add.group();
        toolsGame.mainElements.kladki.pionTop.obj.enableBody = true;

        toolsGame.mainElements.kladki.pionBottom.obj = game.add.group();
        toolsGame.mainElements.kladki.pionBottom.obj.enableBody = true;

        toolsGame.mainElements.player.obj=false;

        toolsGame.mainElements.firebs.obj = game.add.group();
        toolsGame.mainElements.firebs.obj.enableBody = true;

        // woda ma miec wyzszy z-index od playera dlatego w tym miejscu
        toolsGame.mainElements.waters.obj = game.add.group();
        toolsGame.mainElements.waters.obj.enableBody = true;

        // dodanie spashy wody
        toolsGame.mainElements.splashs.obj = game.add.group();
        toolsGame.mainElements.splashs.obj.enableBody = true;



        toolsGame.mainElements.firebs.obj = game.add.group();
        toolsGame.mainElements.firebs.obj.enableBody = true;

        // woda ma miec wyzszy z-index od playera dlatego w tym miejscu
        toolsGame.mainElements.waters.obj = game.add.group();
        toolsGame.mainElements.waters.obj.enableBody = true;

        // dodanie spashy wody
        toolsGame.mainElements.splashs.obj = game.add.group();
        toolsGame.mainElements.splashs.obj.enableBody = true;



        if(map.objects.objects) {
            map.objects.objects.forEach(function(o){
                //console.log(o);


                //generowanie jaskini
                if (o.gid===1)
                {
                    toolsGame.mainElements.caves.add(o.x,o.y);

                }

                //generowanie building1
                if (o.gid===2)
                {
                    toolsGame.mainElements.building1s.add(o.x,o.y);

                }

                //generowanie building2
                if (o.gid===4)
                {
                    toolsGame.mainElements.building2s.add(o.x,o.y);
                }

                //generowanie building3
                if (o.gid===5)
                {
                    toolsGame.mainElements.building3s.add(o.x,o.y);
                }

                //generowanie mine
                if (o.gid===6)
                {
                    toolsGame.mainElements.mines.add(o.x,o.y);

                }

                //generowanie kaktusow
                if (o.gid===504)
                {
                    toolsGame.mainElements.cacti.add(o.x,o.y);

                }

                //generowanie trawy z lewej
                if (o.gid===511)
                {
                    toolsGame.mainElements.grassLeft.add(o.x,o.y);

                }

                //generowanie trawy z prawej
                if (o.gid===512)
                {
                    toolsGame.mainElements.grassRight.add(o.x,o.y);

                }

                //generowanie konca levelu
                if (o.gid===601)
                {
                    toolsGame.mainElements.endLevelS.add(o.x,o.y);

                }

                //generowanie klucza
                if (o.gid===515)
                {
                    toolsGame.mainElements.keys.add(o.x,o.y);

                }

                //generowanie drzwi
                if (o.gid===516)
                {
                    toolsGame.mainElements.doors.add(o.x,o.y);

                }
                //generowanie zamków/locks
                if (o.gid===517) //lewy
                {
                    toolsGame.mainElements.locks.add(o.x,o.y);

                }
                if (o.gid===467) //prawy
                {
                    toolsGame.mainElements.locks.add(o.x,o.y,true);

                }


                //generowanie zapisywania levelu
                if (o.gid===602)
                {
                    toolsGame.mainElements.saveLevelS.add(o.x,o.y);

                }

                //generowanie ognia up
                if (o.gid===111)
                {
                    toolsGame.mainElements.fire.fireUpS.add(o.x,o.y);

                }

                //generowanie ognia down
                if (o.gid===110)
                {
                    toolsGame.mainElements.fire.fireDownS.add(o.x,o.y);

                }

                //generowanie ognia left
                if (o.gid===109)
                {
                    toolsGame.mainElements.fire.fireLeftS.add(o.x,o.y);

                }

                //generowanie ognia right
                if (o.gid===112)
                {
                    toolsGame.mainElements.fire.fireRightS.add(o.x,o.y);

                }

                //generowanie windmillNewS.add();
                if (o.gid===3)
                {
                    toolsGame.mainElements.windmillNewS.add(o.x,o.y);

                }

                //generowanie inkubatora
                if (o.gid===552)
                {
                    wspInkub.push(x*tileSize + "," + y*tileSize);
                }

                if(o.gid===503)
                {
                    toolsGame.mainElements.bulletsGuns.add(o.x,o.y);
                }

                // generating Life main
                if (o.gid===510)
                {
                    toolsGame.mainElements.Lifes.add(o.x,o.y);
                }

                // generating Life single
                if (o.gid===460)
                {
                    toolsGame.mainElements.LifeSingleS.add(o.x,o.y);
                }

                //generowanie monet
                if (o.gid===502)
                {
                    toolsGame.mainElements.coins.add(o.x,o.y);
                }

                //generowanie animowanych klod
                if (o.gid===513)
                {
                    toolsGame.mainElements.logs.add(o.x,o.y);
                }

                //generowanie animowanych klod z niespodzianka
                if (o.gid===514)
                {
                    toolsGame.mainElements.logs.add(o.x,o.y,true);
                    toolsGame.mainElements.logs.lengthBonusCoins ++;
                }

                //generowanie nabojow
                if (o.gid===503)
                {
                    toolsGame.mainElements.bulletsGuns.add(o.x,o.y);
                }

                //generowanie intruzow typ 1
                if (o.gid===551)
                {
                    toolsGame.mainElements.intruzi.add(o.x,o.y,1);
                }
                //generowanie intruzow typ 2
                if (o.gid===553)
                {
                    toolsGame.mainElements.intruzi.add(o.x,o.y,2);
                }
                //generowanie intruzow typ 3
                if (o.gid===554)
                {
                    toolsGame.mainElements.intruzi.add(o.x,o.y,3);
                }
                //generowanie intruzow typ 4 snake
                if (o.gid===555)
                {
                    toolsGame.mainElements.intruzi.add(o.x,o.y,4);
                }

                //generowanie kladki poziomej
                if (o.gid===505)
                {
                    toolsGame.mainElements.kladki.poziom.add(o.x,o.y);
                }

                //generowanie kladki pionowej top back
                if (o.gid===506)
                {
                    toolsGame.mainElements.kladki.pionTopBack.add(o.x,o.y);
                }

                //generowanie kladki pionowej bottom back
                if (o.gid===509)
                {
                    toolsGame.mainElements.kladki.pionBottomBack.add(o.x,o.y);
                }

                //generowanie kladki pionowej top
                if (o.gid===507)
                {
                    toolsGame.mainElements.kladki.pionTop.add(o.x,o.y);
                }

                //generowanie kladki pionowej bottom
                if (o.gid===508)
                {
                    toolsGame.mainElements.kladki.pionBottom.add(o.x,o.y);
                }

                //generowanie playera
                if (o.gid===501)
                {
                    //player moze byc tylko jeden wiec tylko raz jest genrowany
                    toolsGame.mainElements.player.add(o.x,o.y);
                }

                // generowanie ryb
                if (o.gid===520)
                {
                    toolsGame.mainElements.firebs.add(o.x,o.y,randZakres(1,6));
                }



                // generowanie ognistej kuli
                if (o.gid===521)
                {
                    toolsGame.mainElements.firebs.add(o.x,o.y,randZakres(1,6),true);
                }

                //generowanie wody
                if (o.gid===518)
                {
                    toolsGame.mainElements.waters.add(o.x,o.y);
                }
                if (o.gid===519)
                {
                    toolsGame.mainElements.waters.add(o.x,o.y,'water-red');
                }
            });
        }

        if(!toolsGame.mainElements.logs.lengthBonusCoins) toolsGame.mainElements.logs.lengthBonusCoins = 0;
        oneHP = toolsGame.mainElements.coins.obj.children.length + toolsGame.mainElements.logs.lengthBonusCoins;

		playGame.main=true;
		//console.log(game.world.width + "x" + game.world.height);
        toolsGame.audio.bg.play(0.04,proportiesMap[levelFile.activeIdLevel].bgAudio);
		game.load.start();
	},loaderSpeed);

	toolsGame.buttons.play.hide();
    toolsGame.buttons.quit.hide();
};

//laduje sie n* kazde kolejny restart
var create=function() {
    console.log("test-create");
	// ladowanie tla dla menu i domyslnego dla mapy gry
    unlockLevels=(parseInt(getCookies("unlock-levels"))>1)?getCookies("unlock-levels"):1;
    toolsGame.bgSet('#dfe4ff');
    //toolsGame.bgSet('#000000');
    bgMenu = game.add.image(0, 0, 'backgroundMenu');
    bgMenu.fixedToCamera = true;

    toolsGame.buttons.play.show();
    toolsGame.buttons.quit.show();
	
	toolsGame.text.show(false,game.width-165,game.height-25,.9,'semDesign Game (' + (detectionDevice() ? 'Android' : 'Browser') + ')', '400 12px Arial' ,'#000000',true,'logoText');

	toolsGame.buttons.openBoxMenu.show();

	toolsGame.buttons.levels.show();
    console.log('mute: ' + (getCookies('mute')?true:false));
    game.sound.mute = getCookies('mute')?true:false;

    // fix for repeat onload
    var onlyOneLoad=true;
    game.load.onLoadComplete.add(function() {
        if(onlyOneLoad) {
            toolsGame.preloader.hide();
            // theEndCredits = false;
            // if(Object.keys(game.cache._cacheMap[7]).length === levelFile.activeIdLevel) {
            //     theEndCredits = true;
            // }

            toolsGame.windows.boxTopMenu.f=false;
            if(!theEndCredits) {
                console.log("testx");
                // x,y,nameSpriteOrImage,idName,opacitySpec,cameraFixed,scaleW,scaleH,frame,fade
                toolsGame.image.show(
                    (toolsGame.windows.boxMenu.obj)?0:0,
                    (toolsGame.windows.boxMenu.obj)?0:0,
                    'boxTopMenu','boxTopMenu',.85,1,false,false,false,true
                );
                toolsGame.windows.boxTopMenu.const.show();
                toolsGame.buttons.navigations.show();
            } else {
                toolsGame.mainElements.player.obj.alpha=0;
                toolsGame.mainElements.endLevelS.obj.alpha=0;
                toolsGame.mainElements.player.obj.body.gravity.y=-740;
                toolsGame.mainElements.player.obj.body.bounce.y = 0;
                levelFile.blockedKeys=true;
                game.camera.follow(toolsGame.mainElements.player.obj, Phaser.Camera.FOLLOW_LOCKON, 1, 1);
            }
            toolsGame.buttons.openBoxMenu.show('play-game');
            onlyOneLoad=false;
        }
    }, this);

	//fullscreen...
	//game.input.onDown.add(gofull, this);

    //window.graphics = graphics;
};

// main loop the game
var update=function() {
	
	if(playGame.main)
	{


        // spowolnia gre
        // for(var x=0; x<map.width; x++) {
        //     for (var y = 0; y < map.height; y++) {
        //         if (map.getTile(x, y, layer, true).index==514)
        //         {
        //             if(toolsGame.mainElements.player.detectionHoldOnTile(x,y,1)){
        //                 //console.log("wykrywa id 514");
        //                 //console.log(x + "x" + y);
        //                 toolsGame.mainElements.logs.add(x,y,true);
        //                 //toolsGame.mainElements.logs.lengthBonusCoins ++;
        //                 map.removeTile(x, y, layer);
        //             }
        //         }
        //     }
        // }

        // toolsGame.mainElements.logs.obj.forEach(function(log){
        //     //console.log(log.x/tileSize + "x" + log.y/tileSize);
        //     if(!toolsGame.mainElements.player.detectionHoldOnObject(log,1)){
        //         map.getTile(log.x/tileSize, log.y/tileSize, layer, true).index=514;
        //         log.destroy();
        //     }
        // }, this, true);

        toolsGame.mainElements.windmillNewS.obj1.forEach(function(windmill){
            windmill.angle += 1;
		}, this, true);

        // dopracowac kolizje playera
        toolsGame.mainElements.player.obj.body.width = 32;
        //console.log(toolsGame.mainElements.player.obj.body);

        if((cursors.left.isDown || cursors.right.isDown || cursors.up.isDown) && !jumpKillF) {
        	jumpKillY=toolsGame.mainElements.player.obj.body.y;
            jumpKillF=true;
            toolsGame.mainElements.player.obj.body.bounce.y = 0.3;
        }

        //console.log(map);

	 	// position player

		//console.log(toolsGame.mainElements.player.obj.body.y + ' + ' + toolsGame.mainElements.player.obj.height + ' = ' + map.height*map.tileHeight);
	    //console.log("x: " + toolsGame.mainElements.player.obj.body.x + " / " + "y: " + toolsGame.mainElements.player.obj.body.y);

		//game.physics.arcade.collide(toolsGame.mainElements.player.obj, layer);


        //generowanie animowanych klod z niespodzianka
        // if (map.getTile(x, y, layer, true).index==514)
        // {
        //     toolsGame.mainElements.logs.add(x,y,true);
        //     toolsGame.mainElements.logs.lengthBonusCoins ++;
        //     map.removeTile(x, y, layer);
        // }
        // toolsGame.mainElements.windmillNewS.obj1.forEach(function(windmill){
        //     windmill.angle += 1;
        // }, this, true);


        //console.log(map);

		// player vs lay
        game.physics.arcade.overlap(toolsGame.mainElements.player.obj, layer, function(player, layer){
            if(layer.index === 51) {
                //console.log(layer);
                layer.collideDown=false;
                layer.collideUp=false;
                layer.collideLeft=false;
                layer.collideRight=false;
                setTimeout(function () {
                    layer.collideDown=true;
                    layer.collideUp=true;
                    layer.collideLeft=true;
                    layer.collideRight=true;
                },1);
            }
        }, null, this);

        // ewentualnie usunavc jakby przyspieszylo gre, ale chyba to nci nie pomoze
        game.physics.arcade.overlap(toolsGame.mainElements.player.gun.bullets.obj, layer, function(bullet, layer){
            if(layer.index === 51) {
                //console.log(layer);
                layer.collideDown=false;
                layer.collideUp=false;
                layer.collideLeft=false;
                layer.collideRight=false;
                setTimeout(function () {
                    layer.collideDown=true;
                    layer.collideUp=true;
                    layer.collideLeft=true;
                    layer.collideRight=true;
                },1);
            }
        }, null, this);

        // game.physics.arcade.overlap(toolsGame.mainElements.kladki.pionTopBack.obj, layer, function(player, layer){
        //     if(layer.index === 51) {
        //         layer.collideDown=true;
        //         layer.collideUp=true;
        //         layer.collideLeft=true;
        //         layer.collideRight=true;
        //     }
        // }, null, this);

        toolsGame.mainElements.player.obj.t1=false;
		game.physics.arcade.collide(toolsGame.mainElements.player.obj, layer, function(player, layer){
			//console.log(player.body.checkCollision.down);
			//console.log(player.body.blocked.right);

            // player.t1=true;
            // if(!player.onGround) {
            //     toolsGame.audio.footStep();
            //     player.onGround=true;
            // }
            //
            // if(cursors.left.isDown || cursors.right.isDown) {
            //     toolsGame.audio.footStep();
            // }

            toolsGame.mainElements.player.checkIfWasKilledAndOther(player);

			if(player.killHitIntruder) {
                player.killHitIntruder=false;
			}

			// wchodzenie pod gorke
			if((cursors.right.isDown || cursors.left.isDown) && (player.body.blocked.right || player.body.blocked.left) && !jumpButton.isDown && player.body.onFloor())
			{
				//console.log("up");
		        player.body.velocity.y = -12*tileSize;
			}
			//console.log("x: " + player.body.x + " / " + "y: " + player.body.y);
		},null, this);

		game.physics.arcade.collide(toolsGame.mainElements.coins.obj, layer);

        game.physics.arcade.collide(toolsGame.mainElements.logs.obj, layer);

        // game.physics.arcade.overlap(toolsGame.mainElements.player.gun.bullets.obj, toolsGame.mainElements.intruzi.obj, function(bullet, intruz){
        //     //jden strzal wywoluje jedna funkcje...
        //     if(!intruz.killing) toolsGame.mainElements.intruzi.collisionIntruz(intruz,"total-kill");
        //     intruz.killing=true;
        //     bullet.kill();
        // }, null, this);

        ///\\\///
        // game.physics.arcade.overlap(toolsGame.mainElements.logs.obj, toolsGame.mainElements.player.obj, function(log,p){
        //     p.isUp=false;
        // },null, this);


        // dopracowac - to musi byc aby intruzi mogli przemieszcac sie p ktych kladkach
        game.physics.arcade.collide(toolsGame.mainElements.logs.obj,toolsGame.mainElements.intruzi.obj,function(l,i){
            // nie wykrywa blokowania dla intruza
            // console.log("intruz:");
            // console.log(i.body);
            // console.log("log:");
            // console.log(l.body);
            //console.log(l.body);
            toolsGame.mainElements.intruzi.collisionBack(i);
        }, null, this);

        //
        // game.physics.arcade.overlap(toolsGame.mainElements.logs.obj,toolsGame.mainElements.intruzi.obj,function(l,i){
        //     //console.log(i.body.blocked);
        // }, null, this);

        game.physics.arcade.collide(toolsGame.mainElements.logs.obj,toolsGame.mainElements.logs.obj,function(log){
            // dla logs tez dziala
            //toolsGame.intruzCollisonBack(log);
        });

        game.physics.arcade.collide(toolsGame.mainElements.logs.obj, toolsGame.mainElements.player.obj, function(log,p){
           // p.body.allowGravity = true;


            //console.log(p);
            if(toolsGame.mainElements.player.obj.body.overlapY>0)
            {
                toolsGame.mainElements.player.checkIfWasKilledAndOther(toolsGame.mainElements.player.obj);
                p.isUp=true;
                toolsGame.mainElements.player.obj.body.allowGravity = true;
                //toolsGame.mainElements.player.obj.body.bounce.y = 0;
                toolsGame.mainElements.player.obj.body.allowGravity = false;
                setTimeout(function(){
                    p.isUp=false;
                },300);
            } else {
                if(!p.onlynOne) {
                    //p.body.allowGravity = true;
                    p.body.velocity.y = -330;
                    if(facing === 'left') {
                        p.body.velocity.x = -130;
                    } else if(facing === 'right') {
                        p.body.velocity.x = 130;
                    }

                    toolsGame.audio.breakGround();

                    setTimeout(function () {
                        p.body.allowGravity = true;
                        p.body.checkCollision.down=false;
                    },50);
                    setTimeout(function () {
                        p.animations.play('run', 20, false);
                    },300);

                    // jesli id = 514 to dostajemy bonusowe zloto
                    if(p.coin) {
                        setTimeout(function () {
                            toolsGame.mainElements.coins.add(p.x/tileSize, p.y/tileSize);
                        },200);
                    }

                    setTimeout(function () {
                        // toolsGame.mainElements.coins.add(p.saveX/tileSize, p.saveY/tileSize);
                        p.kill();
                    },900);
                    p.onlynOne= true;
                }
            }

        }, null, this);

        game.physics.arcade.collide(toolsGame.mainElements.Lifes.obj, layer);

		game.physics.arcade.collide(toolsGame.mainElements.player.gun.bullets.obj, layer);

		game.physics.arcade.overlap(toolsGame.mainElements.player.gun.bullets.obj, toolsGame.mainElements.intruzi.obj, function(bullet, intruz){
			//jden strzal wywoluje jedna funkcje...
			if(!intruz.killing) {
                toolsGame.mainElements.intruzi.collisionIntruz(intruz, "total-kill");
            }
            toolsGame.audio.breakBones(0.5);
            // setTimeout(function(){
            //     toolsGame.audio.explosionIntruder();
            // },150);
			intruz.killing=true;
			bullet.kill();
		}, null, this);

		game.physics.arcade.overlap(toolsGame.mainElements.player.gun.bullets.obj, layer, function(bullet, layer){
			if(bullet.body.blocked.right || bullet.body.blocked.left)
			{
				bullet.kill();
			}
		}, null, this);

		if(toolsGame.mainElements.player.obj.gForceWater) {
            toolsGame.mainElements.player.obj.body.gravity.y = 0;
            toolsGame.mainElements.player.obj.gForceWater = false;
        }


        toolsGame.mainElements.firebs.obj.forEach(function(f){
            //console.log(toolsGame.mainElements.player.obj.position.x);
            //console.log(f.position.x);
            //console.log(game.width);



            if(!f.startPositionSaveY){
                f.startPositionSaveY = Math.ceil(f.body.position.y/tileSize);
            }

            f.currentPositionY = Math.ceil(f.body.position.y/tileSize);
            //console.log(f.startPositionSaveY - f.currentPositionY);


            //if(timerTotal == f.randomStart) {
            if(timerTotal == 0) {
                f.start = true;
            }

            // if(toolsGame.mainElements.player.obj.position.x>f.position.x-game.width/2 &&
            //     toolsGame.mainElements.player.obj.position.x<f.position.x+game.width/2 &&
            //     toolsGame.mainElements.player.obj.position.y>f.position.y-game.height/2 &&
            //     toolsGame.mainElements.player.obj.position.y<f.position.y+game.height/2) {
            if(toolsGame.mainElements.player.detectionHoldOnObject(f,2)){
                f.active = true;
                if(f.activeWait) {
                    setTimeout(function(){
                        f.fall=false;
                        f.alpha=1;
                    },randZakres(0,3)*1000);
                    f.activeWait=false;
                }
            } else {
                f.active = false;
            }


            if(f.start) {
                if(!f.fall) {
                    if(f.startPositionSaveY-f.currentPositionY === 0) {
                        // unosi sie
                        if(!f.typeFire) {
                            f.animations.play('run1', 10, true);
                        }
                        f.alpha = 1;
                        f.body.allowGravity = false;
                        f.body.velocity.y = -600;
                    } else if(f.startPositionSaveY-f.currentPositionY === 4) {
                        f.body.allowGravity = true;
                    } else if(f.startPositionSaveY-f.currentPositionY === 16) {
                        // opada
                        if(!f.typeFire) {
                            f.animations.play('run2', 10, true);
                        }
                        f.body.allowGravity = true;
                        f.body.velocity.y = 0;
                        f.fall = true;
                        f.t=false;
                    }
                } else {
                    if(f.startPositionSaveY-f.currentPositionY === 0 && !f.t) {
                        // zatrzymuje sie
                        f.body.velocity.y = 0;
                        f.body.allowGravity = false;
                        f.t=true;
                        f.alpha=0;
                        setTimeout(function(){
                            if(f.active) {
                                f.fall=false;
                                f.alpha=1;
                            } else {
                                f.activeWait=true;
                            }
                            //console.log("aktywuj ponownie");
                        },randZakres(1,6)*1000);
                    }
                }

            }
        }, this, true);
        game.physics.arcade.overlap(toolsGame.mainElements.firebs.obj, toolsGame.mainElements.waters.obj, function(f,w){
            //console.log(f.randomStart);
            clearTimeout(f.gForceWaterTimer);
            f.gForceWaterTimer = setTimeout(function(){
                f.gForceWaterOnlyeOne = false;
            },100);

            if(!f.gForceWaterOnlyeOne) {
                toolsGame.mainElements.splashs.add((f.body.position.x+(f.body.width/2))/tileSize,((f.body.position.y+(f.typeFire?(-16):8))/tileSize),(w.type==='water-red')?'splash-water-red':false);
                f.gForceWaterOnlyeOne = true;
            }
        }, null, this);

        game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.firebs.obj, function(p,f){
            if(f.alpha===1) {
                //console.log("collision with player");
                toolsGame.mainElements.player.lostLife(p);
            }
        }, null, this);

        game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.waters.obj, function(p,w){
            p.body.gravity.y = -525;
            clearTimeout(p.gForceWaterTimer);
            p.gForceWaterTimer = setTimeout(function(){
                p.gForceWaterOnlyeOne = false;
            },100);
            if(w.type!=="water-red") {

                //console.log("p: " + p.body.position.x);
                clearTimeout(p.waterYSaveTime);
                p.waterYSaveTime = setTimeout(function () {
                    p.waterYSave = false;
                },300);
                if(!p.waterYSave) {
                    p.waterYSave = Math.ceil(w.body.position.y/tileSize);
                }
                //console.log(p.waterYSave - Math.ceil(p.body.position.y/tileSize));
                if(p.waterYSave - Math.ceil(p.body.position.y/tileSize) < 2) {
                    if(!p.iterWater) {
                        p.iterWater=1;
                    }
                    p.iterWater++;
                    //console.log(w.type);
                    if(p.iterWater >= 250){
                        //console.log("kill");
                        toolsGame.mainElements.player.lostLife(p);
                        p.iterWater = false;
                    }
                } else {
                    p.iterWater = false;
                }
            } else {
                //console.log("kill");
                toolsGame.mainElements.player.lostLife(p,10);
                //
            }


            //console.log(p.animations.currentAnim.name);
            if(!p.gForceWaterOnlyeOne) {
                //console.log(p.body.position.x + " - " + p.body.position.y);
                //console.log(p.body);
                //console.log(p.animations.currentAnim.name);
                var typeSplash=false;
                // toolsGame.audio.splash();

                if(w.type==='water-red') {
                    typeSplash='splash-water-red';
                }
                if(p.animations.currentAnim.name==="left" || p.animations.currentAnim.name==="jump-left") {
                    toolsGame.mainElements.splashs.add(((p.body.position.x+(p.body.width/2))/tileSize)-(32/tileSize),((p.body.position.y+32)/tileSize),typeSplash);
                } else if(p.animations.currentAnim.name==="right" || p.animations.currentAnim.name==="jump-right") {
                    toolsGame.mainElements.splashs.add(((p.body.position.x+(p.body.width/2))/tileSize)+(32/tileSize),((p.body.position.y+32)/tileSize),typeSplash);
                } else {
                    toolsGame.mainElements.splashs.add((p.body.position.x+(p.body.width/2))/tileSize,((p.body.position.y+28)/tileSize),typeSplash);
                }
                p.gForceWaterOnlyeOne = true;
            }
            p.gForceWater = true;

            if(cursors.left.isDown || cursors.right.isDown) {
                if(!p.delayWater) {
                    p.gForceWaterOnlyeOne = false;
                    p.delayWater = true;
                }
                if(timeLoop % 15 == 0) {
                    p.delayWater = false;
                }
            }

        }, null, this);

        toolsGame.mainElements.waters.obj.forEach(function(w){
            if(toolsGame.mainElements.player.detectionHoldOnObject(w,1)){
                //console.log(w.alpha);
                if(!w.alpha) {
                    w.alpha = 0.7;
                }
                //console.log("ładowANIE WOdy");
            } else {
                if(w.alpha) {
                    w.alpha=0;
                }
            }
        }, this, true);

        toolsGame.mainElements.intruzi.obj.forEach(function(intruz){
            if(intruz.gForceWater) {
                intruz.body.gravity.y = 0;
                intruz.gForceWater = false;
            }
        }, this, true);

        game.physics.arcade.overlap(toolsGame.mainElements.intruzi.obj, toolsGame.mainElements.waters.obj, function(i,w){
            if(i.active) {
                i.body.gravity.y = -525;
                clearTimeout(i.gForceWaterTimer);
                i.gForceWaterTimer = setTimeout(function(){
                    i.gForceWaterOnlyeOne = false;
                },100);
                if(!i.gForceWaterOnlyeOne) {
                    //console.log(i.body.position.x + " - " + i.body.position.y);
                    //console.log(i.body);
                    if(i.type===4) {
                        i.move_y = -33/tileSize;
                    } else {
                        i.move_y = 0;
                    }
                    if(i.animations.currentAnim.name==="left") {
                        toolsGame.mainElements.splashs.add(((i.body.position.x+(i.body.width/2))/tileSize)-(32/tileSize),i.move_y + ((i.body.position.y+32)/tileSize));
                    } else if(i.animations.currentAnim.name==="right") {
                        toolsGame.mainElements.splashs.add(((i.body.position.x+(i.body.width/2))/tileSize)+(32/tileSize),i.move_y + ((i.body.position.y+32)/tileSize));
                    } else {
                        toolsGame.mainElements.splashs.add((i.body.position.x+(i.body.width/2))/tileSize,i.move_y + ((i.body.position.y+28)/tileSize));
                    }

                    //toolsGame.mainElements.splashs.add((i.body.position.x+(i.body.width/2))/tileSize,((i.body.position.y+28)/tileSize));
                    i.gForceWaterOnlyeOne = true;
                }
                i.gForceWater = true;

                //console.log(i.animations.currentAnim.name);
                if(i.animations.currentAnim.name=='right' || i.animations.currentAnim.name=='left') {
                    if(!i.delayWater) {
                        i.gForceWaterOnlyeOne = false;
                        i.delayWater = true;
                    }
                    if(timeLoop % 15 == 0) {
                        i.delayWater = false;
                    }
                }
            }
        }, null, this);

		game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.coins.obj, function(player, coin){
            toolsGame.audio.coin();
            toolsGame.mainElements.player.numberCoins++;
            toolsGame.mainElements.player.numberCoinsLevel++;

            toolsGame.mainElements.player.numberCoinsLevelProcent = Math.ceil(100*toolsGame.mainElements.player.numberCoinsLevel/oneHP);
            //console.log("100*" + toolsGame.mainElements.player.numberCoinsLevel + " / " + oneHP);
		    coin.kill();
            toolsGame.windows.boxTopMenu.f=false;

            //console.log(player.x);

            //toolsGame.mainElements.coins.add(player.x/tileSize, player.y/tileSize);

            // only animation text
            toolsGame.addPoint(coin.x,player.y,'addPointGold'+toolsGame.mainElements.player.numberCoins,'+1 gold');

		}, null, this);

        // game.physics.arcade.overlap(toolsGame.mainElements.intruzi.obj, toolsGame.mainElements.coins.obj, function(player, coin){
        //     coin.kill();
        // }, null, this);

        game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.Lifes.obj, function(player, Life){
            toolsGame.mainElements.player.numberMainLifes++;
            toolsGame.audio.life();
            player.body.velocity.y = -300;
            player.scale.setTo(1,playerScaleBig);
            toolsGame.mainElements.player.scale();

            //player.moreJump = true;

            setTimeout(function(){
                toolsGame.audio.life();
                setTimeout(function(){
                    toolsGame.audio.life();
                },200);
            },200);
            Life.kill();
            toolsGame.windows.boxTopMenu.f=false;
            toolsGame.addPoint(Life.x,player.y,'addPointFullLife'+toolsGame.mainElements.player.numberMainLifes,'+1 full life');
        }, null, this);

        game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.LifeSingleS.obj, function(player, LifeSingle){
            if(toolsGame.mainElements.player.numberLifes===amountLife) {
                // toolsGame.mainElements.player.numberMainLifes++;
            } else {
                toolsGame.mainElements.player.numberLifes++;
                toolsGame.audio.life();
                LifeSingle.kill();
                toolsGame.windows.boxTopMenu.f=false;
                toolsGame.addPoint(LifeSingle.x,player.y,'addPointLife'+toolsGame.mainElements.player.numberLifes,'+1 life');
            }
        }, null, this);


		/////
		game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.bulletsGuns.obj, function(player, bullets_gun){
		    var numberAddBullets = 6;
            toolsGame.audio.bullets();
			toolsGame.mainElements.player.countBullets += numberAddBullets;
            toolsGame.mainElements.player.countBulletsF = true;
		    bullets_gun.kill();
            toolsGame.windows.boxTopMenu.f=false;
            toolsGame.addPoint(bullets_gun.x,player.y,'addPointBullet'+toolsGame.mainElements.player.countBullets,'+' + numberAddBullets + ' bullets');
		}, null, this);

		//// Finishing the level
		game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.endLevelS.obj, function(player, end_level){
			if(!levelFile.readyLoad)
			{

			    // saving to cookies

                setCookies('id-level-last-memory',levelFile.activeIdLevel);

                setCookies('coins', toolsGame.mainElements.player.numberCoins);
                setCookies('coins-' + levelFile.activeIdLevel,toolsGame.mainElements.player.numberCoinsLevel);
                //console.log(toolsGame.mainElements.player.numberCoinsLevelProcentLastMemory + " - " + toolsGame.mainElements.player.numberCoinsLevelProcent);
                if(toolsGame.mainElements.player.numberCoinsLevelProcent>toolsGame.mainElements.player.numberCoinsLevelProcentLastMemory) {
                    setCookies('coins-procent-' + levelFile.activeIdLevel,toolsGame.mainElements.player.numberCoinsLevelProcent);
                    //console.log("save");
                }

                setCookies('Lifes', toolsGame.mainElements.player.numberLifes);
                setCookies('main-Lifes', toolsGame.mainElements.player.numberMainLifes);

                setCookies('bullets',toolsGame.mainElements.player.countBullets);

                // poprawic
				//alert("x");
				//clearTimeout(toolsGame.mainElements.player.obj.touchGroundTime);
                //toolsGame.mainElements.player.obj.animations.stop();

				levelFile.readyLoad=true;

				levelFile.blockedKeys=true;
				//console.log(toolsGame.mainElements.player.obj.position.y);
				//toolsGame.mainElements.player.obj.position.y = toolsGame.mainElements.player.obj.position.y - 50;



                if(!theEndCredits) {
                    toolsGame.mainElements.player.obj.body.bounce.y = .9;

                    // jump for finish level
                    toolsGame.mainElements.player.obj.body.velocity.y = -330;
                    toolsGame.mainElements.player.jumpTimer = game.time.now + 330;
                }
                //toolsGame.mainElements.player.obj.animations.play('idle-right');
                toolsGame.mainElements.player.obj.animations.play('end-level');

                // animation jump left/right for finish level
                var start = null;
                var step = function(timestamp) {
                    if (!start) start = timestamp;

                    if (facing === 'right') {
                        toolsGame.mainElements.player.obj.body.velocity.x = 100;

                    } else if (facing === 'left') {
                        toolsGame.mainElements.player.obj.body.velocity.x = -100;
                    }

                    var progress = timestamp - start;
                    if (progress < 500) {
                        window.requestAnimationFrame(step);
                    }
                }

                window.requestAnimationFrame(step);

				setTimeout(function(){
				    correctCookiesProcent();
					levelFile.activeIdLevel=levelFile.activeIdLevel+1;
					//alert(Object.keys(game.cache._cacheMap[7]).length + " - " + amountLevels + " - " + levelFile.activeIdLevel);
					if(amountLevels === levelFile.activeIdLevel-1) {
						// dopracowac
						//alert("congratulation");
                        //endGame();
                        toolsGame.windows.boxMenu.show('game-complete');
                        //levelFile.readyLoad=false;
                        //levelFile.blockedKeys=false;
                    }
					else {
                        //alert(id);
                        endGame();
                        levelFile.name='level'+levelFile.activeIdLevel;
                        //console.log(getCookies("unlock-levels") + " - " + levelFile.activeIdLevel);

                        if(!getCookies("unlock-levels") || getCookies("unlock-levels")<levelFile.activeIdLevel) {
                            unlockLevels = levelFile.activeIdLevel;
                            setCookies('unlock-levels',unlockLevels);
                            //alert("unlockLevels zapisane: " + unlockLevels);
                        }
                        //alert(amountLevels + " - " + levelFile.activeIdLevel);
                        // if(amountLevels === levelFile.activeIdLevel) {
                        //     alert("congratulations!");
                        // }
                        startGame(false,amountLevels === levelFile.activeIdLevel);
                        // levelFile.readyLoad=false;
                        // levelFile.blockedKeys=false;
					}
				},2000);
			}
            toolsGame.windows.boxTopMenu.f=false;
		}, null, this);

        //// Save the place
        game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.saveLevelS.obj, function(player, save_level){
        	//console.log(player);
            if(!(saveX === save_level.body.x && saveY === save_level.body.y) && !save_level.block) {
                //console.log("Save place: " + save_level.body.x + " / " + save_level.body.y);
                saveX = save_level.body.x;
                saveY = save_level.body.y;
                save_level.block = true;
                save_level.animations.play('run2', 17, true);
			}

        }, null, this);

        game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.keys.obj, function(p,k){
            k.kill();
            keys=1;
            toolsGame.audio.key(.8);
            toolsGame.windows.boxTopMenu.f=false;
            toolsGame.addPoint(k.x,p.y,'addPointKey','You got the key!');
        }, null, this);

        game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.locks.obj, function(p,l){
            if(keys === 1) {
                //l.alpha = 0;
                l.kill();
                toolsGame.audio.doorLift();
                toolsGame.mainElements.doors.obj.children[0].body.velocity.y = -50;
                setTimeout(function () {
                    toolsGame.mainElements.doors.obj.children[0].body.velocity.y = 0;
                    // setTimeout(function () {
                    //     toolsGame.mainElements.doors.obj.children[0].body.velocity.y = 50;
                    //     setTimeout(function () {
                    //         toolsGame.mainElements.doors.obj.children[0].body.velocity.y = 0;
                    //         k.alpha = 1;
                    //     },3000);
                    // },5000);
                },3000);
                keys = 0;
            }
        }, null, this);

        game.physics.arcade.collide(toolsGame.mainElements.player.obj, toolsGame.mainElements.doors.obj, function(p,k){

        });

        game.physics.arcade.collide(toolsGame.mainElements.intruzi.obj, toolsGame.mainElements.doors.obj, function(i,d){
            toolsGame.mainElements.intruzi.collisionBack(i);
        });

        // dotatkowy warunek jesli player dotyka dna mapy
        if(toolsGame.mainElements.player.obj.body.y+toolsGame.mainElements.player.obj.height === map.height*map.tileHeight) {
            //toolsGame.mainElements.player.checkIfWasKilledAndOther(toolsGame.mainElements.player.obj);
            toolsGame.mainElements.player.lostLife(toolsGame.mainElements.player.obj,3);
        }

        //player vs fire
        game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.fire.fireUpS.obj, function(player, fire){
            toolsGame.mainElements.player.checkIfWasKilledAndOther(toolsGame.mainElements.player.obj);
            toolsGame.mainElements.player.lostLife(player);
        }, null, this);

        game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.fire.fireDownS.obj, function(player, fire){
            toolsGame.mainElements.player.checkIfWasKilledAndOther(toolsGame.mainElements.player.obj);
            toolsGame.mainElements.player.lostLife(player);
        }, null, this);

        game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.fire.fireLeftS.obj, function(player, fire){
            toolsGame.mainElements.player.checkIfWasKilledAndOther(toolsGame.mainElements.player.obj);
            toolsGame.mainElements.player.lostLife(player);
        }, null, this);

        game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.fire.fireRightS.obj, function(player, fire){
            toolsGame.mainElements.player.checkIfWasKilledAndOther(toolsGame.mainElements.player.obj);
            toolsGame.mainElements.player.lostLife(player);
        }, null, this);

		game.physics.arcade.collide(toolsGame.mainElements.intruzi.obj, layer);



		// player vs intruder
		if(!levelFile.blockedKeys) {

            game.physics.arcade.overlap(toolsGame.mainElements.player.obj, toolsGame.mainElements.intruzi.obj, function(player, intruz){
                if(!intruz.killing) {
                    if(player.body.overlapY>0)
                    {
                        toolsGame.mainElements.intruzi.collisionIntruz(intruz);
                        if(!intruz.hit || !player.killHitIntruder) {
                            player.killHitIntruder=true;
                            intruz.hit=1;
                        }
                        if(intruz.hit > 10) {
                            if(!intruz.killing) toolsGame.mainElements.intruzi.collisionIntruz(intruz,"total-kill");
                            intruz.killing=true;
                            intruz.hit=false;
                        } else {
                            intruz.hit++;
                        }
                    }

                    // tracenie zycia
                    //if(player.body.overlapX>0 || player.body.overlapX<0)
                    if(player.body.overlapY!==0)
                    {
                        toolsGame.mainElements.player.lostLife(player);
                    }
                    //console.log(player.body.overlapY);
                }
            }, null, this);

            game.physics.arcade.collide(toolsGame.mainElements.intruzi.obj, toolsGame.mainElements.player.obj);

		}

        // dotatkowy warunek jesli intruz dotyka dna mapy
        toolsGame.mainElements.intruzi.obj.forEach(function(intruz){
            if(intruz.body.y+intruz.height === map.height*map.tileHeight) {
                if(!intruz.killing) toolsGame.mainElements.intruzi.collisionIntruz(intruz,"total-kill");
                intruz.killing=true;
            }
        }, this, true);


		// Shooting
		if(toolsGame.mainElements.player.countBulletsF){
            if(toolsGame.mainElements.player.countBullets === 0) {
                //console.log("end of ammunition");
                toolsGame.buttons.navigations.shot.alpha = 0;
                toolsGame.buttons.navigations.shot.inputEnabled = false;
            } else {
                //console.log("you have ammunition");
                toolsGame.buttons.navigations.shot.alpha = 0.1;
                toolsGame.buttons.navigations.shot.inputEnabled = true;
            }
            toolsGame.mainElements.player.countBulletsF = false;
		}




        if(timeLoop>=120) timeLoop=0;
        else timeLoop++;
        //console.log(timeLoop);

        game.physics.arcade.overlap(toolsGame.mainElements.intruzi.obj, layer, function(intruz,lay){

            // if(toolsGame.mainElements.player.obj.position.x>intruz.position.x-game.width/1.5 &&
            //     toolsGame.mainElements.player.obj.position.x<intruz.position.x+game.width/1.5 &&
            //     toolsGame.mainElements.player.obj.position.y>intruz.position.y-game.height/1.5 &&
            //     toolsGame.mainElements.player.obj.position.y<intruz.position.y+game.height/1.5) {
            if(toolsGame.mainElements.player.detectionHoldOnObject(intruz,1.5)) {
                intruz.active = true;
                if(intruz.alpha===0) {
                    intruz.alpha=1;
                }
            } else {
                intruz.active = false;
                intruz.alpha = 0;
                intruz.body.velocity.x=0;
                intruz.animations.stop();
            }

            if(intruz.active) {
                if(!intruz.timeLoop) {
                    intruz.timeLoop = 1;
                    toolsGame.mainElements.intruzi.id++;
                    intruz.id = toolsGame.mainElements.intruzi.id;
                    intruz.break = 4000 * intruz.id;
                    //console.log("intruz type: " + intruz.type + " loaded");
                }

                //if parzyste {} else {}

                //console.log(intruz);

                intruz.timeLoop++;


                intruz.body.velocity.x = 0;


                if(intruz.randomMove=='intruzRight' || intruz.randomMove=='intruzLeft')
                {
                    if(intruz.type === 1 || intruz.type === 4) {

                        if(intruz.body.blocked.left) {
                            if(intruz.type === 4) {
                                intruz.frame=41;
                                //intruz.animations.play('turn-left');
                                setTimeout(function(){
                                    intruz.frame=37;
                                },30);
                                setTimeout(function(){
                                    intruz.randomMove='intruzLeft';
                                },60);
                            }
                            else intruz.randomMove='intruzLeft';
                        }
                        else if(intruz.body.blocked.right) {
                            if(intruz.type === 4) {
                                intruz.frame=40;
                                setTimeout(function(){
                                    intruz.frame=37;
                                },30);
                                //intruz.animations.play('turn-right');
                                setTimeout(function(){
                                    intruz.randomMove='intruzRight';
                                },60);
                            }
                            else intruz.randomMove='intruzRight';
                        }
                    }

                    if(intruz.body.blocked.up) {
                        if(intruz.body.blocked.left) intruz.randomMove='intruzLeft';
                        else if(intruz.body.blocked.right) intruz.randomMove='intruzRight';
                    }

                    if(intruz.type === 2 || intruz.type === 3) {
                        if(intruz.body.blocked.left || intruz.body.blocked.right) {
                            var jumpTimerIntruz = 0;
                            if (intruz.body.onFloor() && game.time.now > jumpTimerIntruz) {
                                intruz.body.velocity.y = -450;
                                jumpTimerIntruz = game.time.now + 450;
                            }

                            if (timeLoop === 2) {
                                if (intruz.body.blocked.left) intruz.randomMove = 'intruzLeft';
                                else if (intruz.body.blocked.right) intruz.randomMove = 'intruzRight';
                            }

                        }
                    }

                    if(intruz.type === 1 || intruz.type === 2 || intruz.type === 4) {
                        if (intruz.randomMove == 'intruzRight') {
                            if(intruz.type === 4) {
                                intruz.body.velocity.x = -intruz.randomSpeed/2;
                            } else {
                                intruz.body.velocity.x = -intruz.randomSpeed;
                            }
                            intruz.animations.play('left');
                            intruz.check = false;
                        }
                        else if (intruz.randomMove == 'intruzLeft') {
                            if(intruz.type === 4) {
                                intruz.body.velocity.x = intruz.randomSpeed/2;
                            } else {
                                intruz.body.velocity.x = intruz.randomSpeed;
                            }
                            intruz.animations.play('right');
                            intruz.check = false;
                        }
                    }
                    else if(intruz.type === 3) {
                        if (intruz.randomMove == 'intruzRight') {
                            if (intruz.timeLoop >= 2000 + intruz.break && intruz.timeLoop <= 4000 + intruz.break) {
                                if (!intruz.check) {
                                    intruz.body.velocity.x = 0;
                                    intruz.animations.play('idle-left');
                                    intruz.randomMove = 'intruzLeft';
                                    //console.log("x");
                                    intruz.check = true;
                                }
                                if (intruz.killing) {
                                    //console.log("xKill");
                                    intruz.animations.play('kill');
                                }
                            } else {
                                intruz.body.velocity.x = -intruz.randomSpeed;
                                intruz.animations.play('left');
                                intruz.check = false;
                            }
                        }
                        else if (intruz.randomMove == 'intruzLeft') {
                            if (intruz.timeLoop >= 2000 + intruz.break && intruz.timeLoop <= 4000 + intruz.break) {
                                if (!intruz.check) {
                                    intruz.body.velocity.x = 0;
                                    intruz.animations.play('idle-right');
                                    intruz.randomMove = 'intruzRight';
                                    //console.log("x");
                                    intruz.check = true;
                                }
                                if (intruz.killing) {
                                    //console.log("xKill");
                                    intruz.animations.play('kill');
                                }
                            } else {
                                intruz.body.velocity.x = intruz.randomSpeed;
                                intruz.animations.play('right');
                                intruz.check = false;
                            }
                        }
                    }

                    if (!(intruz.timeLoop >= 1 && intruz.timeLoop <= 4000 + intruz.break)) {
                        intruz.timeLoop = 1;
                    }


                }
                else if(intruz.randomMove=='intruzDelete'){
                    intruz.randomMove=parseInt(Math.random() * 2) ?  'intruzRight' : 'intruzLeft';
                    var wsp=[], wspX=150, wspY=100;
                    if(wspInkub.length>0)
                    {
                        var losoweWspInk=randZakres(0,wspInkub.length-1);
                        //console.log(losoweWspInk);
                        wsp=wspInkub[losoweWspInk].split(",");
                        wspX=parseInt(wsp[0]);
                        wspY=parseInt(wsp[1]);
                    }
                    //console.log(wspInkub);
                    //console.log(wspX + "," + wspY);

                    // intruz.body.x=wspX;
                    // intruz.body.y=wspY;
                    intruz.kill();

                    setTimeout(function(){

                        toolsGame.mainElements.intruzi.add(wspX/tileSize,wspY/tileSize,intruz.type);
                        //console.log((wspX*tileSize) + " x " + (wspY*tileSize));
                        //toolsGame.mainElements.intruzi.add(100,100);
                        //\\//\\
                    }, 3000);
                    //intruz.alpha=1;
                }
                else if(intruz.randomMove=='intruzStop'){
                    if(intruz.type === 4) {
                        //intruz.frame = 37;
                    } else {
                        intruz.frame = 37;
                    }
                }


                if(intruz.type === 4) {
                    //console.log(intruz.body.width);
                    //przesuniecie poziomu dla snake
                    intruz.body.height = 30;
                }
            }


            //console.log(intruz.randomMove);
        },null, this);


		// to uzyc przy dwoch roznych typach intruzow
		// game.physics.arcade.collide(toolsGame.mainElements.intruzi.obj, toolsGame.mainElements.intruzi.obj, function(intruz){
         //    toolsGame.intruzCollisonBack(intruz);
		// 	//console.log(intruz.body.blocked.left);
		// });
		

	    toolsGame.mainElements.player.obj.body.velocity.x = 0;
	    //console.log(toolsGame.mainElements.player.obj.touchGround + " and " + levelFile.blockedKeys);
		if(!levelFile.blockedKeys) // zmiana levelu - blokowanie klawiszy
		{

            // if(toolsGame.mainElements.player.obj.gForceWaterOnlyeOne && (cursors.up.isDown || cursors.left.isDown || cursors.right.isDown)) {
            //     toolsGame.mainElements.player.obj.gForceWaterOnlyeOne = false;
            // }

            if (cursors.up.isDown) {
                // if(toolsGame.mainElements.player.obj.onGround) {
                //     toolsGame.mainElements.player.obj.onGround=false;
                // }
                if (facing === 'right') {
                    if(!toolsGame.mainElements.player.obj.touchGround) {
                    	toolsGame.mainElements.player.obj.animations.play('jump-right');
                    }
                }
                else if (facing === 'left') {
                    if(!toolsGame.mainElements.player.obj.touchGround) {
                    	toolsGame.mainElements.player.obj.animations.play('jump-left');
                    }
                }


                toolsGame.mainElements.player.obj.touchGroundTime = setTimeout(function(){
                	if(!levelFile.blockedKeys) {
                        if (facing === 'left') {
                            toolsGame.mainElements.player.obj.animations.play('left');
                        } else if (facing === 'right') {
                            toolsGame.mainElements.player.obj.animations.play('right');
                        }
                        toolsGame.mainElements.player.obj.touchGround=true;
					}
                },300);
            }

		    if (cursors.left.isDown)
		    {

		        toolsGame.mainElements.player.obj.body.velocity.x = -200;
		       // console.log(game.camera.x);
		        //if() bg.cameraOffset.x+=1;

		        if (facing != 'left')
		        {
		            toolsGame.mainElements.player.obj.animations.play('left');
		            facing = 'left';
		        }

		    }
		    else if (cursors.right.isDown)
		    {
		        toolsGame.mainElements.player.obj.body.velocity.x = 200;
		        //console.log(game.camera.x);
		        //bg.cameraOffset.x-=1;

		        if (facing != 'right')
		        {
		            toolsGame.mainElements.player.obj.animations.play('right');
		            facing = 'right';
		        }
		    }
		    else {
                if (facing != 'idle') {
                    toolsGame.mainElements.player.obj.animations.stop();

                    if (facing == 'left')
                    {
                        //toolsGame.mainElements.player.obj.frame = 0;
                        toolsGame.mainElements.player.obj.animations.play('idle-left');
                    }
                    else
                    {
                        //toolsGame.mainElements.player.obj.frame = 4;
                        toolsGame.mainElements.player.obj.animations.play('idle-right');
                    }

                    facing = 'idle';
                }
		    }

		}

		// camera and backing to other part screen
		//console.log(game.camera.x);
		// game.camera.follow();
		// game.camera.x+=10;

		/* aniamacja kladki itp */

		/*
		game.physics.arcade.collide(kladki, layer);
		//console.log(kladki.children[0].body.blocked.right);

		for (var i = 0, len = kladki.children.length; i < len; i++) {

			if(kladki.children[i].body.blocked.right) {
				kladki.children[i].direction="left";
			}
			else if(kladki.children[i].body.blocked.left) {
				kladki.children[i].direction="right";
			}

			if(kladki.children[i].direction=="right")
			{
				kladki.children[i].body.velocity.x = 100;
			}
			else
			{
				kladki.children[i].body.velocity.x = -100;
			}
			kladki.children[i].isUp=false;
		}
		*/

		game.physics.arcade.collide(toolsGame.mainElements.kladki.poziom.obj, layer);
		game.physics.arcade.overlap(toolsGame.mainElements.kladki.poziom.obj, layer, function(kladka,lay){

            toolsGame.checkSpecialBlankBlockElement(lay);

			if(kladka.body.blocked.right) {
				kladka.direction="left";
			}
			else if(kladka.body.blocked.left) {
				kladka.direction="right";
			}

			if(kladka.direction=="right")
			{
				kladka.body.velocity.x = 100;
			}
			else
			{
				kladka.body.velocity.x = -100;
			}
			kladka.isUp=false;
		},null, this);

		toolsGame.mainElements.player.obj.body.allowGravity = true;
		game.physics.arcade.collide(toolsGame.mainElements.kladki.poziom.obj, toolsGame.mainElements.player.obj, function(p,kladka){
			//console.log(kladka);
			if(kladka.body.overlapY>0)
			{
                toolsGame.mainElements.player.checkIfWasKilledAndOther(toolsGame.mainElements.player.obj,'kladki-poziom');

				toolsGame.mainElements.player.obj.body.allowGravity = true;
				toolsGame.mainElements.player.obj.body.bounce.y = 0;
				kladka.isUp=true;
				toolsGame.mainElements.player.obj.body.velocity.x += kladka.body.velocity.x;
				toolsGame.mainElements.player.obj.body.allowGravity = false;
				//console.log(toolsGame.mainElements.player.obj.body.allowGravity);
				clearTimeout(toolsGame.mainElements.kladki.kladkaPlayerBounceReset);
				toolsGame.mainElements.kladki.kladkaPlayerBounceReset=setTimeout(function(){
					toolsGame.mainElements.player.obj.body.bounce.y = 0.3;
				},200);
				//console.log(toolsGame.mainElements.player.obj.body.bounce.y + " / " + toolsGame.mainElements.player.obj.body.overlapY);
			}

		}, null, this);

		game.physics.arcade.collide(toolsGame.mainElements.kladki.poziom.obj, toolsGame.mainElements.intruzi.obj, function(kladka,intruz){
			//intruz.body.velocity.x += kladka.body.velocity.x;
		}, null, this);
		

		//console.log(toolsGame.mainElements.player.obj.body.bounce.y + " / " + toolsGame.mainElements.player.obj.body.overlapY);
		//console.log(toolsGame.mainElements.player.obj.body.blocked.down);
		/* end aniamacja kladki itp */


		//\\ start
        //game.physics.arcade.collide(toolsGame.mainElements.kladki.pionTopBack.obj, toolsGame.mainElements.blankTileS.obj);

        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionTopBack.obj, toolsGame.mainElements.kladki.poziom.obj);
        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionTopBack.obj, toolsGame.mainElements.intruzi.obj,function(k,intruz){
        	//console.log("intruz vs kladka");
            toolsGame.intruzCollisonNoBack(intruz);
        });
        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionTopBack.obj, toolsGame.mainElements.player.obj, function(k,p){
            if(p.body.overlapY>0) {
                //console.log("kladka pion top (auto back)");
                toolsGame.mainElements.player.checkIfWasKilledAndOther(toolsGame.mainElements.player.obj);
                toolsGame.mainElements.kladki.run.startCollision(p,"pionTopBack");
            }
        }, null, this);
        game.physics.arcade.overlap(toolsGame.mainElements.kladki.pionTopBack.obj, layer, function(k,lay){
            toolsGame.checkSpecialBlankBlockElement(lay);
        }, null, this);
        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionTopBack.obj, layer, function(k,lay){
            toolsGame.mainElements.kladki.run.endCollision(k,"pionTopBack");
        }, null, this);

        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionBottomBack.obj, toolsGame.mainElements.kladki.poziom.obj);
        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionBottomBack.obj, toolsGame.mainElements.intruzi.obj,function(k,intruz){
            //console.log("intruz vs kladka");
            toolsGame.intruzCollisonNoBack(intruz);
        });
        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionBottomBack.obj, toolsGame.mainElements.player.obj, function(k,p){
            if(p.body.overlapY>0) {
                //console.log("kladka pion bottom (auto back)");
                //console.log("test y");
                toolsGame.mainElements.player.checkIfWasKilledAndOther(toolsGame.mainElements.player.obj);
                toolsGame.mainElements.kladki.run.startCollision(p,"pionBottomBack");
            }
        }, null, this);

        game.physics.arcade.overlap(toolsGame.mainElements.kladki.pionBottomBack.obj, layer, function(k,lay){
            toolsGame.checkSpecialBlankBlockElement(lay);
        }, null, this);

        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionBottomBack.obj, layer, function(k,lay){
            toolsGame.mainElements.kladki.run.endCollision(k,"pionBottomBack");
        }, null, this);

        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionTop.obj, toolsGame.mainElements.kladki.poziom.obj);
        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionTop.obj, toolsGame.mainElements.intruzi.obj,function(k,intruz){
            //console.log("intruz vs kladka");
            toolsGame.intruzCollisonNoBack(intruz);
        });
        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionTop.obj, toolsGame.mainElements.player.obj, function(k,p){
            if(p.body.overlapY>0) {
                //console.log("kladka pion top");
                toolsGame.mainElements.player.checkIfWasKilledAndOther(toolsGame.mainElements.player.obj);
                toolsGame.mainElements.kladki.run.startCollision(p,"pionTop");
            }
        }, null, this);
        game.physics.arcade.overlap(toolsGame.mainElements.kladki.pionTop.obj, layer, function(k,lay){
            toolsGame.checkSpecialBlankBlockElement(lay);
        }, null, this);
        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionTop.obj, layer, function(k,lay){
            toolsGame.mainElements.kladki.run.endCollision(k,"pionTop");
        }, null, this);

        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionBottom.obj, toolsGame.mainElements.kladki.poziom.obj);
        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionBottom.obj, toolsGame.mainElements.intruzi.obj,function(k,intruz){
            //console.log("intruz vs kladka");
            toolsGame.intruzCollisonNoBack(intruz);
        });
        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionBottom.obj, toolsGame.mainElements.player.obj, function(k,p){
            if(p.body.overlapY>0) {
                //console.log("kladka pion bottom");
                toolsGame.mainElements.player.checkIfWasKilledAndOther(toolsGame.mainElements.player.obj);
                toolsGame.mainElements.kladki.run.startCollision(p,"pionBottom");
            }
        }, null, this);
        game.physics.arcade.overlap(toolsGame.mainElements.kladki.pionBottom.obj, layer, function(k,lay){
            toolsGame.checkSpecialBlankBlockElement(lay);
        }, null, this);
        game.physics.arcade.collide(toolsGame.mainElements.kladki.pionBottom.obj, layer, function(k,lay){
            toolsGame.mainElements.kladki.run.endCollision(k,"pionBottom");
        }, null, this);
		//\\ end


		/* teleporter postaci
		console.log(toolsGame.mainElements.player.obj.body.x + " : " + toolsGame.mainElements.player.obj.body.y);
		if(toolsGame.mainElements.player.obj.body.x>1200) {
			//game.camera.follow(false);
			//game.camera.follow(toolsGame.mainElements.intruzi.obj.children[0]);
			toolsGame.mainElements.player.obj.body.x=100;
			toolsGame.mainElements.player.obj.body.y=100;
			//game.camera.follow(toolsGame.mainElements.player.obj);
			//game.camera.follow(toolsGame.mainElements.player.obj, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);

		}
		/* end teleporter postaci */


		// shot bullet whit gun 
		toolsGame.mainElements.player.gun.shot(toolsGame.mainElements.player);

		// visual gun
		toolsGame.mainElements.player.gun.visualGun(toolsGame.mainElements.player);

		// visual fog
        if(typeof proportiesMap[levelFile.activeIdLevel] === 'object') {
            if(proportiesMap[levelFile.activeIdLevel].fog && proportiesMap[levelFile.activeIdLevel].fogSpeed)
            {
                if(oFog.x>=-2500) oFog.x=-3000;
                else oFog.x += proportiesMap[levelFile.activeIdLevel].fogSpeed;
                //console.log(oFog.x);
            }
        }

		//console.log(bg.position.x);

		// parallaxa backgroundu
		if(levelFile.backgroundParallax)
		{

            if(proportiesMap[levelFile.activeIdLevel].background) {
                bg.cameraOffset.x = -game.camera.x / 15;
            }
			if(proportiesMap[levelFile.activeIdLevel].backgroundSecond) {
                bg2.cameraOffset.x=-game.camera.x/8;
            }
		}

        // if (toolsGame.mainElements.player.numberLifes < 1) {
        //     toolsGame.mainElements.player.obj.animations.play('kill-right');
        // }


		if(toolsGame.mainElements.player.generateAgain) {
            toolsGame.mainElements.player.obj.body.x=saveX;
            toolsGame.mainElements.player.obj.body.y=saveY;
            toolsGame.mainElements.player.obj.alpha = 1;

            toolsGame.mainElements.player.obj.play("idle-right");
            toolsGame.mainElements.player.generateAgain = false;
		}

        //toolsGame.mainElements.intruzi.obj.children
        //(toolsGame.mainElements.intruzi.obj.children[0].indexOf("intruzStop") !== -1)
        //console.log(toolsGame.mainElements.player.obj.body.onFloor());
        if (
            jumpButton.isDown &&
            (toolsGame.mainElements.player.obj.body.onFloor() ||
                inArrayObject('intruzi',toolsGame.mainElements.intruzi.obj.children,'intruzStop') ||
                inArrayObject('kladki', toolsGame.mainElements.logs.obj.children,true) ||
                inArrayObject('kladki',toolsGame.mainElements.kladki.poziom.obj.children,true) ||
                inArrayObject('kladki',toolsGame.mainElements.kladki.pionTopBack.obj.children,true) ||
                inArrayObject('kladki',toolsGame.mainElements.kladki.pionBottomBack.obj.children,true) ||
                inArrayObject('kladki',toolsGame.mainElements.kladki.pionTop.obj.children,true) ||
                inArrayObject('kladki',toolsGame.mainElements.kladki.pionBottom.obj.children,true)
            ) && game.time.now > toolsGame.mainElements.player.jumpTimer
        )
        {
            if(!levelFile.blockedKeys)
            {
                if(!toolsGame.mainElements.player.obj.gForceWater) {
                    toolsGame.mainElements.player.obj.body.velocity.y = -toolsGame.mainElements.player.velocityNormal;
                    toolsGame.mainElements.player.jumpTimer = game.time.now + toolsGame.mainElements.player.velocityNormal;
                } else {
                    toolsGame.mainElements.player.obj.body.velocity.y = -toolsGame.mainElements.player.velocityWater;
                    toolsGame.mainElements.player.jumpTimer = game.time.now + toolsGame.mainElements.player.velocityWater;
                }

                if(!toolsGame.mainElements.player.obj.body.bounce.y) {
                    toolsGame.mainElements.player.obj.body.bounce.y = 0.3;
                }
            }
        }

        if(!toolsGame.mainElements.player.obj.t1) {
            toolsGame.mainElements.player.obj.onGround=false;
        }

        if(!theEndCredits) {
            // FrameCounter.updateFPS();
            // toolsGame.text.show(false,
            //     (toolsGame.windows.boxMenu.obj)?3*tileSize:tileSize,
            //     (toolsGame.windows.boxMenu.obj)?7*tileSize:5*tileSize,
            //     1,
            //     (
            //         "timeLoop: " + timeLoop + "\n" +
            //         "level " + levelFile.activeIdLevel + "\n" +
            //         'Timer: ' + timerTotal + "\n" +
            //         '\u2764 Main Lifes x ' + toolsGame.mainElements.player.numberMainLifes + "\n" +
            //         '\u2661 Life x ' +  toolsGame.mainElements.player.numberLifes + "\n" +
            //         'Current gold record: ' + ((toolsGame.mainElements.player.numberCoinsLevelProcentLastMemory>toolsGame.mainElements.player.numberCoinsLevelProcent)?toolsGame.mainElements.player.numberCoinsLevelProcentLastMemory + '%':'-') + "\n" +
            //         'Golds: ' +  toolsGame.mainElements.player.numberCoins + ' (' + toolsGame.mainElements.player.numberCoinsLevelProcent + '%)' + "\n" +
            //         '\u204D bullets: ' + toolsGame.mainElements.player.countBullets + "\n" +
            //         '\u26BF keys: ' + keys + "\n" +
            //         "FPS: " + fpsTest
            //     ),
            //     '700 12px Arial' ,'#ded4b8',true,'infogame',true
            // );

            toolsGame.windows.boxTopMenu.letAlways.show();
            if(!toolsGame.windows.boxTopMenu.f) {
                toolsGame.windows.boxTopMenu.let.show();
                toolsGame.windows.boxTopMenu.f=true;
            }

        }

		//+ timer.duration.toFixed(0)

	}
	
 
};

/*
var gofull=function() {
    if (game.scale.isFullScreen)
    {
        game.scale.stopFullScreen();
    }
    else
    {
        game.scale.startFullScreen(false);
    }
}
*/
var correctCookiesProcent = function () {
    console.log("########### Correct procent #############");

    if(toolsGame.mainElements.player.numberCoinsLevelProcentLastMemory>toolsGame.mainElements.player.numberCoinsLevelProcent) {
        toolsGame.mainElements.player.numberCoinsLevelProcent = toolsGame.mainElements.player.numberCoinsLevelProcentLastMemory;
        setCookies('coins-procent-' + levelFile.activeIdLevel, toolsGame.mainElements.player.numberCoinsLevelProcentLastMemory);
    }
};
var cookiesLastLevelMemory = function () {
    if(getCookies('coins-procent-last-memory')>0 && getCookies('id-level-last-memory')>0) {
        console.log("################# cookies last level and last ID #################");
        console.log(getCookies('id-level-last-memory') + " = prcent:" + getCookies('coins-procent-last-memory'));
        setCookies('coins-procent-'+getCookies('id-level-last-memory'),getCookies('coins-procent-last-memory'));
        setCookies('id-level-last-memory',getCookies('id-level-last-memory'));
    }
};
cookiesLastLevelMemory();

var endGame=function() {
	if(playGame.main) {
	    console.log("########### end game #############");
		game.world.removeAll();
		timer.destroy();
        toolsGame.audio.bg.stop();
		playGame.main=false;
		create();
	}
	else
	{
		//navigator.app.exitApp();
	}
};
var render=function() {

    //game.debug.text(game.time.physicsElapsed, 32, 32);
    //game.debug.bodyInfo(toolsGame.mainElements.player.obj, 16, 24);
   	//if(toolsGame.mainElements.intruzi.obj.children[0]) game.debug.body(toolsGame.mainElements.intruzi.obj.children[0]);
    //if(toolsGame.mainElements.intruzi.obj.children[0]) game.debug.bodyInfo(toolsGame.mainElements.intruzi.obj.children[0], 16, 24);
	//console.log("x-game.load.onLoadStart");

	
};

var game = new Phaser.Game(800, 450, Phaser.CANVAS, 'game-content', { preload: preload, create: create, update: update, render: render });


jQuery(window).on("error", function(evt) {
    console.log("jQuery error event:", evt);
    var e = evt.originalEvent; // get the javascript event
    console.log("original event:", e);
    if (e.message) { 
        alert("Error:\n\t" + e.message + "\nLine:\n\t" + e.lineno + "\nFile:\n\t" + e.filename);
    } else {
        alert("Error:\n\t" + e.type + "\nElement:\n\t" + (e.srcElement || e.target));
    }
});
