/**
 * 复盘播放器逻辑代码
 * 
 * 	业务流程
 * 		newgame(test) -> (  roundstart()->autoplay()->movechess()->rundend()->roundstart()->...  )
 * 		->newgame()  -> (  roundstart()->autoplay()->movechess()->rundend()->roundstart()->...  )
 * 
 */

var fire_replayLayer = cc.Layer.extend({
	sprite:null,
	ctor:function () {
		//////////////////////////////
		// 1. super init first
		this._super();

		var size = cc.winSize;
		
		

		// 背景图
		var fire_bg = new cc.Sprite(res.fire_bg);
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


		var that = this;
		
		
		//按钮
		var fire_back = new cc.MenuItemImage(
				res.fire_back,
				res.fire_back_sel,
				res.fire_back,
				function (btn) {
					btn.getParent().pubCallBack(btn);
					that.pause();
					that.getParent().getChildByName('input').setVisible(true);
				}, this);
		fire_back.attr({
			x: 60, 
			y: this.MainNode.height-50,
			name :'back'
		});
		
		
		
		//上一步
		var fire_player_prev = new cc.MenuItemImage(
				res.fire_player_prev,
				res.fire_player_prev_sel,
				res.fire_player_prev,
				function (btn) {
					btn.getParent().pubCallBack(btn);
					that.pause();
					that.backChess();
				}, this);
		fire_player_prev.attr({
			x: this.MainNode.width / 4, 
			y: 110,
			scale:0.5,
			name :'prev'
		});
		//下一步
		var fire_player_next = new cc.MenuItemImage(
				res.fire_player_next,
				res.fire_player_next_sel,
				res.fire_player_next,
				function (btn) {
					btn.getParent().pubCallBack(btn);
					that.pause();
					that.roundStart();
				}, this);
		fire_player_next.attr({
			x: this.MainNode.width * 3 / 4, 
			y: 110,
			scale:0.5,
			name :'next'
		});
		//播放/暂停
		
		var fire_player_pp = new cc.MenuItemToggle(
			new cc.MenuItemImage(
				res.fire_player_play,
				res.fire_player_play,
				res.fire_player_play,
				function (btn) {
					btn.getParent().pubCallBack(btn);
					//cc.director.runScene(new mainMenuScene());
				}, this),
			new cc.MenuItemImage(
				res.fire_player_pause,
				res.fire_player_pause,
				res.fire_player_pause,
				function (btn) {
					btn.getParent().pubCallBack(btn);
					//cc.director.runScene(new mainMenuScene());
				}, this), function(btn){
				btn.getParent().pubCallBack(btn);
				if(btn.getSelectedIndex() == 0){
					that.pause();
					//that.roundStart();
				}else{
					fire.runtime.isAutoPlay = true;
					that.roundStart();
				}
			}, this)
		
		fire_player_pp.attr({
			x: this.MainNode.width / 2, 
			y: 110,
			scale:0.5,
			name :'pp'
		})
		this.fire_player_pp = fire_player_pp;
		
		var menu = new cc.Menu(fire_back,fire_player_prev,fire_player_next,fire_player_pp);
		menu.x = 0;
		menu.y = 0;
		this.MainNode.addChild(menu, 0);
		menu.pubCallBack = function(btn){
			//音效
			cc.audioEngine.playEffect(res.fire_au_beep);
		};
		menu.setAllBtns = function(isEnable){
			var btns = this.getChildren();
			//this.menu.setEnabled(isEnable);
			for(var i in btns){
				//cc.log(btns[i].name);
				if( btns[i].name != 'back'){
					btns[i].setEnabled(isEnable);
				}
			}
		}
		
		this.menu = menu;

		//棋盘点击
		//this.qipanOnTouch();
		
		
		setTimeout(function(){
			//that.newGame(true);		//放到setTimeout 里解决 初始化调用  this.getParent() undefined 的问题
		},0);


		//return true;
	},
	pause:function(){
		fire.runtime.isAutoPlay = false;
		clearTimeout(fire.runtime.STOautoplay);
		this.fire_player_pp.setSelectedIndex(0);
	},
	newGame:function(isTest){
		var that = this;

		fire.runtime.status = 'newGame';

		if(fire.gameConfig.reverse){	//交换棋子和 行棋先后
			fire.runtime.playerNow = 'a';
			fire.gameConfig.color = ['y','g'];
			fire.userData.a.color = 'g';
			fire.userData.b.color = 'y';
		}else{
			fire.runtime.playerNow = 'b';
			fire.gameConfig.color = ['g','y'];
			fire.userData.a.color = 'y';
			fire.userData.b.color = 'g';
		}
		fire.runtime.log = [];	//清空行棋日志
		fire.runtime.chessSel = null;
		fire.runtime.chessable = [];
		fire.runtime.dice = -1;
		fire.runtime.stepNum = -1;
		fire.runtime.isAutoPlay = false;
		fire.runtime.isTest = isTest;
		fire.runtime.roundWait = 1600;

		//删除棋盘精灵
		if(typeof this.qipan != 'undefined'){
			this.qipan.getParent().removeFromParent(true);
		}

		//还原骰子
		//this.getParent().getChildByName('sl').shakeDice('clear');

		//this.score('clear');//清除得分



		this.initQipan();
		this.initQizi(fire.gameConfig.color);
		
		if(fire.runtime.isTest){
			var gameInfo = {};	//为棋谱解析提供棋盘数据接口
			gameInfo.FirstColor = 0;
			gameInfo.GetManListByColor = function ( color ){
				
				var m_yManList =[], m_gManList = [];
				that.forGameData(function(grid){
					
					fire.gameData[grid[0]][grid[1]].row = grid[1];
					fire.gameData[grid[0]][grid[1]].col = grid[0];
					
					if(fire.gameData[grid[0]][grid[1]]['color'] == 'g'){
						m_gManList.push(fire.gameData[grid[0]][grid[1]]);
					}
					if(fire.gameData[grid[0]][grid[1]]['color'] == 'y'){
						m_yManList.push(fire.gameData[grid[0]][grid[1]]);
					}
				});
				
				if( color == 1 )
					return m_gManList;
				else if( color == 0 )
					return m_yManList;
				return null;
			}
			gameInfo.getMan = function(targetCol,targetRow){
				if(fire.gameData[targetCol][targetRow].type == -1)return null;
				return fire.gameData[targetCol][targetRow];
				
			}
			wChessMap.prototype.gameInfo = gameInfo;
			
			//fire.runtime.ccmap = new wChessMap('1. Nc3 d5 2. e3 e6 3. Qh5 Kd7 4. Bb5+ c6 5. Qe2 Bc5 6. d4 Qg5 7. Qd3 Kd8 8. Rb1 Qxg2 9. dxc5 Nd7 10. Qe2 Qxh1 11. Ra1 cxb5 12. c6 Qxg1+ 13. Kd2 Nc5 14. Qh5 Ke8 15. Nxb5 Ne4+ 16. Nc7+ d4 17. Nxe8# ');
			fire.runtime.ccmap = new wChessMap(fire.runtime.chessMapStr);
			
			//ccmap.resolveStep(16);
		}
		//this.qipanOnTouch();//棋盘点击事件监听


		//
		/*
		fire.runtime.timeLeft = fire.gameConfig.gameTime;
		this.getParent().getChildByName('sl').showTime(fire.runtime.timeLeft); //getParent undefined
		if(fire.runtime.timer)clearInterval(fire.runtime.timer);
		fire.runtime.timer = setInterval(function(){

			fire.runtime.timeLeft --;
			//显示时间
			that.getParent().getChildByName('sl').showTime(fire.runtime.timeLeft);

			if(fire.runtime.timeLeft <= 0){
				clearInterval(fire.runtime.timer);
				that.gameOver('time');

			}
		},1000);
		*/
		//cc.log('newGame');
		if(fire.runtime.isTest){
			this.roundStart();
		}
		this.userLock(false);
	},

	//回合开始
	roundStart:function(){

		if(fire.runtime.status == 'gameOver'){
			//return false;
		}

		fire.runtime.status='roundStart';
		//读一步棋谱
		fire.runtime.stepNow = fire.runtime.ccmap.resolveStep(++fire.runtime.stepNum);
		
		if(fire.runtime.stepNow === null ){
			if(fire.runtime.isTest){
				//trace('test over');
				
				this.getParent().getChildByName('input').setVisible(false);
				this.newGame(false);//正式播放
				
			}else{
				fire.runtime.stepNum --;
				//重置播放按钮
				this.pause();
				fire.runtime.status = 'gameOver';
				//trace('play over');
				this.showAlertX('棋谱播放完毕！');
			}
			return false;
		}else if(fire.runtime.stepNow === false){
			//trace('解析错误');
			this.showAlertX('棋谱解析出错，请检查棋谱是否正确！');
			
			return false;
		}
		
		fire.runtime.playerNow = fire.runtime.playerNow=='a'?'b':'a';

		fire.runtime.chessSel=false;	//当前选中棋子的位置
		//还原骰子
		//this.getParent().getChildByName('sl').shakeDice('clear');
		//fire.runtime.dice=-1;		//骰子当前点数
		fire.runtime.chessFrom=null;	//

		//this.userRing();

		//this.userLock(false); //cc.log('roundStart')	//解除锁定
		
			//this.userLock(true);//cc.log('ai')	//锁定 防止用户干扰AI
		this.AutoPlay();
		

		//this.shakeDice();
	},
	roundEnd:function(grid){

		if(fire.runtime.status != 'gameOver')fire.runtime.status='roundEnd';

		var that = this;

		//停止提醒玩家走棋动画
		//this.getParent().getChildByName('sl').show_p_runAction(fire.runtime.playerNow,false);

		//隐藏可走（绿块）
		this.forGameData(function(grid){
			that.qipan.getChildByName(fire.gameData[grid[0]][grid[1]].enSprite).setVisible(false);
		});

		//隐藏选中效果
		//this.qipan.getChildByName('source').setVisible(false);

		//显示最后移动的棋子
		if(grid){
			this.qipan.getChildByName('target').attr(fire.gameData[grid[0]][grid[1]].xy);
			this.qipan.getChildByName('target').setVisible(true);
		}


		if(fire.runtime.status == 'gameOver')
			return false;

		if(fire.runtime.isTest){
			that.roundStart();
		}else if(fire.runtime.isAutoPlay){
			fire.runtime.STOautoplay = setTimeout(
					function(){that.roundStart();},fire.runtime.roundWait
			);
		}



	},
	gameOver:function(type){return false;

		fire.runtime.status = 'gameOver';

		if(type == 'wang'){
			//当前玩家吃了对方的王
			var winner = fire.runtime.playerNow;

		}else if(type == 'time'){
			//时间到
			//调用胜负提示框
			if(fire.userData.a.score > fire.userData.b.score){
				var winner = 'a';
			}else if(fire.userData.a.score == fire.userData.b.score){//平局
				var winner = 'ab';
			}else{
				var winner = 'b';
			}

		}
		//cc.log('aaa'+winner)
		if(winner == 'ab'){
			this.getParent().getChildByName('sl').showGameover(winner,0,fire.userData.a.score);

			cc.audioEngine.playEffect(res.fire_au_dconnect);
		}else if(fire.userData[winner].isAI){
			//机器胜 显示失败框
			this.getParent().getChildByName('sl').showGameover(winner,-1);

			cc.audioEngine.playEffect(res.fire_au_dconnect);
		}else{
			this.getParent().getChildByName('sl').showGameover(winner,1);

			cc.audioEngine.playEffect(res.fire_au_connect);
		}






		//注销棋盘监听
		//this.qipanOnTouch(false);

		//停止计时
		clearInterval(fire.runtime.timer);

		cc.log('gameOver');

		//禁用按钮
		//this.getParent().getChildByName('ml').setAllBtns(false);

		cc.eventManager.addListener(cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: function (touch, event) {
				cc.director.runScene(new fireMenuScene());

				return true;
			}

		}), this);

		//alert('gameOver');
	},

	//玩家提醒
	userRing : function(){


		//停止提醒玩家走棋动画
		this.getParent().getChildByName('sl').show_p_runAction('a',false);
		this.getParent().getChildByName('sl').show_p_runAction('b',false);
		//提醒玩家走棋
		this.getParent().getChildByName('sl').show_p_runAction(fire.runtime.playerNow);
	},

	//锁定用户行为 （屏幕交互、按钮。。。）
	userLock : function(lock){

		if(lock){
			
			//禁用按钮
			this.menu.setAllBtns(false);
		}else{
			this.menu.setAllBtns(true);
		}
	},

	//走棋记录
	runTimeLog:function(key,value){

		if(typeof key == 'object'){
			key = JSON.parse(JSON.stringify(key));	
			fire.runtime.log.push(key);
		}else if(typeof key == 'string'){
			fire.runtime.log[fire.runtime.log.length-1][key] = JSON.parse(JSON.stringify(value));
		}
		
		
		/*
		 * {
				player :fire.runtime.playerNow,
				type :fire.runtime.stepNow.type,
				fromGrid :gridNow,
				toGrid :gridTar,
				fromData :fire.gameData[gridNow[0]][gridNow[1]],
				toData :fire.gameData[gridTar[0]][gridTar[1]],
				changeTo :
				crossEat :
			}
		 * */
		
		
	},
	move:function(fromGrid,toGrid){

		var that = this;
		this.userLock(true);
			this.qipan.getChildByName(fire.gameData[fromGrid[0]][fromGrid[1]].chess).runAction(
					cc.sequence(
							cc.moveTo(0.3, fire.gameData[toGrid[0]][toGrid[1]]['xy']),
							cc.callFunc(function () {
								that.userLock(false);
							}, this)
					)
			);

	
	},
	//悔棋
	backChess:function(){
		//if(fire.runtime.status != 'roundStart')return false;	//只能在回合开始 到 摇骰子之前悔棋
		
		var that = this;
		if(fire.runtime.status != 'gameOver' && fire.runtime.status != 'roundEnd'){	//解决行棋流程未走完 点击上一步导致棋子乱跑问题
			//setTimeout(that.backChess,500);
			return false;
		}
		
		var lastStep = fire.runtime.log.pop();
		if(typeof lastStep != 'undefined' ){//cc.log('qq')

			if(lastStep.type.indexOf('OOO') != -1){
				
				this.move( [3,lastStep.toGrid[1]],[1,lastStep.toGrid[1]]);//cc.log('tt')
				this.moveChessData([3,lastStep.toGrid[1]], [1,lastStep.toGrid[1]]);
			}
			if(lastStep.type.indexOf('OO') != -1){
				this.move( [5,lastStep.toGrid[1]],[7,lastStep.toGrid[1]]);
				this.moveChessData([5,lastStep.toGrid[1]], [7,lastStep.toGrid[1]]);
			}
			
			if(lastStep.type.indexOf('=') != -1){
				this.qipan.getChildByName(lastStep.changeTo.chess).removeFromParent(true);
				this.qipan.getChildByName(lastStep.fromData.chess).setVisible(true);
				this.moveChessData(lastStep.fromData, lastStep.toGrid);
			}
			
			this.move( lastStep.toGrid,lastStep.fromGrid);

			this.moveChessData(lastStep.toGrid, lastStep.fromGrid);
			
			if(lastStep.type.indexOf('x') != -1){
				if(lastStep.type.indexOf('p') != -1){
					this.qipan.getChildByName(lastStep.crossEat.chess).setVisible(true);
					this.moveChessData(lastStep.crossEat, [lastStep.toGrid[0],lastStep.fromGrid[1]]);
				}else{
					this.qipan.getChildByName(lastStep.toData.chess).setVisible(true);
					this.moveChessData(lastStep.toData, lastStep.toGrid);
				}
				
			}


			//重新标记最后一步走棋路径
			var ls = fire.runtime.log[fire.runtime.log.length-1];
			if(typeof ls != 'undefined' ){
				//重新标记最后一步走棋路径
				this.qipan.getChildByName('target').attr(fire.gameData[ls.toGrid[0]][ls.toGrid[1]].xy);
				this.qipan.getChildByName('source').attr(fire.gameData[ls.fromGrid[0]][ls.fromGrid[1]].xy);

			}else{
				//隐藏走棋路径
				this.qipan.getChildByName('target').setVisible(false);
				this.qipan.getChildByName('source').setVisible(false);
			}
			
			//fire.runtime.playerNow = lastStep.player;trace(fire.runtime.playerNow);
			fire.runtime.playerNow = lastStep.player=='a'?'b':'a';
			
			fire.runtime.stepNum --;
			
			//this.userRing();
			return false;
		}
		
		//
	},

	AutoPlay:function(){

		var that = this;

		//1.摇色子
		//this.shakeDice();

		//2.选棋
		
		var gridNow = [fire.runtime.stepNow.fromCol,fire.runtime.stepNow.fromRow];
		var gridTar = [fire.runtime.stepNow.toCol,fire.runtime.stepNow.toRow];
		
		if(!fire.runtime.isTest)
		this.selChess(gridNow);	//选棋

			//3.走棋
		
		if(fire.runtime.isTest){
			this.moveChess(gridNow, gridTar ,fire.runtime.isTest);
		}else{
			//if(!fire.runtime.isAutoPlay)
			this.userLock(true);
			setTimeout(
					function(){that.moveChess(gridNow, gridTar ,fire.runtime.isTest);},fire.runtime.roundWait/2
			);
		}
		




	},


	score:function(score){

		if(score == 'clear'){
			this.getParent().getChildByName('sl').setScore('a','00');
			this.getParent().getChildByName('sl').setScore('b','00');
			fire.userData.a.score = 0;
			fire.userData.b.score = 0;
			return false;
		}

		score = fire.userData[fire.runtime.playerNow].score += parseInt(score);
		//cc.log(fire.runtime.playerNow+':'+fire.userData[fire.runtime.playerNow].score);
		if(score < 10){
			score = '0'+score;
		}
		this.getParent().getChildByName('sl').setScore(fire.runtime.playerNow,score);
	},

	selChess:function(grid){
		cc.audioEngine.playEffect(res.fire_au_click);
		fire.runtime.chessSel = grid;//选中

		this.qipan.getChildByName('source').attr(fire.gameData[grid[0]][grid[1]].xy);
		this.qipan.getChildByName('source').setVisible(true);

		this.showMoveable(grid);
	},
	initQipan:function(){
		//棋盘
		this.qipan = new cc.Sprite(fire.gameConfig['skin'+fire.runtime.skin].qipan);
		this.qipan.attr({
			x: this.MainNode.width / 2,
			y: this.MainNode.height/2,

		});
		this.MainNode.addChild(this.qipan, 0);
		var gridWidth = this.gridWidth = (this.qipan.width-fire.gameConfig.qipanBorderX*2)/fire.gameConfig.qipanGridY;    //格子宽度

		for(var y=fire.gameConfig.qipanGridY-1;y>=0;y--){
			for(var x=0;x<fire.gameConfig.qipanGridX;x++){
				if(typeof fire.gameData[x] == 'undefined')fire.gameData[x] = [];//cc.log(7-y);
				fire.gameData[x][7-y]={xy:this.grid2p([x,y]),chess:null,enSprite:null,selected:false,type:-1,eated:0,color:null,name:null};
			}
		}
		//cc.log(fire.gameData);

		//加载棋子资源
		cc.spriteFrameCache.addSpriteFrames(fire.gameConfig['skin'+fire.runtime.skin].chess_plist);
		var qipanBatchNode = new cc.SpriteBatchNode(fire.gameConfig['skin'+fire.runtime.skin].chess_png, 98);


		//最后移动棋子的效果
		var target = new cc.Sprite('#target.png');
		target.TexTure = 'target.png';
		target.setVisible(false);
		qipanBatchNode.addChild(target, 0,'target');


		//表示可走棋子和可走位置的绿块
		this.forGameData(function(data){	
			var enable = new cc.Sprite('#enable.png');
			enable.attr(fire.gameData[data[0]][data[1]].xy);
			enable.TexTure = 'enable.png';
			enable.setVisible(false);
			qipanBatchNode.addChild(enable, 0,'en'+data[0]+''+data[1]); 
			fire.gameData[data[0]][data[1]].enSprite = 'en'+data[0]+''+data[1];
		});

		//棋子选中效果
		var source = new cc.Sprite('#source.png');
		source.TexTure = 'source.png';
		source.setVisible(false);
		qipanBatchNode.addChild(source, 0,'source');

		this.qipanSp = this.qipan;

		this.qipan.addChild(qipanBatchNode, 0);
		this.qipan = qipanBatchNode; 
	},
	//判断兵变 
	bingbian:function(grid){
		var c_type = fire.gameData[grid[0]][grid[1]].type;
		var c_color = fire.gameData[grid[0]][grid[1]].color;
		if(c_type == 'BING' && fire.runtime.stepNow.changeTo && ((grid[1]==7 &&  c_color==fire.gameConfig.color[0]) || (grid[1]==0 &&  c_color==fire.gameConfig.color[1])  )){

			fire.runtime.bingbian = grid;

			//判断是否机器人
			if(fire.userData[fire.runtime.playerNow].isAI){
				
				fire.runtime.stepNow.changeTo
				
				
				this.bingbian2('hou');//机器人直接变 皇后
			}else{

				//this.getParent().getChildByName('sl').showAlertB();
			}
			return true;
		}else{
			return false;
		}
	},
	//创建兵变棋子并返回数据    grid:要变的棋子，  
	getBBchess:function(grid,type){
		//var grid = fire.runtime.bingbian;
		var data = fire.gameData[grid[0]][grid[1]];
		var name = 0;
		var chess_num = 0;
		switch (type) {
		case 'JU':
			chess_num = 1;
			name = 'che';
			break;
		case 'MA':
			chess_num = 2;
			name = 'ma';
			break;
		case 'XIANG':
			chess_num = 3;
			name = 'xiang';
			break;
		case 'HOU':
			chess_num = 4;
			name = 'hou';
			break;

		default:return false;
		break;
		}

		var bbData = {};
		bbData['chess'] = this.createChess('#'+data.color+chess_num+'.png', data.xy, data.color+'_'+name+'_'+fire.runtime.chess_tag_num);
		bbData['type'] = type;
		bbData['name'] = name;
		bbData['color'] = data.color;

		fire.runtime.chess_tag_num++;

		return bbData;
	},

	//皮肤

	skin:function(skin){

		//替换棋盘纹理
		this.qipan.getParent().setTexture(fire.gameConfig['skin'+skin].qipan);
		//移除精灵表
		cc.spriteFrameCache.removeSpriteFramesFromFile(fire.gameConfig['skin'+fire.runtime.skin].chess_plist);
		//添加新精灵表
		cc.spriteFrameCache.addSpriteFrames(fire.gameConfig['skin'+skin].chess_plist);
		fire.runtime.skin = skin;
		//cc.log(this.qipan);
		//替换棋盘SpriteBatchNode(棋子)的精灵表纹理
		this.qipan.setTexture(cc.textureCache.addImage(fire.gameConfig['skin'+skin].chess_png));

		var that = this;
		/***
		this.forGameData(function(grid){	

			if(fire.gameData[grid[0]][grid[1]].chess){
				//var chess = that.qipan.getChildByName(fire.gameData[grid[0]][grid[1]].chess);
				//替换SpriteBatchNode中子节点的纹理
				//chess.setSpriteFrame(chess.TexTure);
			}
			//that.qipan.getChildByName('en'+grid[0]+''+grid[1]).setSpriteFrame('enable.png');
		});
		 ***/
		//this.qipan.getChildByName('source').setSpriteFrame('source.png');
		//this.qipan.getChildByName('target').setSpriteFrame('target.png');


		//20150804 替换上面注释的部分
		var qipanChildren = this.qipan.getChildren();

		for (var i in qipanChildren){

			//cc.log(qipanChildren[i].TexTure);
			//替换SpriteBatchNode中子节点的纹理
			qipanChildren[i].setSpriteFrame(qipanChildren[i].TexTure);

		}





	},

	//gy {'g','y'} 用于交换棋子
	initQizi:function(gy){


		var chessArr = [];
		for(var i=1;i<7;i++){
			chessArr['g'+i]='#g'+i+'.png';
			//this.MainNode.addChild(g1, 0);
		}
		for(var i=1;i<7;i++){
			chessArr['y'+i]='#y'+i+'.png';
			//this.MainNode.addChild(g1, 0);
		}

		//cc.log('qizi');
		fire.gameData[0][0]['chess'] = this.createChess(chessArr[gy[0]+1], fire.gameData[0][0]['xy'], gy[0]+'_che_1');
		fire.gameData[0][0]['type'] = 'JU';//0王 9后 3马相 5车 1兵
		fire.gameData[1][0]['chess'] = this.createChess(chessArr[gy[0]+2], fire.gameData[1][0]['xy'], gy[0]+'_ma_1');
		fire.gameData[1][0]['type'] = 'MA';
		fire.gameData[2][0]['chess'] = this.createChess(chessArr[gy[0]+3], fire.gameData[2][0]['xy'], gy[0]+'_xiang_1');
		fire.gameData[2][0]['type'] = 'XIANG';
		fire.gameData[3][0]['chess'] = this.createChess(chessArr[gy[0]+4], fire.gameData[3][0]['xy'], gy[0]+'_hou_1');
		fire.gameData[3][0]['type'] = 'HOU';
		fire.gameData[4][0]['chess'] = this.createChess(chessArr[gy[0]+5], fire.gameData[4][0]['xy'], gy[0]+'_wang_1');
		fire.gameData[4][0]['type'] = 'KING';
		fire.gameData[5][0]['chess'] = this.createChess(chessArr[gy[0]+3], fire.gameData[5][0]['xy'], gy[0]+'_xiang_2');
		fire.gameData[5][0]['type'] = 'XIANG';
		fire.gameData[6][0]['chess'] = this.createChess(chessArr[gy[0]+2], fire.gameData[6][0]['xy'], gy[0]+'_ma_2');
		fire.gameData[6][0]['type'] = 'MA';
		fire.gameData[7][0]['chess'] = this.createChess(chessArr[gy[0]+1], fire.gameData[7][0]['xy'], gy[0]+'_che_2');
		fire.gameData[7][0]['type'] = 'JU';
		for(var i=0;i<8;i++){
			fire.gameData[i][1]['chess'] = this.createChess(chessArr[gy[0]+6], fire.gameData[i][1]['xy'], gy[0]+'_bing_'+(i+1));
			fire.gameData[i][1]['type'] = 'BING';
		}

		//
		fire.gameData[0][7]['chess'] = this.createChess(chessArr[gy[1]+1], fire.gameData[0][7]['xy'], gy[1]+'_che_1');
		fire.gameData[0][7]['type'] = 'JU';
		fire.gameData[1][7]['chess'] = this.createChess(chessArr[gy[1]+2], fire.gameData[1][7]['xy'], gy[1]+'_ma_1');
		fire.gameData[1][7]['type'] = 'MA';
		fire.gameData[2][7]['chess'] = this.createChess(chessArr[gy[1]+3], fire.gameData[2][7]['xy'], gy[1]+'_xiang_1');
		fire.gameData[2][7]['type'] = 'XIANG';
		fire.gameData[3][7]['chess'] = this.createChess(chessArr[gy[1]+4], fire.gameData[3][7]['xy'], gy[1]+'_hou_1');
		fire.gameData[3][7]['type'] = 'HOU';
		fire.gameData[4][7]['chess'] = this.createChess(chessArr[gy[1]+5], fire.gameData[4][7]['xy'], gy[1]+'_wang_1');
		fire.gameData[4][7]['type'] = 'KING';
		fire.gameData[5][7]['chess'] = this.createChess(chessArr[gy[1]+3], fire.gameData[5][7]['xy'], gy[1]+'_xiang_2');
		fire.gameData[5][7]['type'] = 'XIANG';
		fire.gameData[6][7]['chess'] = this.createChess(chessArr[gy[1]+2], fire.gameData[6][7]['xy'], gy[1]+'_ma_2');
		fire.gameData[6][7]['type'] = 'MA';
		fire.gameData[7][7]['chess'] = this.createChess(chessArr[gy[1]+1], fire.gameData[7][7]['xy'], gy[1]+'_che_2');
		fire.gameData[7][7]['type'] = 'JU';
		for(var i=0;i<8;i++){
			fire.gameData[i][6]['chess'] = this.createChess(chessArr[gy[1]+6], fire.gameData[i][6]['xy'], gy[1]+'_bing_'+(i+1));
			fire.gameData[i][6]['type'] = 'BING';
		}


		this.forGameData(function(grid){

			if(fire.gameData[grid[0]][grid[1]]['chess']){
				//标注颜色
				fire.gameData[grid[0]][grid[1]]['color'] = fire.gameData[grid[0]][grid[1]]['chess'].substr(0,1);
				//棋子名称
				fire.gameData[grid[0]][grid[1]]['name'] = fire.gameData[grid[0]][grid[1]]['chess'].split('_')[1];
			}
		});
		
	},
	createChess:function(res,xy,tag){
		var chess = new cc.Sprite(res);
		chess.attr(xy);
		chess.TexTure = res.replace('#','');
		this.qipan.addChild(chess, 1,tag); 
		return tag;
	},
	/**
	 * 走棋函数 ——处理动画，特殊走棋，走棋数据 
	 * isTest ： 测试模式 （只走数据）
	 */
	moveChess:function(gridNow,gridTar,isTest){

		//if(fire.runtime.status != 'diced')return false;

		
		var that = this;
		//var type = 'move';
		var score = 0;
		

		

		//正式走棋 移动棋子
		if(!isTest){
			cc.audioEngine.playEffect(res.fire_au_move);//音效
			
			//吃子儿   先隐藏目标棋子 后面就和移动棋子一样了
			if(fire.runtime.stepNow.type.indexOf('x') != -1){
				//type = 'eat';
				//

				if(fire.runtime.stepNow.type.indexOf('p') != -1){

					//吃过路兵
					if(!fire.gameData[gridTar[0]][gridNow[1]].chess)return false;
					this.qipan.getChildByName(fire.gameData[gridTar[0]][gridNow[1]].chess).setVisible(false);
				}else{
					//普通吃字儿
					if(!fire.gameData[gridTar[0]][gridTar[1]].chess)return false;
					this.qipan.getChildByName(fire.gameData[gridTar[0]][gridTar[1]].chess).setVisible(false);
				}
				//this.score(fire.gameData[gridTar[0]][gridTar[1]].type);
				//score = fire.gameData[gridTar[0]][gridTar[1]].type;

			}
			
			
			this.move([gridNow[0],gridNow[1]], [gridTar[0],gridTar[1]]);
			
			if(fire.runtime.stepNow.type.indexOf('OO') != -1){//短易位
				//type = 'eat';
				//移动车
				
				this.move([7,gridNow[1]], [5,gridNow[1]]);
	
			}
			if(fire.runtime.stepNow.type.indexOf('OOO') != -1){//长易位
				//type = 'eat';
				//移动车
				
				this.move([0,gridNow[1]], [3,gridNow[1]]);
	
			}
			
	
			//行棋日志log
			this.runTimeLog({
				player:fire.runtime.playerNow,
				type:fire.runtime.stepNow.type,
				fromGrid:gridNow,
				toGrid:gridTar,
				fromData:fire.gameData[gridNow[0]][gridNow[1]],
				toData:fire.gameData[gridTar[0]][gridTar[1]]
			});
			
		}
		
		
		
		if(fire.gameData[gridTar[0]][gridTar[1]].type == 'KING'){	//如果被吃的是王 则game over
			this.gameOver('wang');
		}



		
		

		//移动数据
		if(fire.runtime.stepNow.type.indexOf('OO') != -1){//短易位
			//移动数据 JU
			this.moveChessData([7,gridNow[1]], [5,gridNow[1]]);
		}else if(fire.runtime.stepNow.type.indexOf('OOO') != -1){//长易位
			//移动数据 JU
			this.moveChessData([0,gridNow[1]], [3,gridNow[1]]);
		}else if(fire.runtime.stepNow.type.indexOf('p') != -1){//吃过路兵
			if(!isTest)
				this.runTimeLog('crossEat',fire.gameData[gridTar[0]][gridNow[1]]);
			this.moveChessData([gridTar[0],gridNow[1]]);
		}
		
		this.moveChessData(gridNow, gridTar);
		
		//兵变  
		if(fire.runtime.stepNow.changeTo){


			if(!isTest)
				this.qipan.getChildByName(fire.gameData[gridTar[0]][gridTar[1]].chess).setVisible(false);//隐藏兵变前的棋子
			
			//当执行到这里时   gridNow的数据已经被换到了gridTar  所以这里传入gridTar
			var BBchess = this.getBBchess(gridTar,fire.runtime.stepNow.changeTo);
			trace(fire.runtime.stepNow.changeTo)
			trace(BBchess)
			
			//更新数据
			fire.gameData[gridTar[0]][gridTar[1]].chess = BBchess.chess;
			fire.gameData[gridTar[0]][gridTar[1]].type = BBchess.type;
			fire.gameData[gridTar[0]][gridTar[1]].color = BBchess.color;
			fire.gameData[gridTar[0]][gridTar[1]].name = BBchess.name;
			if(!isTest)
				this.runTimeLog('changeTo',fire.gameData[gridTar[0]][gridTar[1]]);
		}
		
		this.roundEnd(gridTar);
	},
	
	moveChessData:function(gridNow,gridTar){
		
		//移动数据
		
		if(gridTar){
			if(typeof gridNow[0] == 'undefined'){
				fire.gameData[gridTar[0]][gridTar[1]].chess = gridNow.chess;
				fire.gameData[gridTar[0]][gridTar[1]].type = gridNow.type;
				fire.gameData[gridTar[0]][gridTar[1]].color = gridNow.color;
				fire.gameData[gridTar[0]][gridTar[1]].name = gridNow.name;
			}else{
				fire.gameData[gridTar[0]][gridTar[1]].chess = fire.gameData[gridNow[0]][gridNow[1]].chess;
				fire.gameData[gridTar[0]][gridTar[1]].type = fire.gameData[gridNow[0]][gridNow[1]].type;
				fire.gameData[gridTar[0]][gridTar[1]].color = fire.gameData[gridNow[0]][gridNow[1]].color;
				fire.gameData[gridTar[0]][gridTar[1]].name = fire.gameData[gridNow[0]][gridNow[1]].name;
			}
		}
		if(typeof gridNow[0] != 'undefined'){
			fire.gameData[gridNow[0]][gridNow[1]].chess = null;
			fire.gameData[gridNow[0]][gridNow[1]].type = -1;
			fire.gameData[gridNow[0]][gridNow[1]].color = null;
			fire.gameData[gridNow[0]][gridNow[1]].name = null;
		}
		return true;
	},

	


	//格子转坐标 return cc.p
	grid2p:function(grid){
		//cc.log(grid[0] +'---'+grid[1]);
		//cc.log((this.gridWidth*(grid[0]+1)-this.gridWidth/2+fire.gameConfig.qipanBorderX) +'---'+(this.gridWidth*(grid[1]+1)-this.gridWidth/2+fire.gameConfig.qipanBorderY));
		return new cc.p(this.gridWidth*(grid[0]+1)-this.gridWidth/2+fire.gameConfig.qipanBorderX, this.gridWidth*(grid[1]+1)-this.gridWidth/2+fire.gameConfig.qipanBorderY);
	},
	//坐标转格子	 p:棋盘精灵内部坐标
	p2grid:function(p){
		for(var x in fire.gameData){
			for(var y in fire.gameData){
				if(p.x < (fire.gameData[x][y]['xy']['x']+this.gridWidth/2) && p.y <(fire.gameData[x][y]['xy'].y+this.gridWidth/2) && p.x > (fire.gameData[x][y]['xy'].x-this.gridWidth/2) && p.y >(fire.gameData[x][y]['xy'].y-this.gridWidth/2)){

					return [x,y];
				}
			}
		}
		return false;
	},
	//棋盘点击监听 callback(grid)
	qipanOnTouch:function(type){

		if(type === false){
			this.event_qipanTouch.setEnabled(false);
			return false;
		}
		if(typeof this.event_qipanTouch != 'undefined'){
			this.event_qipanTouch.setEnabled(true);
			return false;
		}

		var that = this;

		this.event_qipanTouch = cc.eventManager.addListener(cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: function (touch, event) {
				//var target = event.getCurrentTarget();
				var p = that.qipan.convertToNodeSpace(touch.getLocation());//cc.log(p);
				if(that.qipanSp.EXT_PinNode(p))
					that.qipanTouchCallback(that.p2grid(p));

				return true;
			}
		}), this);
		//this.event_qipanTouch.retain();

	},
	showAlertX : function(text,cb1,cb2){

		var that = this;
		this.userLock(true);	//打开弹窗  锁定用户操作
		this.getParent().getChildByName('sl').showAlertX(text,function(){
			that.userLock(false);
			cb1 && cb1();			
		},function(){
			that.userLock(false);
			cb2 && cb2();			
		});
	},
	qipanTouchCallback:function(grid){
		var that = this;

		if(fire.runtime.status != 'diced'){
			cc.audioEngine.playEffect(res.fire_au_error1);
			this.showAlertX('请先掷骰子，后走棋！');
			return false;
		}

		if(grid){
			if(!fire.runtime.chessSel){
				if(that.isInchessable(grid)){//点击棋子为可走棋子
					that.selChess(grid);
				}else{
					cc.audioEngine.playEffect(res.fire_au_error1);
					that.showAlertX('请走选中的棋子！');
					return false;
				}
			}

			var clickData = fire.gameData[grid[0]][grid[1]];
			if(clickData['chess']){	//当前位置有棋

				if(that.isInchessable(grid)){//点击棋子为可走棋子  则选中

					that.selChess(grid);
				}else{
					//吃
					if(that.isInchessable(fire.runtime.chessSel,grid)){	//查询是否可吃
						that.moveChess(fire.runtime.chessSel, grid);
					}else{
						cc.audioEngine.playEffect(res.fire_au_error1);
						that.showAlertX('走棋规则不正确！');
					}
				}

			}else {	//当前位置没棋

				if(that.isInchessable(fire.runtime.chessSel,grid)){	//查询是否可走
					that.moveChess(fire.runtime.chessSel, grid);
				}else{
					cc.audioEngine.playEffect(res.fire_au_error1);
					that.showAlertX('走棋规则不正确！');
				}
			}
		}
	},

	forGameData:function(callback){
		for(var x in fire.gameData){
			for(var y in fire.gameData){
				if(callback([x,y]) === false)return false;
			}
		}
	},
	shakeDice : function(){

		if(fire.runtime.status != 'roundStart'){
			return false;
		}
		fire.runtime.status='diced';
		cc.audioEngine.playEffect(res.fire_au_dice);//音效

		var chessType = -1;
		var chessTypes = [0, 1, 3, 5, 9];

		var chessable = false;
		while(!chessable){
			var numRandom = Math.floor(Math.random() * chessTypes.length + 1) - 1;
			chessType = chessTypes[numRandom];
			chessTypes.splice(numRandom,1);
			chessable = this.getChessAble(chessType);
		}


		this.getParent().getChildByName('sl').shakeDice( chessType);
		return chessType;
	},

	showChessable:function(){
		//显示可走棋子
		for(var i in fire.runtime.chessable){
			var grid = fire.runtime.chessable[i]['chess'];
			this.qipan.getChildByName(fire.gameData[grid[0]][grid[1]].enSprite).setVisible(true);
		}
	},

	showMoveable:function(grid){
		var that = this;
		//隐藏所有提示块
		this.forGameData(function(grid){
			that.qipan.getChildByName(fire.gameData[grid[0]][grid[1]].enSprite).setVisible(false);
		});

		//可走棋子提示依然保留
		this.showChessable();

		//显示可走位置
		for(var i in fire.runtime.chessable){
			if( grid[0] == fire.runtime.chessable[i]['chess'][0] && grid[1] == fire.runtime.chessable[i]['chess'][1]){

				for(var j in fire.runtime.chessable[i]['move']){
					var grid = fire.runtime.chessable[i]['move'][j];
					this.qipan.getChildByName(fire.gameData[grid[0]][grid[1]].enSprite).setVisible(true);
				}
			}
		}
	},


	//获取可走棋子及对应可走位置到runtime, return boolean
	getChessAble:function(chessType){

		var chessable = [];//可走棋子的grid

		//遍历得到 可走棋子
		this.forGameData(function(grid){
			//没有被吃的 ，当前玩家的 
			if(fire.gameData[grid[0]][grid[1]]['type'] > -1 && fire.gameData[grid[0]][grid[1]]['color']== fire.userData[fire.runtime.playerNow]['color']&& !fire.gameData[grid[0]][grid[1]]['eated']){
				chessable.push(grid);
			}
		});

		if(chessable.length<1)return false;

		//获取可走棋子的可走路径
		var moveAble = 0;
		for(var i in chessable){
			chessable[i] = {'chess':chessable[i],'move':this.getMoveAble(chessable[i])};
			if(chessable[i]['move'].length > 0)moveAble++;
		}

		fire.runtime.chessable = chessable;  return moveAble;  //2015/05/15(需求变更)  不能走则直接返回   重新摇

		if(!moveAble){
			//如果无路可走 则任意走（获取所有棋子为可走棋子）
			chessable = [];
			this.forGameData(function(grid){
				//没有被吃的 ，当前玩家的 
				if(fire.gameData[grid[0]][grid[1]]['color']== fire.userData[fire.runtime.playerNow]['color']&& !fire.gameData[grid[0]][grid[1]]['eated']){
					chessable.push(grid);
				}
			});
			for(var i in chessable){
				chessable[i] = {'chess':chessable[i],'move':this.getMoveAble(chessable[i])};
				if(chessable[i]['move'].length)moveAble++;
			}
		}
		fire.runtime.chessable = chessable;
		return true;
	},
	//查找位置是否在 chessable中 
	isInchessable:function(chess,move){

		for(var i in fire.runtime.chessable){
			if(chess[0] == fire.runtime.chessable[i]['chess'][0] && chess[1] == fire.runtime.chessable[i]['chess'][1]){
				if(move){
					for(var j in fire.runtime.chessable[i]['move']){
						if(move[0] == fire.runtime.chessable[i]['move'][j][0] && move[1] == fire.runtime.chessable[i]['move'][j][1])return true;
					}
				}else{
					return true;
				}
			}
		}
		return false;
	},
	//获取 grid 可走的格子数组
	getMoveAble:function(grid){
		var that = this;
		var gridNow = grid;
		var moveAble = [];
		this.forGameData(function(grid){
			//目标位置若有棋子则不能与当前棋子颜色相同
			if(fire.gameData[gridNow[0]][gridNow[1]].color != fire.gameData[grid[0]][grid[1]].color && that.checkMoveAble(gridNow,grid)){
				moveAble.push(grid);
			}
		});
		return moveAble;
	},
	//检查从gridNow 到 gridTar 是否可走
	checkMoveAble:function(gridNow,gridTar){
		var curPosX = gridNow[0], curPosY = gridNow[1];
		var ocolor = fire.gameData[gridNow[0]][gridNow[1]].color;

		var newPosX = gridTar[0];
		var newPosY = gridTar[1];
		if (curPosX == newPosX && curPosY == newPosY)
			return false;
		//cc.log(fire.gameData[gridNow[0]][gridNow[1]].name);
		switch (fire.gameData[gridNow[0]][gridNow[1]].name) {
		//走棋口诀：//王走一口(格)，后走米  //车走十字，象走X(斜) //马走Y(歪),踏8方 //兵直走，却X(斜)吃                                                                                                                                                                                                                                                                                                                            
		case "che":
			if (curPosX == newPosX) {//Y轴移动，判断当前Y轴点与目标Y轴点是否有棋子
				if (this.checkX2PHaveQizi(curPosX, curPosY, newPosY) <= 0)
					return true;
			}
			else if (curPosY == newPosY) {//X轴移动，判断当前X轴点与目标X轴点是否有棋子
				if (this.checkY2PHaveQizi(curPosY, curPosX, newPosX) <= 0)
					return true;
			}
			break;
		case "ma":
			if ((Math.abs(curPosX - newPosX) == 1 && Math.abs(curPosY - newPosY) == 2) || (Math.abs(curPosX - newPosX) == 2) && Math.abs(curPosY - newPosY) == 1)
				return true;
			break;
		case "xiang":
			if ((Math.abs(curPosX - newPosX) == Math.abs(curPosY - newPosY)) && (this.checkXY2PHaveQizi(curPosX, curPosY, newPosX, newPosY) <= 0)) {//斜线移动
				//alert("当前位置：" + curPosX + "," + curPosY + "移动位置：" + newPosX + "," + newPosY);
				return true;
			}
			break;
		case "hou":
			if (curPosX == newPosX) {//Y轴移动，判断当前Y轴点与目标Y轴点是否有棋子
				if (this.checkX2PHaveQizi(curPosX, curPosY, newPosY) <= 0)
					return true;
			}
			else if (curPosY == newPosY) {//X轴移动，判断当前X轴点与目标X轴点是否有棋子
				if (this.checkY2PHaveQizi(curPosY, curPosX, newPosX) <= 0)
					return true;
			} else if (Math.abs(curPosX - newPosX) == Math.abs(curPosY - newPosY)) {//斜线移动
				//alert("当前位置：" + curPosX + "," + curPosY + "移动位置：" + newPosX + "," + newPosY);
				if (this.checkXY2PHaveQizi(curPosX, curPosY, newPosX, newPosY) <= 0)
					return true;
			}
			break;
		case "wang":
			//斜对角走棋||X轴移动一格||Y轴移动一格
			if ((Math.abs(newPosY - curPosY) == 1 && Math.abs(newPosX - curPosX) == 1) || (Math.abs(newPosY - curPosY) == 0 && Math.abs(newPosX - curPosX) == 1) || (Math.abs(newPosY - curPosY) == 1 && Math.abs(newPosX - curPosX) == 0))
				return true;
			break;
		case "bing":
			if (fire.gameConfig.color[0] == 'g') {//玩家a先走
				if (ocolor == "g") {//黑兵走棋
					if (newPosY < curPosY)
						return false;
					if (newPosX == curPosX) { //直走
						if (curPosY == 1) {//第一步
							if (newPosY - curPosY == 1 && this.checkP2PHaveQizi(newPosX, newPosY) <= 0)//走一格且目标棋盘无棋子
								return true;
							else if (newPosY - curPosY == 2 && this.checkX2PHaveQizi(curPosX, curPosY, newPosY) <= 0 && this.checkP2PHaveQizi(curPosX, newPosY) <= 0)//走两格且不越子且目标棋盘无棋子
								return true;
						} else {//非第一步只能走一格
							if (newPosY - curPosY == 1 && this.checkP2PHaveQizi(newPosX, newPosY) <= 0)
								return true;
						}
					} else if (Math.abs(newPosX - curPosX) == 1 && newPosY - curPosY == 1) {//斜走一格，吃子
						if (this.checkP2PHaveQizi(newPosX, newPosY) > 0)
							return true;
					}
				}
				else {//红兵走棋
					if (newPosY > curPosY)
						return false;
					if (newPosX == curPosX) { //直走
						if (curPosY == 6) {//第一步
							if (curPosY - newPosY == 1 && this.checkP2PHaveQizi(newPosX, newPosY) <= 0)//走一格且目标棋盘无棋子
								return true;
							else if (curPosY - newPosY == 2 && this.checkX2PHaveQizi(curPosX, curPosY, newPosY) <= 0 && this.checkP2PHaveQizi(curPosX, newPosY) <= 0)//走两格且不越子且目标棋盘无棋子
								return true;
						} else {//非第一步只能走一格
							if (curPosY - newPosY == 1 && this.checkP2PHaveQizi(newPosX, newPosY) <= 0)
								return true;
						}
					} else if (Math.abs(newPosX - curPosX) == 1 && curPosY - newPosY == 1) {//斜走一格，吃子
						if (this.checkP2PHaveQizi(newPosX, newPosY) > 0)
							return true;
					}
				}
			}
			else { //玩家b先走
				if (ocolor == "g") {//黑兵走棋
					if (newPosY > curPosY)
						return false;
					if (newPosX == curPosX) { //直走
						if (curPosY == 6) {//第一步
							if (curPosY - newPosY == 1 && this.checkP2PHaveQizi(newPosX, newPosY) <= 0)//走一格且目标棋盘无棋子
								return true;
							else if (curPosY - newPosY == 2 && this.checkX2PHaveQizi(curPosX, curPosY, newPosY) <= 0 && this.checkP2PHaveQizi(curPosX, newPosY) <= 0)//走两格且不越子且目标棋盘无棋子
								return true;
						} else {//非第一步只能走一格
							if (curPosY - newPosY == 1 && this.checkP2PHaveQizi(newPosX, newPosY) <= 0)
								return true;
						}
					} else if (Math.abs(newPosX - curPosX) == 1 && curPosY - newPosY == 1) {//斜走一格，吃子
						if (this.checkP2PHaveQizi(newPosX, newPosY) > 0)
							return true;
					}
				}
				else {//红兵走棋
					if (newPosY < curPosY)
						return false;
					if (newPosX == curPosX) { //直走
						if (curPosY == 1) {//第一步
							if (newPosY - curPosY == 1 && this.checkP2PHaveQizi(newPosX, newPosY) <= 0)//走一格且目标棋盘无棋子
								return true;
							else if (newPosY - curPosY == 2 && this.checkX2PHaveQizi(curPosX, curPosY, newPosY) <= 0 && this.checkP2PHaveQizi(curPosX, newPosY) <= 0)//走两格且不越子且目标棋盘无棋子
								return true;
						} else {//非第一步只能走一格
							if (newPosY - curPosY == 1 && this.checkP2PHaveQizi(newPosX, newPosY) <= 0)
								return true;
						}
					} else if (Math.abs(newPosX - curPosX) == 1 && newPosY - curPosY == 1) {//斜走一格，吃子
						if (this.checkP2PHaveQizi(newPosX, newPosY) > 0)
							return true;
					}
				}
			}
			break;
		}
		return false;
	},
	checkX2PHaveQizi: function (posX, posY1, posY2) {//判断同一条X轴上的两个点之间是否有棋子，有则返回有的个数，无则返回0
		var c = 0;

		this.forGameData(function(grid){
			//没有被吃的 ，当前玩家的 
			if(grid[0] == posX && ((grid[1] > posY1 && grid[1] < posY2) || (grid[1] > posY2 && grid[1] < posY1)) && fire.gameData[grid[0]][grid[1]]['chess']){
				c++;
			}
		});
		return c;
	},
	checkY2PHaveQizi: function (posY, posX1, posX2) {//判断同一条Y轴上的两个点之间是否有棋子
		var c = 0;
		this.forGameData(function(grid){
			//没有被吃的 ，当前玩家的 
			if(grid[1] == posY && ((grid[0] > posX1 && grid[0] < posX2) || (grid[0] > posX2 && grid[0] < posX1)) && fire.gameData[grid[0]][grid[1]]['chess']){
				c++;
			}
		});
		//cc.log('y2P:'+c);
		return c;
	},
	checkXY2PHaveQizi: function (posX1, posY1, posX2, posY2) {//判断同一条斜线上的两个点之间是否有棋子
		var c = 0;
		this.forGameData(function(grid){
			//没有被吃的 ，当前玩家的 
			if((Math.abs(grid[0] - posX1) == Math.abs(grid[1] - posY1) && Math.abs(grid[0] - posX2) == Math.abs(grid[1] - posY2)) && ((grid[0] > posX1 && grid[0] < posX2) || (grid[0] > posX2 && grid[0] < posX1)) && fire.gameData[grid[0]][grid[1]]['chess']){
				c++;
			}
		});
		return c;
	},
	checkP2PHaveQizi: function (posX, posY) {//判断某个位置是否有棋子，有则返回有的个数，无则返回0
		var c = 0;
		if(fire.gameData[posX][posY]['chess'])c++;
		return c;
	},
});





