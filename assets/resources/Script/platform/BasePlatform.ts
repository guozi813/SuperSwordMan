import {GameManager} from "../manager/GameManager";

/**
 * Created 2019/3/11.
 */

export class BasePlatform {
    public init() {

    }
    protected login() {

    }

    public onLoginHandler(cb:Function) {

    }

    /**
     * banner广告
     */
    public addBannerAd(style):void {

    }

    /**
     * 激励广告
     */
    public addRewardedVideoAd(callback:Function):void {

    }

    /**
     * 隐藏掉banner广告
     */
    public hideBannerAd():void {

    }

    /**
     * 删除banner广告
     */
    public removeBannnerAd():void {

    }

    /**
     * 显示转发按钮
     */
    public showShareMenu(withShareTicket):void{

    }

    /**
     * 主动转发
     */
    public shareAppMessage(title,imageUrl,query,imageUrlId):void{

    }

    /**
     * 获取分享数据
     */
    public getShareInfo(shareTicket):any{

    }

    /**
     * 监听转发按钮事件(主动转发)
     */
    public onShareAppMessage(title,imageUrl,imageUrlId):void{
    }

    /**
     * 初始化数据库
     */
    public initDatabase():void{}

    /**
     * 获取用户openId
     */
    public getOpenId(fun:Function){}


    /**
     * 上传用户游戏数据
     */
    public setUserInfo(openId):void{}

    /**
     * 更新用户游戏数据
     */
    public updateUserInfo(){}

    /**
     * 上传邀请者信息
     */
    public setShareInfo(inviteOpenId){
    }

    /**
     * 获取邀请到的好友数据
     */
    public getInviteInfo(callback){
    }
}
