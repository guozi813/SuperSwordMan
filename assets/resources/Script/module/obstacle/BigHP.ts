/**
 * creator: yisha
 */
import {PoolManager} from "../../manager/PoolManager";
import {EnemyManager} from "../../manager/EnemyManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class BigHP extends cc.Component {

    onCollisionEnter(other,self){
        if(other.node.group == "player"){
            if(other.tag == 100){
                PoolManager.getInstance().put("bigHPPool",this.node,77);
            }
        }
    }

    // onLoad () {}

    start () {

    }

    update (dt) {
        if(EnemyManager.getInstance().enemyArr.length == 0){
            PoolManager.getInstance().put("bigHPPool",this.node,77);
        }
    }
}
