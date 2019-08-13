import Enemy from "../module/Enemy/Enemy";
import {GameUtil} from "./GameUtil";
import Rect = cc.Rect;
import {PoolManager} from "./PoolManager";
import {ConfigManager} from "../Configs/ConfigManager";
import {LevelConfigContainer} from "../Configs/LevelConfigContainer";
import {GameManager} from "./GameManager";

export class EnemyManager {

    private static _instance: EnemyManager;

    public static getInstance(): EnemyManager {
        if (!this._instance) {
            this._instance = new EnemyManager();
        }
        return this._instance;
    }

    public enemyArr: any[] = []; // 敌人数组
    public playerNode: any = null; // 人物节点
    public index: number = null; // 距离最近的敌人在数组中的索引
    public direction: string = ""; // 方向
    public randomPosArr = []; // 障碍物和怪物的随机坐标数组
    public enemyTypeArr = []; // 每关怪物种类数组

    // 生成怪
    public createEnemyByConfig(enemy, remoteEnemy, chongfengEnemy, jumpEnemy, qinEnemy, flameTower, molingEnemy, mofoEnemy,gujingEnemy,moxiangEnemy) {
        let level = GameManager.getInstance().gameData.level;
        let levelConfig = ConfigManager.getInstance().getConfigById(LevelConfigContainer, level);
        // let num = 1;
        let num = levelConfig.enemyNum;
        // console.log("enemy num:",num);
        this.enemyTypeArr = [];
        while (this.enemyTypeArr.length < levelConfig.enemyTypeNum) {
            let random = GameUtil.randomNum(10, false);
            if (this.enemyTypeArr.indexOf(random) <= -1) {
                this.enemyTypeArr.push(random);
            }
        }
        console.log("enemyTypeArr:", this.enemyTypeArr);
        for (let j = 0; j < num; j++) {
            // let random = 0; // TODO 测试
            let index = GameUtil.randomNum(levelConfig.enemyTypeNum, false);
            let random = this.enemyTypeArr[index];
            switch (random) {
                case 0:
                    // 灯笼鬼或勾魂幺鸡
                    let node = cc.instantiate(enemy);
                    let pos = this.createPosPlus();
                    node.setPosition(pos.x * node.width, pos.y * node.width);
                    let enemyScript: Enemy = node.getComponent("Enemy");
                    let randomType = GameUtil.randomNum(2, false); // 随机类型
                    cc.director.getScene().getChildByName("Canvas").getChildByName("enemyNode").addChild(node);
                    enemyScript.initData(randomType);
                    break;
                case 1:
                    // 噬魂瞳
                    let remoteEnemyNode = cc.instantiate(remoteEnemy);
                    let remoteEnemyPos = this.createPosPlus();
                    remoteEnemyNode.setPosition(remoteEnemyPos.x * remoteEnemyNode.width, remoteEnemyPos.y * remoteEnemyNode.width);
                    cc.director.getScene().getChildByName("Canvas").getChildByName("enemyNode").addChild(remoteEnemyNode);
                    break;
                case 2:
                    // 僵尸娃娃
                    let chongfengEnemyNode = cc.instantiate(chongfengEnemy);
                    let chongfengEnemyPos = this.createPosPlus();
                    chongfengEnemyNode.setPosition(chongfengEnemyPos.x * chongfengEnemyNode.width, chongfengEnemyPos.y * chongfengEnemyNode.width);
                    cc.director.getScene().getChildByName("Canvas").getChildByName("enemyNode").addChild(chongfengEnemyNode);
                    break;
                case 3:
                    // 金蟾老祖
                    let jumpEnemyNode = cc.instantiate(jumpEnemy);
                    let jumpEnemyPos = this.createPosPlus();
                    jumpEnemyNode.setPosition(jumpEnemyPos.x * jumpEnemyNode.width, jumpEnemyPos.y * jumpEnemyNode.width);
                    cc.director.getScene().getChildByName("Canvas").getChildByName("enemyNode").addChild(jumpEnemyNode);
                    break;
                case 4:
                    // 伞妖
                    let qinEnemyNode = cc.instantiate(qinEnemy);
                    let qinEnemyPos = this.createPosPlus();
                    qinEnemyNode.setPosition(qinEnemyPos.x * qinEnemyNode.width, qinEnemyPos.y * qinEnemyNode.width);
                    cc.director.getScene().getChildByName("Canvas").getChildByName("enemyNode").addChild(qinEnemyNode);
                    break;
                case 5:
                    // 香炉怪
                    let flameTowerNode = cc.instantiate(flameTower);
                    let flameTowerPos = this.createPosPlus();
                    flameTowerNode.setPosition(flameTowerPos.x * 80, flameTowerPos.y * 80);
                    cc.director.getScene().getChildByName("Canvas").getChildByName("enemyNode").addChild(flameTowerNode);
                    break;
                case 6:
                    // 魔铃
                    let molingNode = cc.instantiate(molingEnemy);
                    let molingPos = this.createPosPlus();
                    molingNode.setPosition(molingPos.x * molingNode.width, molingPos.y * molingNode.width);
                    cc.find("Canvas").getChildByName("enemyNode").addChild(molingNode);
                    break;
                case 7:
                    // 魔佛怪
                    let mofoNode = cc.instantiate(mofoEnemy);
                    let mofoPos = this.createPosPlus();
                    mofoNode.setPosition(mofoPos.x * mofoNode.width, mofoPos.y * mofoNode.width);
                    cc.find("Canvas").getChildByName("enemyNode").addChild(mofoNode);
                    let script = mofoNode.getComponent("MofoEnemy");
                    script.generation = 0;
                    break;
                case 8:
                    // 鼓精
                    let gujingNode = cc.instantiate(gujingEnemy);
                    let gujingPos = this.createPosPlus();
                    gujingNode.setPosition(gujingPos.x * gujingNode.width, gujingPos.y * gujingNode.width);
                    cc.find("Canvas").getChildByName("enemyNode").addChild(gujingNode);
                    break;
                case 9:
                    // 魔像怪
                    let moxiangNode = cc.instantiate(moxiangEnemy);
                    let moxiangPos = this.createPosPlus();
                    moxiangNode.setPosition(moxiangPos.x * moxiangNode.width, moxiangPos.y * moxiangNode.width);
                    cc.find("Canvas").getChildByName("enemyNode").addChild(moxiangNode);
                    break;
            }
        }
    }

