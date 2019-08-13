import {EnemyManager} from "../../manager/EnemyManager";
import {PoolManager} from "../../manager/PoolManager";

/**
 * creator: yisha
 */


const {ccclass, property} = cc._decorator;

@ccclass
export default class MolingBullet extends cc.Component {
    private angle = 0;
    @property
    private speed:number = 200;


    public fireToPlayer(){
        let pos = EnemyManager.getInstance().playerNode.getPosition();
        this.angle = EnemyManager.getInstance().followBullet(pos,this.node);
    }

    onCollisionEnter(other,self){
        if((other.node.group == "player" && other.tag ==100) || other.node.group == "wall" ){
            PoolManager.getInstance().put("bulletPool",self.node,20);
        }
    }

    // onLoad () {}

    start () {

    }

    update (dt) {
        this.node.x += Math.cos(this.angle) * this.speed * dt;
        this.node.y += Math.sin(this.angle) * this.speed * dt;
    }
}
