import {EnemyManager} from "../../manager/EnemyManager";
import {PoolManager} from "../../manager/PoolManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {

    private angle:number = 0;
    @property
    private speed:number = 0;
    private times:number = 0;
    public type:number = 0; // 区分哪个怪发射的 0噬魂瞳 1伞妖 2魔铃

    // onLoad () {}

    start () {
        // this.fireToPlayer();
    }

    public fireToPlayer(type){
        let num = 0;
        if(type ==0){
            num = 0;
        }else if(type == 1){
            num = -0.75
        }else if(type == 2){
            num = 0.75
        }

        let pos = EnemyManager.getInstance().playerNode.getPosition();
        this.angle = EnemyManager.getInstance().followBullet(pos,this.node)+num;
    }

    onCollisionEnter(other,self){
        if( other.node.group == "wall" || other.node.group == "stick" || other.tag == 10 ){
            this.times = 0;
            PoolManager.getInstance().put("bulletPool",self.node,20);
        }else if(other.node.group == "player" && other.tag ==100 ){
            this.times = 0;
            PoolManager.getInstance().put("bulletPool",self.node,20);
        }
    }

    update (dt) {
        this.node.x += Math.cos(this.angle) * this.speed * dt;
        this.node.y += Math.sin(this.angle) * this.speed * dt;
    }
}
