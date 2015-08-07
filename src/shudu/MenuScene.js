


var shuduMenuMainLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();
        
        var that = this;
        // 背景图
        var menuBg = new cc.Sprite(res.sd_HelloWorld_png);
        menuBg.attr({
        	x: cc.winSize.width / 2,
        	y: cc.winSize.height / 2,
        	scaleX : cc.winSize.width / menuBg.width,
        	scaleY : cc.winSize.height / menuBg.height
        });
        this.addChild(menuBg, 0);

        //层主节点    该层所有元素都放入这个节点 方便整体缩放
        this.MainNode = new cc.Sprite(res.mainNodeBg);

        this.MainNode.attr({
        	x: cc.winSize.width / 2,
        	y: cc.winSize.height / 2,
        	anchorX:0.5,
        	anchorY:0.5,
        	scaleX:cc.winSize[displayMode]/this.MainNode[displayMode],
        	scaleY:cc.winSize[displayMode]/this.MainNode[displayMode]
        });
        this.addChild(this.MainNode,0);
        var size = this.MainNode.getContentSize();

        var btn = [];
         btn[0] = new cc.MenuItemImage(//3X3
            res.sd_btn1,
            res.sd_btn1s,
            function (btn2) {
            	that.btnPubCallBack(btn2);
                menuClick(btn,0);
                shudu.C_selMenu = 0;
            }, this);
        btn[0].attr({
                x: size.width / 2,
                y: size.height  - size.height / 4,
                anchorX: 0.5,
                anchorY: 0.5,
                scale:shudu.UI.scale,
            });
       
       /**/
         btn[1] = new cc.MenuItemImage(//4X4
            res.sd_btn2,
            res.sd_btn2s,
            function (btn2) {
            	that.btnPubCallBack(btn2);
                menuClick(btn,1);
                shudu.C_selMenu = 1;
            }, this);
        btn[1].attr({
            x: size.width / 2,
            y: size.height - size.height*2 / 4,
            anchorX: 0.5,
            anchorY: 0.5,
            scale:shudu.UI.scale,
        });
/**/
        btn[2] = new cc.MenuItemImage(//六宫标准数独（先不做）
            res.sd_btn3,
            res.sd_btn3s,
            res.sd_btn3d,
            function (btn2) {
            	that.btnPubCallBack(btn2);
            	menuClick(btn,2);
            	shudu.C_selMenu = 2;

            }, this);
        btn[2].attr({
            x: size.width / 2,
            y: size.height  - size.height*3 / 5,
            anchorX: 0.5,
            anchorY: 0.5,
            scale:shudu.UI.scale,
        });
        //btn[2].setEnabled(false);
        //btn[2].setVisible(false);

        btn[shudu.C_selMenu].selected();
        //
        var menu = new cc.Menu(btn[0],btn[1],btn[2]);//
        menu.x = size.width / 2;
        menu.y = size.height - size.height*3 / 7;
        menu.alignItemsVertically();
        this.MainNode.addChild(menu, 1);

        //游戏模式按钮
        var sel = [];
        sel[0] = new cc.MenuItemImage(//3X3
            res.sd_sel1,
            res.sd_sel1s,
            function (btn) {
            	that.btnPubCallBack(btn);
                menuClick(sel,0);
                shudu.C_selSelect = 0;
                //cc.director.runScene(new GameScene());	//进入游戏场景

            }, this);
        sel[0].attr({
            x: size.width / 4,
            y:  size.height / 5,
            anchorX: 0.5,
            anchorY: 0.5,
            scale:shudu.UI.scale,
        });

        /**/
        sel[1] = new cc.MenuItemImage(//4X4
            res.sd_sel2,
            res.sd_sel2s,
            function (btn) {
            	that.btnPubCallBack(btn);
                menuClick(sel,1);
                shudu.C_selSelect = 1;
                //cc.director.runScene(new GameScene()); //进入游戏场景

            }, this);
        sel[1].attr({
            x: size.width *3/ 4,
            y: size.height / 5 ,
            anchorX: 0.5,
            anchorY: 0.5,
            scale:shudu.UI.scale,
        });
        /**/
        sel[2] = new cc.MenuItemImage(//DIY模式（先不做）
            res.sd_sel3,
            res.sd_sel3s,
            res.sd_sel3d,
            function (btn) {
            	that.btnPubCallBack(btn);

                // cc.director.runScene(new GameScene()); //进入游戏场景

            }, this);
        sel[2].attr({
            x: size.width *3/ 4,
            y: size.height / 6,
            anchorX: 0.5,
            anchorY: 0.5
        });
        sel[2].setEnabled(false);
        sel[2].setVisible(false);

        sel[shudu.C_selSelect].selected();
        //
        var select = new cc.Menu(sel[0],sel[1],sel[2]);//
        select.x = 0;
        select.y = 0;
        this.MainNode.addChild(select, 1);


        //
        function menuClick(arr,k){
            for(var i in arr){cc.log(i)

                arr[i].unselected();
            }
            arr[k].selected();
        }
        
        
        // 返回按钮
        var backBtn = new cc.MenuItemImage(
        		res.sd_back_png,
        		res.sd_back_sel_png,
        		function (btn) {
        			that.btnPubCallBack(btn);
        			cc.director.runScene(new mainMenuScene());
        		}, this);
        backBtn.attr({
        	x: 70,
        	y: size.height-60,
        	anchorX: 0.5,
        	anchorY: 0.5,
        	//scale:shudu.UI.scale,
        });
        
        //开始按钮
        var startBtn = new cc.MenuItemImage(
            res.sd_start_png,
            res.sd_start_sel_png,
            function (btn) {
            	that.btnPubCallBack(btn);
                //if()              //若游戏规格 和 游戏模式 没有默认值 则需要判断是否选择

                 cc.director.runScene(new shuduGameScene()); //进入游戏场景

            }, this);
        startBtn.x = size.width / 2;
        startBtn.y = 80;
        startBtn.scale = shudu.UI.scale;
        
        var pubbtn = new cc.Menu(startBtn,backBtn);
        pubbtn.x = 0;
        pubbtn.y = 0;
        this.MainNode.addChild(pubbtn, 1);




       

            return true;
        },
        //按钮公共函数
        btnPubCallBack:function(btn){
        	cc.audioEngine.playEffect(res.fire_au_beep);
        },
});

var shuduMenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new shuduMenuMainLayer();
        this.addChild(layer);
    }
});

