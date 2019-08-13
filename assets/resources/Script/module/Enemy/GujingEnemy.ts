/**
 * creator: yisha
 */
import EnemyBaseClass from "./EnemyBaseClass";
import {ConfigManager} from "../../Configs/ConfigManager";
import {EnemyConfigContainer} from "../../Configs/EnemyConfigContainer";
import {GameManager} from "../../manager/GameManager";
import {PlayerManager} from "../../manager/PlayerManager";
import {GameUtil} from "../../manager/GameUtil";
import {AudioManager} from "../../manager/AudioManager";
import {EnemyManager} from "../../manager/EnemyManager";
import {PoolManager} from "../../manager/PoolManager";
import ConstConfigContainer from "../../Configs/ConstConfigContainer";


const {ccclass, property} = cc._decorator;

@ccclass
export default class GujingEnemy extends EnemyBaseClass {
    @property
    private speed:number = 20;
    @property(cc.Label)
    blood:cc.Label = null;
    @property(cc.ProgressBar)
    bloodBar:cc.ProgressBar = null;


    private isFire:boolean = true;
    private isMove:boolean = true;
    private aggressivity:number= 0;
    private speedX:number = 0;
    private speedY:number = 0;
    private controlX:number = 1; // 控制x方向
    private controlY:number = 1; // 控制y方向
    private deadTag:boolean = false;
    private angle:number = 0;
    private type:number = 1;
    private attackCollider:cc.CircleCollider = null; // 攻击范围的碰撞组件
    private  _curHp : number = 0; // 怪当前血量

    public get curHp(){
        return this._curHp
    }

    public set curHp(value){
        console.log("当前血量",value);
        this._curHp = value
    }

    // onLoad () {}

    start () {
        this.totalHp = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,9).hp;
        this.curHp = this.totalHp;
        this.blood.string = String(this.curHp);
        this.schedule(this.changeMoveState,1);
        this.schedule(this.moveType,3,cc.macro.REPEAT_FOREVER,0.01);
        let colliderArr = this.node.getComponents(cc.CircleCollider);
        for(let i=0;i<colliderArr.length;i++){
            if(colliderArr[i].tag == 227){
                this.attackCollider = colliderArr[i];
            }
        }
        this.aggressivity = PlayerManager.getInstance().aggressivity;
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
                // 子母剑
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
                // 绯云剑
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

        if(this.attackCollider.enabled){
            this.attackCollider.enabled = false;
        }
    }

    private initAggressivity(isSplit:boolean){
        GameManager.getInstance().refreshAttack(isSplit);
        this.aggressivity = PlayerManager.getInstance().aggressivity;
    }

    private boom(){
        this.node.getComponent(cc.CircleCollider).enabled = false;
    }

    private moveType(){
        if(this.type==1){
            console.log("跟随玩家");
            this.type = 2;
            // 跟随玩家
            // this.angle = EnemyManager.getInstance().followBullet(EnemyManager.getInstance().playerNode,this.node);
        }else if(this.type == 2){
            // 随机移动
            console.log("随机移动");
            this.getDirection();
            this.type = 1;
        }
        this.isMove = false;
        this.attackCollider.enabled= true;
    }

    private getDirection(){
        let direction = GameUtil.randomNum(4,false);
        switch(direction) {
            case 0:
                this.speedX = this.speed;
                this.speedY = 0;
                break;
            case 2:
                this.speedX = -this.speed;
                this.speedY = 0;
                break;
            case 3:
                this.speedX = 0;
                this.speedY = -this.speed;
                break;
            case 4:
                this.speedX = 0;
                this.speedY = this.speed;
                break;
        }
    }


    onCollisionEnter(other,self){
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
                    this.curHp -= this.aggressivity;
                    if(this.curHp<0){
                        this.curHp = 0;
                    }
                }
                this.playAttackedAnim();
                this.refreshBloodBar(this.blood,this.curHp,this.bloodBar);
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
        }else if (other.node.group == "stick" || other.node.group == "well"|| other.node.group == "wall") {
            if (self.tag == 22 || self.tag == 24) {
                this.speedY = -this.speedY;
                this.controlX = 0;
            } else if (self.tag == 23 || self.tag == 25) {
                this.speedX = -this.speedX;
                this.controlY = 0;
            }
        }
    }

    onCollisionExit(other, self) {
        if (other.node.group == "stick" || other.node.group == "well"|| other.node.group == "wall") {
            if (self.tag == 22 || self.tag == 24) {
                this.controlX = 1;
            } else if (self.tag == 23 || self.tag == 25) {
                this.controlY = 1;
            }
        }
    }

    onCollisionStay(other, self) {
    }

    update (dt) {
        if(this.isMove){
            if(this.type == 2){
                this.angle = EnemyManager.getInstance().followBullet(EnemyManager.getInstance().playerNode,this.node);
                this.node.x += Math.cos(this.angle)*this.speed*dt*this.controlX;
                this.node.y += Math.sin(this.angle)*this.speed*dt*this.controlY;
            }else if(this.type == 1){
                this.node.x +=this.speedX*dt;
                this.node.y +=this.speedY*dt;
            }
        }

    }
}
