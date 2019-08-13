import {AudioManager} from "../../manager/AudioManager";
import {ConfigManager} from "../../Configs/ConfigManager";
import {EnemyConfigContainer} from "../../Configs/EnemyConfigContainer";
import {LevelConfigContainer} from "../../Configs/LevelConfigContainer";
import {GameUtil} from "../../manager/GameUtil";
import {GameManager} from "../../manager/GameManager";
import {PlayerManager} from "../../manager/PlayerManager";
import {EnemyManager} from "../../manager/EnemyManager";
import EnemyBaseClass from "./EnemyBaseClass";
import ConstConfigContainer from "../../Configs/ConstConfigContainer";

/**
 * creator: yisha
 */


const {ccclass, property} = cc._decorator;

@ccclass
export class FlameTower extends EnemyBaseClass {

    @property(cc.ProgressBar)
    bloodBar: cc.ProgressBar = null;
    @property(cc.Label)
    blood:cc.Label = null;

    public totalHp: number = 0; // 怪总血量
    private aggressivity:number = 0; // 玩家攻击力
    private speed:number = 0; // 移动速度
    private isFire:boolean = true; // 攻击开关
    private isMove:boolean = true; // 移动开关
    private  _curHp : number = 0; // 怪当前血量

    public get curHp(){
        return this._curHp
    }

    public set curHp(value){
        console.log("当前血量",value);
        this._curHp = value
    }

