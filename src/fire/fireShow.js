
var fire_showLayer = cc.Layer.extend({
	sprite:null,
	ctor:function () {
		this._super();

		var that = this;

		var size = cc.winSize;
		//层主节点    该层所有元素都放入这个节点 方便整体缩放
		this.MainNode = new cc.Sprite(res.mainNodeBg);

		this.MainNode.attr({
			x: size.width / 2,
			y: size.height / 2,
			anchorX:0.5,
			anchorY:0.5,
			scaleX:cc.winSize[displayMode]/this.MainNode[displayMode],
			scaleY:cc.winSize[displayMode]/this.MainNode[displayMode]
		});
		this.addChild(this.MainNode,0);


		//记分牌
		var fire_score_board = new cc.Sprite(res.fire_score_board);
		fire_score_board.attr({
			x: this.MainNode.width / 2,
			y: this.MainNode.height-150,

		});
		this.MainNode.addChild(fire_score_board, 0); 

		//玩家a头像
		var headImgA = new cc.Sprite(fire.userData.a.headImg);
		headImgA.attr({
			x: 43,
			y: fire_score_board.height / 2,

		});
		fire_score_board.addChild(headImgA, 0);
		//玩家b头像
		var headImgB = new cc.Sprite(fire.userData.b.headImg);
		headImgB.attr({
			x: fire_score_board.width - 43,
			y: fire_score_board.height / 2,

		});
		fire_score_board.addChild(headImgB, 0);

		//玩家a分数
		var scoreA = new cc.LabelTTF('00',  '黑体', 40, cc.size(320,40), cc.TEXT_ALIGNMENT_CENTER);
		scoreA.setFontFillColor(cc.color('#333333'));
		scoreA.attr({
			x: 90,
			y: fire_score_board.height / 2,
		});
		fire_score_board.addChild(scoreA, 0);
		//玩家b分数
		var scoreB = new cc.LabelTTF('00',  '黑体', 40, cc.size(320,40), cc.TEXT_ALIGNMENT_CENTER);
		scoreB.setFontFillColor(cc.color('#333333'));
		scoreB.attr({
			x: fire_score_board.width - 90,
			y: fire_score_board.height / 2,
		});
		fire_score_board.addChild(scoreB, 0);
		fire.userData.a.scoreShow = scoreA;
		fire.userData.b.scoreShow = scoreB;

		//时间
		cc.spriteFrameCache.addSpriteFrames(res.fire_time_plist);
		this.timeBatchNode = new cc.SpriteBatchNode(res.fire_time_png, 11);
		this.timeBatchNode.attr({
			x: fire_score_board.width /2,
			y: fire_score_board.height / 2 + 5,
		});
		fire_score_board.addChild(this.timeBatchNode, 1);
		var times = [];
		for(var i=0;i<10;i++){

			var sprite = cc.spriteFrameCache.getSpriteFrame('t'+i+'.png');
			times.push( sprite);
		}
		this.times = times;
		//时间冒号
		var time_tt = new cc.Sprite(
				cc.spriteFrameCache.getSpriteFrame('tt.png')
		);
		this.timeBatchNode.addChild(time_tt, 0);


		//骰子资源
		cc.spriteFrameCache.addSpriteFrames(res.fire_dices_plist);
		this.diceBatchNode = new cc.SpriteBatchNode(res.fire_dices_png, 16);
		this.MainNode.addChild(this.diceBatchNode, 1);


		//this.fire_dice_png.setTexture(cc.textureCache.addImage(cc.spriteFrameCache.getSpriteFrame('dice_end0.png')));

		//this.showTime(fire.gameConfig.gameTime);



		//弹窗
		var alertX = new cc.Sprite(res.fire_alertx);
		alertX.attr({
			x: this.MainNode.width /2,
			y: this.MainNode.height / 2,
			visible:false
		});
		this.MainNode.addChild(alertX, 0);
		this.alertX = alertX;

		var alertxTxt = new cc.LabelTTF('',  '黑体', 30, cc.size(alertX.width-20,50), cc.TEXT_ALIGNMENT_CENTER);
		alertxTxt.setFontFillColor(cc.color('#ffffff'));
		alertxTxt.attr({
			x: alertX.width /2,
			y: 140,
		});
		this.alertX.addChild(alertxTxt, 0);
		this.alertxTxt = alertxTxt;

		var fire_ok = new cc.MenuItemImage(
				res.fire_ok,
				res.fire_ok_sel,
				function (btn) {
					//
					//cc.log(btn)
					if(typeof btn.cb == 'function')btn.cb();
					alertX.setVisible(false);
				}, this);
		fire_ok.attr({
			x: this.alertX.width/4, 
			y: 70,
		});
		var fire_cancel = new cc.MenuItemImage(
				res.fire_cancel,
				res.fire_cancel_sel,
				function (btn) {
					//
					//cc.log(btn)
					if(typeof btn.cb == 'function')btn.cb();
					alertX.setVisible(false);
				}, this);
		fire_cancel.attr({
			x: this.alertX.width *3/4, 
			y: 70,
		});

		var menu = new cc.Menu(fire_ok,fire_cancel);
		menu.x = 0;
		menu.y = 0;
		this.alertX.addChild(menu, 0);
		this.fire_ok = fire_ok;
		this.fire_cancel = fire_cancel;


		//兵变选择框
		var alertB = new cc.Sprite(res.fire_alertb);
		alertB.attr({
			x: this.MainNode.width /2,
			y: this.MainNode.height / 2,
			visible:false
		});
		this.MainNode.addChild(alertB, 0);
		this.alertB = alertB;

		var fire_b2che = new cc.MenuItemImage(
				res.fire_b2che,
				res.fire_b2che,
				function (btn) {

					if(that.getParent().getChildByName('gl').bingbian2('che'))
						alertB.setVisible(false);
				}, this);
		fire_b2che.attr({
			x: alertB.width/2, 
			y: 305,
		});
		var margin = 78;
		var fire_b2ma = new cc.MenuItemImage(
				res.fire_b2ma,
				res.fire_b2ma,
				function (btn) {

					if(that.getParent().getChildByName('gl').bingbian2('ma'))
						alertB.setVisible(false);
				}, this);
		fire_b2ma.attr({
			x: alertB.width/2, 
			y: 305-margin,
		});
		var fire_b2xiang = new cc.MenuItemImage(
				res.fire_b2xiang,
				res.fire_b2xiang,
				function (btn) {

					if(that.getParent().getChildByName('gl').bingbian2('xiang'))
						alertB.setVisible(false);
				}, this);
		fire_b2xiang.attr({
			x: alertB.width/2, 
			y: 305-margin*2,
		});
		var fire_b2hou = new cc.MenuItemImage(
				res.fire_b2hou,
				res.fire_b2hou,
				function (btn) {

					if(that.getParent().getChildByName('gl').bingbian2('hou'))
						alertB.setVisible(false);
				}, this);
		fire_b2hou.attr({
			x: alertB.width/2, 
			y: 305-margin*3,
		});

		var menu = new cc.Menu(fire_b2che,fire_b2ma,fire_b2xiang,fire_b2hou);
		menu.x = 0;
		menu.y = 0;
		this.alertB.addChild(menu, 0);
	},
	//兵变
	showAlertB:function(){
		this.alertB.setVisible(true);
	},

	showGameover:function(score,isWin){
		//game over
		if(isWin){
			var gameOver = new cc.Sprite(res.fire_gameover,cc.rect(0,405,540,405));
		}else{
			var gameOver = new cc.Sprite(res.fire_gameover,cc.rect(0,0,540,405));
		}
		gameOver.attr({
			x: this.MainNode.width /2,
			y: this.MainNode.height / 2,
			//visible:false
		});
		this.MainNode.addChild(gameOver, 0,'gameOver');

		var Txt = new cc.LabelTTF(''+score,  '黑体', 30, cc.size(200,30), cc.TEXT_ALIGNMENT_CENTER);
		Txt.setFontFillColor(cc.color('#ffffff'));
		Txt.attr({
			x: gameOver.width /2,
			y: 120,
		});
		gameOver.addChild(Txt, 0);
	},

	showAlertX:function(text,cb1,cb2){
		this.alertxTxt.setString(text);
		this.fire_ok.cb = cb1;
		this.fire_cancel.cb = cb2;
		this.alertX.setVisible(true);
	},

	showTime:function(seconds){


		if(typeof this.t1 != 'undefined'){
			this.t1.removeFromParent(true);
			this.t2.removeFromParent(true);
			this.t3.removeFromParent(true);
			this.t4.removeFromParent(true);
		}



		//分钟十位
		var t1 = parseInt(seconds/60/10);
		this.t1 = new cc.Sprite( this.times[t1]);
		this.t1.attr({
			x:-42,
			visible:true
		});
		this.timeBatchNode.addChild(this.t1, 0);

		//分钟个位
		var t2 = parseInt(seconds/60)%10;
		this.t2 = new cc.Sprite( this.times[t2]);
		this.t2.attr({
			x:-21,
		});
		this.timeBatchNode.addChild(this.t2, 0);


		//秒钟十位
		var t3 = parseInt((seconds%60)/10);
		this.t3 = new cc.Sprite( this.times[t3]);
		this.t3.attr({
			x:21,
		});
		this.timeBatchNode.addChild(this.t3, 0);

		//秒钟个位
		var t4 = seconds%60%10;
		this.t4 = new cc.Sprite( this.times[t4]);
		this.t4.attr({
			x:42,
		});
		this.timeBatchNode.addChild(this.t4, 0);


	},

	setScore:function(user,score){
		fire.userData[user].scoreShow.setString(score);

	},

	shakeDice:function(num){

		if(num == 'clear'){
			for(var i in this.diceEnd){
				this.diceEnd[i].setVisible(false);
			}

			if(typeof this.fire_dice_png != 'undefined'){

				this.fire_dice_png.removeFromParent(true);
			}
			//骰子精灵
			var fire_dice_png = new cc.Sprite(
					cc.spriteFrameCache.getSpriteFrame('dice_start.png')
			);
			fire_dice_png.attr({
				x: this.MainNode.width/2, 
				y: 100,
			});

			this.diceBatchNode.addChild(fire_dice_png,0);
			this.fire_dice_png = fire_dice_png;

			return false;
		}
		num = parseInt(num);
		if(num < 0 )return false

		if(typeof this.diceEnd == 'undefined'){
			/**/
			this.diceEnd = {
					'0':new cc.Sprite(
							cc.spriteFrameCache.getSpriteFrame('dice_end0.png')
					),
					'1':new cc.Sprite(
							cc.spriteFrameCache.getSpriteFrame('dice_end1.png')
					),
					'3':new cc.Sprite(
							cc.spriteFrameCache.getSpriteFrame('dice_end3.png')
					),
					'5':new cc.Sprite(
							cc.spriteFrameCache.getSpriteFrame('dice_end5.png')
					),
					'9':new cc.Sprite(
							cc.spriteFrameCache.getSpriteFrame('dice_end9.png')
					),
			};

			for(var i in this.diceEnd){
				this.diceBatchNode.addChild(this.diceEnd[i],1);cc.log(123);
				this.diceEnd[i].attr({
					x: this.MainNode.width/2, 
					y: 100,
					visible:false
				})
			}

		}
		var that = this;

		//骰子动画
		var diceanimFrames = [];
		for (var i = 0; i < 4; i++) {
			var str = "dice_anim" + i + ".png";
			var frame = cc.spriteFrameCache.getSpriteFrame(str);
			//if(cc.sys.isNative)frame.retain();
			diceanimFrames.push(frame);
		}
		diceanimFrames.push(cc.spriteFrameCache.getSpriteFrame('dice_start.png'));
		diceAnimation = new cc.Animation(diceanimFrames, 0.04,4);
		//if(cc.sys.isNative)this.diceAnimation.retain();
		diceAnimate = cc.animate(diceAnimation);
		//if(cc.sys.isNative)this.diceAnimate.retain();

		diceanim =new cc.Sequence(  diceAnimate,
				cc.callFunc(function(){

					//动画完成时的回调
					that.diceEnd[num].setVisible(true);
					that.fire_dice_png.setVisible(false);
					that.getParent().getChildByName('gl').showChessable();
				}));
		//if(cc.sys.isNative)this.diceanim.retain();

		this.fire_dice_png.runAction(diceanim);
	}
});