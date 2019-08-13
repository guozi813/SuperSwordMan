import {LevelUp} from "./LevelUp";
import {GameManager} from "../../manager/GameManager";
import {AudioManager} from "../../manager/AudioManager";
import {TipsManager} from "../../manager/TipsManager";
import Player from "../player/Player";
import {EnemyManager} from "../../manager/EnemyManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class Item extends cc.Component {

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    level: cc.Label = null;

    @property(cc.Node)
    use: cc.Node = null;

    @property(cc.Node)
    image: cc.Node = null;

    private _data;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    public init(data: any): void {
        if (!data) return;
        this._data = data;

        this.initView();
    }

    public initView(): void {
        let id = GameManager.getInstance().gameData.isUse.id;
        let tupian = this._data.image;
        this.title.string = this._data.name;
        if (this._data.id == id) {
            this.use.active = true;
        }
        let level = this._data.unlockLevel;
        cc.loader.loadRes("Texture/sword/" + tupian, cc.SpriteFrame, function (err, res) {
            this.image.getComponent(cc.Sprite).spriteFrame = res;
        }.bind(this));
        if (level > GameManager.getInstance().gameData.level) {
            // TODO 测试时注释
            this.level.string = level + "关解锁";
            this._data.state = false;
            return;
        }
        this.node.getChildByName("bg").active = false;
        this.node.getChildByName("unlockLevel").active = false;
        this._data.state = true;
    }


    public refreshView(): void {

    }

    public onClick(): void {
        AudioManager.getInstance().btnOnClick();

        if (!this._data.state) {
            TipsManager.getInstance().showTip("未解锁");
            return;
        }
        // let swordData:any = GameManager.getInstance().gameData.swordData;
        // for ( let i = 0;i < swordData.length;i++){
        //     let item = swordData[i];
        //     if(item.id == this._data.id){
        //         item.level += 1;
        //         item.attack = GameUtil.levelUp(this._data.attack,this._data.attackFactor);
        //         item.cost = GameUtil.levelUp(this._data.cost,this._data.factor);
        //         GameManager.getInstance().gameData.isUse = item;
        //     }
        // }
        GameManager.getInstance().gameData.isUse = this._data;
        let levelUp: LevelUp = GameManager.getInstance().levelUp.getChildByName("column1").getComponent("LevelUp");
        levelUp.refreshView();

        let items = this.node.parent.children;
        for (let i = 0; i < items.length; i++) {
            let node = items[i];
            let item: Item = node.getComponent("Item");
            item.use.active = false;
        }
        //选中效果
        this.use.active = true;
        GameManager.getInstance().mainScene.refreshView(this._data.image);
        GameManager.getInstance().saveData();
    }


    start() {

    }

    // update (dt) {}
}
