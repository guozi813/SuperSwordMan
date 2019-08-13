import {GameUtil} from "../../manager/GameUtil";
import Sword from "./Sword";
import {PlayerManager} from "../../manager/PlayerManager";
import {EnemyManager} from "../../manager/EnemyManager";
import {PoolManager} from "../../manager/PoolManager";
import {AudioManager} from "../../manager/AudioManager";
import {SoundConst, UIConst} from "../../Data/Const";
import JoyStickBG from "../game/JoyStickBG";
import {TipsManager} from "../../manager/TipsManager";
import {ConfigManager} from "../../Configs/ConfigManager";
import {EnemyConfigContainer} from "../../Configs/EnemyConfigContainer";
import {GameManager} from "../../manager/GameManager";
import {ObstacleConfigContainer} from "../../Configs/ObstacleConfigContainer";
import {LevelConfigContainer} from "../../Configs/LevelConfigContainer";
import Bullet from "../Enemy/Bullet";
import {ListenerManager} from "../../manager/listen/ListenManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    @property(cc.Prefab)
    sword: cc.Prefab = null;
    @property(cc.Sprite)
    swordPlace: cc.Sprite = null;
    @property(cc.ProgressBar)
    bloodBar: cc.ProgressBar = null; // 血条
    @property
    private reduceSpeed: number = 0.3; // 减速

    public swordPool: cc.NodePool = null; // 剑节点对象池
    private _time: number = 0;
    private count: number = 0; // 玩家拥有的剑数量
    public totalHp: number = 1000; // 玩家总血量
    public _curHp: number = 0; // 玩家当前血量
    private angle: number = 0;
    private cd: number = 1;
    private tickId1 = null;
    private tickId = null;
    private levelConfig = null;
    private side: number = null;
    private lastTickTime = null;
    private times = null;
    private swordNum: number = 0;// 技能5 剑数

    private get curHp(){
        return this._curHp;
    }

    private set curHp(value){
        console.log("玩家当前血量。。。。。。。",this._curHp);
        this._curHp = value;
    }

    onLoad() {
        this.count = GameManager.getInstance().gameData.skillList[0].num;
        this.swordPool = new cc.NodePool();
        PoolManager.getInstance()._casePools["swordPool"] = this.swordPool;
        for (let i = 0; i < this.count; i++) {
            let node = cc.instantiate(this.sword);
            PoolManager.getInstance().put("swordPool", node, this.count);
        }
    }

    start() {
        this.refreshSword();
        // this.fire();
        let role = GameManager.getInstance().gameData.roleData;
        this.totalHp = role.hp;
        PlayerManager.getInstance().fireSword = 0;
        this.refreshBloodBar(this.totalHp, true);
        this.node.setPosition(0, -440);
        let swordArr = this.node.getParent().getComponents("Sword");
        for (let i = 0; i < swordArr.length; i++) {
            swordArr[i].node.setPosition(this.node.getPosition());
        }

        let level = GameManager.getInstance().gameData.level;
        this.levelConfig = ConfigManager.getInstance().getConfigById(LevelConfigContainer, level);

        let percent = GameManager.getInstance().gameData.swordData[7].remarks;
        ListenerManager.getInstance().add(UIConst.REFRESH_PLAYER_HP,this,this.refreshBloodBar.bind(this,Math.floor(this.totalHp*(percent/100)),true));
    }

    // 重置
    public refreshPlayerData() {
        this.curHp = this.totalHp;
        this.refreshBloodBar(this.totalHp, true);
        this.node.setPosition(0, -440);
        let swordArr = this.node.getParent().getComponents("Sword");
        for (let i = 0; i < swordArr.length; i++) {
            swordArr[i].node.setPosition(this.node.getPosition());
        }
        PlayerManager.getInstance().fireSword = 0;
    }


    // 御剑
    private fireSword(enemy) {
        let role = GameManager.getInstance().gameData.roleData;
        if (PlayerManager.getInstance().fireSword == this.count) {
            console.log("没有剑了。。。。。。");
            return;
        } else {
            PlayerManager.getInstance().fireSword++;
            AudioManager.getInstance().playSound("attack", false);

            if (GameManager.getInstance().gameData.skillID == 2) {
                // 技能2 三相攻击
                for (let i = 0; i < 3; i++) {
                    let sword = PoolManager.getInstance().get("swordPool", this.sword);
                    sword.parent = this.node.getParent();
                    sword.setPosition(this.node.x + 32, this.node.y);
                    sword.getComponent("Sword").fireToEnemy(i % 3, enemy);
                    sword.getComponent("Sword").isSplit = true;
                }
            } else if (GameManager.getInstance().gameData.skillID == 5) {
                // 技能5 并排发射
                this.swordNum = GameManager.getInstance().gameData.skillList[GameManager.getInstance().gameData.skillID - 1].num;
                for (let i = 0; i < this.swordNum; i++) {
                    let sword = PoolManager.getInstance().get("swordPool", this.sword);
                    sword.parent = this.node.getParent();
                    sword.setPosition(this.node.x + 32 + (i + 1) * 30, this.node.y);
                    sword.getComponent("Sword").getEnemy(enemy);
                    sword.getComponent("Sword").isSplit = true;
                }

            } else {
                let sword = PoolManager.getInstance().get("swordPool", this.sword);
                sword.parent = this.node.getParent();
                sword.setPosition(this.node.x + 32, this.node.y);
                sword.getComponent("Sword").getEnemy(enemy);
                sword.getComponent("Sword").isSplit = true;
            }
        }
    }

    // 优化了 判断是否达到攻击距离（对象池）
    private isfire() {
        let enemyArr = EnemyManager.getInstance().sortEnemyArr();
        // let size = PoolManager.getInstance().getPool("swordPool").size();
        let enemy = enemyArr[PlayerManager.getInstance().fireSword];
        if (enemy == null) {
            enemy = enemyArr[0];
        }
        let delta = EnemyManager.getInstance().getDelta(enemy);
        // if (delta < 600) {
        // PlayerManager.getInstance().recoverNum--;
        // 射剑
        this.fireSword(enemy);

        // }
    }


    // 碰撞产生时调用
    onCollisionEnter(other, self) {
        if (self.tag == 100) {
            if (other.tag == 5) {
                let num:number = 0;
                let type = other.node.getComponent("Bullet").type;
                console.log("type:",type);
                if(type == 0){
                    // 和噬魂瞳的武器发生碰撞
                    num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,3).aggressivity;
                }else if(type == 1){
                    // 和伞妖的武器发生碰撞
                    num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,7).aggressivity;
                }
                console.log("武器的攻击力。。。。",num);
                this.refreshBloodBar(num, false);
            } else if (other.node.group == "bigHP") {
                // 吃大回血药
                let percent = ConfigManager.getInstance().getConfigById(ObstacleConfigContainer, 12).healling;
                let num = this.totalHp * percent;
                this.refreshBloodBar(num, true);
            } else if (other.node.group == "smallHP") {
                // 吃小回血药
                let percent = ConfigManager.getInstance().getConfigById(ObstacleConfigContainer, 13).healling;
                let num = this.totalHp * percent;
                this.refreshBloodBar(num, true);
            } else if (other.tag == 9) {
                // 碰到炸弹的波及范围
                console.log("被炸到了。。。。。");
                let percent = ConfigManager.getInstance().getConfigById(ObstacleConfigContainer, 14).hurting;
                let num = this.totalHp * percent;
                this.refreshBloodBar(num, false);
            } else if (other.node.group == "trap") {
                // 踩到捕兽夹
                let percent = ConfigManager.getInstance().getConfigById(ObstacleConfigContainer, 10).hurting;
                let num = this.totalHp * percent;
                this.refreshBloodBar(num, false);
            } else if (other.tag == 200) {
                let num = 0;
                let id = 0;
                if(other.node.name == "RemoteEnemy"){
                    num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,3).aggressivity;
                    id = 3;
                }else if(other.node.name == "FlameTower"){
                    num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,4).aggressivity;
                    id = 4;
                }else if(other.node.name == "ChongfengEnemy"){
                    num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,5).aggressivity;
                    id = 5;
                }else if(other.node.name == "JumpEnemy"){
                    num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,6).aggressivity;
                    id = 6;
                }else if(other.node.name == "QinEnemy"){
                    num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,7).aggressivity;
                    id = 7;
                }else if(other.node.name == "MolingEnemy"){
                    num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,8).aggressivity;
                    id = 8;
                }else if(other.node.name == "GujingEnemy"){
                    num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,9).aggressivity;
                    id = 9;
                }else if(other.node.name == "MoxiangEnemy"){
                    num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,10).aggressivity;
                    id = 10;
                }else if(other.node.name == "MofoEnemy"){
                    num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,11).aggressivity;
                    id = 11;
                }else if(other.node.name == "MofoChild"){
                    num = Math.floor(ConfigManager.getInstance().getConfigById(EnemyConfigContainer,10).aggressivity/2);
                    id = 10;
                }else if(other.node.name == "MoxiangChild"){
                    num = Math.floor(ConfigManager.getInstance().getConfigById(EnemyConfigContainer,11).aggressivity/2);
                    id = 11;
                }
                console.log("id",id,"num",num);
                this.refreshBloodBar(num, false);
            } else if (other.tag == 276) {
                let num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,6).aggressivity;
                console.log("碰到跳跃怪的落地范围。。。。。。。。。",num);
                this.refreshBloodBar(num, false);
            } else if (other.node.group == "bonfire") {
                // 火堆
                console.log("烧到了。。。。。。。。。。");
                let percent = ConfigManager.getInstance().getConfigById(ObstacleConfigContainer, 9).hurting;
                let num = this.totalHp * percent;
                this.refreshBloodBar(Number(num), false);
                this.tickId = setInterval(this.refreshBloodBar.bind(this, Number(num), false), 1000);
                TipsManager.getInstance().addTickId(this.tickId);
            } else if (other.node.group == "thorns") {
                // 踩到地刺
                let percent = ConfigManager.getInstance().getConfigById(ObstacleConfigContainer, 8).hurting;
                let num = this.totalHp * percent;
                this.refreshBloodBar(Number(num), false);
                this.tickId1 = setInterval(this.refreshBloodBar.bind(this, Number(num), false), 1000);
                TipsManager.getInstance().addTickId(this.tickId);
            }else if(other.tag == 227){
                // 鼓精的攻击
                console.log("受到鼓精的攻击。。。。。。。");
                let num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,9).aggressivity;
                this.refreshBloodBar(num,false);
            }else if(other.tag == 300){
                if(other.node.getComponent("Enemy").type == 0){
                    let num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer, 1).aggressivity;
                    this.schedule(this.refreshBloodBar.bind(this,num,false),1,cc.macro.REPEAT_FOREVER,0.01);
                }else if(other.node.getComponent("Enemy").type == 1){
                    let num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer, 2).aggressivity;
                    this.schedule(this.refreshBloodBar.bind(this,num,false),2,cc.macro.REPEAT_FOREVER,0.01);
                }
            }else if(other.tag == 251){
                // 香炉怪
                let num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,4).aggressivity;
                this.refreshBloodBar(num,false);
            }else if(other.node.name == "MolingBullet"){
                // 和魔铃的武器发生碰撞
                let num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,8).aggressivity;
                this.refreshBloodBar(num,false);
            }
        }
    }

    onCollisionStay(other, self) {
        if (other.node.group == "stick" || other.node.group == "well") {
            // 阻挡效果
            if (self.tag == 112) {
                if (this.angle < 180 && this.angle >= 0) {
                    PlayerManager.getInstance().controlY = 0;
                } else {
                    PlayerManager.getInstance().controlY = 1;
                }
            } else if (self.tag == 113) {
                if ((this.angle <= 90 && this.angle > 0) || (this.angle > -90 && this.angle <= 0)) {
                    PlayerManager.getInstance().controlX = 0;
                } else {
                    PlayerManager.getInstance().controlX = 1;
                }
            } else if (self.tag == 114) {
                if ((this.angle < 0 && this.angle > -180)) {
                    PlayerManager.getInstance().controlY = 0;
                } else {
                    PlayerManager.getInstance().controlY = 1;
                }
            } else if (self.tag == 115) {
                if ((this.angle > 90 && this.angle < 180) || (this.angle < -90 && this.angle > -180)) {
                    PlayerManager.getInstance().controlX = 0;
                } else {
                    PlayerManager.getInstance().controlX = 1;
                }
            }

            // TODO 只用一个碰撞组件控制（刘音的办法）
            // if(self.tag == 101){
            //     this.stopMove(self.node,other.node);
            // }
        } else if (other.node.group == "marsh" || other.node.group == "pool") {
            // 减速效果
            PlayerManager.getInstance().reduceSpeed = this.reduceSpeed;
        } else if (other.node.group == "spring") {
            // 泉水回血
            let percent = ConfigManager.getInstance().getConfigById(ObstacleConfigContainer, 11).healling;
            let num = this.totalHp * percent;
            this.tickId1 = setInterval(this.refreshBloodBar.bind(this, Number(num), true), 1000);
        } else if (other.tag == 300) {
            // if (other.node.name == "Enemy") {
            //     if (other.node.getComponent("Enemy").type == 0) {
            //         // 和刀怪发生碰撞
            //         let num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer, 1).aggressivity;
            //         if (!this.tickId1) {
            //             this.tickId1 = setInterval(this.refreshBloodBar.bind(this, Number(num), false), 1000);
            //             TipsManager.getInstance().addTickId(this.tickId1);
            //         }
            //     } else if (other.node.getComponent("Enemy").type == 1) {
            //         // 和盾怪发生碰撞
            //         let num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer, 2).aggressivity;
            //         if (!this.tickId1) {
            //             this.tickId1 = setInterval(this.refreshBloodBar.bind(this, Number(num), false), 2000);
            //             TipsManager.getInstance().addTickId(this.tickId1);
            //         }
            //     }
            // }
        } else if (other.tag == 251) {
            // 碰到喷火塔的火焰
            console.log("碰到喷火塔.....");
            let num = ConfigManager.getInstance().getConfigById(EnemyConfigContainer, 4).aggressivity;
            if (!this.tickId1) {
                this.tickId1 = setInterval(this.refreshBloodBar.bind(this, Number(num), false), 1000);
                TipsManager.getInstance().addTickId(this.tickId1);
            }
        }
    }

    onCollisionExit(other, self) {
        if (this.tickId1) {
            clearInterval(this.tickId1);
            TipsManager.getInstance().removeTickId(this.tickId1);
            this.tickId1 = null;
        }
        if (other.node.name == "Stick" || other.node.group == "well") {
            if (self.tag == 112 || self.tag == 114) {
                PlayerManager.getInstance().controlY = 1;
            } else if (self.tag == 113 || self.tag == 115) {
                PlayerManager.getInstance().controlX = 1;
            }

            // if(self.tag == 101){
            //     if (this.side == 1 || this.side ==2) {
            //         PlayerManager.getInstance().controlY = 1;
            //     } else if (this.side == 3 || this.side == 4) {
            //         PlayerManager.getInstance().controlX = 1;
            //     }
            // }
        } else if (other.node.group == "marsh" || other.node.group == "pool") {
            PlayerManager.getInstance().reduceSpeed = 1;
        } else if (other.node.name == "Bonfire") {
            if (this.tickId) {
                clearInterval(this.tickId);
                TipsManager.getInstance().removeTickId(this.tickId);
                this.tickId = null;
            }
        }else if(other.tag == 300){
            this.unscheduleAllCallbacks();
        }
    }

    /**
     * 刷新血条
     * @param attack 伤害/回血
     * @param flag true:加血，false:扣血
     */
    public refreshBloodBar(attack: number, flag: boolean) {

        if (flag) {
            this.curHp += attack;
            if (this.curHp >= this.totalHp) {
                this.curHp = this.totalHp;
            }
        } else {
            if (this.node) {
                let anim = this.node.getComponent(cc.Animation);
                anim.play("hurtClip");
                this.curHp -= attack;
            }
        }
        // 刷新进度条
        let percent: number = this.curHp / this.totalHp;
        this.bloodBar.progress = percent;
        if (this.curHp <= 0) {
            GameManager.getInstance().addAward(1, PlayerManager.getInstance().coin);
            cc.director.loadScene("GameOverScene");
            TipsManager.getInstance().removeAllTickId();
        }
    }

    // 刷新人物视图
    private refreshView() {
        // TODO 替换人物图片
        if (this.angle == 0) {
            cc.loader.loadRes(UIConst.PLAYER_SPRITE_DIR + "right", cc.SpriteFrame, function (error, resource) {
                if (error) {
                    cc.log(error);
                    return;
                }
                if (resource) {
                    this.node.getComponent(cc.Sprite).spriteFrame = resource;
                }
            }.bind(this));
        } else if (this.angle > 0 && this.angle < 90) {
            cc.loader.loadRes(UIConst.PLAYER_SPRITE_DIR + "rightUp", cc.SpriteFrame, function (error, resource) {
                if (error) {
                    cc.log(error);
                    return;
                }
                if (resource) {
                    this.node.getComponent(cc.Sprite).spriteFrame = resource;
                }
            }.bind(this));
        } else if (this.angle == 90) {
            cc.loader.loadRes(UIConst.PLAYER_SPRITE_DIR + "up", cc.SpriteFrame, function (error, resource) {
                if (error) {
                    cc.log(error);
                    return;
                }
                if (resource) {
                    this.node.getComponent(cc.Sprite).spriteFrame = resource;
                }
            }.bind(this));
        } else if (this.angle > 90 && this.angle < 180) {
            cc.loader.loadRes(UIConst.PLAYER_SPRITE_DIR + "leftUp", cc.SpriteFrame, function (error, resource) {
                if (error) {
                    cc.log(error);
                    return;
                }
                if (resource) {
                    this.node.getComponent(cc.Sprite).spriteFrame = resource;
                }
            }.bind(this));
        } else if (this.angle == 180) {
            cc.loader.loadRes(UIConst.PLAYER_SPRITE_DIR + "left", cc.SpriteFrame, function (error, resource) {
                if (error) {
                    cc.log(error);
                    return;
                }
                if (resource) {
                    this.node.getComponent(cc.Sprite).spriteFrame = resource;
                }
            }.bind(this));
        } else if (this.angle < 0 && this.angle > -90) {
            cc.loader.loadRes(UIConst.PLAYER_SPRITE_DIR + "rightDown", cc.SpriteFrame, function (error, resource) {
                if (error) {
                    cc.log(error);
                    return;
                }
                if (resource) {
                    this.node.getComponent(cc.Sprite).spriteFrame = resource;
                }
            }.bind(this));
        } else if (this.angle == -90) {
            cc.loader.loadRes(UIConst.PLAYER_SPRITE_DIR + "down", cc.SpriteFrame, function (error, resource) {
                if (error) {
                    cc.log(error);
                    return;
                }
                if (resource) {
                    this.node.getComponent(cc.Sprite).spriteFrame = resource;
                }
            }.bind(this));
        } else if (this.angle < -90 && this.angle > -180) {
            cc.loader.loadRes(UIConst.PLAYER_SPRITE_DIR + "leftDown", cc.SpriteFrame, function (error, resource) {
                if (error) {
                    cc.log(error);
                    return;
                }
                if (resource) {
                    this.node.getComponent(cc.Sprite).spriteFrame = resource;
                }
            }.bind(this));
        } else if (this.angle == -180) {
            cc.loader.loadRes(UIConst.PLAYER_SPRITE_DIR + "left", cc.SpriteFrame, function (error, resource) {
                if (error) {
                    cc.log(error);
                    return;
                }
                if (resource) {
                    this.node.getComponent(cc.Sprite).spriteFrame = resource;
                }
            }.bind(this));
        }
    }

    private removeTick() {
        if (this.tickId1) {
            clearInterval(this.tickId1);
            TipsManager.getInstance().removeTickId(this.tickId1);
            this.tickId1 = null;
        }
    }

    /**
     * 刷新剑
     */
    public refreshSword() {
        // 切换图片
        let image = GameManager.getInstance().gameData.isUse.image;
        cc.loader.loadRes(UIConst.SWORD_IMG_DIR + image, cc.SpriteFrame, function (err, res) {
            if (err) {
                console.log("loadRes err:", err);
            }
            this.node.getChildByName("sword").getChildByName("swordPlace").getComponent(cc.Sprite).spriteFrame = res;
        }.bind(this));
    }

    // 控制某一方向的速度为0
    private stopMove(selfNode, otherNode) {
        this.side = GameUtil.getToward(selfNode, otherNode);
        console.log(this.side);
        switch (this.side) {
            case 1:
                // 上
                if (this.angle < 180 && this.angle >= 0) {
                    PlayerManager.getInstance().controlY = 0;
                } else {
                    PlayerManager.getInstance().controlY = 1;
                }
                break;
            case 4:
                // 右
                if ((this.angle <= 90 && this.angle > 0) || (this.angle > -90 && this.angle <= 0)) {
                    PlayerManager.getInstance().controlX = 0;
                } else {
                    PlayerManager.getInstance().controlX = 1;
                }
                break;
            case 2:
                // 下
                if ((this.angle < 0 && this.angle > -180)) {
                    PlayerManager.getInstance().controlY = 0;
                } else {
                    PlayerManager.getInstance().controlY = 1;
                }
                break;
            case 3:
                // 左
                if ((this.angle > 90 && this.angle < 180) || (this.angle < -90 && this.angle > -180)) {
                    PlayerManager.getInstance().controlX = 0;
                } else {
                    PlayerManager.getInstance().controlX = 1;
                }
                break;
        }
    }

    update(dt) {
        // this.removeTick();
        // this.refreshView();
        this.cd -= dt;
        this.angle = PlayerManager.getInstance().angle;
        this._time += dt;
        if (!PlayerManager.getInstance().isMove) {
            if (EnemyManager.getInstance().enemyArr.length != 0) {
                if (PlayerManager.getInstance().fireSword < this.count) {
                    if (GameManager.getInstance().gameData.skillID == 1) {
                        var nt = new Date().getTime();
                        if (!this.lastTickTime) this.lastTickTime = nt;
                        if (this.times == parseInt(String((nt - this.lastTickTime) / 300))) return;
                        this.times = parseInt(String((nt - this.lastTickTime) / 300));
                        this.isfire();
                    } else {
                        if (this._time % 10 > 1) {
                            this._time = 0;
                            this.isfire();
                        }
                    }
                }
            }
            if (PlayerManager.getInstance().fireSword == 0) {
                this.swordPlace.node.active = true;
            } else {
                this.swordPlace.node.active = false;
            }
        }
    }
}