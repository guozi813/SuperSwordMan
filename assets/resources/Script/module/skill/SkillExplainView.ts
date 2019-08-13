/**
 * creator: yisha
 */
import {BaseUI} from "../../UI/BaseUI";
import {GameManager} from "../../manager/GameManager";
import {SkillConfigData} from "../../Configs/SkillConfigContainer";
import {PlayerManager} from "../../manager/PlayerManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class SkillExplainView extends BaseUI {

    protected static className = "SkillExplainView";
    protected static pathName = "/ui/skill/";

    @property(cc.Label)
    label:cc.Label = null;

    private initView(){
        let skillId = PlayerManager.getInstance().checkOutSkillId;
        let skillList = GameManager.getInstance().gameData.skillList;
        let skillData:SkillConfigData = skillList[skillId-1];
        this.label.string = skillData.skillExplain;
    }


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.initView();
    }

    // update (dt) {}
}
