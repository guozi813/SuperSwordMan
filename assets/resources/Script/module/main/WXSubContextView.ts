/**
 * creator: yisha
 */


const {ccclass, property} = cc._decorator;

@ccclass
export default class WXSubContextView extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.node.on("touchstart",function () {
            this.node.active = false;
        }.bind(this),this);
    }

    // update (dt) {}
}
