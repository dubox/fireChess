
var shuduGameMainLayer = cc.Layer.extend({
    Sense:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();
        //this.Sense = Sense;
        
        
        //this.getParent().call(this);
        //this.test(this.tt);
        
        var that = this;
        var size = cc.winSize;
        //alert('C_selMenu='+C_selMenu+' C_selSelect='+C_selSelect);
        
        //判断游戏规格 和 棋子ui
        if(shudu.C_selMenu == 0){
        	shudu.gameType = 3;
        }else if(shudu.C_selMenu == 1){
        	shudu.gameType = 4;
        }else if(shudu.C_selMenu == 2){
        	shudu.gameType = 6;
        	chessUI = 3;
        }
        if(shudu.C_selSelect == 0){
            chessUI = 1;
            if(shudu.gameType == 6 )chessUI = 3;
        }else if(shudu.C_selSelect == 1){
            chessUI = 2;
        }
        

        // 背景图
        var Bg = new cc.Sprite(res.sd_HelloWorld_png);
        Bg.attr({
            x: size.width / 2,
            y: size.height / 2,
            scaleX : size.width / Bg.width,
            scaleY : size.height / Bg.height
        });
        this.addChild(Bg, 0);
        
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

        //时间的表盘
        var timePanel = new cc.Sprite(res.sd_time_panel);
        timePanel.attr({
            x: size.width / 2,
            y: size.height -120,
            scale : shudu.UI.scale,
        });
        this.MainNode.addChild(timePanel, 0);
        

		//时间
        cc.spriteFrameCache.addSpriteFrames(res.fire_time_plist);
        this.timeBatchNode = new cc.SpriteBatchNode(res.fire_time_png, 11);
        this.timeBatchNode.attr({
        	x: timePanel.width /2,
        	y: timePanel.height / 2 ,
        	scale:2,
        });
        timePanel.addChild(this.timeBatchNode, 1);
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
        
        
        
/*** 不显示关卡**/
        //关卡文字
        var guanText = new cc.LabelTTF('第 1 关',  'Times New Roman', 22, cc.size(320,32), cc.TEXT_ALIGNMENT_CENTER);
        guanText.attr({x:timePanel.width/2,y:30});
        guanText.setFontFillColor(cc.color('#ff3333'));
        //timePanel.addChild(guanText, 0);    //不显示关卡
        this.guanText = guanText;
        this.guanText.val = 1;
        
        
        //关卡时间
        var timeText = new cc.LabelTTF('计时:00:00',  'Times New Roman', 22, cc.size(320,32), cc.TEXT_ALIGNMENT_CENTER);
        timeText.attr({x:timePanel.width/2,y:10});
        timeText.setFontFillColor(cc.color('#ff3333'));
        //timePanel.addChild(timeText, 0);
        this.timeText = timeText;

        // 返回按钮
        var backBtn = new cc.MenuItemImage(
            res.sd_back_png,
            res.sd_back_png,
            function (btn) {
            	that.btnPubCallBack(btn);
            	cc.director.runScene(new shuduMenuScene());
            }, this);
        backBtn.attr({
            x: 70,
            y: size.height-60,
            anchorX: 0.5,
            anchorY: 0.5
        });

        /*
        var leftBtn = new cc.MenuItemImage(
            res.sd_left_png,
            res.sd_left_png,
            function () {
                that.chageGuan(-1);
            }, this);
        leftBtn.attr({
            x: size.width / 2-timePanel.width/2-30,
            y: size.height -80
        });
        */
        
        //跳关
        var rightBtn = new cc.MenuItemImage(
            res.sd_right_png,
            res.sd_right_sel_png,
            function (btn) {
            	that.btnPubCallBack(btn);
            	that.showAlertX('放弃当前局，\n切换至新一局？',
            			function(){that.chageGuan(1);}	
            			//function(){}		
            	);
                
            }, this);
        rightBtn.attr({
        	x: size.width - 70,
            y: size.height -60,
            scale : shudu.UI.scale,
        });
        

        //排名按钮
        this.topList = new cc.MenuItemImage(//3X3
        		res.sd_topList,
        		res.sd_topLists,
        		function (btn) {
        			that.btnPubCallBack(btn);
        			that.showTopList();
        		}, this);
        this.topList.attr({x: size.width - 180,	y: size.height -60,scale : shudu.UI.scale,});

        var menu = new cc.Menu(backBtn,rightBtn,this.topList);
        menu.x = 0;
        menu.y = 0;
        this.MainNode.addChild(menu, 1);


        //提交按钮
        this.subBtn = new cc.MenuItemImage(//3X3
            res.sd_subBtn,
            res.sd_subBtn,
            function (btn) {
            	that.btnPubCallBack(btn);
                that._submit();

            }, this);
        this.subBtn.attr({x:this.MainNode.width *3/ 4+10,y:80,scale : shudu.UI.scale,});
        
        
        //重玩按钮  （面板上的）
        this.replayBtn2 = new cc.MenuItemImage(//3X3
        		res.sd_replay2,
        		res.sd_replay2s,
        		function (btn) {
        			that.btnPubCallBack(btn);
        			that.replay();

        		}, this);
        this.replayBtn2.attr({x:this.MainNode.width / 4-10,y:80,scale : shudu.UI.scale,});

        var bottomBtn = new cc.Menu(this.subBtn,this.replayBtn2);
        bottomBtn.x = 0;
        bottomBtn.y = 0;
        this.MainNode.addChild(bottomBtn, 1);

        if(shudu.gameType == 4 || shudu.gameType == 6) {
            //玩家点击翻开按钮翻开棋子
            this.btnOpen = new cc.MenuItemImage(
                res.sd_btnOpen,
                res.sd_btnOpen_sel,
                res.sd_btnOpen_dis,
                function (btn) {
                	that.btnPubCallBack(btn);
                	
                  /*** **/ //4x4 翻开棋子
                    if (shudu.QOpened > 0 && shudu.gameData[shudu.gameData_sel]['chess']==null) {//cc.log(that.Qt); //当该格没有棋子时 执行翻开
                    	//cc.log(that.Qt[1])
                    	var p = that.moveChess(parseInt(that.Qt[1][shudu.gameData_sel])-1, shudu.gameData_sel);
                        shudu.QOpened--;
                        that.openNum.setString(shudu.QOpened);
                        shudu.gameData[shudu.gameData_sel]['chess']['chenge'] = false;
                        this.showDisMove(p);
                        
                        shudu.gameData_sel = false; //当前选中的格子
                        shudu.selBtn_sel = false; //当前选中的棋子按钮
                    }
                    
                    if(shudu.QOpened <= 0){
                    	that.btnOpen.setEnabled(false);
                    }
                    
                    
                },
                this);
            
            this.btnOpen.attr({x:this.MainNode.width / 4,y:80,scale : shudu.UI.scale,});
            
            bottomBtn.addChild(this.btnOpen, 0);
            
            
            //4阶 重玩按钮在中间
            this.replayBtn2.attr({x:this.MainNode.width / 2,y:80});

            //剩余翻开机会
            var openNum = new cc.LabelTTF(shudu.QOpened, 'Times New Roman', 45, cc.size(70, 70), cc.TEXT_ALIGNMENT_CENTER,0,cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
            openNum.attr({anchorX: 0, anchorY: 0});
            openNum.setFontFillColor(cc.color('#ffff33'));
            this.openNum = openNum;
           // new cc.Labe
            var msgNum = new cc.Sprite(res.sd_msgNum);
            msgNum.attr({x:this.btnOpen.width-20, y:this.btnOpen.height-20});
            
            msgNum.addChild(openNum, 0);
            this.btnOpen.addChild(msgNum, 0);
        }

        
        
        //弹窗
        var alertX = new cc.Sprite(res.fire_alertx);
        alertX.attr({
        	x: this.MainNode.width /2,
        	y: this.MainNode.height / 2,
        	visible:false
        });
        this.MainNode.addChild(alertX, 2);
        this.alertX = alertX;

        var alertxTxt = new cc.LabelTTF('',  '黑体', 30, cc.size(alertX.width-20,100), cc.TEXT_ALIGNMENT_CENTER);
        alertxTxt.setFontFillColor(cc.color('#ffffff'));
        alertxTxt.attr({
        	x: alertX.width /2,
        	y: 135,
        });
        this.alertX.addChild(alertxTxt, 0);
        this.alertxTxt = alertxTxt;

        var replay = new cc.MenuItemImage(
        		res.sd_replay,
        		res.sd_replay,
        		function (btn) {
        			that.btnPubCallBack(btn);
        			//cc.log(btn)
        			//if(typeof btn.cb == 'function')btn.cb();
        			that.replay();
        			alertX.setVisible(false);
        		}, this);
        replay.attr({
        	x: this.alertX.width/4, 
        	y: 70,
        	scale:shudu.UI.scale
        });
        var continues = new cc.MenuItemImage(
        		res.sd_continue,
        		res.sd_continues,
        		function (btn) {
        			that.btnPubCallBack(btn);
        			//cc.log(btn)
        			//if(typeof btn.cb == 'function')btn.cb();
        			alertX.setVisible(false);
        		}, this);
        continues.attr({
        	x: this.alertX.width *3/4, 
        	y: 65,
        	scale:shudu.UI.scale
        });
        
        var btn_ok = new cc.MenuItemImage(
        		res.sd_ok,
        		res.sd_ok_sel,
        		function (btn) {
        			that.btnPubCallBack(btn);
        			//cc.log(btn)
        			if(typeof btn.cb == 'function')btn.cb();
        			//that.replay();
        			alertX.setVisible(false);
        		}, this);
        btn_ok.attr({
        	x: this.alertX.width/4, 
        	y: 70,
        	//scale:shudu.UI.scale
        });
        var btn_cancel = new cc.MenuItemImage(
        		res.sd_cancel,
        		res.sd_cancel_sel,
        		function (btn) {
        			that.btnPubCallBack(btn);
        			//cc.log(btn)
        			if(typeof btn.cb == 'function')btn.cb();
        			alertX.setVisible(false);
        		}, this);
        btn_cancel.attr({
        	x: this.alertX.width *3/4, 
        	y: 70,
        	//scale:shudu.UI.scale
        });

        var menu = new cc.Menu(replay,continues,btn_ok,btn_cancel);
        menu.x = 0;
        menu.y = 0;
        this.alertX.addChild(menu, 0);
        this.replayBtn = replay;
        this.continuesBtn = continues;
        this.btn_ok = btn_ok;
        this.btn_cancel = btn_cancel;
        //弹窗end
        
        
        //*********************结算面板
        var jiesuan = new cc.Sprite(res.sd_jiesuan);
        jiesuan.attr({
        	x: this.MainNode.width / 2,
        	y: this.MainNode.height - 250,
        	scale : shudu.UI.scale,
        	visible:false,
        });
        
        var replay = new cc.MenuItemImage(
        		res.fire_ok,
        		res.fire_ok,
        		function (btn) {
        			that.btnPubCallBack(btn);
        			//cc.log(btn)
        			//if(typeof btn.cb == 'function')btn.cb();
        			that.setTopList();
        			that.replay();
        			jiesuan.setVisible(false);
        		}, this);
        replay.attr({
        	x: jiesuan.width/4, 
        	y: -70,
        	scale : 1/shudu.UI.scale,
        });
        
        //下一关
        var nextGuan = new cc.MenuItemImage(
        		res.sd_next,
        		res.sd_nexts,
        		function (btn) {
        			that.btnPubCallBack(btn);
        			//cc.log(btn)
        			//if(typeof btn.cb == 'function')btn.cb();
        			
        			that.setTopList();
        			that.chageGuan(1);
        			
        			jiesuan.setVisible(false);
        		}, this);
        nextGuan.attr({
        	x: jiesuan.width *3/4, 
        	y: -70,
        });
        var menu = new cc.Menu(replay,nextGuan);
        menu.x = 0;
        menu.y = 0;
        jiesuan.addChild(menu, 0);
        
        //用时
        var useTimeTxt = new cc.LabelTTF('该局用时：1000秒',  '黑体', 60, cc.size(620,75), cc.TEXT_ALIGNMENT_CENTER);
        useTimeTxt.setFontFillColor(cc.color('#992e00'));
        useTimeTxt.attr({
        	x: jiesuan.width /2,
        	y: 385,
        });
        jiesuan.addChild(useTimeTxt,0, 'useTime');
        
        //输入姓名
        var enterNameTxt = new cc.LabelTTF('输入姓名：',  '黑体', 40, cc.size(200,50), cc.TEXT_ALIGNMENT_CENTER);
        enterNameTxt.setFontFillColor(cc.color('#ffffff'));
        enterNameTxt.attr({
        	x: 345,
        	y: 233,
        });
        
        jiesuan.addChild(enterNameTxt,0, 'enterNameTxt');
        
        //玩家名字输入框
        var userNameField = new cc.TextFieldTTF("", cc.size(410,90), cc.TEXT_ALIGNMENT_LEFT,"Arial", 72);
        userNameField.setPlaceHolder('Player1');
        userNameField.attr({
        	x: 635,
        	y: 260,
        });
        //this.userNameField = userNameField;
        jiesuan.addChild(userNameField,0, 'userName');
        
        /*
        jiesuan.onTextFieldAttachWithIME = function(sender){

        	userNameField.runAction(cc.repeatForever(cc.sequence(
        			cc.fadeOut(0.4),
        			cc.fadeIn(0.4)
        	)));
        	return false;
        }
        jiesuan.onTextFieldDetachWithIME = function(sender){

        	userNameField.stopAllActions();
        	userNameField.setOpacity(255);
        	return false;
        }
        jiesuan.onTextFieldInsertText = function(sender){
        	
        	return false;
        }
        jiesuan.onTextFieldDeleteBackward = function(sender){
        	
        	return false;
        }
        
        this.userNameField.setDelegate(jiesuan);	//jsb 不支持
        
        */
        
        userNameField.onClickTrackNode = function (clicked) {
        	//var textField = this._trackNode;
        	if (clicked) {

        		userNameField.attachWithIME();
        		
        	} else {

        		userNameField.detachWithIME();
        		userNameField.stopAllActions();
        	}
        }
        
        
        //监听输入框点击事件
        var userNameFieldListener = cc.EventListener.create({
        	event: cc.EventListener.TOUCH_ONE_BY_ONE,
        	swallowTouches: true,
        	onTouchBegan: function (touch, event) {
        		var target = event.getCurrentTarget();
        		var p = target.convertToNodeSpace(touch.getLocation());//cc.log(p);
        		//cc.log(target.visible)
        		if(target.getParent().visible)	//暂时获取父级可见属性   
        		target.onClickTrackNode(cc.rectContainsPoint(cc.rect(0, 0, target.width, target.height), p));
        		
        		return false;
        	},
        });

        cc.eventManager.addListener(userNameFieldListener, userNameField);
        
        
        //userNameField.attachWithIME();
        
        this.MainNode.addChild(jiesuan, 2);
        this.jiesuan = jiesuan;
        //**************结算面板end
        
        
        //*****************排行榜
        var topList = new cc.Sprite(res.sd_topListBg);
        
        topList.attr({
        	x:this.MainNode.width /2,
        	y:this.MainNode.height /2,
        	visible:false,
        	scale: 0.6,
        });
        var btn_ok = new cc.MenuItemImage(
        		res.fire_ok,
        		res.fire_ok_sel,
        		function (btn) {
        			that.btnPubCallBack(btn);
        			topList.setVisible(false);
        		}, this);
        btn_ok.attr({
        	x: topList.width/2, 
        	y: 120,
        	scale: 1/0.6,
        });

        var btn_close = new cc.MenuItemImage(
        		res.fire_close,
        		res.fire_close,
        		function (btn) {
        			that.btnPubCallBack(btn);
        			topList.setVisible(false);
        		}, this);
        btn_close.attr({
        	x: topList.width - 30, 
        	y: topList.height - 30,
        	scale: 1/0.6,
        });
        var menu = new cc.Menu(btn_ok,btn_close);
        menu.x = 0;
        menu.y = 0;
        topList.addChild(menu, 0);
        this.topList = topList;
        
        this.MainNode.addChild(topList, 2);
        //*****************排行榜end
        
        
        

        this.qipan();
        this.initBtnQi();

        this.newGame(shudu.gameType);

        //棋盘点击事件回调
        this.qipanSpriteonTouch(function(id){

        	that.qt_sel.setPosition(shudu.gameData[id]['xy'][0],shudu.gameData[id]['xy'][1]);
        	that.qt_sel.setVisible(true);
        	shudu.gameData_sel = id;

        	that.play();
        });
        
        
        
        return true;
    },
    
    
    
    //按钮公共函数
    btnPubCallBack:function(btn){
    	cc.audioEngine.playEffect(res.fire_au_beep);
    },
    
    showTopList:function(){
    	
    	if(!this.topList.getChildByName('list')){
	    	var list = new cc.Sprite();
	    	list.setContentSize(680, 540);
	    	list.attr ({
	    		x:this.topList.width/2,
	    		y:500,
	    	});
	    	this.topList.addChild(list, 0, 'list');
    	}
    	var list = this.topList.getChildByName('list');
    	
    	list.removeAllChildren(true);
    	var data = this.getTopList('Q'+shudu.gameType+'_'+this.Qt[0]);
    	
    	for(var i in data){
    		var dataTxt = new cc.LabelTTF('  No.'+(parseInt(i)+1),  '黑体', 50, cc.size(190,75), cc.TEXT_ALIGNMENT_LEFT);
    		dataTxt.setFontFillColor(cc.color('#ffffff'));
    		dataTxt.attr({
    			x: 190 /2,
    			y: 540 - (i*100) -50,
    		});
    		list.addChild(dataTxt,0);
    		//玩家名称
    		var dataTxt = new cc.LabelTTF(data[i][0],  '黑体', 50, cc.size(300,75), cc.TEXT_ALIGNMENT_CENTER);
    		dataTxt.setFontFillColor(cc.color('#ffffff'));
    		dataTxt.attr({
    			x: 190 + 300 /2,
    			y: 540 - (i*100) -50,
    		});
    		list.addChild(dataTxt,0);
    		//秒数
    		var dataTxt = new cc.LabelTTF(' '+data[i][1]+'s',  '黑体', 50, cc.size(190,75), cc.TEXT_ALIGNMENT_LEFT);
    		dataTxt.setFontFillColor(cc.color('#ffffff'));
    		dataTxt.attr({
    			x: 490 + 190 /2,
    			y: 540 - (i*100) -50,
    		});
    		list.addChild(dataTxt,0);
    	}
    	this.topList.setVisible(true);
    },
    
    getTopList:function(QtNum){
    	if(cc.sys.isNative) {
    		var writablePath = jsb.fileUtils.getWritablePath();
    		var topListJsonPath = writablePath+'topList.json';
    		if(!jsb.fileUtils.isFileExist(topListJsonPath)){

    			return [];
    		}else{
    			return jsb.fileUtils.getValueMapFromFile(topListJsonPath)[QtNum];
    		}
    	}
    },
    
    setTopList:function(){
    	
    	if(cc.sys.isNative) {
    		var writablePath = jsb.fileUtils.getWritablePath();
    		var topListJsonPath = writablePath+'topList.json';
    		if(!jsb.fileUtils.isFileExist(topListJsonPath)){
    			
    			var topListJson = {
    					
    			};
    			jsb.fileUtils.writeToFile(topListJson, topListJsonPath);
    		}else{
    			var topListJson = jsb.fileUtils.getValueMapFromFile(topListJsonPath);
    		}
    		var userName = this.jiesuan.getChildByName('userName').getString().substr(0,5);
    		userName = userName == '' ?'Player1':userName;
    		var time = shudu.gameTime;
    		var QtNum = 'Q'+shudu.gameType+'_'+this.Qt[0]; //题号
    		
    		if(typeof topListJson[QtNum] == 'undefined'){
    			//该题没有数据 
    			topListJson[QtNum] = [];
    			topListJson[QtNum].push([userName,time]);
    			
    		}else{
    			//该题已有数据
    			//topListJson[QtNum].push([userName,time]);
    			
    			var isInsert = 0;
    			for(var i in topListJson[QtNum]){
    				
    				if(topListJson[QtNum][i][1] > time){
    						topListJson[QtNum].splice(i, 0, [userName,time]);
    						isInsert = 1;
    						break;
    				}
    			}
    			if(!isInsert){
    				topListJson[QtNum].push([userName,time]);
    			}
    			topListJson[QtNum] = topListJson[QtNum].slice(0,5);
    		}
    		
    		jsb.fileUtils.writeToFile(topListJson, topListJsonPath);
    		//cc.log( topListJson[QtNum].pop().toString());

    	}
    },
    
    qipan:function(){
        //棋盘
    	this.qipanSprite = new cc.Sprite(res['sd_q'+shudu.gameType]);
        this.qipanSprite.attr({
        	x: this.MainNode.width / 2,
        	y: this.MainNode.height / 2 + 40,
            scale : shudu.UI.scale,
        });
        this.MainNode.addChild(this.qipanSprite, 0);

    },
    //切换关卡
    chageGuan:function(change){
        this.guanText.val = this.guanText.val+change;
        this.guanText.val = this.guanText.val<1?48:this.guanText.val;
        this.guanText.val = this.guanText.val>48?1:this.guanText.val;
        //this.guanText.setString('第 '+this.guanText.val+' 关');
        this.newGame(shudu.gameType);
    },
    gameTimer:function(type){
        var that = this;
        if(type == 'stop'){
        	clearInterval(shudu.gameTimerId);
            return false;
        }
        clearInterval(shudu.gameTimerId);
        shudu.gameTime = 0;
        this.showTime(shudu.gameTime);
        shudu.gameTimerId = setInterval(function(){
            shudu.gameTime++;
            that.showTime(shudu.gameTime);
        },1000);
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
    
    
    
    //初始化棋盘
    initGameData:function(){

    	var border = 65 ;
    	var gameType = shudu.gameType;
    	
    	var gridWidth = this.gridWidth = (this.qipanSprite.width - border*2)/gameType;    //格子宽度
        shudu.gameData = [];
        for(var y=gameType;y>0;y--){
            for(var x=1;x<=gameType;x++){
            	shudu.gameData.push({xy:[gridWidth*x-gridWidth/2+border,gridWidth*y-gridWidth/2 + border],chess:null,selected:false});
            }
        }
        
    },

    newGame:function(type,QtId){

        this.initGameData();
        this.qipanSprite.removeAllChildren(true);


        //棋盘格子选中效果
        this.qt_sel = new cc.Sprite(res.sd_qt_sel);
        this.qt_sel.attr({
            scaleX : this.gridWidth/this.qt_sel.width,
            scaleY : this.gridWidth/this.qt_sel.width
        });
        this.qt_sel.setVisible(false);
        this.qipanSprite.addChild(this.qt_sel, 0);
        
        shudu.gameData_sel = false; //当前选中的格子
        shudu.selBtn_sel = false; //当前选中的棋子按钮

        if(type == 3) {

        	this.Qt = this.Qt3X3(QtId ? QtId : 0);  //随机题
            //cc.log(this.Qt);
            var chess1 = this.newChess(this.Qt[1][1][0]);
            var moveto1 = cc.p(shudu.gameData[this.Qt[1][0][0]]['xy'][0], shudu.gameData[this.Qt[1][0][0]]['xy'][1]);
            chess1.runAction(

            		cc.moveTo(0.3, moveto1)

            );
            chess1.chenge = false;   //初始棋子不能被改变
            shudu.gameData[this.Qt[1][0][0]]['chess'] = chess1;
            // chess1.attr({x:this.gridArr[this.Qt[1][0][0]][0],y:this.gridArr[this.Qt[1][0][0]][1]});
            var chess2 = this.newChess(this.Qt[1][1][1]);
            var moveto2 = cc.p(shudu.gameData[this.Qt[1][0][1]]['xy'][0], shudu.gameData[this.Qt[1][0][1]]['xy'][1]); 
            chess2.runAction(

            		cc.moveTo(0.3, moveto2)

            );
            chess2.chenge = false;   //初始棋子不能被改变
            shudu.gameData[this.Qt[1][0][1]]['chess'] = chess2;
            // chess2.attr({x:this.gridArr[this.Qt[1][0][1]][0],y:this.gridArr[this.Qt[1][0][1]][1]});
            
            //禁止移动提示红块
            this.showDisMove(moveto1);
            this.showDisMove(moveto2);
            
            
            //cc.log(shudu.gameData);
        }else if(type == 4){
        	
        	//剩余翻开次数
        	shudu.QOpened = 6;
        	this.openNum.setString(shudu.QOpened);
        	this.btnOpen.setEnabled(true);
        	
        	this.Qt = this.Qt4X4(QtId ? QtId : 0);  //随机题

        }else if(type == 6){

        	//剩余翻开次数
        	shudu.QOpened = 12;
        	this.openNum.setString(shudu.QOpened);
        	this.btnOpen.setEnabled(true);

        	this.Qt = this.Qt6X6(QtId ? QtId : 0);  //随机题

        }
        
        if(typeof this.QtTouchListener != 'undefined')this.QtTouchListener.setEnabled(true);	//开启事件监听
       // cc.log('dddd');
        this.gameTimer(); //开始计时
    },
    
    //添加表示不能移动棋子的红块
    //xy cc.p
    showDisMove:function(xy){
    	
    	var qt_dissel = new cc.Sprite(res.sd_qt_dissel);
    	qt_dissel.attr({
    		scaleX : this.gridWidth/qt_dissel.width,
    		scaleY : this.gridWidth/qt_dissel.width,
    	});
    	qt_dissel.setPosition(xy);
    	this.qipanSprite.addChild(qt_dissel, 0);
    },
    
    /**
     *
     * @param chessNum 棋子的值
     * @returns {chess Sprite}
     */
    newChess:function(chessNum){

        var chess = new cc.Sprite(res['sd_q3'+'_'+chessUI+'_'+chessNum]);
        chess.scale = (this.gridWidth * 0.8)/chess.height;
        var p = this.qipanSprite.convertToNodeSpace(this.selBtn[chessNum-1].getPosition());
        chess.attr(p);
        chess.val = chessNum;
        
        this.qipanSprite.addChild(chess, 0);
        
        //cc.log(this.qipanSprite);
        return chess;
    },
    
    //选择棋子按钮
    initBtnQi:function(){

        var that = this;
        var gameType = shudu.gameType;
        
        //按钮底盘
        var selBtnPenal = new cc.Sprite(res.sd_selBtnPenal);
        selBtnPenal.attr({
        	x: this.MainNode.width / 2, y: this.MainNode.height / 5,
        	scale:shudu.UI.scale,
        });
        this.MainNode.addChild(selBtnPenal, 1);
        
        
        if(gameType == 3) {
            var xy = [

                      {x: selBtnPenal.width / 4, y: selBtnPenal.height / 2},
                      {x: selBtnPenal.width / 2, y: selBtnPenal.height / 2},
                      {x: selBtnPenal.width * 3 / 4, y: selBtnPenal.height / 2},
            ];
        }else if(gameType == 4){
            var xy = [

                      {x: selBtnPenal.width / 5, y: selBtnPenal.height / 2},
                      {x: selBtnPenal.width *2/ 5, y: selBtnPenal.height / 2},
                      {x: selBtnPenal.width * 3 / 5, y: selBtnPenal.height / 2},
                      {x: selBtnPenal.width * 4 / 5, y: selBtnPenal.height / 2},
            ];
        }else if(gameType == 6){
        	var xy = [

        	          {x: selBtnPenal.width / 7, y: selBtnPenal.height / 2},
        	          {x: selBtnPenal.width *2/ 7, y: selBtnPenal.height / 2},
        	          {x: selBtnPenal.width * 3 / 7, y: selBtnPenal.height / 2},
        	          {x: selBtnPenal.width * 4 / 7, y: selBtnPenal.height / 2},
        	          {x: selBtnPenal.width * 5 / 7, y: selBtnPenal.height / 2},
        	          {x: selBtnPenal.width * 6 / 7, y: selBtnPenal.height / 2},
        	          ];
        }
        //棋子按钮
        var sel = [];
        for(var i=0;i<gameType;i++){
            sel[i] = new cc.MenuItemImage(//3X3
                res['sd_btn'+'_'+chessUI+'_'+(i+1)],
                res['sd_btn'+'_'+chessUI+'_'+(i+1)+'s'],
                function (btn) {
                	that.btnPubCallBack(btn);
                    for(var i in sel){
                        sel[i].unselected();
                    }
                    btn.selected();
                    shudu.selBtn_sel = btn.k;
                    that.play();
                }, this);
            sel[i].k = i;
            sel[i].attr(xy[i]);
        }

        var select = new cc.Menu(sel);
        select.x = 0;
        select.y = 0;
        
        
        selBtnPenal.addChild(select, 0)
        
        
        this.selBtn = sel;

    },

    play:function(){
        //检查棋盘和棋子按钮
        if(shudu.selBtn_sel !== false && shudu.gameData_sel !== false){
            this.moveChess(shudu.selBtn_sel,shudu.gameData_sel);
            //清除选中
            this.qt_sel.setVisible(false);
            this.selBtn[shudu.selBtn_sel].unselected();
            shudu.selBtn_sel = shudu.gameData_sel = false;
        }


    },
    /**
     *根据已选择的 btn 和 棋盘格 创建并移动棋子
     * @param btn  this.selBtn的key
     * @param qt    gameData的key
     * @return target  cc.p 目标位置
     */
    moveChess:function(btn,qt){
        if(shudu.gameData[qt]['chess'] && shudu.gameData[qt]['chess']['chenge'] === false) {
            //cc.log('chenge');
            return false;    //检查棋子是否可替换
        }
        
        cc.audioEngine.playEffect(res.fire_au_click);//音效
        
        btn = parseInt(btn);
        qt = parseInt(qt);
        var chess = this.newChess(btn+1);
        
        var target = cc.p(shudu.gameData[qt]['xy'][0], shudu.gameData[qt]['xy'][1]);
        chess.runAction(
            cc.spawn(
            		cc.moveTo(0.3, target)
            )
        );
        if(shudu.gameData[qt]['chess'])shudu.gameData[qt]['chess'].removeFromParent();  //删除该位置原有棋子
        shudu.gameData[qt]['chess'] = chess;
        
        return target;
    },

    qipanSpriteonTouch:function(cb){
        var that = this;
        
        this.QtTouchListener = cc.EventListener.create({
        	event: cc.EventListener.TOUCH_ONE_BY_ONE,
        	swallowTouches: true,
        	onTouchBegan: function (touch, event) {
        		var p = that.qipanSprite.convertToNodeSpace(touch.getLocation());//cc.log(p);

        		for(var i in shudu.gameData){
        			if(p.x < (shudu.gameData[i]['xy'][0]+that.gridWidth/2) && p.y <(shudu.gameData[i]['xy'][1]+that.gridWidth/2) && p.x > (shudu.gameData[i]['xy'][0]-that.gridWidth/2) && p.y >(shudu.gameData[i]['xy'][1]-that.gridWidth/2)){
        				//cc.log(i);
        				cb(i);
        				//return false;
        			}
        		}
        		return true;
        	},
        });
        
        cc.eventManager.addListener(this.QtTouchListener, this.qipanSprite);
    },
    
    showAlertX:function(text,cb1,cb2){
    	this.alertxTxt.setString(text);
    	
    	if(cb1){
    		this.replayBtn.setVisible(false);
    		this.continuesBtn.setVisible(false);
    		this.btn_ok.setVisible(true);
    		this.btn_cancel.setVisible(true);
    		
    		this.btn_ok.cb = cb1 ? cb1:0;
    		this.btn_cancel.cb = cb2 ? cb2:0;
    	}else{
    		
    		this.btn_ok.setVisible(false);
    		this.btn_cancel.setVisible(false);
    		this.replayBtn.setVisible(true);
    		this.continuesBtn.setVisible(true);
    	}
    	
    	
    	this.alertX.setVisible(true);
    },
    
    replay:function(){
    	
    	this.newGame(shudu.gameType, this.Qt[0]);
    },
    
    _submit:function(){
    	
    	var gameData = shudu.gameData;
    	

    	
    	if(shudu.gameType == 3) {
            //
            for (var i = 0; i < gameData.length; i++) {
                if (typeof gameData[i].chess == 'undefined' || !gameData[i].chess) {
                	this.showAlertX('填写有误！');
                    return false;
                }
            }
            for (var i = 0; i < gameData.length; i++) {

                //行检查
                if (i % 3 == 0 && (gameData[i].chess.val + gameData[i + 1].chess.val + gameData[i + 2].chess.val) != 6) {
                    var row = 0;
                    for (var j = 0; j < 3; j++) {

                        row += gameData[i + j].chess.val;
                    }
                    //cc.log('row:' + row);
                    if (row != 6) {

                    	this.showAlertX('填写有误！');
                        return false;
                    }
                }
                if (i < 3 && (gameData[i].chess.val + gameData[i + 3].chess.val + gameData[i + 2].chess.val) != 6) {
                    var cos = 0;
                    for (var j = 0; j < 3; j++) {

                        cos += gameData[i + j * 3].chess.val;
                    }
                    if (cos != 6) {
                    	this.showAlertX('填写有误！');
                        return false;
                    }
                }
            }
    	}else if(shudu.gameType == 4){
            for(var i in this.Qt[1]){
                if(!gameData[i]['chess'] || this.Qt[1][i] != gameData[i]['chess']['val']){
                	this.showAlertX('填写有误！');
                    return false;
                }
            }
    	}else if(shudu.gameType == 6){
    		for(var i in this.Qt[1]){
    			if(!gameData[i]['chess'] || this.Qt[1][i] != gameData[i]['chess']['val']){
    				this.showAlertX('填写有误！');
    				return false;
    			}
    		}
    	}
        this.gameTimer('stop');
        this.showJiesuan(shudu.gameTime);
        return true;
    },
    
    //过关面板
    showJiesuan:function(time){
    	
    	this.QtTouchListener.setEnabled(false);	//关闭事件监听
    	
    	var useTime = this.jiesuan.getChildByName('useTime');
    	useTime.setString('该局用时：'+time+'秒');
    	this.jiesuan.getChildByName('userName').attachWithIME();
    	
    	this.jiesuan.setVisible(true);
    },
    
    /****
     *三宫题库 返回 一道随机题 和 题号
     *
     *
     * @returns [题号,[[位置,位置],[棋子,棋子]]]
     * @constructor
     */
    Qt3X3:function(id){
        var Qt3X3 = [[0,5],[1,8],[2,7],[5,6],[8,3],[7,0],[6,1],[3,2] ];

        var Qt3_data = [];   //题库数组
        for (var i = 1;i<=3;i++){
            var y = i+1;
            if(i == 3){
                y = 1;
            }
            for(var k in Qt3X3){

                Qt3_data.push( [Qt3X3[k],[i,y]]);    //位置，数值
            }
        }
        for (var i = 3;i>=1;i--){
            var y = i-1;
            if(i === 1){
                y = 3;
            }
            for(var k in Qt3X3){

                Qt3_data.push( [Qt3X3[k],[i,y]]);
            }
        }
        var key = this.random(0,47);    //随机题号
        if(id) key = id;
        return [key,Qt3_data[key]];

    },

    Qt4X4:function(id){
        var Qt4_data = [

            '2413312413424231',
            '2413312413424231',
            '2134341243211243',
            '2413312413424231',
            '1423234141323214',
            '2341142341323214',
            '4132231412433421',
            '2413312413424231', //8
            '4132321414232341',
            '1423234141323214',
        ];
        var key = this.random(0,Qt4_data.length-1);    //随机题号
        if(id) key = id;
        return [key,Qt4_data[key].split('')];
    },
    Qt6X6:function(id){
    	
    	var key = this.random(0,Qt6_data.length-1);    //随机题号
    	if(id) key = id;
    	//cc.log(Qt6_data[key])
    	var Qt6 = unpackflm( Qt6_data[key] );
    	
    	return [key,Qt6.answer];
    },
    random:function(start,end){
        return parseInt(Math.random()*(end-start)+start);
    }
});

var shuduGameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        //判断是否选择游戏模式
        if(typeof shudu.C_selMenu === false || typeof shudu.C_selSelect === false){
            cc.director.runScene(new shuduMenuScene());
        } 
         
        //解决联机调试中 扑捉不到onExit导致的计时器没有释放的问题
        if(typeof shudu.gameTimerId != 'undefined')clearInterval(shudu.gameTimerId);	//释放计时器
        
        
        //初始化数据

        shudu.gameData = []; 
        shudu.gameTime = 0;
        shudu.gameData_sel = false; //当前选中的格子
        shudu.selBtn_sel = false; //当前选中的棋子按钮
        //shudu.Q4Opened = 6;	//4阶 剩余可翻开棋子数
        shudu.QOpened = 0;	// 剩余可翻开棋子数
        //shudu.gameTimerId = null; //计时器
        
        
        var layer = new shuduGameMainLayer(this);
        this.addChild(layer);
    },
    tt:'tt1sssssssssssss',
    test:function(t){cc.log(t)},
    onExit:function(){
    	this._super();
    	if(shudu.gameTimerId)clearInterval(shudu.gameTimerId);	//释放计时器
    }
});

