/**
 * creator: yisha
 */
import {BasePlatform} from "./BasePlatform";


const {ccclass, property} = cc._decorator;

import game = cc.game;

@ccclass
export class WXPlatform extends BasePlatform{

    private _videoAd:any;//激励视频广告
    private _bannerAd:any;//banner广告
    public bannerHeight = 80;
    public bannerWidth = 300;
    public static seeVideoCall:Function = null;//看视频回调
    private static GameClubButton:any;
    init() {

    }

    login() {

    }


    /**
     * 登录操作
     * @param cb
     */
    onLoginHandler(cb:Function) {

    }

    /**
     * 展示激励广告
     */

    public addRewardedVideoAd(callBack:Function) {
        let self = this;
        if (WXPlatform.seeVideoCall) {
            WXPlatform.seeVideoCall = null;
        }
        if (this._videoAd) {
            this._videoAd.offClose();
            this._videoAd = null;
        };
        WXPlatform.seeVideoCall = callBack;
        let videoAd = window["wx"].createRewardedVideoAd({
            adUnitId: 'adunit-8f9fe3643dbbd8f1'
        });
        videoAd.load()
            .then(() => {
                self._videoAd = videoAd;
                videoAd.show();
            }).catch(err => console.log(err.errMsg)
        );
        videoAd.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                if (WXPlatform.seeVideoCall) {
                    WXPlatform.seeVideoCall(true);
                }
            } else {
                // 播放中途退出，不下发游戏奖励
                if (WXPlatform.seeVideoCall) {
                    WXPlatform.seeVideoCall(false);
                }
            }
        });
        // this._videoAd = videoAd;
    }

    /**
     * 重写banner广告展示
     * @param style {
     * left banner 广告组件的左上角横坐标
     * top banner 广告组件的左上角纵坐标
     * width banner 广告组件的宽度
     * height banner 广告组件的高度
     *
     * }
     */
    public addBannerAd(style) {
        if (!window["wx"]) return;
        let winSize = window["wx"].getSystemInfoSync();
        if (this._bannerAd) {
            if (style) {
                this._bannerAd.width = style.width;
                this._bannerAd.top = style.top;
                this._bannerAd.left = style.left;
                this._bannerAd.height = style.height;
            }
            this._bannerAd.show();
            return;
        }
        if (!style) {
            let bannerAd = window["wx"].createBannerAd({
                adUnitId: 'adunit-cff48f30994a401e',
                style: {
                    left: 0,
                    top: winSize.windowHeight - 130,
                    width: winSize.windowWidth > 300 ? winSize.windowWidth : 300,
                }
            });
            this._bannerAd = bannerAd;
            bannerAd.show();
        }else {
            let bannerAd = window["wx"].createBannerAd({
                adUnitId: 'adunit-cff48f30994a401e',
                style:style
            });
            bannerAd.show();
            this._bannerAd = bannerAd;
        }


        // this._bannerAd.onresize(res=>{
        //     // console.log(res.width, res.height);
        //     // console.log(this._bannerAd.style.realWidth, this._bannerAd.style.realHeight)
        // })
    }

    /**
     * 隐藏当前的banner广告
     */
    public hideBannerAd():void {
        if (this._bannerAd) {
            this._bannerAd.hide();
        }
    }

    /**
     * 移掉banner广告
     */
    public removeBanerAd():void {
        if (this._bannerAd) {
            this._bannerAd.destroy();
            this._bannerAd = null;
        }

    }



    /**
     * 往开放数据域发送数据
     * @param data {messageType:hide//隐藏排行榜,show//获取好友排行榜,commit//提交得分
     * MAIN_MENU_NUM:powerData
     * powerNum:战力值
     * }
     */
    public static sendOpenAreaMsg(messageType:string,powerNum:number):void {
        if (CC_WECHATGAME) {
            window["wx"].postMessage({
                messageType: messageType,
                MAIN_MENU_NUM: "powerData",
                powerNum:powerNum
            });
        }
    }

    /**
     * 垃圾回收
     */
    public static triggerGC():void {
        if (CC_WECHATGAME) {
            window["wx"].triggerGC();
        }
    }


    /**
     *监听内存不足告警事件。
     * @param callback
     */
    public static onMemoryWarning(callback:Function):void {
        if (CC_WECHATGAME) {
            window["wx"].onMemoryWarning(callback);
        }
    }

    /**
     *
     * 分享
     * @param callback
     */
    public static share(callback:Function):void {

    }

    /**
     *显示当前页面的转发按钮
     * @param withShareTicket
     */
    public showShareMenu(withShareTicket:boolean):void {
        if (CC_WECHATGAME) {
            window["wx"].showShareMenu({withShareTicket:withShareTicket});
        }

    }



    /**
     *
     * @param title 转发标题，不传则默认使用当前小游戏的昵称。
     * @param imageUrl 转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径。显示图片长宽比是 5:4
     * @param query 查询字符串，从这条转发消息进入后，可通过 wx.getLaunchInfoSync() 或 wx.onShow() 获取启动参数中的 query。必须是 key1=val1&key2=val2 的格式。
     * @param imageUrlId 审核通过的图片 ID
     */
    public shareAppMessage(title:string,imageUrl:string,query:string,imageUrlId:string):void {
        if (CC_WECHATGAME) {
            window["wx"].shareAppMessage({
                title:title,
                imageUrl:imageUrl,
                query:query,
            });
        }
    }

    /**
     * 监听用户点击右上角菜单的「转发」按钮时触发的事件
     * @param callback
     */
    public onShareAppMessage(title:string,imageUrl:string,imageUrlId:string):void {
        if (CC_WECHATGAME) {
            // console.log("WXPlatform 被动转发");
            window["wx"].onShareAppMessage(() => ({
                title: title,
                imageUrl: imageUrl, // 图片 URL
                imageUrlId:imageUrlId
            }));
        }
    }


    /**
     * 获取转发详细信息
     */
    public getShareInfo(shareTicket):any {
        if(CC_WECHATGAME) {
            window["wx"].getShareInfo({
                shareTicket
            })
        }
    }


    /**
     * 监听小游戏回到前台的事件
     *
     *scene	string	场景值
     *query	Object	查询参数
     *shareTicket	string	shareTicket
     *referrerInfo	object	当场景为由从另一个小程序或公众号或App打开时，返回此字段
     *
     * referrerInfo {
     * appId	string	来源小程序或公众号或App的 appId
     * extraData	object	来源小程序传过来的数据，scene=1037或1038时支持
     * }
     *
     *
     */
    public static onShow(callback:Function):void {
        if (CC_WECHATGAME) {
            window["wx"].onShow(function (res) {
                if (callback) {
                    callback(res);
                }
            })
        }
    }


    /**
     * 监听小游戏隐藏到后台事件。锁屏、按 HOME 键退到桌面、显示在聊天顶部等操作会触发此事件。
     * @param callback
     */
    public static onHide(callback:Function):void {
        if (CC_WECHATGAME) {
            window["wx"].onHide(function () {
                if (callback) {
                    callback();
                }
            })
        }
    }


    /**
     * 获取小游戏启动时的参数。
     */
    public static getLaunchOptionsSync():any {
        if (CC_WECHATGAME) {
            return window["wx"].getLaunchOptionsSync();
        }
    }


    /**
     *
     * 退出当前小游戏
     */
    public static exitMiniProgram(callback:Function):void {
        if (CC_WECHATGAME) {
            window["wx"].exitMiniProgram({
                success:callback
            });
        }else {
            // TipsManager.getInstance().removeAllTickId();
            game.end();
        }
    }


    /**
     * 设置帧频
     * @param fps
     */
    public static setPreferredFramesPerSecond(fps:number):void{
        window["wx"].setPreferredFramesPerSecond(fps);
    }

    /**
     * 是否展示调试面板
     * @param isShow
     */
    public static setEnableDebug(isShow:boolean):void {
        window["wx"].setEnableDebug({
            enableDebug: isShow
        })
    }

    /**
     * 重新刷新游戏
     */
    public static refreshLogin():void {
        if  (CC_WECHATGAME) {
            let updateManager = window["wx"].getUpdateManager;
            updateManager.applyUpdate();
        }
    }

    /**
     * 添加游戏圈按钮
     */
    public static createGameClubButton():void{
        if(CC_WECHATGAME){
            let menuPos = window["wx"].getMenuButtonBoundingClientRect();
            let windowSize = window["wx"].getSystemInfoSync();
            let menuTop = menuPos.top;
            let menuLeft = windowSize.windowWidth -30-18; // 因为clubButton的锚点在左上角 减去宽度再减去18与主场景的rightNode右对齐
            // console.log("leftPos:",menuLeft,"topPos:",menuTop);
            this.GameClubButton = window["wx"].createGameClubButton({
                icon: 'light',
                style: {
                    left:menuLeft,
                    top: menuTop+40,
                    width: 40,
                    height: 40,
                }
            });
        }
    }

    /**
     * 隐藏掉游戏圈
     */
    public static hideGameClubButton():void{
        if(CC_WECHATGAME){
            if(this.GameClubButton){
                this.GameClubButton.hide();
            }
        }
    }

    /**
     * 显示游戏圈
     */
    public static showGameClubButton():void{
        if(CC_WECHATGAME){
            this.GameClubButton.show();
        }
    }


    /**
     * 上传数据
     * @param KVDataList {key:"secondCoin",value:secondCoin}
     */
    public static setUserCloudStorage(key, value): void {
        if (CC_WECHATGAME) {
            window["wx"].setUserCloudStorage({
                KVDataList: [{key: key, value: value}],
                success: function (args) {
                    console.log("setUserCloudStorage success: ", args);
                },
                fail: function (args) {
                    console.log("setUserCloudStorage fail: ", args);
                }
            });
        }
    }


    /**
     * 向开放数据域发送消息
     */
    public static postMessage(massageType,main_menu_num,secondCoin) {
        if (CC_WECHATGAME) {
            window["wx"].getOpenDataContext().postMessage({messageType:massageType,MAIN_MENU_NUM:main_menu_num,powerNum:secondCoin});
        }
    }

    /**
     * 调用客服功能
     */
    public static openCustomerServiceConversation():void{
        if(CC_WECHATGAME){
            window["wx"].openCustomerServiceConversation({
                showMessageCard:true,
                sendMessageTitle:"联系客服，领取钻石！",
                sendMessageImg:"https://mmocgame.qpic.cn/wechatgame/XKGicIWicBF9pOt6gEN4UJ2IMy8iameEAd96EPWcXkFSfCT1HUsO1ibJlDbsxvLR85UV/0",
                success:function () {
                    // WXPlatform.onShow(function () {
                    //     SocketMgr.getInstance().sendCollectCoin({itemId:102,num:20});
                    //     TipsManager.getInstance().showAward({itemId:102,num:"20"},6);
                    // })
                }
            });
        }
    }

    /**
     * 收起键盘
     */
    public static hideKeyboard():void{
        if(CC_WECHATGAME){
            window["wx"].hideKeyboard();
        }
    }

    /**
     * 显示键盘
     */
    public static showKeyboard():void{
        if( CC_WECHATGAME ){
            window["wx"].showKeyboard();
        }
    }

    /**
     * 监听键盘输入事件
     * @param callback
     */
    public static onKeyboardInput(callback:Function):void{
        if(CC_WECHATGAME){
            window["wx"].onKeyboardInput(callback);
        }
    }

    public static onKeyboardConfirm(callback:Function):void{
        if(CC_WECHATGAME){
            window["wx"].onKeyboardConfirm(callback);
        }
    }
}
