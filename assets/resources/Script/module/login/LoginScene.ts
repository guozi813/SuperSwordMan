import {GameManager} from "../../manager/GameManager";
import {PlaformManager} from "../../platform/PlatformManager";
import {GameUtil} from "../../manager/GameUtil";
import {PlayerManager} from "../../manager/PlayerManager";
import {LogWrap} from "../../manager/utils/LogWrap";


const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginScene extends cc.Component {

    private _button;
    private _code: string = null;
    private _userInfo: any = null;

    // onLoad () {}
    @property(cc.Button)
    loginBtn: cc.Button = null;

    start() {
        this.initUI();
        PlaformManager.getInstance().initPlaform();
        PlaformManager.getInstance().showShareMenu(true);
        PlaformManager.getInstance().intiDatabase();
    }

    private initUI(): void {
        let self = this;
        self._userInfo = cc.sys.localStorage.getItem("userInfo");
        if (CC_WECHATGAME) {
            this.loginBtn.node.active = false;
            window["wx"].getSystemInfo({
                success(res) {
                    LogWrap.log("获取系统信息：", res);
                    var width = res.screenWidth;
                    var height = res.screenHeight;
                    var btWidth = 310 / 2.2; //这里只是简单的认为Dpr 2.2
                    var btHeight = 95 / 2.2;
                    self._button = window["wx"].createUserInfoButton({
                        type: 'image',
                        image: 'https://resoure-bucket.oss-cn-shenzhen.aliyuncs.com/res/SuperSwordMan/btn_login.png',
                        style: {
                            left: width / 2 - btWidth / 2,
                            top: height / 2 - btHeight - 50,
                            width: btWidth,
                            height: btHeight,
                            lineHeight: 40,
                            backgroundColor: '#ffffff',
                            color: '#000000'
                        }
                    });
                    self._button.onTap((res) => {
                        LogWrap.log("onTap,res:", self._userInfo, !self._userInfo);
                        if (!self._userInfo) {
                            window["wx"].getSetting({
                                success(res) {
                                    if (res.authSetting["scope.userInfo"]) {
                                        // 已授权
                                        window["wx"].login({
                                            success: function (res) {
                                                LogWrap.log(res);
                                                if (res.code) {
                                                    window["wx"].getUserInfo({
                                                        lang: 'zh_CN',
                                                        withCredentials: true,
                                                        success: function (res) {
                                                            LogWrap.log("getUserInfo:", res);
                                                            self._userInfo = res.userInfo;
                                                            PlayerManager.getInstance().userInfo = res.userInfo;
                                                            cc.sys.localStorage.setItem("userInfo", self._userInfo);
                                                            GameManager.getInstance().initData();
                                                            GameManager.getInstance().enterGame();
                                                            self._button.hide();
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    }
                                }
                            })
                        } else {
                            self._button.hide();
                            GameManager.getInstance().enterGame();
                        }
                    });
                }
            })
        }
    }

    private loginBtnHandler(): void {
        if (!cc.sys.localStorage.getItem("gameData")) {
            GameManager.getInstance().initData();
        }
        GameManager.getInstance().enterGame();
    }


    // update (dt) {}
}
