//
//  NativeForJs.m
//  firechess
//
//  Created by MacDev1 on 15-4-16.
//  Copyright (c) 2015年 bian. All rights reserved.
//

#import "NativeForJs.h"
#import <UIKit/UIKit.h>
#import "MobClick.h"    //友盟sdk
#import "SYQRCodeViewController.h"  //
#import "AppController.h"


// static int QRstatus = 0;
//static NSString *QRstr;
static int QRstatus = 0;
static NSString *QRstr = [[NSString alloc] initWithFormat:@""]; //要定义成不自动释放的类型（包括后续的赋值都要 alloc）  否则当getQRstr访问QRstr时 QRstr 已经释放就会报错

@implementation NativeForJs

+(NSString *)teststr{
    
    return @"abc";
    
}


+(BOOL)openUrll:(NSString *)url
{
    //window = [[UIWindow alloc] initWithFrame: [[UIScreen mainScreen] bounds]];
    //window = [[[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]] autorelease];
    //viewController = [[[ViewController alloc] initWithNibName:@"ViewController" bundle:nil] autorelease];
    //window.rootViewController = viewController;
    //[window makeKeyAndVisible];
    
    //调用safar打开网页
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:url]];
    ////调用app store (省略号后面加的是产品的id等一些参数)
    //    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"itms://itunes.apple.com/app/……"]];
    //    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"itms-apps://itunes.apple.com/app/ "]];
    ////调用电话
    //    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"tel://XXXXX"]];
    ////调用SMS
    //    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"sms://XXXXX"]];
    ////调用Remote
    //    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"remote://XXX"]];
    
    return YES;
}


//友盟计数事件
+(BOOL)um_event:(NSString *)eventId{
    
    [MobClick event:eventId];   //调用友盟sdk
    
    return YES;
    
}


//二维码扫描
+(BOOL)QRscan{
    //NSString *qrString2 = @"yyyyyyyy";
    
    //[self setQRstr:[NSString stringWithFormat:@"2%@",qrString2]];
    //QRstr = [[NSString alloc] initWithFormat:@"2%@",qrString2];
    //QRstatus = 2;
    //NSLog(@"eeeeeeee%@",QRstr);
    //return YES;
    
    //扫描二维码 vc
    SYQRCodeViewController *qrcodevc = [[SYQRCodeViewController alloc] init];
    
    qrcodevc.SYQRCodeSuncessBlock = ^(SYQRCodeViewController *aqrvc,NSString *qrString){
        //self.saomiaoLabel.text = qrString;
        //NSLog(@"%@",qrString);
        
        QRstr = [[NSString alloc] initWithFormat:@"2%@",qrString];
        QRstatus = 2;
        NSLog(@"eeeeeeee%@",QRstr);
        
        [aqrvc dismissViewControllerAnimated:NO completion:nil];
    };
    qrcodevc.SYQRCodeFailBlock = ^(SYQRCodeViewController *aqrvc){
        //self.saomiaoLabel.text = @"fail~";
        [aqrvc dismissViewControllerAnimated:NO completion:nil];
    };
    qrcodevc.SYQRCodeCancleBlock = ^(SYQRCodeViewController *aqrvc){
        [aqrvc dismissViewControllerAnimated:NO completion:nil];
        //self.saomiaoLabel.text = @"cancle~";
    };
    
    //用当前VC 调用 presentViewController 以切换到摄像头界面（qrcodevc）
    [[self getCurrentVC] presentViewController:qrcodevc animated:YES completion:nil];
    
    return YES;
    
}


/******
 *获取二维码扫描结果
 *
 **/
+(NSString *)getQRstr{

    if(QRstatus == 2){
        QRstatus = 0;
        //return (@"2%@" , [[NSString alloc] initWithString:QRstr]);
        //QRstr = @"2rrrr";//[NSString stringWithFormat:@"2%@",QRstr];
        //NSLog(@"ffffff%@",QRstr);
        return QRstr;
        
    }else{
        return @"0";
    }


}


/******
 *获取剪贴板内容
 *
 **/
+(NSString *)getClip{
    
    
    return [[UIPasteboard generalPasteboard] string];
    
}





//获取当前屏幕显示的viewcontroller
+(UIViewController *) getCurrentVC {
    UIViewController *result = nil;
    
    UIWindow * window = [[UIApplication sharedApplication] keyWindow];
    if (window.windowLevel != UIWindowLevelNormal)
    {
        NSArray *windows = [[UIApplication sharedApplication] windows];
        for(UIWindow * tmpWin in windows)
        {
            if (tmpWin.windowLevel == UIWindowLevelNormal)
            {
                window = tmpWin;
                break;
            }
        }
    }
    
    UIView *frontView = [[window subviews] objectAtIndex:0];
    id nextResponder = [frontView nextResponder];
    
    if ([nextResponder isKindOfClass:[UIViewController class]])
        result = nextResponder;
    else
        result = window.rootViewController;
    
    return result;
}


@end
