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