/**
 * creator: yisha
 */
import {BaseUI} from "../../UI/BaseUI";
import {GameData} from "../../Data/GameData";
import {GameManager} from "../../manager/GameManager";
import SkillItem from "./SkillItem";
import {UIManager} from "../../UI/UIManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class SkillView extends BaseUI {

    protected static className = "SkillView";
    protected static pathName = "/ui/skill/";

    @property(cc.Node)
    content:cc.Node = null;

    // onLoad () {}

    private initView(){
        let skillConfig = GameManager.getInstance().gameData.skillList;
        for(let i=0;i<skillConfig.length;i++){
            let obj = skillConfig[i];
            let skillItem = this.content.children[i];
            let skillItemScript:SkillItem = skillItem.getComponent("SkillItem");
            skillItemScript.init(obj);
        }
    }

    private closeBtnHandler(){
        UIManager.getInstance().closeUI(SkillView);
    }

    private addEvent(){
        this.content.on("touchstart",this.initView,this);
    }

    start () {
        this.initView();
        this.addEvent();
    }

    // update (dt) {}
}
