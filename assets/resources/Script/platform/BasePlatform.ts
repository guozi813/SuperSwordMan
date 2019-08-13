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
}
