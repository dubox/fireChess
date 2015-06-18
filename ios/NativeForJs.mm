//
//  NativeForJs.m
//  firechess
//
//  Created by MacDev1 on 15-4-16.
//  Copyright (c) 2015年 bian. All rights reserved.
//

#import "NativeForJs.h"

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
@end
