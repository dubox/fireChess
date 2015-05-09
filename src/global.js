//以9：16缩放主节点
var displayMode = 'height';
/*
if(cc.winSize.width / cc.winSize.height < 9/16){
	var displayMode = 'width';
}else{
	var displayMode = 'height';
}
*/












//公共函数

//取随机整数
function random(start,end){
	return parseInt(Math.random()*(end-start)+start);
}


//随机在数组中取一个元素
function arrRandom(arr){
	return arr[random(0,arr.length-1)];
}

