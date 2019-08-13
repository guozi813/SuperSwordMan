import {PlayerManager} from "../../manager/PlayerManager";
import {GameManager} from "../../manager/GameManager";
import {UIManager} from "../../UI/UIManager";
import {GameUtil} from "../../manager/GameUtil";
import {ListenerManager} from "../../manager/listen/ListenManager";
import {ConfigManager} from "../../Configs/ConfigManager";
import ConstConfigContainer from "../../Configs/ConstConfigContainer";

/**
 * creator: yisha
 */


const {ccclass, property} = cc._decorator;

@ccclass
export default class NextLevelView extends cc.Component {

    @property(cc.Label)
    numLabel: cc.Label = null;

    @property(cc.Label)
    adNumLabel: cc.Label = null;

    private multiple: number = 1; // 广告观看后增加的倍数

    // onLoad () {}

    onEnable() {
        let mixNum = ConfigManager.getInstance().getConfigById(ConstConfigContainer,2).value;
        let maxNum = ConfigManager.getInstance().getConfigById(ConstConfigContainer,3).value;
        this.multiple = GameUtil.randomNumByRange(mixNum,maxNum); // 广告翻倍
        PlayerManager.getInstance().multiple = this.multiple;
        this.numLabel.string = String(PlayerManager.getInstance().coin);
        this.adNumLabel.string = String(PlayerManager.getInstance().coin * this.multiple);
    }

    private getRewardBtnHandler() {
        // 添加金币
        GameManager.getInstance().addAward(1, PlayerManager.getInstance().coin);
    }

    private getADRewardBtnHandler() {
        GameManager.getInstance().addAward(1, PlayerManager.getInstance().coin * this.multiple);
    }

    // update (dt) {}
}