var fire_replayScene = cc.Scene.extend({
	onEnter:function () {
		this._super();


		//初始化游戏配置
		fire = {};
		fire.gameConfig={

				qipanGridX:8,
				qipanGridY:8,
				qipanBorderX:15,
				qipanBorderY:20,
				gameTime:300,//秒
				color:['g','y'],
				reverse:false,
				roundKey:null,
				skin1:{
					qipan:res.fire_qipan1,
					chess_plist:res.fire_chess1_plist,
					chess_png:res.fire_chess1_png
				},
				skin2:{
					qipan:res.fire_qipan2,
					chess_plist:res.fire_chess2_plist,
					chess_png:res.fire_chess2_png
				},
				skin3:{
					qipan:res.fire_qipan3,
					chess_plist:res.fire_chess3_plist,
					chess_png:res.fire_chess3_png
				},
		};

		fire.gameData = [];

		fire.userData = {
				a:{
					color:'y',
					score:0,
					headImg:res.fire_playerA,
					isAI:false,
				},
				b:{
					color:'g',
					score:0,
					headImg:res.fire_playerB,
					isAI:false,
				},			
		};

		fire.runtime = {
				chessSel:false,	//当前选中棋子的位置
				dice:-1,			//骰子当前点数
				playerNow:'',//当前玩家
				chessable:null,
				status:0,
				timer:null,
				timeLeft:0,
				log:[],
				skin:1,
				chess_tag_num:3,	//用于兵变新增棋子的tag后缀


		};

		
		fire.userData.b.isAI = true;
		fire.userData.a.isAI = true;

		//this.addChild(mainLayer,0);
		this.addChild(new fire_replayLayer(),0,'gl');
		//this.addChild(new fire_menuLayer(),0,'ml');
		
		this.addChild(new fire_replayInputLayer(),0,'input');
		this.addChild(new fire_showLayer(),0,'sl');
		
		this.getChildByName('sl').MainNode.getChildByName('fire_score_board').setVisible(false);
	},
	onExit:function(){
		this._super();
		//解决点返回退出时 计时器没有被clear
		if(fire.runtime.timer)clearInterval(fire.runtime.timer);

		//移除精灵表  解决换皮肤后第二次进入场景棋子混乱问题
		cc.spriteFrameCache.removeSpriteFramesFromFile(fire.gameConfig['skin'+fire.runtime.skin].chess_plist);
	}
});







