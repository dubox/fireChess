
var mainMenuLayer = cc.Layer.extend({
	sprite:null,
	ctor:function () {
		//////////////////////////////
		// 1. super init first
		this._super();

		var size = cc.winSize;
		

		// 背景图
		var menuBg = new cc.Sprite(res.main_menuBg);
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
		
		//按钮
		var main_btn_huo = new cc.MenuItemImage(
				res.main_btn_huo,
				res.main_btn_huo_sel,
				function (btn) {
					btn.getParent().pubCallBack(btn);
					cc.director.runScene(new fireMenuScene());
				}, this);
		main_btn_huo.attr({
			x: this.MainNode.width /2,
			y: 400,
		});
		
		var main_btn_shu = new cc.MenuItemImage(
				res.main_btn_shu,
				res.main_btn_shu_sel,
				function (btn) {
					btn.getParent().pubCallBack(btn);
				}, this);
		main_btn_shu.attr({
			x: this.MainNode.width /2,
			y: 300,
		});
		
		var main_btn_qita = new cc.MenuItemImage(
				res.main_btn_qita,
				res.main_btn_qita_sel,
				function (btn) {
					btn.getParent().pubCallBack(btn);
				}, this);
		main_btn_qita.attr({
			x: this.MainNode.width /2,
			y: 200,
		});

		var menu = new cc.Menu(main_btn_huo,main_btn_shu,main_btn_qita);
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

var mainMenuScene = cc.Scene.extend({
	onEnter:function () {
		this._super();
		var layer = new mainMenuLayer();
		this.addChild(layer);
		
		//var customClass = cc.CustomClass.create();
		//var msg = customClass.helloMsg();
		//cc.log("customClass's msg is : " + msg);
	
		
	}
});







//公共函数

//取随机整数
function random(start,end){
	return parseInt(Math.random()*(end-start)+start);
}


//随机在数组中取一个元素
function arrRandom(arr){
	return arr[random(0,arr.length-1)];
}





