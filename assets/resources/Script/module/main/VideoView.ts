import {BaseUI} from "../../UI/BaseUI";
import {UIManager} from "../../UI/UIManager";


const {ccclass, property} = cc._decorator;

@ccclass
export  class VideoView extends BaseUI {

    protected static className = "VideoView";
    protected static pathName = "/ui/main/";

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

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
        UIManager.getInstance().closeUI(VideoView);
    }


    // update (dt) {}
}
