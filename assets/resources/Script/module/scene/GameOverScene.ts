import {GameUtil} from "../../manager/GameUtil";
import {PlayerManager} from "../../manager/PlayerManager";
import {GameManager} from "../../manager/GameManager";
import {UIManager} from "../../UI/UIManager";
import LoadingView from "../loading/LoadingView";
import {ListenerManager} from "../../manager/listen/ListenManager";
import {ListenerType} from "../../Data/Const";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameOverScene extends cc.Component {

    private restartBtnHandler():void{
        UIManager.getInstance().showUI(LoadingView,function () {
            cc.director.preloadScene("GameScene",function (completedCount: number, totalCount: number, item: any) {
                ListenerManager.getInstance().trigger(ListenerType.LOADPROGRESS, completedCount, totalCount);
                if (totalCount && completedCount == totalCount) {
                    UIManager.getInstance().closeUI(LoadingView);
                    cc.director.loadScene("GameScene");
                }
            }.bind(this),null);
        }.bind(this));
        // this.node.active = false;
    }

    private menuBtnHandler(){
        GameManager.getInstance().addAward(1, PlayerManager.getInstance().coin);
        console.log("goldNum:",GameManager.getInstance().gameData.coin);
        cc.director.loadScene("MainScene");
    }

    // onLoad () {}

    start () {
        this.node.getChildByName("goldNum").getComponent(cc.Label).string = "获得金币："+String(PlayerManager.getInstance().coin);

        PlayerManager.getInstance().coin = 0;
    }
    // update (dt) {}
}
