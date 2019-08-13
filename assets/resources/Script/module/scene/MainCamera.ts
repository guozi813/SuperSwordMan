/**
 * creator: yisha
 */
import {PlayerManager} from "../../manager/PlayerManager";
import {EnemyManager} from "../../manager/EnemyManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class MainCamera extends cc.Component {


    @property(cc.Sprite)
    player: cc.Sprite = null;

    @property(cc.Node)
    nextLevelView:cc.Node= null;

    // onLoad () {}

    start() {

    }

    update(dt) {
        this.moveBg();
    }

    moveBg() {
        this.node.y = this.player.node.y+422;
        console.log("y:",this.node.y);
        this.nextLevelView.y = this.player.node.y+422;
        if(this.node.y<=-10){
            this.node.y = -10;
        }
        if(this.nextLevelView.y<=-10){
            this.nextLevelView.y = -10;
        }
    }

}