/**
 * creator: yisha
 */
import {UIConst} from "../../Data/Const";
import SkillExplainView from "./SkillExplainView";
import {UIManager} from "../../UI/UIManager";
import {PlayerManager} from "../../manager/PlayerManager";
import {GameManager} from "../../manager/GameManager";
import {GameUtil} from "../../manager/GameUtil";
import {ListenerManager} from "../../manager/listen/ListenManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class SkillItem extends cc.Component {

    @property(cc.Sprite)
    image: cc.Sprite = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Label)
    levelLabel: cc.Label = null;

    @property(cc.Prefab)
    skillExplainView: cc.Prefab = null;

    @property(cc.Label)
    goldLabel:cc.Label = null;

    @property(cc.Label)
    chooseLabel:cc.Label = null;

    @property(cc.Button)
    chooseBtn:cc.Button = null;

    private _data: any;

    public init(data) {
        if (!data) return;
        this._data = data;
        this.initView();
    }

    // 刷新视图
    private initView() {



        if(this._data.id == GameManager.getInstance().gameData.skillID){
            this.chooseLabel.string = "已选择";
            this.chooseBtn.enabled = false;
        }else{
            this.chooseLabel.string = "选择";
            this.chooseBtn.enabled = true;
        }
        this.nameLabel.string = this._data.des;
        this.levelLabel.string = this._data.level;
        this.goldLabel.string = this._data.gold;
        if (this._data.image == "") {
            return
        } else {
            cc.loader.loadRes(UIConst.SKILL_IMAGE_DIR + this._data.image, cc.SpriteFrame, function (err, res) {
                if (err) {
                    console.log(err);
                    return
                } else {
                    this.image.getComponent(cc.Sprite).spriteFrame = res;
                }
            }.bind(this));
        }

        // 未解锁
        // let level = GameManager.getInstance().gameData.level;
        // if(level < this._data.unlock){
        //     this.goldLabel.node.parent.active = false;
        //     this.chooseLabel.string = "未解锁";
        //     this.chooseBtn.enabled = false;
        // }
    }

    private updateBtnHandler() {
        let skillList = GameManager.getInstance().gameData.skillList;
        skillList.filter((res) => {
            if (this._data.id == res.id) {
                res.level += 1;
                res.num = GameUtil.levelUp(this._data.num, this._data.numFactor);
                res.gold = GameUtil.levelUp(this._data.gold, this._data.goldFactor);
                this._data = res;
            }
        });
        GameManager.getInstance().gameData.skillID = Number(this._data.id);
        GameManager.getInstance().saveData();
        this.levelLabel.string = this._data.level;
        this.goldLabel.string = this._data.gold;
    }

    private chooseBtnHandler(){
        GameManager.getInstance().gameData.skillID = Number(this._data.id);
        GameManager.getInstance().saveData();
        this.chooseLabel.string = "已选择";
        this.chooseBtn.enabled = false;
        // 注册监听item刷新事件
        ListenerManager.getInstance().trigger(UIConst.REFRESH_SKILLITEN);
    }

    // onLoad () {}

    start() {
        this.image.node.on("touchstart", function () {
            PlayerManager.getInstance().checkOutSkillId = Number(this._data.id);
            console.log("skillId", PlayerManager.getInstance().checkOutSkillId);
            UIManager.getInstance().showUI(SkillExplainView);
        }.bind(this), this);

        this.image.node.on("touchend", function () {
            UIManager.getInstance().closeUI(SkillExplainView);
        }.bind(this), this);

        ListenerManager.getInstance().add(UIConst.REFRESH_SKILLITEN,this,this.initView);
    }

    // update (dt) {}
}
