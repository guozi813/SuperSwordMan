import {GameUtil} from "../../manager/GameUtil";
import {PlayerManager} from "../../manager/PlayerManager";
import {ConfigManager} from "../../Configs/ConfigManager";
import {LevelConfigContainer} from "../../Configs/LevelConfigContainer";
import {GameManager} from "../../manager/GameManager";
import {EnemyManager} from "../../manager/EnemyManager";
import {LogWrap} from "../../manager/utils/LogWrap";

/**
 * creator: yisha
 */
export interface EnemyClass<T extends EnemyBaseClass> {
    new():T;
    refreshBloodBar();
    isDead();
    totalHp;
    speed;
}

const {ccclass, property} = cc._decorator;

@ccclass
export default class EnemyBaseClass extends cc.Component {

    public totalHp:number;

    // onLoad () {}

    start () {
        let level = GameManager.getInstance().gameData.level;
        this.totalHp = ConfigManager.getInstance().getConfigById(LevelConfigContainer,level).totalHp;
    }

    public refreshBloodBar(blood:cc.Label,curHp:number,bloodBar:cc.ProgressBar){
        this.isDead(curHp);
        blood.string = String(Math.floor(curHp));
        let percent = curHp / this.totalHp;
        bloodBar.progress = percent;
    }

    public isDead(curHp){
        if (curHp <= 0) {
            let num  =GameUtil.randomNumByRange(100,200);
            PlayerManager.getInstance().coin += num;
            LogWrap.log("num:%d,coin:%d",num,PlayerManager.getInstance().coin);
            this.node.removeFromParent(true);
        }
    }

    public playAttackedAnim() {
        let anim = this.node.getChildByName("hurtSprite").getComponent(cc.Animation);
        anim.play("hurtClip2");
        anim.on("finished", this.isDead, this);
    }

    public getAngle() {
        let pos = this.node.getPosition();
        let playerPos = EnemyManager.getInstance().playerNode;
        return Math.atan2(playerPos.y - pos.y, playerPos.x - pos.x) * (180 / Math.PI);
    }

    // update (dt) {}
}
