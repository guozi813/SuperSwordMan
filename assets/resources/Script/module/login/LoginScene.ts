import {GameManager} from "../../manager/GameManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginScene extends cc.Component {

    private _button;
    private _code:string = null;
    private _userInfo:any = null;

    // onLoad () {}
    @property(cc.Button)
    loginBtn:cc.Button = null;

    start () {
        this.initUI();
    }

    private initUI():void{
        let self = this;
        self._userInfo = cc.sys.localStorage.getItem("userInfo");
        if(CC_WECHATGAME){
            this.loginBtn.node.active = false;
            window["wx"].getSystemInfo({
                success(res){
                    console.log("获取系统信息：",res);
                    var width = res.screenWidth;
                    var height = res.screenHeight;
                    var btWidth = 310/2.2; //这里只是简单的认为Dpr 2.2
                    var btHeight = 95/2.2;
                    self._button = window["wx"].createUserInfoButton({
                        type:'image',
                        image:'https://resoure-bucket.oss-cn-shenzhen.aliyuncs.com/res/SuperSwordMan/btn_login.png',
                        style: {
                            left: width/2 - btWidth/2,
                            top: height/2 - btHeight - 50 ,
                            width: btWidth,
                            height: btHeight,
                            lineHeight: 40,
                            backgroundColor: '#ffffff',
                            color: '#000000'
                        }
                    });
                    self._button.onTap((res) =>{
                        console.log("gameData",cc.sys.localStorage.getItem("gameData")); // 获取当前游戏数据
                        console.log("onTap,res:",res,self._userInfo);
                        if( !self._userInfo ){
                            window["wx"].getSetting({
                                success(res){
                                    if(res.authSetting["scope.userInfo"]){
                                        // 已授权
                                        window["wx"].login({
                                            success:function (res) {
                                                console.log(res);
                                                if(res.code){
                                                    window["wx"].getUserInfo({
                                                        lang: 'zh_CN',
                                                        withCredentials: true,
                                                        success:function (res) {
                                                            console.log("getUserInfo:",res);
                                                            self._userInfo = res.userInfo;
                                                            cc.sys.localStorage.setItem("userInfo",self._userInfo);
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
                        }else{
                            self._button.hide();
                            GameManager.getInstance().enterGame();
                        }
                    });
                }
            })
        }
    }

    private loginBtnHandler():void{
        GameManager.getInstance().enterGame();
    }


    // update (dt) {}
}
