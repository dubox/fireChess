//以9：16缩放主节点
var displayMode = 'height';
/*
if(cc.winSize.width / cc.winSize.height < 9/16){
	var displayMode = 'width';
}else{
	var displayMode = 'height';
}
*/

var version = '1.7.0';
var version_ser = getLocalJson('version');	//服务端版本(从服务端获取并存在本地的版本信息)
var version_path = 'http://113.140.65.67:8081/firechess/';










//公共函数

//取随机整数
function random(start,end){
	return parseInt(Math.random()*(end-start)+start);
}


//随机在数组中取一个元素
function arrRandom(arr){
	return arr[random(0,arr.length-1)];
}

//
/*****
 * 通过文件名获取json对象 如果文件不存在则创建 
 * 原生传入 文件名，web传入kay
 */

function getLocalJson(f){
	if(cc.sys.isNative) {
		var writablePath = jsb.fileUtils.getWritablePath();
		var JsonPath = writablePath+f+'.json';
		if(!jsb.fileUtils.isFileExist(JsonPath)){
			var json = {};
			jsb.fileUtils.writeToFile(json, JsonPath);
			
		}else{
			var json = jsb.fileUtils.getValueMapFromFile(JsonPath);
		}
		
		return json;
	}
	
	return false;
}

/*****
 * 存入json对象 如果文件不存在则创建 
 * 原生传入 文件名，web传入kay
 */

function setLocalJson(f,json){
	if(cc.sys.isNative) {
		var writablePath = jsb.fileUtils.getWritablePath();
		var JsonPath = writablePath+f+'.json';
		
		jsb.fileUtils.writeToFile(json, JsonPath);

	}

	//return false;
}


function HttpGet(url,cb){
	
	var xhr = cc.loader.getXMLHttpRequest();  
	
	//set arguments with <URL>?xxx=xxx&yyy=yyy  
	xhr.open("GET", url, true);  

	xhr.onreadystatechange = function () {  
		if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {  

			cb(xhr.responseText);
		}  
	};  
	xhr.send();
}


var trace = function(s) {
	var ss = '';
	if(typeof s == 'object' || typeof s == 'array'){
		
		
		function d(_s,tag){
			if(!tag)tag = '';
			//if(!ss)ss = '';
			for(var i in _s){
				if(typeof _s[i] == 'object' || typeof _s[i] == 'array'){
					ss += tag+(i+' : \n\r');
					d(_s[i],'-'+tag);
				}else{
					if(typeof _s[i] == 'undefined') _s[i] = 'undefined';
					ss += tag+(i+' : '+_s[i].toString()+'\n\r');
				}
			}
			//return ss;
		}
		d(s);
		
		ss = '\n\r'+ss;
		//cc.log(ss);
	}else{
		ss = s.toString();
		
	}
	cc.log(ss);
	
};

/***
 * 获取原生剪贴板内容
 * 
 */
function getClip(){
	if(cc.sys.isNative && cc.sys.os == 'iOS'){
		return jsb.reflection.callStaticMethod('NativeForJs', 'getClip');
	}else{
		return jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getClip", "()Ljava/lang/String;");
	}
	
}


