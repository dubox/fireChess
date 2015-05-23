
var mainMenuLayer = cc.Layer.extend({
	sprite:null,
	ctor:function () {
		//////////////////////////////
		// 1. super init first
		this._super();
		var that = this;
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
					cc.director.runScene(new shuduMenuScene());
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
					
					var h = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "openUrll", "(Ljava/lang/String;)V", "http://m.lianzhong.com");
				}, this);
		main_btn_qita.attr({
			x: this.MainNode.width /2,
			y: 200,
		});
		
		var main_btn_lock = new cc.MenuItemImage(
				res.main_child_opened,
				res.main_child_locked,
				function (btn) {
					btn.getParent().pubCallBack(btn);
					that.showAlertX('上锁后，每天只能玩3小时，防止\n您的孩子沉迷游戏！', function(){
						var passW = parseInt(that.child_input.getString());
						that.child_input.setString('');
						if(passW <1000 || passW > 9999)return false;
						if(typeof passW != 'number')return false;cc.log(2)
						
						if(child_lock.type){
							if(passW == child_lock.password){
								child_lock.type = 0;
								btn.unselected();
							}
						}else{
							child_lock.type = 1;
							child_lock.password = passW;
							child_lock.timeLeft = child_lock.timeTotal;
							btn.selected();
						}
						setLocalJson('child_lock',child_lock);
						that.alertX.setVisible(false);
					});
				}, this);
		main_btn_lock.attr({
			x: this.MainNode.width - 100,
			y: 530,
			scale:0.5
		});
		if(child_lock.type){main_btn_lock.selected()}
		

		var menu = new cc.Menu(main_btn_huo,main_btn_shu,main_btn_qita);//,main_btn_lock
		menu.x = 0;
		menu.y = 0;
		this.MainNode.addChild(menu, 0);
		
		menu.pubCallBack = function(btn){
			//音效
			
				cc.audioEngine.playEffect(res.fire_au_beep);
			
		};
		
		
		//弹窗
		var alertX = this.alertBg(300);
		this.MainNode.addChild(alertX, 0);
		this.alertX = alertX;

		var alertxTxt = new cc.LabelTTF('',  '黑体', 25, cc.size(alertX.width-20,70), cc.TEXT_ALIGNMENT_CENTER);
		alertxTxt.setFontFillColor(cc.color('#ffffff'));
		alertxTxt.attr({
			x: alertX.width /2,
			y: 240,
		});
		this.alertX.addChild(alertxTxt, 0);
		this.alertxTxt = alertxTxt;
		
		
		
		var child_input_bg = new cc.Sprite(res.main_child_input);
		child_input_bg.attr({
			x: alertX.width /2,
			y: 150,
			scale:0.5
		});
		this.alertX.addChild(child_input_bg, 0);
		

		//输入框
		var Field = new cc.TextFieldTTF("", cc.size(child_input_bg.width,child_input_bg.height), cc.TEXT_ALIGNMENT_CENTER,"Arial", 72);
		Field.setPlaceHolder('请输入4位数字密码！');
		Field.attr({
			x: child_input_bg.width /2,
			y: child_input_bg.height /2,
		});
		child_input_bg.addChild(Field, 0);
		this.child_input = Field;
		this.inputClick(Field);

		var fire_ok = new cc.MenuItemImage(
				res.fire_ok,
				res.fire_ok_sel,
				function (btn) {
					//
					//cc.log(btn)
					if(typeof btn.cb == 'function')
						{
							btn.cb();
						}else{
							alertX.setVisible(false);
						}
					
				}, this);
		fire_ok.attr({
			x: this.alertX.width/4, 
			y: 60,
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
			y: 60,
		});

		var menu = new cc.Menu(fire_ok,fire_cancel);
		menu.x = 0;
		menu.y = 0;
		this.alertX.addChild(menu, 0);
		this.fire_ok = fire_ok;
		this.fire_cancel = fire_cancel;
		//********弹窗end
		
		
		
		//***********************检查版本更新
		if(typeof version_ser.ver != 'undefined' && version != version_ser.ver && parseInt(version.replace(/\./g, '')) < parseInt(version_ser.ver.replace(/\./g, ''))){
							
			var desLines = version_ser.des.split('\n').length;
			var txth = desLines * 30 + 50 ;	//文本高度
			
			//弹窗
			this.showAlert(txth+ 100, function(alertBg){
				var alertxTxt = new cc.LabelTTF('发现新版本：'+version_ser.ver+'\n'+version_ser.des,  '黑体', 25, cc.size(alertX.width-20,txth), cc.TEXT_ALIGNMENT_CENTER);
				alertxTxt.setFontFillColor(cc.color('#ffffff'));
				alertxTxt.attr({
					x: alertBg.width /2,
					y: alertBg.height /2 + 40,
				});
				alertBg.addChild(alertxTxt, 0);
				
				var fire_ok = new cc.MenuItemImage(
						res.fire_ok,
						res.fire_ok_sel,
						function (btn) {
							jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "openUrll", "(Ljava/lang/String;)V", version_path+version_ser.apk);
							
							alertBg.removeFromParent(true);
							
						}, this);
				fire_ok.attr({
					x: alertBg.width/4, 
					y: 50,
				});
				var fire_cancel = new cc.MenuItemImage(
						res.fire_cancel,
						res.fire_cancel_sel,
						function (btn) {
							alertBg.removeFromParent(true);
						}, this);
				fire_cancel.attr({
					x: alertBg.width *3/4, 
					y: 50,
				});

				var menu = new cc.Menu(fire_ok,fire_cancel);
				menu.x = 0;
				menu.y = 0;
				alertBg.addChild(menu, 0);
				
				that.MainNode.addChild(alertBg, 0);
				
				alertBg.setVisible(true);
			});
			
			//
		}
		//***********************检查版本更新end
		

		return true;
	},
	showAlertX:function(text,cb1,cb2){
		this.alertxTxt.setString(text);
		this.fire_ok.cb = cb1;
		this.fire_cancel.cb = cb2;
		this.alertX.setVisible(true);
	},
	
	showAlert:function(height,cb){
		
		var alertBg = this.alertBg(height);
		
		return cb(alertBg);
	},
	
	alertBg:function(height ){

		//if(typeof this.alert == 'undefined')this.alert = [];

		var alertSp = new cc.Sprite();
		alertSp.setContentSize(402, height);
		alertSp.attr ({

			x:this.MainNode.width/2,
			y:this.MainNode.height/2,
			visible:false
		});



		var alertBG_top = new cc.Sprite(res.fire_alertBG_top);
		alertBG_top.attr({
			x: alertSp.width /2,
			y: alertSp.height,
		});
		alertSp.addChild(alertBG_top, 0);

		var alertBG_bottom = new cc.Sprite(res.fire_alertBG_top);
		alertBG_bottom.attr({
			x: alertSp.width /2,
			flippedY:true
		});
		alertSp.addChild(alertBG_bottom, 0);

		var alertBG_body = new cc.Sprite(res.fire_alertBG_body);
		alertBG_body.attr({
			x: alertSp.width /2,
			y: alertSp.height /2,
			scaleY:height-40
		});
		alertSp.addChild(alertBG_body, 0);

		return alertSp;
	},
	inputClick:function(Field){
		
		
		Field.onClickTrackNode = function (clicked) {
			//var textField = this._trackNode;
			if (clicked) {

				Field.attachWithIME();
			} else {

				Field.detachWithIME();
			}
		}
		//监听输入框点击事件
		var FieldListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: function (touch, event) {
				var target = event.getCurrentTarget();
				var p = target.convertToNodeSpace(touch.getLocation());//cc.log(p);
				//cc.log(target.visible)
				if(target.EXT_getVisible())	//暂时获取父级可见属性   
					target.onClickTrackNode(cc.rectContainsPoint(cc.rect(0, 0, target.width, target.height), p));
			},
		});

		cc.eventManager.addListener(FieldListener, Field);
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

//儿童锁 配置参数初始化
var child_lock = getLocalJson('child_lock');
if(typeof child_lock.type == 'undefined'){
	child_lock = {

			type:0,	//1锁   0 开
			password:'',
			timeTotal:3*60*60*1000,
			timeLeft:0,
			timer:null
	};
	setLocalJson('child_lock',child_lock);
}
/*
//儿童锁 计时器
child_lock.timer = setInterval(function(){
	//clearInterval(child_lock.timer); return false;
	if(child_lock.type){
		if(child_lock.timeLeft <= 0){
			cc.director.runScene(new mainMenuScene());
			return false;
		}
		child_lock.timeLeft -= 60*1000;
		setLocalJson('child_lock',child_lock);
		
	}
},60*1000);
*/


//获取最新版本信息
HttpGet(version_path+'version.json',function(data){
	//if(data)
	//cc.log(data);
	data = JSON.parse(data);
	setLocalJson('version',data);
	version_ser = data;

});


