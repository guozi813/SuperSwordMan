import {AudioManager} from "../../manager/AudioManager";
import {GameUtil} from "../../manager/GameUtil";
import {GameManager} from "../../manager/GameManager";
import {TipsManager} from "../../manager/TipsManager";
import {ConfigConst} from "../../Data/Const";
import {ConfigManager} from "../../Configs/ConfigManager";
import {LevelConfigContainer} from "../../Configs/LevelConfigContainer";
import {RoleConfigContainer} from "../../Configs/RoleConfigContainer";
import {LogWrap} from "../../manager/utils/LogWrap";


const {ccclass, property} = cc._decorator;

@ccclass
export  class LevelUp extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Label)
    attackLabel:cc.Label=null;

    @property(cc.Label)
    cost: cc.Label = null;



    private type:number;
    private _data:any;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    public init(type:number,data:any):void{

        if(!data)return;
        this.type = type;
        this._data = data;
        this.initView();
    }

    public initView():void{
        switch (this.type) {
            case 0:
                this.label.string = "角色等级:LV." + this._data.level;
                this.cost.string = GameUtil.numberShow(this._data.cost,1);
                break;
            case 1:
                LogWrap.log(this._data);
                if(!this._data){
                    this.label.string = "当前血量:" + 496;
                    this.cost.string = "已满级";
                    return;
                }
                this.label.string = "当前血量:" + this._data.hp;
                this.attackLabel.node.active = true;
                this.attackLabel.string = "当前攻击力:"+this._data.aggressivity;
                this.cost.node.parent.active = false;
                break;
            case 2:
                this.label.string = "等级:LV." + this._data.level + "  "+ "攻击:" + this._data.attack;
                this.cost.string = GameUtil.numberShow(this._data.cost,1);
                break;
            case 3:
                this.label.string = "金币价值:LV." + this._data.value;
                this.cost.string = this._data.cost1;
                break;
            case 4:
                this.label.string = "每日收益:LV." + this._data.level;
                this.cost.string = this._data.cost2;
                break;
        }
    }

    /**
     * 剑升级
     */
    public refreshView():void{
        this._data = GameManager.getInstance().gameData.isUse;
        this.label.string = "等级:LV." + this._data.level + "  "+ "攻击:" + this._data.attack;
        this.cost.string = this._data.cost;
    }

    public refresh(data:any):void{
        switch (this.type) {
            case 0:
                this.label.string = "角色等级:LV." + data.level;
                this.cost.string = GameUtil.numberShow(data.cost,1);
                break;
            case 1:
                this.label.string = "控剑数量:" + data.num;
                this.cost.string = GameUtil.numberShow(data.cost,1);
                break;
            case 2:
                this.label.string = "等级:LV." + data.level + "  "+ "攻击:" + data.attack;
                this.cost.string = GameUtil.numberShow(data.cost,1);
                break;
            case 3:
                this.label.string = "金币价值:LV." + data.value;
                this.cost.string = data.cost1;
                break;
            case 4:
                this.label.string = "每日收益:LV." + data.level;
                this.cost.string = data.cost2;
                break;
        }
    }

    public onBtnHandler():void{
        AudioManager.getInstance().levelBtn();
        let coin = GameManager.getInstance().gameData.coin;
        let role = GameManager.getInstance().gameData.roleData;
        let swordList:any = GameManager.getInstance().gameData.swordData;
        let levelUp:LevelUp = GameManager.getInstance().levelUp.getChildByName("column2").getComponent("LevelUp");
        if(this.type == 2){
            if(this._data.level >= role.level){
                TipsManager.getInstance().showContent("剑的等级不能超过角色等级");
                return;
            }
        }
        if(!this._data)return;
        if(this._data.cost > coin ){
            TipsManager.getInstance().showContent("金币不足");
            return;
        }
        if(this.type == 3 || this.type == 4){
            TipsManager.getInstance().showContent("未开放");
            return;
        }
        GameManager.getInstance().addAward(1,- this._data.cost);
        switch (this.type) {
            case 0:
            case 1:
                break;
            case 2:
                // cc.log("等级+1");
                swordList.filter((res)=>{
                   if(this._data.id == res.id){
                       res.level += 1;
                       res.attack = GameUtil.levelUp(this._data.attack,this._data.attackFactor);
                       res.cost = GameUtil.levelUp(this._data.cost,this._data.factor);
                       if(res.level % 10 == 0){
                           // TODO
                           res.remarks += res.skillFactor;
                       }
                       this._data = res;
                   }
                });
                GameManager.getInstance().gameData.isUse = this._data;
                break;
            case 3:
                TipsManager.getInstance().showContent("未开放");
                return;
                // break;
            case 4:
                TipsManager.getInstance().showContent("未开放");
                return;
                // break;
        }
        this.initView();
        GameManager.getInstance().saveData();
        GameManager.getInstance().mainScene.refreshView("");
    }

    start () {

    }

    // update (dt) {}
}
