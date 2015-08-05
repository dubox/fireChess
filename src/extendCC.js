/******
 * 
 * 对cocos 对象进行扩展
 * 所有扩展方法加 EXT_ 前缀
 * 
 */



/****
 * 获取节点的实际看见性 包括所有父级
 * @returns {Boolean}
 */

cc.Node.prototype.EXT_getVisible = function(){
	
	//cc.log(this);
	var NodeArr = [this]; var i = 0;
	while(NodeArr.length > i){
		
		if(NodeArr[i].getParent())	
		NodeArr.push(NodeArr[i].getParent());

		if(!NodeArr[i].isVisible()){
			return false;
		}

		i++;
	}
	return true;
};

/****
 * 返回节点p是否在节点中
 * p 为该节点的相对坐标 
 * @returns {Boolean}
 */

cc.Node.prototype.EXT_PinNode = function(p){

	return cc.rectContainsPoint(cc.rect(0, 0, this.getContentSize().width, this.getContentSize().height), p);
	
};

/****
 * 为节点绑定事件
 * @returns {Boolean}
 */

cc.Node.prototype.EXT_EventListener = function( opt ){

	var that = this;

	return cc.EventListener.create({
		event: cc.EventListener[opt.event],
		swallowTouches: true,
		onTouchBegan: function (touch, event) {
			var target = event.getCurrentTarget();
			var p = target.convertToNodeSpace(touch.getLocation());//cc.log(p);
			//cc.log(target.visible)
			if(target.EXT_getVisible())	//可见且为当前  
				opt.onTouchBegan(cc.rectContainsPoint(cc.rect(0, 0, target.width, target.height), p));
			
			return true;
		},
	});
};