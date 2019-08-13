import {UIManager} from "../../UI/UIManager";
import {BaseUI} from "../../UI/BaseUI";

const {ccclass, property} = cc._decorator;

@ccclass
export  class RankView extends BaseUI {

    protected static className = "RankView";
    protected static pathName = "/ui/main/";
    // LIFE-CYCLE CALLBACKS:

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
        // UIManager.getInstance().closeUI(RankView);
    }


    // update (dt) {}
}
