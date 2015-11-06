/**
 * 复盘 国象棋谱解析代码
 * 
 * 
 */



var indexToLetter = {a:0,b:1,c:2,d:3,e:4,f:5,g:6,h:7};
var WorldManDefine = {};
WorldManDefine.MAN_TYPE_KING = 'KING';

WorldManDefine.MAN_TYPE_JU = 'JU';
WorldManDefine.MAN_TYPE_MA = 'MA';
WorldManDefine.MAN_TYPE_XIANG = 'XIANG';
WorldManDefine.MAN_TYPE_HOU = 'HOU';
WorldManDefine.MAN_TYPE_BING = 'BING';


		function wChessMap(movePiecesStr){
			/*
			if(gameInfo){
				this.gameInfo.destory();
			}
			gameInfo = WorldChessGameInfoBiz.Instance;
			*/
			//var recordedInfo = [];
			
			
			
			movePiecesStr = movePiecesStr.replace(/\r\n/g,' ');
			movePiecesStr = movePiecesStr.replace(/\n/g,' ');
			movePiecesStr = movePiecesStr.replace(/\]/g,' ');
			//trace(movePiecesStr)
			//var arr = movePiecesStr.split("]");trace(arr)
			//movePiecesStr = arr.pop();
			
			movePiecesStr = ' '+movePiecesStr;
			var manualArr = movePiecesStr.split(/\s\d+\./);
			manualArr.shift();
			var stepArr = [];
			for(var manual in manualArr){

				var arr = manualArr[manual].split(" ");

				//if(arr[0] == '')arr.shift();
				for(var i =0; i< arr.length;i++){
					if(!(/^([a-h1-8PKRNBQx#!=\+\?]|O\-O)+$/.test(arr[i]))){
						arr.splice(i,1);
						i--;
					}
				}
				
				if(arr.length > 0){
					if(arr[0]){
						stepArr.push({color:0, step:arr[0]});
						
					}
				}
				if(arr.length > 1){
					if(arr[1]){
						stepArr.push({color:1, step:arr[1]});
						
					}
				}
				
			}
			//stepArr.shift();
			this.stepArr = stepArr;
			this.stepParamsArr = [];
			
			
			
			
			//this.resolveStep(1);
			//return recordedInfo;
		}
		
		
		/**
		 * 解析一步走棋
		 */
		wChessMap.prototype.resolveStep = function( stepIndex){
			
			if(typeof this.stepParamsArr[stepIndex] != 'undefined'){
				return this.stepParamsArr[stepIndex];
			}
			
			var manual = this.stepArr[stepIndex];
			if(!manual && stepIndex)return null;	//解析完毕
			if(!manual && !stepIndex)return false;	//空棋谱
			var color = manual.color;
			var stepStr=manual.step;
			var stepParams;
			stepParams = this.getMoveParams(stepStr, color);
			
			
			//trace(stepParams);
			
			if(stepParams == null){	//解析出错
				return false;
			}
			this.stepParamsArr.push(stepParams);
			
			return stepParams;
			/*
			var moveParams = stepParams.moveParams;
			var manType = stepParams.manType;
			var wcyw=(stepStr=="O-O" || stepStr=="O-O-O");
			var checkbing=getMoveCheckbing(moveParams, manType);
			var change=getMoveChange(stepStr);
			
			var step = this.gameInfo.onMove(moveParams, color, manType, wcyw, checkbing, change);
			step.manual = stepStr;
			
			if(stepStr=="O-O"){
				var move1=new WorldMoveParams();
				move1.fromCol=7;
				move1.toCol=5;
				move1.fromRow=getWcywRow(color);
				move1.toRow=getWcywRow(color);
				this.gameInfo.onMove(move1, color, WorldManDefine.MAN_TYPE_JU);
			}else if(stepStr=="O-O-O"){
				var move2=new WorldMoveParams();
				move2.fromCol=0;
				move2.toCol=3;
				move2.fromRow=getWcywRow(color);
				move2.toRow=getWcywRow(color);
				this.gameInfo.onMove(move2, color, WorldManDefine.MAN_TYPE_JU);
			}
			var movePiecesInfo = new ByteArray();
			movePiecesInfo.writeUTFBytes(getMoveParamXML(BroadcastDefine.BOARD_ROLE_BROADCAST, null, null, BroadcastDefine.STEP_TYPE_MOVE, "", stepIndex, step));
			
			var movePieces = new MovePieces();
			movePieces.Flag = stepIndex + 2;
			movePieces.MovePiecesInfo = movePiecesInfo;
			return movePieces;*/
		}
		
		/**
		 * 解析获取走棋参数
		 * manualStr：一步棋谱
		 * color： 棋子颜色
		 * return mantype:棋子类型		moveParams：走棋参数
		 */
		wChessMap.prototype.getMoveParams = function(manualStr, color){
			var manType = this.getManTypeManual(manualStr);
			var moveParams = {};
			if(manType < 0) return null;
			var toManType = this.getToManType(manualStr);
			var coord = this.getCoord(color, manType, manualStr);
			if(coord==null) return null;
			var type = '-'; moveParams.changeTo = null;
			if(manualStr == "O-O"){
				type += 'OO';
			}
			if(manualStr == "O-O-O"){
				type += 'OOO';
			}
			if(manualStr.indexOf("+") != -1){
				type += '+';
			}
			if(manualStr.indexOf("=") != -1){
				type += '=';
				var st = manualStr.split('=');
				moveParams.changeTo = this.getManType(st[1]);
			}
			if(manualStr.indexOf("x") != -1){
				type += 'x';
				if(manType == 'BING' && this.gameInfo.getMan(coord.toCol, coord.toRow) == null){
					//吃过路兵
					type += 'p';
				}
			}
			if(manualStr.indexOf("#") != -1){
				type += '#';
			}
				
			
			moveParams.fromCol=coord.fromCol;
			moveParams.toCol=coord.toCol;
			moveParams.fromRow=coord.fromRow;
			moveParams.toRow=coord.toRow;
			moveParams.toManType=toManType;
			moveParams.manType=manType;
			moveParams.type=type;
			return moveParams;
		}
		
		/**
		 * 获取棋子类型
		 * manualStr：一步棋谱
		 * return mantype:棋子类型		moveParams：走棋参数
		 */
		wChessMap.prototype.getManTypeManual = function(manualStr){
			var manType = -1;
			manType = this.getManType(manualStr.substr(0,1));
			return manType;
		}
		
		wChessMap.prototype.getManType = function(manualType){
			var manType = -1;
			if(manualType == "K" || manualType=="O"){
				manType = WorldManDefine.MAN_TYPE_KING;
			}else if(manualType == "R"){
				manType = WorldManDefine.MAN_TYPE_JU;
			}else if(manualType == "N"){
				manType = WorldManDefine.MAN_TYPE_MA;
			}else if(manualType == "B"){
				manType = WorldManDefine.MAN_TYPE_XIANG;
			}else if(manualType == "Q"){
				manType = WorldManDefine.MAN_TYPE_HOU;
			}else{
				manType = WorldManDefine.MAN_TYPE_BING;
			}
			return manType;
		}
		
		wChessMap.prototype.getToManType = function(manualStr){
			var toManType = -1;
			var index = manualStr.indexOf("x");
			if(index!=-1){
				var str = manualStr.substr(index+1,2);
				var toCol = indexToLetter[str.charAt(0)];
				var toRow = 8-parseInt(str.charAt(1));
				var manInfo = this.gameInfo.getMan(toCol,toRow);
				if(manInfo){
					toManType=manInfo.type;
				}
			}
			return toManType;
		}
		wChessMap.prototype.getMan = function(targetCol,targetRow){
			
				return m_ManGird[targetCol][targetRow];
			
			
		}
		

		wChessMap.prototype.getCoord = function(manColor, manType, manualStr){
			var coord={};
			if(manualStr == "O-O"){
				coord.fromCol=4;
				coord.toCol=6;
				coord.fromRow=this.getWcywRow(manColor);
				coord.toRow=this.getWcywRow(manColor);
			}else if(manualStr == "O-O-O"){
				coord.fromCol=4;
				coord.toCol=2;
				coord.fromRow=this.getWcywRow(manColor);
				coord.toRow=this.getWcywRow(manColor);
			}else{
				manualStr=manualStr.replace("P","");
				manualStr=manualStr.replace("K","");
				manualStr=manualStr.replace("R","");
				manualStr=manualStr.replace("N","");
				manualStr=manualStr.replace("B","");
				manualStr=manualStr.replace("Q","");
				manualStr=manualStr.replace("+","");
				manualStr=manualStr.replace("#","");
				manualStr=manualStr.replace("=","");
				manualStr=manualStr.replace("!!","");
				manualStr=manualStr.replace("!","");
				manualStr=manualStr.replace("??","");
				manualStr=manualStr.replace("?","");
				manualStr=manualStr.replace("x","");
				var col = this.getCol(manColor, manType, manualStr);
				if(col==null) return null;
				var row = this.getRow(manColor, manType, manualStr);
				if(row==null) return null;
				coord.fromCol=col.fromCol;
				coord.toCol=col.toCol;
				coord.fromRow=row.fromRow;
				coord.toRow=row.toRow;
			}
			return coord;
		}
		

		wChessMap.prototype.getWcywRow = function(manColor)
		{
			if(manColor==this.gameInfo.FirstColor){
				return 7;
			}else{
				return 0;
			}
		}

		wChessMap.prototype.getCol = function(manColor, manType, manualStr)
		{
			var fromCol=-1;
			var toCol=-1;
			if(manualStr.length==2){
				toCol=indexToLetter[manualStr.charAt(0)];
				fromCol=this.getFromCol(manColor, manType, manualStr);
			}else if(manualStr.length==3){
				toCol=indexToLetter[manualStr.charAt(1)];
				var fromRow=8-parseInt(manualStr.charAt(0));
				if( !isNaN(fromRow)){
					fromCol=this.getFromColByFromRow(manColor, manType, manualStr.substr(1,2),fromRow);
				}else{
					fromCol=indexToLetter[manualStr.charAt(0)];
				}
			}else if(manualStr.length==4){
				toCol=indexToLetter[manualStr.charAt(2)];
				fromCol=indexToLetter[manualStr.charAt(0)];
			}else{
				return null;
			}
			if(fromCol==-1 || toCol==-1) return null;
			return {fromCol:fromCol,toCol:toCol};
		}

		wChessMap.prototype.getFromCol = function(manColor, manType, manualStr)
		{
			if(manualStr.length!=2){
				return -1;
			}
			var currentMan = this.gameInfo.GetManListByColor(manColor);
			if(currentMan==null){
				return -1;
			}
			var man;
			var len=currentMan.length;
			var fromCol=-1;
			var toCol=indexToLetter[manualStr.charAt(0)];
			var toRow=8-parseInt(manualStr.charAt(1));
			for(var i=0;i<len;i++)
			{
				man=currentMan[i];
				if(man && man.type==manType){
					////trace("Col from:"+man.col+","+man.row+" to:"+toCol+","+toRow+" type:"+man.type+" color:"+man.color+" fromtype:"+manType+" fromcolor:"+manColor);
					var j;
					switch(manType)
					{
					case WorldManDefine.MAN_TYPE_BING: //dubox
						if(Math.abs(man.row-toRow)==2 && man.col==toCol && this.gameInfo.getMan(toCol,toRow) == null){
							if(manColor==this.gameInfo.FirstColor){
								if(this.gameInfo.getMan(toCol,toRow+1) == null){
									fromCol=man.col;
								}
							}else{
								if(this.gameInfo.getMan(toCol,toRow-1) == null){
									fromCol=man.col;
								}
							}
						}else if(Math.abs(man.row-toRow)==1){
							if(man.col==toCol){
								if(this.gameInfo.getMan(toCol,toRow) == null){
									fromCol=man.col;
								}
							}else if(Math.abs(man.col-toCol)==1){
								if(this.gameInfo.getMan(toCol,toRow) != null){
									fromCol=man.col;
								}else{

								}
							}
						}
						break;
					case WorldManDefine.MAN_TYPE_MA:
						if((Math.abs(man.col-toCol)==1 && Math.abs(man.row-toRow)==2) || (Math.abs(man.col-toCol)==2 && Math.abs(man.row-toRow)==1)){
							fromCol=man.col;
						}
						break;
					case WorldManDefine.MAN_TYPE_XIANG:
						if(Math.abs(man.col-toCol)==Math.abs(man.row-toRow)){
							fromCol=man.col;
						}
						break;
					case WorldManDefine.MAN_TYPE_JU:
						var hasManJu=false;
						if(man.row==toRow){
							hasManJu=true;
							for(j=Math.min(man.col,toCol)+1;j<Math.max(man.col,toCol);j++)
							{
								if(this.gameInfo.getMan(j,toRow)){
									hasManJu=false;
									break;
								}
							}
						}else if(man.col==toCol){
							hasManJu=true;
							for(j=Math.min(man.row,toRow)+1;j<Math.max(man.row,toRow);j++)
							{
								if(this.gameInfo.getMan(toCol,j)){
									hasManJu=false;
									break;
								}
							}
						}
						if(hasManJu){
							fromCol=man.col;
						}
						break;
					case WorldManDefine.MAN_TYPE_HOU:
						if(man.col==toCol || man.row==toRow || Math.abs(man.col-toCol)==Math.abs(man.row-toRow)){
							fromCol=man.col;
						}
						break;
					case WorldManDefine.MAN_TYPE_KING:
						fromCol=man.col;
						break;
					}
				}
				if(fromCol!=-1){////trace("from:"+fromCol+" type:"+manType+" color:"+manColor);
				break;
				}
			}
			return fromCol;
		}

		wChessMap.prototype.getFromColByFromRow = function(manColor, manType, manualStr, fromRow)
		{
			if(manualStr.length!=2){
				return -1;
			}
			var currentMan = this.gameInfo.GetManListByColor(manColor);
			if(currentMan==null){
				return -1;
			}
			var man;
			var len=currentMan.length;
			var fromCol=-1;
			var toCol=indexToLetter[manualStr.charAt(0)];
			var toRow=8-parseInt(manualStr.charAt(1));
			for(var i=0;i<len;i++)
			{
				man=currentMan[i];
				if(man && man.type==manType){
					//trace("Col from:"+man.col+","+man.row+" to:"+toCol+","+toRow+" type:"+man.type+" color:"+man.color+" fromtype:"+manType+" fromcolor:"+manColor);
					if(fromRow==man.row){
						var j;
					switch(manType)
					{
					case WorldManDefine.MAN_TYPE_BING:
						if(Math.abs(man.row-toRow)==2 && man.col==toCol){
							if(manColor==this.gameInfo.FirstColor){
								if(this.gameInfo.getMan(toCol,toRow+1) == null){
									fromCol=man.col;
								}
							}else{
								if(this.gameInfo.getMan(toCol,toRow-1) == null){
									fromCol=man.col;
								}
							}
						}else if(Math.abs(man.row-toRow)==1){
							if(man.col==toCol){
								if(this.gameInfo.getMan(toCol,toRow) == null){
									fromCol=man.col;
								}
							}else if(Math.abs(man.col-toCol)==1){
								if(this.gameInfo.getMan(toCol,toRow) != null){
									fromCol=man.col;
								}else{

								}
							}
						}
						break;
					case WorldManDefine.MAN_TYPE_MA:
						if((Math.abs(man.col-toCol)==1 && Math.abs(man.row-toRow)==2) || (Math.abs(man.col-toCol)==2 && Math.abs(man.row-toRow)==1)){
							fromCol=man.col;
						}
						break;
					case WorldManDefine.MAN_TYPE_XIANG:
						if(Math.abs(man.col-toCol)==Math.abs(man.row-toRow)){
							fromCol=man.col;
						}
						break;
					case WorldManDefine.MAN_TYPE_JU:
						var hasManJu=false;
						if(man.row==fromRow && man.row==toRow){
							hasManJu=true;
							for(j=Math.min(man.col,toCol)+1;j<Math.max(man.col,toCol);j++)
							{
								if(this.gameInfo.getMan(j,toRow)){
									hasManJu=false;
									break;
								}
							}
						}else if(man.row==fromRow && man.col==toCol){
							hasManJu=true;
							for(j=Math.min(man.row,toRow)+1;j<Math.max(man.row,toRow);j++)
							{
								if(this.gameInfo.getMan(toCol,j)){
									hasManJu=false;
									break;
								}
							}
						}
						if(hasManJu){
							fromCol=man.col;
						}
						break;
					case WorldManDefine.MAN_TYPE_HOU:
						if(man.col==toCol || man.row==toRow || Math.abs(man.col-toCol)==Math.abs(man.row-toRow)){
							fromCol=man.col;
						}
						break;
					case WorldManDefine.MAN_TYPE_KING:
						fromCol=man.col;
						break;
					}
					}
				}
				if(fromCol!=-1){//trace("from:"+fromCol+" type:"+manType+" color:"+manColor);
				break;
				}
			}
			
			return fromCol;
		}

		wChessMap.prototype.getRow = function(manColor, manType, manualStr)
		{
			var fromRow=-1;
			var toRow=-1;
			if(manualStr.length==2){
				toRow=8-parseInt(manualStr.charAt(1));
				fromRow=this.getFromRowByGameInfo(manColor, manType, manualStr);
			}else if(manualStr.length==3){
				toRow=8-parseInt(manualStr.charAt(2));
				var fromCol=8-parseInt(manualStr.charAt(0));
				if(!isNaN(fromCol)){
					fromRow = fromCol;
				}else{
					fromRow=this.getFromRowByGameInfo(manColor, manType, manualStr.substr(1,2),indexToLetter[manualStr.charAt(0)]);
				}
			}else if(manualStr.length==4){
				toRow=8-parseInt(manualStr.charAt(3));
				fromRow=8-parseInt(manualStr.charAt(1));
			}else{
				return null;
			}
			if(fromRow==-1 || toRow==-1) return null;
			return {fromRow:fromRow,toRow:toRow};
		}

		wChessMap.prototype.getFromRowByGameInfo = function(manColor, manType, manualStr, fromCol)
		{
			if(!fromCol)fromCol=-1;
			
			if(manualStr.length!=2){
				return -1;
			}
			var currentMan = this.gameInfo.GetManListByColor(manColor);
			if(currentMan==null){
				return -1;
			}
			var man;
			var len=currentMan.length;
			var fromRow=-1;
			var toCol=indexToLetter[manualStr.charAt(0)];
			var toRow=8-parseInt(manualStr.charAt(1));
			for(var i=0;i<len;i++)
			{
				man=currentMan[i];
				if(man && man.type==manType){
					
					if(fromCol==-1 || fromCol==man.col){
						var j;
					switch(manType)
					{
					case WorldManDefine.MAN_TYPE_BING:
						if(fromCol==-1){
							if(manColor==this.gameInfo.FirstColor){
								if(toRow!=4){
									fromRow=toRow+1;
								}else{
									if(this.gameInfo.getMan(toCol,toRow+1)){
										fromRow=toRow+1;
									}else if(this.gameInfo.getMan(toCol,toRow+2)){
										fromRow=toRow+2;
									}
								}
							}else{
								if(toRow!=3){
									fromRow=toRow-1;
								}else{
									if(this.gameInfo.getMan(toCol,toRow-1)){
										fromRow=toRow-1;
									}else if(this.gameInfo.getMan(toCol,toRow-2)){
										fromRow=toRow-2;
									}
								}
							}
						}else{
							if(manColor==this.gameInfo.FirstColor){
								fromRow=toRow+1;
							}else{
								fromRow=toRow-1;
							}
						}
						break;
					case WorldManDefine.MAN_TYPE_MA:
						if((Math.abs(man.col-toCol)==1 && Math.abs(man.row-toRow)==2) || (Math.abs(man.col-toCol)==2 && Math.abs(man.row-toRow)==1)){
							fromRow=man.row;
						}
						break;
					case WorldManDefine.MAN_TYPE_XIANG:
						if(Math.abs(man.col-toCol)==Math.abs(man.row-toRow)){
							fromRow=man.row;
						}
						break;
					case WorldManDefine.MAN_TYPE_JU: 
						
						if(fromCol==-1){
							var hasManJu=false;
							if(man.row==toRow){
								hasManJu=true;
								for(j=Math.min(man.col,toCol)+1;j<Math.max(man.col,toCol);j++)
								{
									if(this.gameInfo.getMan(j,toRow)){
										hasManJu=false;
										break;
									}
								}
							}else if(man.col==toCol){
								hasManJu=true;
								for(j=Math.min(man.row,toRow)+1;j<Math.max(man.row,toRow);j++)
								{
									if(this.gameInfo.getMan(toCol,j)){
										hasManJu=false;
										break;
									}
								}
							}
							
							if(hasManJu){
								fromRow=man.row;
							}
						}else{
							if(man.col==fromCol && man.row==toRow){
								fromRow=man.row;
							}
						}
						break;
					case WorldManDefine.MAN_TYPE_HOU:
						if(man.col==toCol || man.row==toRow || Math.abs(man.col-toCol)==Math.abs(man.row-toRow)){
							fromRow=man.row;
						}
						break;
					case WorldManDefine.MAN_TYPE_KING:
						fromRow=man.row;
						break;
					}
					}
				}
				if(fromRow!=-1){////trace("from:"+fromRow+" type:"+manType+" color:"+manColor);
				break;
				}
			}
			return fromRow;
		}
		
		//var ccmap = new wChessMap('1.c4 c5 2.Nf3 Nf6 3.Nc3 d5 4.cxd5 Nxd5 5.d4 Nxc3 6.bxc3 g6 7.e3 Bg7 8.Bd3 O-O 9.O-O Qc7 10.Rb1 b6 11.Qe2 Rd8 12.Be4 Ba6 13.c4 Nc6 14.d5 f5 15.Bd3 e5 16.e4 Nd4 17.Nxd4 cxd4 18.Bg5 Rf8 19.Rfc1 Rac8 20.Bd2 Rf7 21.a4 fxe4 22.Qxe4 Rcf8 23.f3 Bc8 24.a5 Bf5 25.Qe2 Re8 26.Be4 Bf8 27.Qd3 Bc5 28.Ra1 Qd7 29.Re1 Qc8 30.Kh1 Rc7 31.Rab1 Kg7 32.Rec1 Bxe4 33.fxe4 Rf7 34.Qg3 bxa5 35.Bxa5 Rf4 36.Re1 Qa6 37.Bd2 Rf7 38.Qd3 Ref8 39.h3 Rf2 40.Ra1 Qf6 41.Rg1 h5 42.Ra5 Qe7 43.Rb1 h4 44.Ra6 R8f7 45.Rc6 Qf8 46.Rg1 Be7 47.Re6 Kh7 48.Be1 Rf1 49.Bd2 Bc5 50.Rc6 R7f3 51.gxf3 Rxf3 52.Rc7+ Kh8 53.Bh6 Rxd3 54.Bxf8 Rxh3+ 55.Kg2 Rg3+ 56.Kh2 Rxg1 57.Bxc5 d3  1-0');
		
		
		
		
		
		//resolveMovePieces('1.h2h4 h7h5 2.g2g4 Ng8h6 3.Ng1f3 g7g6 4.Bf1h3 Bf8g7 5.e2e4 e7e6 6.e4e5 d7d5 7.e5xd6 c7xd6 8.d2d4 e6e5 9.d4xe5 d6xe5 10.Qd1xd8+ Ke8xd8 11.O-O Nh6xg4 12.Bh3xg4 Bc8xg4 13.Nf3xe5 Bg7xe5 14.Bc1g5+ Kd8c8 15.c2c4 Nb8c6 16.a2a4 Ra8b8 17.Nb1c3 Be5xc3 18.b2xc3 Nc6e5 19.c4c5 b7b5 20.a4xb5 Rb8xb5 21.Ra1xa7 Kc8b8 22.Ra7e7 Rb5xc5 23.Bg5f4 f7f6 24.Rf1e1 Kb8c8 25.Bf4xe5 f6xe5 26.Re7xe5 Rc5xe5 27.Re1xe5 Bg4f3 28.Re5f5 Bf3g4 29.Rf5a5 Bg4f3 30.c3c4 Rh8f8 31.c4c5 Rf8f4 32.Kg1h2 Rf4xh4+ 33.Kh2g3 Rh4g4+ 34.Kg3xf3 Rg4c4 35.Kf3e3 Kc8c7 36.Ke3d3 Rc4f4 37.Kd3e3 Rf4c4 38.f2f3 Kc7c6 39.Ke3d3 Rc4xc5 40.Ra5xc5+ Kc6xc5 41.f3f4 h5h4 42.Kd3e4 h4h3 43.Ke4e5 h3h2 44.Ke5f6 h2h1=Q 45.Kf6xg6 Qh1f1 46.f4f5 Qf1g1+ 47.Kg6f7 Qg1b1 48.f5f6 Qb1b3+ 49.Kf7f8 Qb3b8+ 50.Kf8g7 Kc5d6 51.f6f7 Kd6e7 52.Kg7g6 Qb8f8 53.Kg6h5 Qf8xf7+ 54.Kh5g4 Qf7g7+ 55.Kg4f4 Ke7e6 56.Kf4e4 Qg7g4+ 57.Ke4e3 Ke6e5 58.Ke3d3 Ke5d5 59.Kd3e3 Qg4e4+ 60.Ke3f2 Qe4f4+ 61.Kf2g2 Kd5e4 62.Kg2h3 Ke4e3 63.Kh3g2 Qf4f3+ 64.Kg2h2 Ke3e2 65.Kh2g1 Qf3f2+ 66.Kg1h1 Qf2f3+ 67.Kh1h2 Qf3c3 68.Kh2g2 Qc3f3+ 69.Kg2h2 Qf3g4 70.Kh2h1 Ke2f2 71.Kh1h2 Qg4g2+');
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		