/**
 * Created 2019/3/11.
 **/
import {WXPlatform} from "./WXPlatform";
import {UIConst} from "../Data/Const";
import {BasePlatform} from "./BasePlatform";


export class plaformName {
    public static WX: string = "wx";
    public static ANDROID_TAPTAP: string = "android-taptap";//taptap安卓平台
    public static IOS_TAPTAP: string = "ios_taptap";//taptap苹果平台
}

export class PlaformManager {
    private static _instance: PlaformManager;
    private _plaformIns: BasePlatform = null;
    public static plaformName: plaformName = plaformName.WX;

    constructor() {

    }

    public initPlaform() {
        if (PlaformManager.plaformName == plaformName.WX) {
        }
        this._plaformIns = new WXPlatform();
        this._plaformIns.init();
    }


    public onLoginHandler(loginCallback: Function): void {
        this._plaformIns.onLoginHandler(loginCallback);
    }

    public static getInstance(): PlaformManager {
        if (!this._instance) {
            this._instance = new PlaformManager();
        }
        return this._instance;
    }

    /**
     *
     * 展示激励广告
     * @param callback
     */
    public addRewardedVideoAd(callback: Function): void {
        if (this._plaformIns) {
            this._plaformIns.addRewardedVideoAd(callback);
        }
    }


    /**
     *
     * 展示banner广告
     * @param style
     */
    public addBannerAd(style: any): void {
        if (this._plaformIns) {
            this._plaformIns.addBannerAd(style);
        }
    }

    /**
     * 隐藏掉banner广告
     */
    public hideBannerAd(): void {
        if (this._plaformIns) {
            this._plaformIns.hideBannerAd();
        }
    }


    /**
     * 删除掉banner广告
     */
    public removeBannnerAd(): void {
        if (this._plaformIns) {
            this._plaformIns.removeBannnerAd();
        }
    }

    /**
     * 显示转发功能
     */
    public showShareMenu(withShareTicket): void {
        if (this._plaformIns) {
            this._plaformIns.showShareMenu(withShareTicket);
        }
    }

    /**
     * 触发主动转发按钮
     */
    public shareAppMessage(title, imageUrl, query, imageUrlId): void {
        if (title == null) {
            title = UIConst.DEFAULT_SHARE_TITLE;
        }
        if (imageUrl == null) {
            imageUrl = "https://mmocgame.qpic.cn/wechatgame/XKGicIWicBF9pOt6gEN4UJ2IMy8iameEAd96EPWcXkFSfCT1HUsO1ibJlDbsxvLR85UV/0";
        }
        if (imageUrlId == null) {
            imageUrlId = "dfJGFGZoTP6IMsJrDUlc_A";
        }
        if (this._plaformIns) {
            this._plaformIns.shareAppMessage(title, imageUrl, query, imageUrlId);
        }
    }

    /**
     * 获取分享数据
     */
    public getShareInfo(shareTicket): any {
        if (this._plaformIns) {
            this._plaformIns.getShareInfo(shareTicket);
        }
    }

    /**
     * 监听转发按钮事件
     */
    public onShareAppMessage() {
        let title = UIConst.DEFAULT_SHARE_TITLE;
        let imageUrl = "https://mmocgame.qpic.cn/wechatgame/XKGicIWicBF9pOt6gEN4UJ2IMy8iameEAd96EPWcXkFSfCT1HUsO1ibJlDbsxvLR85UV/0"; // TODO 默认的分享图片
        let imageUrlId = "dfJGFGZoTP6IMsJrDUlc_A";
        // LogWrap.log("PlaformManager 被动转发");
        if (this._plaformIns) {
            this._plaformIns.onShareAppMessage(title, imageUrl, imageUrlId);
        }
    }

    /**
     * 短震动
     */
    public static vibrateShort(): void {
        if (CC_WECHATGAME) {
            window["wx"].vibrateShort();
        }
    }

    /**
     * 长震动
     */
    public static vibrateLong(): void {
        if (CC_WECHATGAME) {
            window["wx"].vibrateLong();
        }
    }

    /**
     * 创建游戏圈按钮
     */
    public static createGameClubButton() {
        if (CC_WECHATGAME) {
            WXPlatform.createGameClubButton();
        }
    }

    /**
     * 隐藏游戏圈
     */
    public static hideGameClubButton(): void {
        if (CC_WECHATGAME) {
            WXPlatform.hideGameClubButton();
        }
    }

    /**
     * 显示游戏圈
     */
    public static showGameClubButton(): void {
        if (CC_WECHATGAME) {
            WXPlatform.showGameClubButton();
        }
    }

    /**
     * 初始化数据库
     */
    public intiDatabase() {
        if (this._plaformIns) {
            this._plaformIns.initDatabase();
        }
    }

    /**
     * 获取用户openId
     */
    public getOpenId(fun: Function) {
        if (this._plaformIns) {
            this._plaformIns.getOpenId(fun);
        }
    }

    /**
     * 上传用户游戏数据
     */
    public setUserInfo(openId): void {
        if (this._plaformIns) {
            this._plaformIns.setUserInfo(openId);
        }
    }

    /**
     * 更新用户游戏数据
     */
    public updateUserInfo() {
        if (this._plaformIns) {
            this._plaformIns.updateUserInfo();
        }
    }

    /**
     * 上传邀请者信息
     */
    public setShareInfo(inviteOpenId) {
        if (this._plaformIns) {
            this._plaformIns.setShareInfo(inviteOpenId);
        }
    }

    /**
     * 获取邀请到的好友数据
     */
    public getInviteInfo(callback){
        if(this._plaformIns){
            this._plaformIns.getInviteInfo(callback);
        }
    }


}
