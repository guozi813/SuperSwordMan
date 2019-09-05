/**
 * creator: yisha
 */
import {GameManager} from "../../manager/GameManager";
import {ConfigManager} from "../../Configs/ConfigManager";
import {RoleConfigContainer} from "../../Configs/RoleConfigContainer";
import {GameUtil} from "../../manager/GameUtil";
import {TipsManager} from "../../manager/TipsManager";
import {LogWrap} from "../../manager/utils/LogWrap";


const {ccclass, property} = cc._decorator;

@ccclass
export default class RoleUpdateView extends cc.Component {

    @property(cc.Label)
    levelLabel:cc.Label = null;
    @property(cc.Label)
    hpLabel:cc.Label = null;
    @property(cc.Label)
    attackLabel:cc.Label = null;
    @property(cc.Label)
    costLabel:cc.Label = null;

    private initView(){
        let roleData = GameManager.getInstance().gameData.roleData;
        this.levelLabel.string = "当前等级："+roleData.level;
        this.hpLabel.string = "当前血量："+roleData.hp;
        this.attackLabel.string = "当前攻击力："+roleData.aggressivity;
        this.costLabel.string = roleData.cost;
    }

    private updateBtnHandler(){

        let role = GameManager.getInstance().gameData.roleData;
        role.level += 1;
        if(role.level == 97){
            GameManager.getInstance().gameData.roleData.factor = 300;
            GameManager.getInstance().saveData();
        }else if(role.level == 200){
            GameManager.getInstance().gameData.roleData.factor = 400;
            GameManager.getInstance().saveData();
        }
        let level = ConfigManager.getInstance().getConfigById(RoleConfigContainer,role.level);
        LogWrap.log("level",level);

        if(role.cost > GameManager.getInstance().gameData.coin){
            TipsManager.getInstance().showContent("金币不足");
            return;
        }

        GameManager.getInstance().addAward(1,-role.cost);
        role.cost = GameUtil.levelUp(role.cost,250);
        role.hp = level.hp;
        role.aggressivity = level.aggressivity;
        GameManager.getInstance().saveData();
        this.initView();
    }

    // onLoad () {}

    protected onEnable() {
        this.initView();
    }

    // update (dt) {}
}
