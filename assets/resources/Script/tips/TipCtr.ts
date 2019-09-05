const {ccclass, property} = cc._decorator;

@ccclass
export  class TipCtr extends cc.Component {

    @property(cc.Label)
    content: cc.Label = null;

    @property
    text: string = 'hello';


    // onLoad () {}

    start () {

    }

    onDestroySelf() {
        this.node.removeFromParent();
    }

    showContent (str:string) {
        if (str) {
            this.content.string = str;
            this.node.getComponent(cc.Animation).play("up");
        }

    }

    // update (dt) {}
}
