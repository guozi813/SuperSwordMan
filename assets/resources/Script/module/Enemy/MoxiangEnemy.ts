/**
 * creator: yisha
 */
import EnemyBaseClass from "./EnemyBaseClass";
import {PlayerManager} from "../../manager/PlayerManager";
import {ConfigManager} from "../../Configs/ConfigManager";
import {EnemyConfigContainer} from "../../Configs/EnemyConfigContainer";
import {EnemyManager} from "../../manager/EnemyManager";
import {GameManager} from "../../manager/GameManager";
import {GameUtil} from "../../manager/GameUtil";
import {AudioManager} from "../../manager/AudioManager";
import ConstConfigContainer from "../../Configs/ConstConfigContainer";


const {ccclass, property} = cc._decorator;

@ccclass
export default class MoxiangEnemy extends EnemyBaseClass{

    @property
    speed:number = 20;
    @property
    isMove:boolean = true;
    @property(cc.Label)
    blood:cc.Label = null;
    @property(cc.ProgressBar)
    bloodBar:cc.ProgressBar = null;
    @property(cc.Prefab)
    moxiangChild:cc.Prefab = null;

    private aggressivity:number = null;
    private deadTag:boolean = false;
    private angle:number = null;
    private isFire:boolean = true;
    private controlX: number = 1; // 控制X方向
    private controlY: number = 1; // 控制Y方向
    private  _curHp : number = 0; // 怪当前血量

    public get curHp(){
        return this._curHp
    }

    public set curHp(value){
        console.log("当前血量",value);
        this._curHp = value
    }

    protected onDisable(): void {
        this.unscheduleAllCallbacks();
    }

    private effectBySword(){
        let swordData = GameManager.getInstance().gameData.isUse; // 所持剑的数据
        switch (swordData.id) {
            case "1":
                let angle = EnemyManager.getInstance().followBullet(EnemyManager.getInstance().playerNode, this.node);
                if (Math.sin(angle) < 0) {
                    this.node.y += swordData.remarks;
                } else {
                    this.node.y -= swordData.remarks;
                }
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
                    console.log("animState",animState);
                    let posArr = animState.curves[0].values;
                    for(let i=0;i<posArr.length;i++){
                        if(i<=1){
                            posArr[i] = cc.v2(this.node.x+20*Math.pow(-1,i),this.node.y);
                        }else{
                            posArr[i] = cc.v2(this.node.x,this.node.y+20*Math.pow(-1,i));
                        }
                    }
                    anim.on("finished",function () {
                        this.speed = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,8).speed;
                        this.isFire = true;
                    }.bind(this),this);
                }else{
                    console.log("isFire",this.isFire);
                }
                break;
            case "4":
                // 剧毒剑 中毒 持续5秒 每秒作用一次
                this.lastBloodDown(swordData.remarks,5,1);
                break;
            case "5":
                // 子母剑 TODO
                break;
            case "6":
                // 暴击剑
                break;
            case "7":
                // 奔雷剑
                // let rate6 = Math.floor(Math.random()*100);
                let rate6 = 1;
                let random6 = GameManager.getInstance().gameData.swordData[5].remarks;
                if(rate6 < random6){
                    this.unschedule(this.changeMoveState);
                    this.isMove = false;
                    this.scheduleOnce(this.changeMoveState,2);
                }
                break;
            case "8":
                // 绯云剑 TODO
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

    private changeMoveState(){
        if(!this.isMove){
            console.log("恢复移动....");
            this.isMove = true;
        }
    }

    private initAggressivity(isSplit:boolean){
        GameManager.getInstance().refreshAttack(isSplit);
        this.aggressivity = PlayerManager.getInstance().aggressivity;
    }

    private boom(){
        this.node.getComponent(cc.CircleCollider).enabled = false;
    }

    public isDead(curHp){
        console.log("isDead.........");
        if (curHp <= 0) {
            let num  =GameUtil.randomNumByRange(100,200);
            PlayerManager.getInstance().coin += num;
            console.log("num:%d,coin:%d",num,PlayerManager.getInstance().coin);
            // 分裂
            for(let i=0;i<2;i++){
                let node = cc.instantiate(this.moxiangChild);
                node.setPosition(this.node.x+this.node.width*Math.pow(-1,i)/2,this.node.y-this.node.height/2);
                this.node.getParent().addChild(node);
            }
            this.node.removeFromParent(true);
        }
    }

    onCollisionEnter(other,self){
        let swordData = GameManager.getInstance().gameData.isUse; // 所持剑的数据
        if (other.node.name == "Sword") {
            if (self.tag == 200) {
                let num = GameUtil.randomNum(100,false);
                let rate = GameManager.getInstance().gameData.swordData[5].remarks;
                if(swordData.id == 6 && num<=rate){
                    if(num <= rate){
                        let crit = ConfigManager.getInstance().getConfigById(ConstConfigContainer,1).value;
                        this.curHp -= this.aggressivity+(this.aggressivity*(crit/100));
                        console.log("暴击。。。",this.aggressivity+(this.aggressivity*(crit/100)));
                        // this.refreshBloodBar(this.blood,this.curHp,this.bloodBar);
                    }
                }else{
                    if(swordData.id == 5){
                        this.initAggressivity(other.node.getComponent("Sword").isSplit);
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
            }
        }else if(other.node.group == "enemy" && other.tag == 226 && self.tag==200){
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

    onCollisionExit(other, self) {
        if (other.node.group == "stick" || other.node.group == "well") {
            // 阻挡效果
            if (self.tag == 22 || self.tag == 24) {
                this.controlY = 1;
            } else if (self.tag == 23 || self.tag == 25) {
                this.controlX = 1;
            }
        }
    }

    onCollisionStay(other, self) {
        if (other.node.group == "stick" || other.node.group == "well") {
            if (self.tag == 22) {
                if (this.angle < 180 && this.angle >= 0) {
                    this.controlY = 0;
                } else {
                    this.controlY = 1;
                }
            } else if (self.tag == 23) {
                if ((this.angle <= 90 && this.angle > 0) || (this.angle > -90 && this.angle <= 0)) {
                    this.controlX = 0;
                } else {
                    this.controlX = 1;
                }
            } else if (self.tag == 24) {
                if ((this.angle < 0 && this.angle > -180)) {
                    this.controlY = 0;
                } else {
                    this.controlY = 1;
                }
            } else if (self.tag == 25) {
                if ((this.angle > 90 && this.angle < 180) || (this.angle < -90 && this.angle > -180)) {
                    this.controlX = 0;
                } else {
                    this.controlX = 1;
                }
            }
            // this.controlY = 0;
        }
    }

    // onLoad () {}

    start () {
        this.aggressivity = PlayerManager.getInstance().aggressivity;
        this.totalHp = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,10).hp;
        this.curHp =this.totalHp;
        this.blood.string = String(this.curHp);
        // this.schedule()
    }

    update (dt) {
        if(this.isMove){
            this.angle = this.getAngle();
            let angle = EnemyManager.getInstance().followBullet(EnemyManager.getInstance().playerNode, this.node);
            this.node.x += Math.cos(angle)*this.speed*dt*this.controlX;
            this.node.y += Math.sin(angle)*this.speed*dt*this.controlY;
        }
    }
}
