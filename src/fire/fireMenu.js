


var fire_gameType_rj = true;//是否人机对战	
var fireMenuLayer = cc.Layer.extend({
	sprite:null,
	ctor:function () {
		//////////////////////////////
		// 1. super init first
		this._super();

		var size = cc.winSize;


		// 背景图
		var menuBg = new cc.Sprite(res.fire_menuBg);
		menuBg.attr({
			x: size.width / 2,
			y: size.height / 2,
			scaleX : size.width / menuBg.width,
			scaleY : size.height / menuBg.height
		});
		this.addChild(menuBg, 0); 


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



		// logo
		var fire_logo = new cc.Sprite(res.fire_logo);
		fire_logo.attr({
			x: this.MainNode.width / 2,
			y: 700,
		});
		this.MainNode.addChild(fire_logo, 0); 
		
		//返回按钮
		var fire_back = new cc.MenuItemImage(
				res.fire_back,
				res.fire_back_sel,
				function (btn) {
					btn.getParent().pubCallBack(btn);
					
					cc.director.runScene(new mainMenuScene());
				}, this);
		fire_back.attr({
			x: 60, 
			y: this.MainNode.height-50,
		});
		
		//游戏模式按钮
		var main_btn_rr = new cc.MenuItemImage(
				res.fire_rr,
				res.fire_rr_sel,
				function (btn) {
					btn.getParent().pubCallBack(btn);
					
					fire_gameType_rj = false;
					cc.director.runScene(new fire_gameScene());
				}, this);
		main_btn_rr.attr({
			x: this.MainNode.width /2,
			y: 400,
			scaleX:0.4,
			scaleY:0.4,
		});

		var main_btn_rj = new cc.MenuItemImage(
				res.fire_rj,
				res.fire_rj_sel,
				function (btn) {
					btn.getParent().pubCallBack(btn);
					
					fire_gameType_rj = true;
					cc.director.runScene(new fire_gameScene());
				}, this);
		main_btn_rj.attr({
			x: this.MainNode.width /2,
			y: 220,
			scaleX:0.4,
			scaleY:0.4,
		});



		var menu = new cc.Menu(main_btn_rr,main_btn_rj,fire_back);
		menu.x = 0;
		menu.y = 0;
		this.MainNode.addChild(menu, 0);

		menu.pubCallBack = function(btn){
			//音效
			
			cc.audioEngine.playEffect(res.fire_au_beep);
			
		};

		return true;
	}
});

var fireMenuScene = cc.Scene.extend({
	onEnter:function () {
		this._super();
		var layer = new fireMenuLayer();
		this.addChild(layer);
	}
});