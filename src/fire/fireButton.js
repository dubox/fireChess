

var fire_menuLayer = cc.Layer.extend({
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





		//按钮
		var fire_back = new cc.MenuItemImage(
				res.fire_back,
				res.fire_back_sel,
				function () {
					cc.director.runScene(new fireMenuScene());
				}, this);
		fire_back.attr({
			x: 60, 
			y: this.MainNode.height-50,
		});

		var fire_guize = new cc.MenuItemImage(
				res.fire_guize,
				res.fire_guize_sel,
				function () {

				}, this);
		fire_guize.attr({
			x: this.MainNode.width-60, 
			y: this.MainNode.height-50,
		});

		var fire_huiqi = new cc.MenuItemImage(
				res.fire_huiqi,
				res.fire_huiqi_sel,
				function () {
					that.getParent().getChildByName('gl').backChess();
				}, this);
		fire_huiqi.attr({
			x: 60, 
			y: 100,
		});

		var fire_chonglai = new cc.MenuItemImage(
				res.fire_chonglai,
				res.fire_chonglai_sel,
				function () {
					that.getParent().getChildByName('gl').newGame();
				}, this);
		fire_chonglai.attr({
			x: 160, 
			y: 100,
		});

		var fire_jiaohuan = new cc.MenuItemImage(
				res.fire_jiaohuan,
				res.fire_jiaohuan_sel,
				function () {

					fire.gameConfig.color.reverse();
					var tmp = fire.userData.a;
					fire.userData.a = fire.userData.b;
					fire.userData.b = tmp;
					fire.userData.a.color = 'y';
					fire.userData.b.color = 'g';
					fire.gameConfig.reverse = fire.gameConfig.reverse?false:true;
					that.getParent().getChildByName('gl').newGame();
				}, this);
		fire_jiaohuan.attr({
			x: this.MainNode.width-60, 
			y: 100,
		});

		var fire_pifu = new cc.MenuItemImage(
				res.fire_pifu,
				res.fire_pifu_sel,
				function () {
					var skin = fire.runtime.skin+1;
					if(skin>3)skin = 1;
					that.getParent().getChildByName('gl').skin(skin);
				}, this);
		fire_pifu.attr({
			x: this.MainNode.width-160, 
			y: 100,
		});



		//
		cc.log(fire_gameScene)
		//骰子按钮
		var fire_dice_btn = new cc.MenuItemImage(
				res.fire_dices_btn,
				res.fire_dices_btn,
				function () {
					if(fire.runtime.status == 'roundStart')
						that.getParent().getChildByName('gl').shakeDice();
				}, this);
		fire_dice_btn.attr({
			x: this.MainNode.width/2, 
			y: 100,
		});



		var menu = new cc.Menu(fire_back,fire_guize,fire_huiqi,fire_chonglai,fire_jiaohuan,fire_pifu,fire_dice_btn);
		menu.x = 0;
		menu.y = 0;
		this.MainNode.addChild(menu, 0);



	}
});