    public createPosPlus() {
        let randomX = GameUtil.randomNum(4, true);
        let randomY = GameUtil.randomNum(4, true);
        if (this.randomPosArr.length != 0) {
            for (let i = 0; i < this.randomPosArr.length; i++) {
                let obj = this.randomPosArr[i];
                if (obj.equals(cc.v2(randomX, randomY))) {
                    return this.createPosPlus();
                } else continue;
            }
        }
        this.randomPosArr.push(cc.v2(randomX, randomY));
        return cc.v2(randomX, randomY)
    }


    /**
     * 跟踪子弹与目标节点的角度 angle
     * @param targetNode
     * @param bulletNode
     */
    public followBullet(targetNode, bulletNode: cc.Node): number {

        let x1 = targetNode.x;
        let x2 = bulletNode.x;
        let y1 = targetNode.y;
        let y2 = bulletNode.y;
        let deltaX = x1 - x2;
        let deltaY = y1 - y2;

        if (deltaX == 0) {
            if (y1 >= y2) {
                deltaX = 0.0000001
            } else {
                deltaX = -0.0000001
            }
        }

        if (deltaY == 0) {
            if (x1 >= x2) {
                deltaY = 0.0000001
            } else {
                deltaY = -0.0000001
            }
        }
        let angle: number = 0;
        let π = 3.1415926;
        if (deltaX > 0 && deltaY > 0) {
            angle = Math.atan(Math.abs(deltaY / deltaX));           // 第一项限
            this.direction = "eastNorth"
        } else if (deltaX < 0 && deltaY > 0) {
            angle = π - Math.atan(Math.abs(deltaY / deltaX));          // 第二项限
            this.direction = "westNorth"
        } else if (deltaX < 0 && deltaY < 0) {
            angle = π + Math.atan(Math.abs(deltaY / deltaX));          // 第三项限
            this.direction = "westSouth"
        } else {
            angle = 2 * π - Math.atan(Math.abs(deltaY / deltaX));         // 第四项限
            this.direction = "eastSouth"
        }
        return angle;
    }

    // 离当前怪最近的另外一个怪
    public getNearestEnemy(selfNode: cc.Node) {
        let enemyArr = [];
        for (let i = 0; i < this.enemyArr.length; i++) {
            let obj = this.enemyArr[i];
            enemyArr.push(obj);
        }
        enemyArr.shift();
        console.log("-------------------------", enemyArr);
        let deltaX: number = 0; // enemy与player的x差
        let deltaY: number = 0; // enemy与player的y差
        let deltaArr: number[] = [];
        let playerX = selfNode.x; // player的x坐标
        let playerY = selfNode.y; // player的y坐标
        for (let i = 0; i < enemyArr.length; i++) {
            let obj: Enemy = enemyArr[i];
            // @ts-ignore
            if (obj.active != false) {
                // @ts-ignore
                deltaX = Math.abs(obj.getPosition().x - playerX);
                // @ts-ignore
                deltaY = Math.abs(obj.getPosition().y - playerY);
                let delta = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
                deltaArr.push(delta);
            }
        }
        // 取值最小的索引
        this.index = deltaArr.indexOf(Math.min.apply(Math, deltaArr));
        return enemyArr[this.index];
    }

    // 计算enemy与player的距离
    public getDelta(enemy) {
        let deltaX: number = 0; // enemy与player的x差
        let deltaY: number = 0; // enemy与player的y差
        let playerX = this.playerNode.x; // player的x坐标
        let playerY = this.playerNode.y; // player的y坐标 deltaX = Math.abs(obj.getPosition().x-playerX);
        deltaY = Math.abs(enemy.getPosition().y - playerY);
        deltaX = Math.abs(enemy.getPosition().x - playerX);
        let delta = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        return delta;
    }

    // 按离玩家的位置远近排序
    public sortEnemyArr() {
        for (let i = 0; i < this.enemyArr.length; i++) {
            for (let j = 0; j < this.enemyArr.length - i - 1; j++) {
                let delta1 = this.getDelta(this.enemyArr[j]);
                let delta2 = this.getDelta(this.enemyArr[j + 1]);
                if (delta1 > delta2) {
                    let node = this.enemyArr[j];
                    this.enemyArr[j] = this.enemyArr[j + 1];
                    this.enemyArr[j + 1] = node;
                }
            }
        }
        return this.enemyArr;
    }

    // 朝向目标
    public lookAtObj(target, selfNode) {
        //计算出朝向
        let dx = target.x - selfNode.x;
        let dy = target.y - selfNode.y;
        let dir = cc.v2(dx, dy);

        //根据朝向计算出夹角弧度
        let angle = dir.signAngle(cc.v2(0, 1));

        //将弧度转换为欧拉角
        let degree = angle / Math.PI * 180;

        //赋值给节点
        // selfNode.angle = -degree;
        return degree;
    }
}

window["EnemyManager"] = EnemyManager.getInstance();