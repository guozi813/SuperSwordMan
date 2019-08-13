import Player from "./Player";
import {GameUtil} from "../../manager/GameUtil";
import {PlayerManager} from "../../manager/PlayerManager";
import {EnemyManager} from "../../manager/EnemyManager";
import {PoolManager} from "../../manager/PoolManager";
import {UIConst} from "../../Data/Const";
import {GameManager} from "../../manager/GameManager";
import {ListenerManager} from "../../manager/listen/ListenManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class Sword extends cc.Component {

    @property
    speed: number = 0;
    @property
    distance: number = 250;

    @property(cc.Prefab)
    sword: cc.Prefab = null;

    private angle: any;
    private degree: any; // 朝向目标时偏向的角度
    private isBack: boolean = false; // 飞回玩家身边
    private playerNode: cc.Node = null;
    private swordPool: cc.NodePool = null;
    private swordNum: number = 0;
    private fireTimes: number = 0; // 与怪碰撞反射次数
    private bounceTimes: number = 0; // 与障碍物碰撞反弹次数
    private _move: boolean = true; // 剑是否飞行
    private speedX: number = 0;
    private speedY: number = 0;
    private enemy: cc.Node = null;
    private isSplit: boolean = true;

    onLoad() {
        this.playerNode = this.node.getParent().getChildByName("player");
        let player: Player = this.playerNode.getComponent("Player");
        this.swordPool = player.swordPool;
        this.swordNum = GameManager.getInstance().gameData.roleData.swordNum;
        this.initUI();
    }

    // 碰撞产生时调用
    onCollisionEnter(other, self) {
        if (other.node.group == "sword") {
            if (self.tag == 1) {
                console.log("回到位置上");
                this.isBack = false;
                // PlayerManager.getInstance().recoverNum++;
                PlayerManager.getInstance().fireSword--;
                if (PlayerManager.getInstance().fireSword < 0) {
                    PlayerManager.getInstance().fireSword = 0;
                }
                // self.node.active = false;
                // self.node.setPosition(this.node.getPosition());
                self.node.angle = this.degree;
                this.speed = 0;
                PoolManager.getInstance().put("swordPool", self.node, this.swordNum);
            }
        } else if (other.node.group == "wall" || other.tag == 10) {
            // tag为10的节点没有穿透效果
            if (GameManager.getInstance().gameData.skillID == 4) {
                // 技能4 反射
                if (this.bounceTimes != 0) {
                    this.bounceTimes--;
                    if (this.bounceTimes <= 0) {
                        this.bounceTimes = 0;
                    }
                    let side = GameUtil.getToward(this.node, other.node);
                    this.rotateView(side);
                } else {
                    PlayerManager.getInstance().fireSword--;
                    if (PlayerManager.getInstance().fireSword < 0) {
                        PlayerManager.getInstance().fireSword = 0;
                    }
                    PoolManager.getInstance().put("swordPool", this.node, this.swordNum);
                }
            } else {
                PlayerManager.getInstance().fireSword--;
                if (PlayerManager.getInstance().fireSword < 0) {
                    PlayerManager.getInstance().fireSword = 0;
                }
                PoolManager.getInstance().put("swordPool", this.node, this.swordNum);
            }
        } else if (other.tag == 200 || other.tag == 300) {
            if (GameManager.getInstance().gameData.skillID == 3) {
                // 技能3 弹射
                if (this.fireTimes != 0) {
                    this.fireTimes--;
                    if (this.fireTimes <= 0) {
                        this.fireTimes = 0;
                    }
                    let newEnemy = EnemyManager.getInstance().getNearestEnemy(this.enemy);
                    if (newEnemy) {
                        this.getEnemy(newEnemy);
                    }
                } else {
                    PlayerManager.getInstance().fireSword--;
                    if (PlayerManager.getInstance().fireSword < 0) {
                        PlayerManager.getInstance().fireSword = 0;
                    }
                    PoolManager.getInstance().put("swordPool", this.node, this.swordNum);
                }
            } else {
                PlayerManager.getInstance().fireSword--;
                if (PlayerManager.getInstance().fireSword < 0) {
                    PlayerManager.getInstance().fireSword = 0;
                }
                PoolManager.getInstance().put("swordPool", this.node, 20);
            }
            this.swordSkill(other.node);
        }
    }

    private swordSkill(otherNode) {
        if (GameManager.getInstance().gameData.isUse.id == 5 && this.isSplit) {
            // 子母剑
            for (let i = 0; i < 2; i++) {
                let side = GameUtil.getToward(this.node, otherNode);
                let sword = PoolManager.getInstance().get("swordPool", this.sword);
                switch (side) {
                    case 1:
                        // 上
                        sword.setPosition(this.node.x + 32 * Math.pow(-1, i + 1), this.node.y +9);
                        break;
                    case 2:
                        // 下
                        sword.setPosition(this.node.x + 32 * Math.pow(-1, i + 1), this.node.y - 9);
                        break;
                    case 3:
                        // 左
                        sword.setPosition(this.node.x-9 , this.node.y + 32* Math.pow(-1, i + 1));
                        break;
                    case 4:
                        // 右
                        sword.setPosition(this.node.x + 9 , this.node.y - 32* Math.pow(-1, i + 1));
                        break;
                }
                let Sword: Sword = sword.getComponent("Sword");
                sword.angle = this.angle + 45 * Math.pow(-1, i + 1);
                Sword.lookAtEnemy(this.enemy, i + 1);
                Sword.isSplit = false;
                Sword.speedX = 500 * Math.cos(this.angle + 45 * Math.pow(-1, i + 1));
                Sword.speedY = 500 * Math.sin(this.angle + 45 * Math.pow(-1, i + 1));
                sword.parent = cc.find("Canvas").getChildByName("playerNode");
            }
        } else if (GameManager.getInstance().gameData.isUse.id == 8) {
            // 绯云剑
            ListenerManager.getInstance().trigger(UIConst.REFRESH_PLAYER_HP);
        }
    }


    start() {
        // this.initUI();
    }

    protected onEnable(): void {
        let swordList = GameManager.getInstance().gameData.skillList;
        this.fireTimes = swordList[2].num;
        this.bounceTimes = swordList[3].num;
    }

    private initUI() {
        cc.loader.loadRes(UIConst.SWORD_IMG_DIR + GameManager.getInstance().gameData.isUse.image, cc.SpriteFrame, function (err, res) {
            if (err) {
                console.log("loadRes err:", err);
            }
            this.node.getComponent(cc.Sprite).spriteFrame = res;
        }.bind(this));
    }

    public getEnemy(enemy) {
        if (enemy != null) {
            this.angle = EnemyManager.getInstance().followBullet(enemy, this.node);
            this.lookAtEnemy(enemy, 0);
        }
        this.speed = 500;
        this.speedX = this.speed * Math.cos(this.angle);
        this.speedY = this.speed * Math.sin(this.angle);
        this.enemy = enemy;
    }

    private lookAtEnemy(enemy, type) {
        this.degree = EnemyManager.getInstance().lookAtObj(enemy, this.node);
        let num = 0;
        if (type == 0) {
            num = 0;
        } else if (type == 1) {
            num = -45
        } else if (type == 2) {
            num = 45
        }
        this.node.angle = -this.degree + num;

    }

    public fireToEnemy(type, enemy) {
        let num = 0;
        if (type == 0) {
            num = 0;
            this.lookAtEnemy(enemy, type);
        } else if (type == 1) {
            num = -0.75;
            this.lookAtEnemy(enemy, type);
        } else if (type == 2) {
            this.lookAtEnemy(enemy, type);
            num = 0.75;
        }
        this.angle = EnemyManager.getInstance().followBullet(enemy, this.node) + num;
        this.speed = 500;
        this.speedX = this.speed * Math.cos(this.angle);
        this.speedY = this.speed * Math.sin(this.angle);
        this.enemy = enemy;
    }


    /**
     * 上-1，下-2，左-3，右-4
     */
    private rotateView(side) {
        if (!this._move) return;
        let angle = this.node.angle / 180 * Math.PI;
        let point = GameUtil.getCollisionPoint(this.node, angle, 35);
        switch (side) {
            case 1:
                this.speedY = -this.speedY;
                this.node.angle = 180 - this.node.angle;
                break;
            case 2:
                this.speedY = -this.speedY;
                this.node.angle = 180 - this.node.angle;
                break;
            case 3:
                this.speedX = -this.speedX;
                this.node.angle = -this.node.angle;
                break;
            case 4:
                this.speedX = -this.speedX;
                this.node.angle = -this.node.angle;
                break;
        }

        this.node.x = point.x;
        this.node.y = point.y;
    }

    update(dt) {
        this.distance -= dt * 20;
        if (EnemyManager.getInstance().enemyArr.length != 0) {
            if (this._move) {
                this.node.x += this.speedX * dt;
                this.node.y += this.speedY * dt;
            }
        } else {
            PoolManager.getInstance().put("swordPool", this.node, 20);
        }
    }
}
