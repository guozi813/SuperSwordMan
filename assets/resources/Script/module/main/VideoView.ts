import {BaseUI} from "../../UI/BaseUI";
import {UIManager} from "../../UI/UIManager";
import {PlayerManager} from "../../manager/PlayerManager";
import {PlaformManager} from "../../platform/PlatformManager";
import {GameManager} from "../../manager/GameManager";
import {TipsManager} from "../../manager/TipsManager";
import {ConfigManager} from "../../Configs/ConfigManager";
import ConstConfigContainer from "../../Configs/ConstConfigContainer";


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

    private addCoin(type){
        if(type){
            // TODO
            let num = ConfigManager.getInstance().getConfigById(ConstConfigContainer,6).value;
            GameManager.getInstance().addAward(1,num);
        }else{
            TipsManager.getInstance().showContent("视频未看完,无法获得奖励!");
            return;
        }
    }

    closeUI(){
        UIManager.getInstance().closeUI(VideoView);
    }


    // update (dt) {}
}
