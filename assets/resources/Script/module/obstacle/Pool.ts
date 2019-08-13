/**
 * creator: yisha
 */
import {EnemyManager} from "../../manager/EnemyManager";
import {PoolManager} from "../../manager/PoolManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class Pool extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    update (dt) {
        if(EnemyManager.getInstance().enemyArr.length == 0){
            PoolManager.getInstance().put("poolPool",this.node,77);
        }
    }
}