    private initData() {
        let level = GameManager.getInstance().gameData.level;
        this.totalHp = ConfigManager.getInstance().getConfigById(LevelConfigContainer, level).totalHp; // 血量
        this.curHp = this.totalHp;
        this.blood.string = String(this.totalHp);
        this.aggressivity = PlayerManager.getInstance().aggressivity;
        this.speed = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,4).speed;
    }

    onCollisionEnter(other, self) {
        let swordData = GameManager.getInstance().gameData.isUse; // 所持剑的数据
        if (other.node.name == "Sword") {
            if (self.tag == 200) {
                let num = GameUtil.randomNum(100,false);
                let rate = GameManager.getInstance().gameData.swordData[5].remarks;
                if(swordData.id == 6 && num<=rate){
                        let crit = ConfigManager.getInstance().getConfigById(ConstConfigContainer,1).value;
                        this.curHp -= this.aggressivity+(this.aggressivity*(crit/100));
                        console.log("暴击。。。",this.aggressivity+(this.aggressivity*(crit/100)));
                }else{
                    if(swordData.id == 5){
                        this.initAggressivity(other.node.getComponent("Sword").isSplit);
                        console.log("子剑攻击力",this.aggressivity);
                    }
                    this.curHp -= this.aggressivity;
                    if(this.curHp<0){
                        this.curHp = 0;
                    }
                }
                this.refreshBloodBar(this.blood,this.curHp,this.bloodBar);
                this.playAttackedAnim();
                // 剑的效果
                this.effectBySword();
                AudioManager.getInstance().playSound("hurt", false);
            }
        }else if(other.tag == 10 || other.node.group =="wall" || other.node.group == "enemy"){
            if(self.tag == 200){
                this.speed = -this.speed;
            }
        }else if (other.node.group == "enemy" && other.tag == 226 && self.tag == 300) {
            if (swordData.id == 9) {
                this.initAggressivity(false);
                this.curHp -= this.aggressivity;
                if (this.curHp < 0) {
                    this.curHp = 0;
                }
                this.refreshBloodBar(this.blood,this.curHp,this.bloodBar);
                this.playAttackedAnim();
            }
            AudioManager.getInstance().playSound("hurt", false);
        }
    }

    private effectBySword(){
        let swordData = GameManager.getInstance().gameData.isUse; // 所持剑的数据
        switch (swordData.id) {
            case "1":
                this.node.x -= swordData.remarks;
                break;
            case "2":
                // 寒冰剑 减速
                let effectNum1 = swordData.remarks;
                // console.log("被寒冰剑刺到。。。。。。。。。。",effectNum1);
                this.speed -= this.speed*(effectNum1/100);
                break;
            case "3":
                // 烈焰剑 失去目标 停止攻击 持续3秒
                if(this.curHp <=0){
                    break;
                }
                let rate = Math.floor(Math.random()*100);
                // let rate = 1;
                let percent = GameManager.getInstance().gameData.swordData[2].remarks;
                if(rate < percent){
                    this.speed = 0;
                    this.isFire = false;
                    let anim = this.node.getComponent(cc.Animation);
                    let animState = anim.play("missingClip2");
                    let posArr = animState.curves[0].values;
                    for(let i=0;i<posArr.length;i++){
                        if(i<=1){
                            posArr[i] = cc.v2(this.node.x+20*Math.pow(-1,i),this.node.y);
                        }else{
                            posArr[i] = cc.v2(this.node.x,this.node.y+20*Math.pow(-1,i));
                        }
                    }
                    anim.on("finished",function () {
                        this.speed = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,4).speed;
                        this.isFire = true;
                    }.bind(this),this);
                }
                break;
            case "4":
                // 剧毒剑 中毒 持续5秒 每秒作用一次
                this.lastBloodDown(swordData.remarks,5,1);
                break;
            case "5":
            // 子母剑
            case "6":
                // 暴击剑
                break;
            case "7":
                // 奔雷剑
                let rate6 = Math.floor(Math.random()*100);
                // let rate6 = 1;
                let random6 = GameManager.getInstance().gameData.swordData[5].remarks;
                console.log("眩晕  rate",rate6,"config",random6);
                if(rate6 < random6){
                    this.unschedule(this.changeMoveState);
                    this.isMove = false;
                    this.scheduleOnce(this.changeMoveState,2);
                }
                break;
            case "8":
                // 绯云剑 吸血 TODO
                break;
            case "9":
                // 太乙剑
                this.unschedule(this.boom);
                this.node.getComponent(cc.CircleCollider).enabled = true;
                this.scheduleOnce(this.boom,0.5);
                break;
        }
    }

    /**
     * 持续掉血
     * @param num
     */
    private lastBloodDown(num:number,times:number,interval:number){
        this.unschedule(this.callback);
        // self.unscheduleAllCallbacks();
        this.schedule(this.callback,interval);
        console.log( cc.director.getScheduler().isScheduled(this.callback,this) )
    }
    count = 0;
    private callback(){
        let swordData = GameManager.getInstance().gameData.isUse; // 所持剑的数据
        if(this.count == 5){
            this.unschedule(this.callback);
            this.count=0;
        }
        this.curHp -= swordData.remarks;
        this.refreshBloodBar(this.blood,this.curHp,this.bloodBar);
        this.count ++;
    }

    private initAggressivity(isSplit:boolean){
        GameManager.getInstance().refreshAttack(isSplit);
        this.aggressivity = PlayerManager.getInstance().aggressivity;
    }

    private boom(){
        this.node.getComponent(cc.CircleCollider).enabled = false;
    }

    private changeMoveState() {
        this.isMove = true;
    }

    // onLoad () {}

    start () {
        this.initData();
        let wall  = cc.find("Canvas").getChildByName("realWall");
        if( this.node.x < 0  ){
            if( (wall.getContentSize().width/2+wall.x) +this.node.position.x-this.node.width/2<80 ){
                this.node.getChildByName("fire3").active = false;
            }
        }else{
            if( (wall.getContentSize().width/2+wall.x) -this.node.position.x-this.node.width/2<80 ){
                this.node.getChildByName("fire1").active = false;
            }
        }
        if( this.node.y < 0  ){
            if( (wall.getContentSize().height/2+wall.y) +this.node.position.y<80 ){
                this.node.getChildByName("fire4").active = false;
            }
        }else{
            if( (wall.getContentSize().height/2+wall.y) -this.node.position.y<80 ){
                this.node.getChildByName("fire2").active = false;
            }
        }
    }

    update (dt) {
        if(this.isMove){
            this.node.x += this.speed;
        }
    }
}
