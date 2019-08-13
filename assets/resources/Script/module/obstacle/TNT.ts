/**
 * creator: yisha
 */
import {PoolManager} from "../../manager/PoolManager";
import {TipsManager} from "../../manager/TipsManager";
import {GameManager} from "../../manager/GameManager";
import {ConfigManager} from "../../Configs/ConfigManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class TNT extends cc.Component {

    private isCountdown: boolean = false;
    private _tickId: number = null;
    private curBoomCD: number = null; //
    private boxCollider: any;

    // onLoad () {}

    onCollisionEnter(other, self) {
        if (other.node.group == "player") {
            this.isCountdown = true;
            this.playBoomAnim();
        }
    }

    private playBoomAnim() {
        if (this._tickId) {
            clearInterval(this._tickId);
            TipsManager.getInstance().removeTickId(this._tickId);
            this._tickId = null;
        } else if (!this._tickId) {
            // TODO this.curBoomCD = ConfigManager.;
            this._tickId = setInterval(this.cdBoomHandler.bind(this), 2000);
            TipsManager.getInstance().addTickId(this._tickId);
        }
    }

    private cdBoomHandler() {
        if (this._tickId) {
            clearInterval(this._tickId);
            this._tickId = null;
        }
        let boxColliders = this.node.getComponents(cc.BoxCollider);
        for (let i = 0; i < boxColliders.length; i++) {
            let obj = boxColliders[i];
            if (obj.tag == 9) {
                console.log("找到了");
                obj.enabled = true;
            }
        }
        let anim = this.node.getComponent(cc.Animation);
        anim.play("boomClip");
        anim.on("finished", function () {
            PoolManager.getInstance().put("tntPool", this.node, 10);
        }.bind(this));
    }


    start() {
    }

    update(dt) {
    }
}
