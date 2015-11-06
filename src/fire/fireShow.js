
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
		this.MainNode.addChild(fire_score_board, 0 ,'fire_score_board'); 

		//玩家a头像
		var headImgA = new cc.Sprite(fire.userData.a.headImg);
		headImgA.attr({
			x: 43,
			y: fire_score_board.height / 2,
			scale:0.6
		});
		fire_score_board.addChild(headImgA, 0);
		//玩家b头像
		var headImgB = new cc.Sprite(fire.userData.b.headImg);
		headImgB.attr({
			x: fire_score_board.width - 43,
			y: fire_score_board.height / 2,
			scale:0.6
		});
		fire_score_board.addChild(headImgB, 0);
		fire.userData.a.headImgShow = headImgA;
		fire.userData.b.headImgShow = headImgB;

		//玩家a分数
		var scoreA = new cc.LabelTTF('00',  '黑体', 40, cc.size(320,46), cc.TEXT_ALIGNMENT_CENTER);
		scoreA.setFontFillColor(cc.color('#333333'));
		scoreA.attr({
			x: 90,
			y: fire_score_board.height / 2 +10,
		});
		fire_score_board.addChild(scoreA, 0);
		//玩家b分数
		var scoreB = new cc.LabelTTF('00',  '黑体', 40, cc.size(320,46), cc.TEXT_ALIGNMENT_CENTER);
		scoreB.setFontFillColor(cc.color('#333333'));
		scoreB.attr({
			x: fire_score_board.width - 90,
			y: fire_score_board.height / 2 +10,
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
		

		//当前玩家提示动画
		this.show_p_left = new cc.Sprite(res.fire_show_p_left);
		this.show_p_left.attr({x: 140,
			y: fire_score_board.height / 2 ,});
		
		fire_score_board.addChild(this.show_p_left, 1);
		
		this.show_p_right = new cc.Sprite(res.fire_show_p_right);
		this.show_p_right.attr({x: fire_score_board.width - 140,
			y: fire_score_board.height / 2 ,});

		fire_score_board.addChild(this.show_p_right, 1);
		
		
		

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

		var alertxTxt = new cc.LabelTTF('',  '黑体', 30, cc.size(alertX.width-20,100), cc.TEXT_ALIGNMENT_CENTER);
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
		
		
		
		//游戏规则资源
		cc.spriteFrameCache.addSpriteFrames(res.fire_rule_plist);
		//this.ruleBatchNode = new cc.SpriteBatchNode(res.fire_rule_png, 14);
		//走棋规则列表
		this.rule_go = cc.Menu.extend({

			ctor : function(){
				this._super();
				//cc.log(this);

				var that = this;


				var go1 = new cc.MenuItemImage(
						'#go1.png',
						'#go1.png',
						function (btn) {
							that.callBack(btn);
						}, this);
				this.addChild(go1, 0,'go1');

				var go2 = new cc.MenuItemImage(
						'#go2.png',
						'#go2.png',
						function (btn) {
							that.callBack(btn);
						}, this);
				this.addChild(go2, 0,'go2');

				var go3 = new cc.MenuItemImage(
						'#go3.png',
						'#go3.png',
						function (btn) {
							that.callBack(btn);
						}, this);
				this.addChild(go3, 0,'go3');

				var go4 = new cc.MenuItemImage(
						'#go4.png',
						'#go4.png',
						function (btn) {
							that.callBack(btn);
						}, this);
				this.addChild(go4, 0,'go4');

				var go5 = new cc.MenuItemImage(
						'#go5.png',
						'#go5.png',
						function (btn) {
							that.callBack(btn);
						}, this);
				this.addChild(go5, 0,'go5');

				var go6 = new cc.MenuItemImage(
						'#go6.png',
						'#go6.png',
						function (btn) {
							that.callBack(btn);
						}, this);
				this.addChild(go6, 0,'go6');


				this.attr({x:0,y:240});
				this.alignItemsVertically();




				var close = new cc.MenuItemImage(
						res.fire_close,
						res.fire_close,
						function (btn) {
							that.callBack(btn);
						}, this);
				close.attr({
					x:180,
					y:310
				});
				this.addChild(close, 0,'close');
			},
			
			callBack:function(btn){
				that.rule_show(btn.getName());
			}
		});
		
		this.rule_put = cc.Menu.extend({

			ctor : function(){
				this._super();
				//cc.log(this);

				var that = this;



				var put1 = new cc.MenuItemImage(
						'#put1.png',
						'#put1.png',
						function (btn) {
							that.callBack(btn);
						}, this);
				this.addChild(put1, 0,'put1');

				var put2 = new cc.MenuItemImage(
						'#put2.png',
						'#put2.png',
						function (btn) {
							that.callBack(btn);
						}, this);
				this.addChild(put2, 0,'put2');

				var put3 = new cc.MenuItemImage(
						'#put3.png',
						'#put3.png',
						function (btn) {
							that.callBack(btn);
						}, this);
				this.addChild(put3, 0,'put3');

				var put4 = new cc.MenuItemImage(
						'#put4.png',
						'#put4.png',
						function (btn) {
							that.callBack(btn);
						}, this);
				this.addChild(put4, 0,'put4');

				 


				this.attr({x:0,y:170});
				this.alignItemsVertically();




				var close = new cc.MenuItemImage(
						res.fire_close,
						res.fire_close,
						function (btn) {
							that.callBack(btn);
						}, this);
				close.attr({
					x:180,
					y:250
				});
				this.addChild(close, 0,'close');
			},
			callBack:function(btn){
				that.rule_show(btn.getName());
			}
		});
		
		
	},
	//run or stop玩家提示动画
	show_p_runAction:function(user,type){
		
		if(user == 'a'){
			
			if(type === false){
				this.show_p_left.stopAllActions();
				this.show_p_left.x = 140;
				this.show_p_left.opacity = 255;
			}else{
				this.show_p_left.runAction(this.show_p_Action(this.show_p_left,15));
				
			}
		}else if(user == 'b'){
			if(type === false){
				this.show_p_right.stopAllActions();
				this.show_p_right.x = 454 - 140;
				this.show_p_right.opacity = 255;
			}else{
				this.show_p_right.runAction(this.show_p_Action(this.show_p_right,-15));
				
			}
		}
		
		
		//
	},
	//玩家提示动画
	show_p_Action:function(sprite , move){
		
		var posX = sprite.x;
		var show_p_Action = cc.repeatForever(cc.sequence ( cc.spawn(cc.moveTo(0.3, cc.p( posX - move,sprite.y)).easing(cc.easeIn(0.3)), cc.fadeOut(0.3)), cc.delayTime(0.3), cc.callFunc(function () {
			sprite.x = sprite.x + move;
			sprite.opacity = 255;
		}, this)));
		return show_p_Action;
	},
	
	//游戏规则
	rule_show:function(type){
		
		var that = this;
		
		if(type == 'close' || this.MainNode.getChildByName('rule_list')){
			this.MainNode.getChildByName('rule_list').removeFromParent(true);
			
		}

		if(type == 'go'){
			var rule_go_menu = new this.rule_go();
			
			var rule_go_list = this.alertBg(550);
			rule_go_list.addChild(rule_go_menu,0,'rule_go_list');
			var go_tab = this.rule_tab('go','put');
			go_tab.attr({x:0,y:515});
			rule_go_list.addChild(go_tab,0,'go_tab');

			this.MainNode.addChild(rule_go_list, 0,'rule_list');
		}else if(type=='put'){
			var rule_put_menu = new this.rule_put();

			var rule_put_list = this.alertBg(410);
			rule_put_list.addChild(rule_put_menu,0,'rule_put_list');
			
			var put_tab = this.rule_tab('put','go');
			put_tab.attr({x:0,y:375});
			rule_put_list.addChild(put_tab,0,'put_tab');

			this.MainNode.addChild(rule_put_list, 0,'rule_list');
			
			
		}else if(type.indexOf('go') != -1){
			
			
			var rule_go_list = this.alertBg(570);
			
			var _con = new cc.Sprite(res['fire_rule_'+type]);
			_con.attr({x:0,y:270});
			rule_go_list.addChild(_con,0);
			
			var go_tab = this.rule_tab('go','put');
			go_tab.attr({x:0,y:515});
			rule_go_list.addChild(go_tab,0,'go_tab');
			
			var close = new cc.MenuItemImage(
					res.fire_close,
					res.fire_close,
					function (btn) {
						that.rule_show('close');
					}, this);
			close.attr({
				x:180,
				y:570
			});

			var back2list = new cc.MenuItemImage(
					res.fire_back2list,
					res.fire_back2list_sel,
					function (btn) {
						//btn.getParent().getParent().removeFromParent(true);
						that.rule_show('go');
					}, this);
			back2list.attr({
				x:0,
				y:35
			});

			var menu = new cc.Menu(close,back2list);
			menu.attr({x:0,y:0});
			rule_go_list.addChild(menu,0);
			
			this.MainNode.addChild(rule_go_list, 0,'rule_list');
		}else if(type.indexOf('put') != -1){


			var rule_put_list = this.alertBg(570);

			var _con = new cc.Sprite(res['fire_rule_'+type]);
			_con.attr({x:0,y:270});
			rule_put_list.addChild(_con,0);

			var put_tab = this.rule_tab('put','go');
			put_tab.attr({x:0,y:515});
			rule_put_list.addChild(put_tab,0,'put_tab');
			
			var close = new cc.MenuItemImage(
					res.fire_close,
					res.fire_close,
					function (btn) {
						that.rule_show('close');
					}, this);
			close.attr({
				x:180,
				y:570
			});
			
			var back2list = new cc.MenuItemImage(
					res.fire_back2list,
					res.fire_back2list_sel,
					function (btn) {
						//btn.getParent().getParent().removeFromParent(true);
						that.rule_show('put');
					}, this);
			back2list.attr({
				x:0,
				y:35
			});
			
			var menu = new cc.Menu(close,back2list);
			menu.attr({x:0,y:0});
			rule_put_list.addChild(menu,0);

			this.MainNode.addChild(rule_put_list, 0,'rule_list');
		}
		
		


		
	},
	//游戏规则列表中的tab切换
	rule_tab:function(s,b){
		
		var that = this;
		
		var tab = new cc.Sprite('#'+s+'Sp.png');
		
		
		var _btn = new cc.MenuItemImage(
				'#'+b+'.png',
				'#'+b+'.png',
				function () {
					that.rule_show(b);
				}, this);
		if(s == 'go'){
			_btn.attr({x:234,y:29});
		}else{
			_btn.attr({x:79,y:29});
		}
		var menu = new cc.Menu(_btn);
		//menu.addChild(_btn, 0);
		menu.attr({x:0,y:0});
		tab.addChild(menu, 0);
		return tab;
	},
	
	alertBg:function(height ){
		
		if(typeof this.alert == 'undefined')this.alert = [];
		
		var alertSp = new cc.Sprite();
		alertSp.setContentSize(0, height);
		alertSp.attr ({
				
				x:this.MainNode.width/2,
				y:this.MainNode.height/2,
				
		});
		
		
		
		var alertBG_top = new cc.Sprite(res.fire_alertBG_top);
		alertBG_top.attr({
			
			y: alertSp.height,
		});
		alertSp.addChild(alertBG_top, 0);
		
		var alertBG_bottom = new cc.Sprite(res.fire_alertBG_top);
		alertBG_bottom.attr({

			flippedY:true
		});
		alertSp.addChild(alertBG_bottom, 0);
		
		var alertBG_body = new cc.Sprite(res.fire_alertBG_body);
		alertBG_body.attr({
			y: alertSp.height /2,
			scaleY:height-40
		});
		alertSp.addChild(alertBG_body, 0);
		
		return alertSp;
	},
	
	
	//兵变
	showAlertB:function(){
		this.alertB.setVisible(true);
	},
	
	//游戏结束 结算框
	showGameover:function(user,isWin,score){
		
		//蒙版
		var bgLayer = new cc.LayerColor(cc.color(0, 0, 0, 155));
		this.addChild(bgLayer, 0);
		
		
		//game over
		if(isWin > 0){	
			var gameOver = new cc.Sprite(res.fire_gameover,cc.rect(0,405,540,405));//胜
		}else if(isWin == 0){
			var gameOver = new cc.Sprite(res.fire_gameover,cc.rect(0,0,540,405));//平
		}else{
			var gameOver = new cc.Sprite(res.fire_gameover,cc.rect(0,810,540,405));//负
		}
		gameOver.attr({
			x: cc.winSize.width /2,
			y: cc.winSize.height / 2,
			scale:cc.winSize.width / gameOver.width
			//visible:false
		});
		this.addChild(gameOver, 0,'gameOver');
		
		
		if(isWin > 0 || isWin < 0){
			
			var Txt = new cc.LabelTTF('获胜方：',  '黑体', 40, cc.size(200,66), cc.TEXT_ALIGNMENT_CENTER);
			Txt.setFontFillColor(cc.color('#ffffff'));
			Txt.attr({
				x: 200,
				y: 128,
			});
			var head =  new cc.Sprite(fire.userData[user].headImg);
			head.attr({
				x: 300,
				y: 128,
				scale:0.8
			});
			gameOver.addChild(Txt, 0);
			gameOver.addChild(head, 0);
		}else{
			var Txt = new cc.LabelTTF(score+' : '+score,  '黑体', 40, cc.size(200,66), cc.TEXT_ALIGNMENT_CENTER);
			Txt.setFontFillColor(cc.color('#ffffff'));
			Txt.attr({
				x: gameOver.width / 2,
				y: 133,
			});
			var heada =  new cc.Sprite(fire.userData['a'].headImg);
			heada.attr({
				x: 150,
				y: 133,
				scale:0.8
			});
			var headb =  new cc.Sprite(fire.userData['b'].headImg);
			headb.attr({
				x: 390,
				y: 133,
				scale:0.8
			});
			gameOver.addChild(Txt, 0);
			gameOver.addChild(heada, 0);
			gameOver.addChild(headb, 0);
		}
		
		
		
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
				this.diceBatchNode.addChild(this.diceEnd[i],1);
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