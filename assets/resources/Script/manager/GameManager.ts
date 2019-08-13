import {ConfigManager} from "../Configs/ConfigManager";
import {ListenerManager} from "./listen/ListenManager";
import {ListenerType} from "../Data/Const";
import {TipsManager} from "./TipsManager";
import {GameData} from "../Data/GameData";
import {GameUtil} from "./GameUtil";
import GameScene from "../module/scene/GameScene";
import {MainScene} from "../module/scene/MainScene";
import {WXPlatform} from "../platform/WXPlatform";
import {PlaformManager} from "../platform/PlatformManager";
import Player from "../module/player/Player";
import {PlayerManager} from "./PlayerManager";
import {UIManager} from "../UI/UIManager";
import LoadingView from "../module/loading/LoadingView";


export class GameManager {
    private static _instance: GameManager;

    public static getInstance(): GameManager {
        if (!this._instance) {
            this._instance = new GameManager();
        }
        return this._instance;
    }

    public enterGame() {
        PlaformManager.getInstance().showShareMenu(true);
        if (CC_WECHATGAME) {
            // 上传排行榜数据
            let messageType1 = "commit";
            let MAIN_MENU_NUM = "level";
            let powerNum = GameManager.getInstance().gameData.level;

            WXPlatform.postMessage(messageType1,MAIN_MENU_NUM,powerNum);
        }
        UIManager.getInstance().showUI(LoadingView,function () {
            cc.director.preloadScene("MainScene", function (completedCount: number, totalCount: number, item: any) {
                ListenerManager.getInstance().trigger(ListenerType.LOADPROGRESS, completedCount, totalCount);
                if (totalCount && completedCount == totalCount) {
                    TipsManager.getInstance().init();
                    ConfigManager.getInstance().loadAllConfig(this.loadComplete.bind(this));
                }
            }.bind(this),null);
        }.bind(this));

    }

    private loadComplete() {
        cc.log("所有配置文件加载完毕。。。");
        if (!cc.sys.localStorage.getItem("gameData")) {
            GameManager.getInstance().gameData.initData();
            console.log(GameManager.getInstance().gameData);
            // return;
        }else{
            let data = JSON.parse(cc.sys.localStorage.getItem("gameData"));
            GameManager.getInstance().gameData = data;
        }
        GameManager.getInstance().saveData();
        // console.log(data);
        UIManager.getInstance().closeUI(LoadingView);
        cc.director.loadScene("MainScene");
    }

    public gameData: GameData;

    public _haveEnemy: boolean = true;
    public gameScene: GameScene = null;
    public mainScene: MainScene = null;

    public swordNum: number = null;
    public enemyNum: number = null;
    public restNum: number = null;

    public level: number = null;//当前关卡

    public levelUp: cc.Node = null;

    public constructor() {
        this.initData()
    }

    public initData(): void {
        this.gameData = new GameData();
        this.swordNum = 1;
        this.level = 1;
    }

    public initEnemyData(): void {
        this.enemyNum = this.getMissionData().total;
        this.restNum = this.enemyNum;
    }

    /**
     * 取关卡配置
     */
    public getMissionData(): any {
        let levelId = this.gameData.level + 1000;
        // return ConfigManager.getInstance().getConfigById(MissionConfig, levelId);
    }

    public saveData(): void {
        let data = JSON.stringify(this.gameData);
        cc.sys.localStorage.setItem("gameData", data);
    }

    /**
     * 1 - 金币 2 - 钻石
     * @param id
     * @param num
     */
    public addAward(id: number, num: number): void {
        switch (id) {
            case 1:
                this.gameData.coin += num;
                break;
            case 2:
                this.gameData.diamond += num;
                break;
        }
        this.saveData();
    }

    public refreshAttack(isSplit:boolean){
        let role = GameManager.getInstance().gameData.roleData;
        let isUse = GameManager.getInstance().gameData.isUse;
        if(!isSplit){
            PlayerManager.getInstance().aggressivity = role.aggressivity+isUse.attack*(isUse.remarks/100);
        }else{
            PlayerManager.getInstance().aggressivity = role.aggressivity+isUse.attack;
        }
    }

}