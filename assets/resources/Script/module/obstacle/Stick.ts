import {PlayerManager} from "../../manager/PlayerManager";
import {PoolManager} from "../../manager/PoolManager";
import {EnemyManager} from "../../manager/EnemyManager";
import {GameUtil} from "../../manager/GameUtil";
import {UIConst} from "../../Data/Const";

/**
 * creator: yisha
 */


const {ccclass, property} = cc._decorator;

@ccclass
export default class Stick extends cc.Component {

    // onLoad () {}

    start() {
        this.init();
    }

    private init() {
        // let random = GameUtil.randomNum(4, false);
        let random = 2;
        switch (random) {
            case 0:
                cc.loader.loadRes(UIConst.OBSTACLE_IMG_DIR + "bigBox",cc.SpriteFrame, function (err, res) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (res) {
                        this.node.getComponent(cc.Sprite).spriteFrame = res;
                    }
                }.bind(this));
                break;
            case 1:
                cc.loader.loadRes(UIConst.OBSTACLE_IMG_DIR + "smallBox",cc.SpriteFrame, function (err, res) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (res) {
                        this.node.getComponent(cc.Sprite).spriteFrame = res;
                    }
                }.bind(this));

                break;
            case 2:
                cc.loader.loadRes(UIConst.OBSTACLE_IMG_DIR + "wall",cc.SpriteFrame, function (err, res) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (res) {
                        this.node.getComponent(cc.Sprite).spriteFrame = res;
                    }
                }.bind(this));
                break;
            case 3:
                cc.loader.loadRes(UIConst.OBSTACLE_IMG_DIR + "forest",cc.SpriteFrame, function (err, res) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (res) {
                        this.node.getComponent(cc.Sprite).spriteFrame = res;
                    }
                }.bind(this));
                break;
        }
    }

    onCollisionEnter(other, self) {
        // if (other.node.group == "sword") {
        //     // 撞到障碍物--箱子上 消失
        //     PlayerManager.getInstance().fireSword--;
        //     if(PlayerManager.getInstance().fireSword<0){
        //         PlayerManager.getInstance().fireSword = 0;
        //     }
        //     PoolManager.getInstance().put("swordPool", self.node, 10);
        // }

    }


    update(dt) {
        if (EnemyManager.getInstance().enemyArr.length == 0) {
            PoolManager.getInstance().put("stickPool", this.node, 77);
        }
    }
}
