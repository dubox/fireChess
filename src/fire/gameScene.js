

var fire_gameLayer = cc.Layer.extend({
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
		
		//棋盘点击
		this.qipanOnTouch();
		setTimeout(function(){
			that.newGame();		//放到setTimeout 里解决 初始化调用  this.getParent() undefined 的问题
		},0);
		

		//return true;
	},
	newGame:function(){
		var that = this;
		
		fire.runtime.status = 'newGame';
		fire.runtime.playerNow = '';
		
		//删除棋盘精灵
		if(typeof this.qipan != 'undefined'){
			this.qipan.getParent().removeFromParent(true);
		}
		
		//还原骰子
		this.getParent().getChildByName('sl').shakeDice('clear');
		
		//检查是否交换棋子
		if(fire.gameConfig.reverse){
			//交换
			
			
		}
		
		this.initQipan();
		this.initQizi(fire.gameConfig.color);
		
		this.qipanOnTouch();//棋盘点击事件监听
		
		
		this.score('clear');//清除得分
		//
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
		cc.log('newGame');
		this.roundStart();
		
		
	},
	
	//回合开始
	roundStart:function(){
		
		if(fire.runtime.status == 'gameOver'){
			return false;
		}
		
		fire.runtime.status='roundStart';
		fire.runtime.playerNow = fire.runtime.playerNow=='a'?'b':'a';
		
		fire.runtime.chessSel=false;	//当前选中棋子的位置
		//还原骰子
		this.getParent().getChildByName('sl').shakeDice('clear');
		fire.runtime.dice=-1;		//骰子当前点数
		fire.runtime.chessable=null;	//
		
		//提醒玩家走棋
		this.getParent().getChildByName('sl').show_p_runAction(fire.runtime.playerNow);
		
		
		if(fire.userData[fire.runtime.playerNow].isAI){
			this.AI();
		}
		
		//this.shakeDice();
	},
	roundEnd:function(grid){
		
		if(fire.runtime.status != 'gameOver')fire.runtime.status='roundEnd';
		
		var that = this;
		
		//停止提醒玩家走棋动画
		this.getParent().getChildByName('sl').show_p_runAction(fire.runtime.playerNow,false);
		
		//隐藏可走（绿块）
		this.forGameData(function(grid){
			that.qipan.getChildByName(fire.gameData[grid[0]][grid[1]].enSprite).setVisible(false);
		});
		
		//隐藏选中效果
		//this.qipan.getChildByName('source').setVisible(false);
		
		//显示最后移动的棋子
		this.qipan.getChildByName('target').attr(fire.gameData[grid[0]][grid[1]].xy);
		this.qipan.getChildByName('target').setVisible(true);
		
		
		
		if(fire.runtime.status == 'gameOver')
			return false;
		
			
		this.roundStart();
			
		
		
	},
	gameOver:function(type){
		
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
		this.qipanOnTouch(false);
		
		//停止计时
		clearInterval(fire.runtime.timer);
		
		cc.log('gameOver');
		
		//禁用按钮
		this.getParent().getChildByName('ml').disAllBtns();
		
		cc.eventManager.addListener(cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: function (touch, event) {
				cc.director.runScene(new fireMenuScene());
			},
			onTouchMoved: function (touch, event) {

			},
			onTouchEnded: function (touch, event) {

			}
		}), this);
		
		//alert('gameOver');
	},
	//走棋记录
	runTimeLog:function(type,user,score,sourceGrid ,targetGrid ,sourceData ,targetData){
		//cc.log('runTimeLog-sourceData')
		//cc.log(sourceData)
		fire.runtime.log.push({
			
			'type':type,		//move or eat
			'user':user,		//
			'score':score,		//
			'sourceGrid':sourceGrid,		//原grid
			'targetGrid':targetGrid,		//目标grid
			'sourceData':sourceData,		//原棋子name
			'targetData':targetData,		//目标棋子
		});
	},
	//悔棋
	backChess:function(){
		if(fire.runtime.status == 'gameOver')return false;
		
		var lastStep = fire.runtime.log.pop();
		if(typeof lastStep != 'undefined' ){//cc.log('qq')
			
			fire.runtime.playerNow = lastStep.user;
			if(lastStep.type == 'eat'){
			
				this.moveBack( lastStep.targetGrid,lastStep.sourceGrid, lastStep.targetData);//cc.log('tt')
				this.score(-lastStep.score);
			}else if(lastStep.type == 'bingbian'){
				this.moveBack( lastStep.targetGrid,lastStep.sourceGrid, lastStep.sourceData);
				this.backChess();
			}else{
				this.moveBack( lastStep.targetGrid,lastStep.sourceGrid);
			}
			
			if(fire.userData[lastStep.user].isAI){
				this.backChess();
			}
			
			return false;
		}
		//cc.log(fire.runtime.playerNow)
		//针对 人机对战 机器先走  机器走第一步 玩家就悔棋 悔棋后 机器不能自动走棋bug
		if(fire.runtime.playerNow == 'a' && fire.userData['a'].isAI){
			fire.runtime.playerNow = 'b';
			this.roundStart();
		}
		//
	},
	
	AI:function(){
		
		var taht = this;
		
		//1.摇色子
		this.shakeDice();
		
		//2.选棋
			//先找可以吃的 没有可吃的 则取最后一个 有可走的位置的
		var gridNow = gridTar = null;
		for(var i in fire.runtime.chessable){
			var move = fire.runtime.chessable[i]['move'];
			if(move.length <= 0)continue; //没有可走位置
			
			gridNow = fire.runtime.chessable[i]['chess'];
			
			var eatAble = 0;
			for(var j in move){
				gridTar = move[j];
				if(fire.gameData[move[j][0]][move[j][1]].chess){
					eatAble = 1;
					break;//可吃则跳出
				}
			}
			if(eatAble)break;
		}
		setTimeout(function(){
			taht.selChess(gridNow);	//选棋
			
			//3.走棋
			setTimeout(function(){taht.moveChess(gridNow, gridTar);},1000);
		
		},1000);
		
		
		
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
		
		
		this.forGameData(function(data){	//表示可走棋子和可走位置的绿块
			var enable = new cc.Sprite('#enable.png');
			enable.attr(fire.gameData[data[0]][data[1]].xy);
			enable.setVisible(false);
			qipanBatchNode.addChild(enable, 0,'en'+data[0]+''+data[1]); 
			fire.gameData[data[0]][data[1]].enSprite = 'en'+data[0]+''+data[1];
		});
		
		//棋子选中效果
		var source = new cc.Sprite('#source.png');
		source.setVisible(false);
		qipanBatchNode.addChild(source, 0,'source');
		
		//最后移动棋子的效果
		var target = new cc.Sprite('#target.png');
		target.setVisible(false);
		qipanBatchNode.addChild(target, 0,'target');
		
		this.qipan.addChild(qipanBatchNode, 0);
		this.qipan = qipanBatchNode; 
	},
	//判断兵变 并弹出选择框
	bingbian:function(grid){
		var c_type = fire.gameData[grid[0]][grid[1]].type;
		var c_color = fire.gameData[grid[0]][grid[1]].color;
		if(c_type == 1 && ((grid[1]==7 &&  c_color==fire.gameConfig.color[0]) || (grid[1]==0 &&  c_color==fire.gameConfig.color[1])  )){
			
			fire.runtime.bingbian = grid;
			
			//判断是否机器人
			if(fire.userData[fire.runtime.playerNow].isAI){
				this.bingbian2('hou');//机器人直接变 皇后
			}else{
			
				this.getParent().getChildByName('sl').showAlertB();
			}
			return true;
		}else{
			return false;
		}
	},
	//执行兵变 name:che ma xiang hou
	bingbian2:function(name){
		var grid = fire.runtime.bingbian;
		var data = fire.gameData[grid[0]][grid[1]];
		var type = 0;
		var chess_num = 0;
		switch (name) {
		case 'che':
			chess_num = 1;
			type = 5;
			break;
		case 'ma':
			chess_num = 2;
			type = 3;
			break;
		case 'xiang':
			chess_num = 3;
			type = 3;
			break;
		case 'hou':
			chess_num = 4;
			type = 9;
			break;

		default:return false;
			break;
		}
		
		this.qipan.getChildByName(data.chess).setVisible(false);
		
		var datalog = JSON.stringify(data);	//被换掉的数据
		
		fire.gameData[grid[0]][grid[1]]['chess'] = this.createChess('#'+data.color+chess_num+'.png', data.xy, data.color+'_'+name+'_'+fire.runtime.chess_tag_num);
		fire.gameData[grid[0]][grid[1]]['type'] = type;
		fire.gameData[grid[0]][grid[1]]['name'] = name;
		
		//兵变log
		
		this.runTimeLog('bingbian', fire.runtime.playerNow , 0 , grid , grid , JSON.parse(datalog),fire.gameData[grid[0]][grid[1]] );

		
		fire.runtime.chess_tag_num++;
		fire.runtime.bingbian = null;
		
		this.roundEnd(grid);
		return true;
	},
	
	//皮肤
	
	skin:function(skin){
		
		//替换棋盘纹理
		this.qipan.getParent().setTexture(fire.gameConfig['skin'+skin].qipan);
		//移除精灵表
		cc.spriteFrameCache.removeSpriteFramesFromFile(fire.gameConfig['skin'+fire.runtime.skin].chess_plist);
		//添加新精灵表
		cc.spriteFrameCache.addSpriteFrames(fire.gameConfig['skin'+skin].chess_plist);
		//cc.log(this.qipan);
		//替换棋盘SpriteBatchNode的精灵表纹理
		this.qipan.setTexture(cc.textureCache.addImage(fire.gameConfig['skin'+skin].chess_png));
		
		var that = this;
		
		this.forGameData(function(grid){	
			
			if(fire.gameData[grid[0]][grid[1]].chess){
				var chess = that.qipan.getChildByName(fire.gameData[grid[0]][grid[1]].chess);
				//替换SpriteBatchNode中子节点的纹理
				chess.setSpriteFrame(chess.TexTure);
			}
			that.qipan.getChildByName('en'+grid[0]+''+grid[1]).setSpriteFrame('enable.png');
		});
		
		this.qipan.getChildByName('source').setSpriteFrame('source.png');
		this.qipan.getChildByName('target').setSpriteFrame('target.png');
		
		fire.runtime.skin = skin;
		
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
		fire.gameData[0][0]['type'] = 5;//0王 9后 3马相 5车 1兵
		fire.gameData[1][0]['chess'] = this.createChess(chessArr[gy[0]+2], fire.gameData[1][0]['xy'], gy[0]+'_ma_1');
		fire.gameData[1][0]['type'] = 3;
		fire.gameData[2][0]['chess'] = this.createChess(chessArr[gy[0]+3], fire.gameData[2][0]['xy'], gy[0]+'_xiang_1');
		fire.gameData[2][0]['type'] = 3;
		fire.gameData[3][0]['chess'] = this.createChess(chessArr[gy[0]+4], fire.gameData[3][0]['xy'], gy[0]+'_hou_1');
		fire.gameData[3][0]['type'] = 9;
		fire.gameData[4][0]['chess'] = this.createChess(chessArr[gy[0]+5], fire.gameData[4][0]['xy'], gy[0]+'_wang_1');
		fire.gameData[4][0]['type'] = 0;
		fire.gameData[5][0]['chess'] = this.createChess(chessArr[gy[0]+3], fire.gameData[5][0]['xy'], gy[0]+'_xiang_2');
		fire.gameData[5][0]['type'] = 3;
		fire.gameData[6][0]['chess'] = this.createChess(chessArr[gy[0]+2], fire.gameData[6][0]['xy'], gy[0]+'_ma_2');
		fire.gameData[6][0]['type'] = 3;
		fire.gameData[7][0]['chess'] = this.createChess(chessArr[gy[0]+1], fire.gameData[7][0]['xy'], gy[0]+'_che_2');
		fire.gameData[7][0]['type'] = 5;
		for(var i=0;i<8;i++){
			fire.gameData[i][1]['chess'] = this.createChess(chessArr[gy[0]+6], fire.gameData[i][1]['xy'], gy[0]+'_bing_'+(i+1));
			fire.gameData[i][1]['type'] = 1;
		}
		
		//
		fire.gameData[0][7]['chess'] = this.createChess(chessArr[gy[1]+1], fire.gameData[0][7]['xy'], gy[1]+'_che_1');
		fire.gameData[0][7]['type'] = 5;
		fire.gameData[1][7]['chess'] = this.createChess(chessArr[gy[1]+2], fire.gameData[1][7]['xy'], gy[1]+'_ma_1');
		fire.gameData[1][7]['type'] = 3;
		fire.gameData[2][7]['chess'] = this.createChess(chessArr[gy[1]+3], fire.gameData[2][7]['xy'], gy[1]+'_xiang_1');
		fire.gameData[2][7]['type'] = 3;
		fire.gameData[3][7]['chess'] = this.createChess(chessArr[gy[1]+4], fire.gameData[3][7]['xy'], gy[1]+'_hou_1');
		fire.gameData[3][7]['type'] = 9;
		fire.gameData[4][7]['chess'] = this.createChess(chessArr[gy[1]+5], fire.gameData[4][7]['xy'], gy[1]+'_wang_1');
		fire.gameData[4][7]['type'] = 0;
		fire.gameData[5][7]['chess'] = this.createChess(chessArr[gy[1]+3], fire.gameData[5][7]['xy'], gy[1]+'_xiang_2');
		fire.gameData[5][7]['type'] = 3;
		fire.gameData[6][7]['chess'] = this.createChess(chessArr[gy[1]+2], fire.gameData[6][7]['xy'], gy[1]+'_ma_2');
		fire.gameData[6][7]['type'] = 3;
		fire.gameData[7][7]['chess'] = this.createChess(chessArr[gy[1]+1], fire.gameData[7][7]['xy'], gy[1]+'_che_2');
		fire.gameData[7][7]['type'] = 5;
		for(var i=0;i<8;i++){
			fire.gameData[i][6]['chess'] = this.createChess(chessArr[gy[1]+6], fire.gameData[i][6]['xy'], gy[1]+'_bing_'+(i+1));
			fire.gameData[i][6]['type'] = 1;
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
	moveChess:function(gridNow,gridTar){
		
		if(fire.runtime.status == 'gameOver')return false;
		
		cc.audioEngine.playEffect(res.fire_au_move);//音效
		
		var type = 'move';
		var score = 0;
		
		
			if(fire.gameData[gridTar[0]][gridTar[1]].chess){
				type = 'eat';
					//目标位置有棋 则为 吃
				this.qipan.getChildByName(fire.gameData[gridTar[0]][gridTar[1]].chess).setVisible(false);
				
				this.score(fire.gameData[gridTar[0]][gridTar[1]].type);
				score = fire.gameData[gridTar[0]][gridTar[1]].type;
				
			}
		
		//移动棋子
		this.qipan.getChildByName(fire.gameData[gridNow[0]][gridNow[1]].chess).runAction(
				cc.spawn(
						cc.moveTo(0.3, fire.gameData[gridTar[0]][gridTar[1]]['xy'])
				)
		);
		
		//走棋和吃子log
		var tarData = JSON.stringify(fire.gameData[gridTar[0]][gridTar[1]]);
		this.runTimeLog(type, fire.runtime.playerNow,score, gridNow, gridTar, fire.gameData[gridNow[0]][gridNow[1]], JSON.parse(tarData));
		
		if(fire.gameData[gridTar[0]][gridTar[1]].type == 0){	//如果被吃的是王 则game over
			this.gameOver('wang');
		}
		
		//移动数据
		fire.gameData[gridTar[0]][gridTar[1]].chess = fire.gameData[gridNow[0]][gridNow[1]].chess;
		fire.gameData[gridTar[0]][gridTar[1]].type = fire.gameData[gridNow[0]][gridNow[1]].type;
		fire.gameData[gridTar[0]][gridTar[1]].color = fire.gameData[gridNow[0]][gridNow[1]].color;
		fire.gameData[gridTar[0]][gridTar[1]].name = fire.gameData[gridNow[0]][gridNow[1]].name;
		
		fire.gameData[gridNow[0]][gridNow[1]].chess = null;
		fire.gameData[gridNow[0]][gridNow[1]].type = -1;
		fire.gameData[gridNow[0]][gridNow[1]].color = null;
		fire.gameData[gridNow[0]][gridNow[1]].name = null;
		
		//判断兵变
		
		if(!this.bingbian(gridTar)){
			this.roundEnd(gridTar);
		}
		
			
		
	},
	
	moveBack:function(from,backTo,backData){

		
		if(from[0] == backTo[0] && from[1] == backTo[1] && backData){
			//删除兵变后的棋子
			
			this.qipan.getChildByName(fire.gameData[from[0]][from[1]].chess).removeFromParent(true);
			
		}else{
		
			//移动棋子
			this.qipan.getChildByName(fire.gameData[from[0]][from[1]].chess).runAction(
					cc.spawn(
							cc.moveTo(0.3, fire.gameData[backTo[0]][backTo[1]]['xy'])
					)
			);
			
			//移动数据
			fire.gameData[backTo[0]][backTo[1]].chess = fire.gameData[from[0]][from[1]].chess;
			fire.gameData[backTo[0]][backTo[1]].type = fire.gameData[from[0]][from[1]].type;
			fire.gameData[backTo[0]][backTo[1]].color = fire.gameData[from[0]][from[1]].color;
			fire.gameData[backTo[0]][backTo[1]].name = fire.gameData[from[0]][from[1]].name;
	
			fire.gameData[from[0]][from[1]].chess = null;
			fire.gameData[from[0]][from[1]].type = -1;
			fire.gameData[from[0]][from[1]].color = null;
			fire.gameData[from[0]][from[1]].name = null;
		}
		if(backData){
			//复活被吃掉的棋子 或 恢复兵变前的棋子
			this.qipan.getChildByName(backData.chess).setVisible(true);
			fire.gameData[from[0]][from[1]] = backData;
		}

		
	},
	
	//格子转坐标 return cc.p
	grid2p:function(grid){
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
		this.eventM = cc.eventManager;
		this.event_qipanTouch = this.eventM.addListener(cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: true,
			onTouchBegan: function (touch, event) {
				var p = that.qipan.convertToNodeSpace(touch.getLocation());//cc.log(p);
				
				that.qipanTouchCallback(that.p2grid(p));
			},
			onTouchMoved: function (touch, event) {

			},
			onTouchEnded: function (touch, event) {

			}
		}), this);
		//this.event_qipanTouch.retain();
		
	},
	showAlertX : function(text,cb1,cb2){
		this.getParent().getChildByName('sl').showAlertX(text,cb1,cb2);
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
		
		cc.audioEngine.playEffect(res.fire_au_dice);//音效
		
		
		if(fire.runtime.status != 'roundStart' || fire.runtime.status == 'gameOver')return false;
		
		var chessType = -1;
		var chessTypes = [0, 1, 3, 5, 9];
		
		var chessable = false;
		while(!chessable){
			var numRandom = Math.floor(Math.random() * chessTypes.length + 1) - 1;
			chessType = chessTypes[numRandom];
			chessTypes.splice(numRandom,1);
			chessable = this.getChessAble(chessType);
		}
		
		fire.runtime.status='diced';
		
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
		//隐藏可走棋子
		this.forGameData(function(grid){
			that.qipan.getChildByName(fire.gameData[grid[0]][grid[1]].enSprite).setVisible(false);
		});
		
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
			//没有被吃的 ，当前玩家的 ，摇到的类型
			if(fire.gameData[grid[0]][grid[1]]['type'] > -1 && fire.gameData[grid[0]][grid[1]]['type'] == chessType && fire.gameData[grid[0]][grid[1]]['color']== fire.userData[fire.runtime.playerNow]['color']&& !fire.gameData[grid[0]][grid[1]]['eated']){
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





var fire = {};	
var fire_gameScene = cc.Scene.extend({
	onEnter:function () {
		this._super();
		
		//初始化游戏配置
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
		
		if(fire_gameType_rj){
			fire.userData.b.headImg = res.fire_playerAI;
			fire.userData.b.isAI = true;
		}
		
		
		//this.addChild(mainLayer,0);
		this.addChild(new fire_gameLayer(),0,'gl');
		this.addChild(new fire_menuLayer(),0,'ml');
		this.addChild(new fire_showLayer(),0,'sl');
		
	},
	onExit:function(){
		//解决点返回退出时 计时器没有被clear
		if(fire.runtime.timer)clearInterval(fire.runtime.timer);
	}
});






