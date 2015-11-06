/****************************************************************************
Copyright (c) 2008-2010 Ricardo Quesada
Copyright (c) 2010-2012 cocos2d-x.org
Copyright (c) 2011      Zynga Inc.
Copyright (c) 2013-2014 Chukong Technologies Inc.
 
http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package org.cocos2dx.javascript;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import android.content.pm.ActivityInfo;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.view.WindowManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import android.widget.Toast;
import java.util.Timer;
import android.view.KeyEvent;
import android.content.ClipboardManager;


import com.umeng.analytics.MobclickAgent;
import com.umeng.analytics.social.UMPlatformData;
import com.umeng.analytics.social.UMPlatformData.GENDER;
import com.umeng.analytics.social.UMPlatformData.UMedia;

import com.umeng.message.PushAgent;

//import com.google.zxing.*;
import org.Zxing.QR.CaptureActivity;
import org.cocos2dx.fireChess.R;

// The name of .so is specified in AndroidMenifest.xml. NativityActivity will load it automatically for you.
// You can use "System.loadLibrary()" to load other .so files.

public class AppActivity extends Cocos2dxActivity{

	private static AppActivity api = null;
	private static int backKey = 0;
	private long exitTime = 0;
    static String hostIPAdress = "0.0.0.0";
	
	private static Context mContext;
	private final  String mPageName = "main";
	
	private static String QRstr = "";	//二维码扫描结果
	private static int QRstatus = 0;	//二维码状态 2: 表示有新结果
	
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // TODO Auto-generated method stub
        super.onCreate(savedInstanceState);
        
        if(nativeIsLandScape()) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
        } else {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
        }
        if(nativeIsDebug()){
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON, WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }
        hostIPAdress = getHostIpAddress();
		
		api = this;
		
		//友盟sdk
		mContext = this;
		//MobclickAgent.setDebugMode(true);
//      SDK在统计Fragment时，需要关闭Activity自带的页面统计，
//		然后在每个页面中重新集成页面统计的代码(包括调用了 onResume 和 onPause 的Activity)。
		MobclickAgent.openActivityDurationTrack(true);
		MobclickAgent.setAutoLocation(true);
		MobclickAgent.setSessionContinueMillis(1000);
		MobclickAgent.updateOnlineConfig(this);
		
		//友盟推送
		PushAgent mPushAgent = PushAgent.getInstance(this);
		mPushAgent.enable();
		PushAgent.getInstance(this).onAppStart();
		
		getClip();	//需要在这里调用一次剪贴板 否则js直接调会闪退（bug原因尚不清楚）
    }
    
    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        // TestCpp should create stencil buffer
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

        return glSurfaceView;
    }

    public String getHostIpAddress() {
        WifiManager wifiMgr = (WifiManager) getSystemService(WIFI_SERVICE);
        WifiInfo wifiInfo = wifiMgr.getConnectionInfo();
        int ip = wifiInfo.getIpAddress();
        return ((ip & 0xFF) + "." + ((ip >>>= 8) & 0xFF) + "." + ((ip >>>= 8) & 0xFF) + "." + ((ip >>>= 8) & 0xFF));
    }
    
    public static String getLocalIpAddress() {
        return hostIPAdress;
    }
	
	//test js to java
	public static String hello(String msg){
        return msg;
    }
	
	/*********
	监听后退按钮
	实现 再按一次退出程序
	**************/	
	@Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (event.getKeyCode() == KeyEvent.KEYCODE_BACK
                && event.getAction() == KeyEvent.ACTION_DOWN
                && event.getRepeatCount() == 0) {
            if((System.currentTimeMillis()-exitTime)>2000){
            	exitTime = System.currentTimeMillis();
            	Toast.makeText(api, "再按一次退出程序", Toast.LENGTH_SHORT).show();
            }else{
            	//android.os.Process.killProcess(android.os.Process.myPid());	//杀死进程 无法收到推送
				//api.finish();		//无法完全退出
				System.exit(0);
				
            }
        }
        return super.dispatchKeyEvent(event);
    }
	
	/*********
	调用手机默认浏览器打开链接
	
	**************/	
	public static void openUrll(final String url) {
        // TODO Auto-generated method stub
		//ui相关的操作需要在ui线程中运行
		api.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Uri uri = Uri.parse(url);  
				 Intent it = new Intent(Intent.ACTION_VIEW, uri);  
				 api.startActivity(it);
			}
        });
		
         
    }
	
	//友盟sdk
	@Override
	public void onResume() {
		super.onResume();
		MobclickAgent.onPageStart( mPageName );
		MobclickAgent.onResume(mContext);
	}
	
	@Override
	public void onPause() {
		super.onPause();
		MobclickAgent.onPageEnd( mPageName );
		MobclickAgent.onPause(mContext);
	}
	
	/*********
	友盟sdk
	自定义计数事件
	
	**************/	
	public static String um_event(String eventId){
		
        MobclickAgent.onEvent(mContext,eventId);
		
         return eventId;
		 
    }
	
	
	
	/*********
	扫描二维码
	
	**************/	
	public static void decodeQR() {
        // TODO Auto-generated method stub
		//ui相关的操作需要在ui线程中运行
		
		api.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Intent it = new Intent(api, CaptureActivity.class);
				 api.startActivityForResult(it , 1200);
			}
        });
		
         
    }
	
	
	/**
     * 所有的Activity对象的返回值都是由这个方法来接收
     * requestCode:    表示的是启动一个Activity时传过去的requestCode值
     * resultCode：表示的是启动后的Activity回传值时的resultCode值
     * data：表示的是启动后的Activity回传过来的Intent对象
     */
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data)
    {
        //super.onActivityResult(requestCode, resultCode, data);
        if(requestCode == 1200 && resultCode == 1200)	//二维码扫描扫描回传
        {
            //
        	QRstr = data.getStringExtra("result");
			QRstatus = 2;
			//回传数据到js
        	//Cocos2dxJavascriptJavaBridge.evalString("QRcallback(\""+QRstr+"\");");
        	//Cocos2dxJavascriptJavaBridge.evalString("cc.director.runScene(new shuduMenuScene())");
			
			//openUrll("http://baidu.com/"+result_value);
        }
    }
	
	
	//js端通过此函数获取二维码扫描结果
	public static String getQRstr(){
        if(QRstatus == 2){
			QRstatus = 0;
			return "2"+QRstr;
		}else{
			return "0";
		}
    }
	
	/** 
	* 获取剪贴板内容
	* 
	* @return 
	*/  
	public static String getClip()
	{  
		// 得到剪贴板管理器  
		String str = "";
		ClipboardManager cmb = (ClipboardManager)api.getSystemService(api.CLIPBOARD_SERVICE);
		if (cmb.hasPrimaryClip()){  
			str = cmb.getPrimaryClip().getItemAt(0).getText().toString().trim();
		}
		//Log.i("getClip",str);
		return str;
	}
    
    private static native boolean nativeIsLandScape();
    private static native boolean nativeIsDebug();
    
}
