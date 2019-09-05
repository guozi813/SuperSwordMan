import {BaseUI} from "../../UI/BaseUI";
import {UIManager} from "../../UI/UIManager";
import {ListenerManager} from "../../manager/listen/ListenManager";
import {ListenerType} from "../../Data/Const";
import {GameManager} from "../../manager/GameManager";


const {ccclass, property} = cc._decorator;

@ccclass
export  class CoinView extends BaseUI {

    protected static className = "CoinView";
    protected static pathName = "/ui/main/";

    @property(cc.Label)
    coin:cc.Label =null;

    // onLoad () {}

    start () {
        this.addEvent();
    }

    addEvent(){
        let bg = this.node.getChildByName("bg");
        bg.on("touchstart",this.closeUI,this);
        bg.on("touchmove",this.closeUI,this);
    }


    closeUI(){
        UIManager.getInstance().closeUI(CoinView);
    }


    // update (dt) {}
}
