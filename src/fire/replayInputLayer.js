

var fire_replayInputLayer = cc.Layer.extend({
	sprite:null,
	ctor:function () {
		//////////////////////////////
		// 1. super init first
		this._super();

		var size = cc.winSize;
		
		var that = this;

		// 背景图
		var fire_bg = new cc.Sprite(res.fire_playertext_bg);
		fire_bg.attr({
			x: size.width / 2,
			y: size.height / 2,
			scaleX : size.width / fire_bg.width,
			scaleY : size.height / fire_bg.height
		});
		this.addChild(fire_bg, 0);
		//fire_bg.setTexture(res.main_menuBg);


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

		
		
		//按钮
		var fire_back = new cc.MenuItemImage(
				res.fire_back,
				res.fire_back_sel,
				res.fire_back,
				function (btn) {
					btn.getParent().pubCallBack(btn);
					cc.director.runScene(new mainMenuScene());
				}, this);
		fire_back.attr({
			x: 60, 
			y: this.MainNode.height-50,
			name :'back'
		});
		
		
		
		var menu = new cc.Menu(fire_back);
		menu.x = 0;
		menu.y = 0;
		this.MainNode.addChild(menu, 0);
		menu.pubCallBack = function(btn){
			//音效
			cc.audioEngine.playEffect(res.fire_au_beep);
		};

		
		var fire_player_text = new cc.Sprite(res.fire_player_text);

		fire_player_text.attr({
			x: this.MainNode.width / 2,
			y: this.MainNode.height / 2
		});
		this.MainNode.addChild(fire_player_text,0,'fire_player_text');
		
		//提交
		var fire_ok = new cc.MenuItemImage(
				res.fire_ok,
				res.fire_ok_sel,
				res.fire_back,
				function (btn) {
					cc.audioEngine.playEffect(res.fire_au_beep);
					//Field.setDetachWithIME(true);
					
					fire.runtime.chessMapStr = Field.getString();

					//测试棋谱
					that.getParent().getChildByName('gl').newGame(true);
				}, this);
		fire_ok.attr({
			x: fire_player_text.width/2, 
			y: 55,
			name :'ok'
		});

		var menu = new cc.Menu(fire_ok);
		menu.x = 0;
		menu.y = 0;
		fire_player_text.addChild(menu, 0);
		
		
		var Field = new ccui.Text('\n\n\n\n\n\n\n　　　　　　点击粘贴棋谱','',18);
		//Field.setPlaceHolder('请输入4位数字密码！');
		Field.ignoreContentAdaptWithSize(false);
		Field.setTextAreaSize(cc.size(fire_player_text.width-80,fire_player_text.height-140));
		Field.attr({
			x: fire_player_text.width /2,
			y: fire_player_text.height /2 + 40,
		});
		Field.setTextColor(cc.color('#000'));
		//Field.setDetachWithIME(true);
		fire_player_text.addChild(Field, 0);
		
		Field.EXT_EventListener({event:'TOUCH_ONE_BY_ONE',onTouchBegan:function(isTouched){
			if(isTouched){
				var mapStr = getClip();
				Field.setString(mapStr);
			}
		}});
		
		
		
		//this.inputClick(Field);
		/****/
		//return true;
	},
	inputClick:function(Field){


		Field.onClickTrackNode = function (clicked) {
			//var textField = this._trackNode;
			if (clicked) {

				//Field.setAttachWithIME(true);
			} else {

				//Field.setDetachWithIME(true);
			}
			var mapStr = getClip();
			trace(mapStr);
			this.setInsertText(mapStr);
		}
		//监听输入框点击事件
		var FieldListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: function (touch, event) {
				var target = event.getCurrentTarget();
				var p = target.convertToNodeSpace(touch.getLocation());//cc.log(p);
				//cc.log(target.visible)
				if(target.EXT_getVisible())	
					target.onClickTrackNode(cc.rectContainsPoint(cc.rect(0, 0, target.width, target.height), p));

				return false;
			},
		});

		cc.eventManager.addListener(FieldListener, Field);
	}
});





