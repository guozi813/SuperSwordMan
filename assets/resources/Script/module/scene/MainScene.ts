import {Item} from "../main/Item";
import log = cc.log;
import {LevelUp} from "../main/LevelUp";

import Game = cc.Game;
import {ConfigManager} from "../../Configs/ConfigManager";
import {TipsManager} from "../../manager/TipsManager";
import {ListenerType, UIConst} from "../../Data/Const";
import {AudioManager} from "../../manager/AudioManager";
import {GameUtil} from "../../manager/GameUtil";
import {CoinView} from "../main/CoinView";
import {InviteView} from "../main/InviteView";
import {DailyView} from "../main/DailyView";
import {VideoView} from "../main/VideoView";
import {RankView} from "../main/RankView";
import {UIManager} from "../../UI/UIManager";
import {GameManager} from "../../manager/GameManager";
import {WXPlatform} from "../../platform/WXPlatform";
import {PlaformManager} from "../../platform/PlatformManager";
import SkillView from "../skill/SkillView";
import RoleUpdateView from "../main/RoleUpdateView";
import LoadingView from "../loading/LoadingView";
import {ListenerManager} from "../../manager/listen/ListenManager";


const {ccclass, property} = cc._decorator;

@ccclass
export class MainScene extends cc.Component {

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;

    @property(cc.Label)
    count: cc.Label = null;

    @property(cc.Node)
    level: cc.Node = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    swordList: cc.Node = null;

    @property(cc.Prefab)
    swordItem: cc.Prefab = null;

    @property(cc.Prefab)
    skillItem: cc.Prefab = null;

    @property(cc.Prefab)
    levelItem: cc.Prefab = null;

    @property(cc.Label)
    swordNum: cc.Label = null;

    @property(cc.Label)
    swordName: cc.Label = null;

    @property(cc.Label)
    swordLevel: cc.Label = null;

    @property(cc.Label)
    diamond: cc.Label = null;

    @property(cc.Label)
    coin: cc.Label = null;

    @property(cc.Label)
    year: cc.Label = null;

    @property(cc.Node)
    image: cc.Node = null;

    @property(cc.Sprite)
    sword: cc.Sprite = null;

    @property(cc.Node)
    role: cc.Node = null;

    @property(cc.Node)
    roleUpdateView: cc.Node = null;

    private _button;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let action = cc.repeatForever(cc.sequence(cc.moveTo(1, -20, 40), cc.moveTo(1, -20, 20)));
        this.role.runAction(action);
        this.level.active = false;
        GameManager.getInstance().mainScene = this;
        GameManager.getInstance().levelUp = this.level;
        this.initView();
    }

    start() {

        this.count.string = "0%";
        this.progress.progress = 0;

        let self = this;
        // cc.director.preloadScene("GameScene");
        this.addEvent();
        // let str = "⁡";
        // let c = "你好";
        // console.log("============转换：",c+str+str+str);
    }

    private addEvent(): void {
        this.node.on("touchstart", this.startGame, this);
        this.node.on("touchmove", this.startGame, this);
    }

    private removeEvent(): void {
        this.node.off("touchmove", this.startGame, this);
    }

    private startGame(event): void {
        if (this.level.active) {
            this.level.active = false;
            this.swordList.active = false;
            return;
        }
        if(this.roleUpdateView.active){
            this.roleUpdateView.active = false;
            return;
        }
        UIManager.getInstance().showUI(LoadingView,function () {
            cc.director.preloadScene("GameScene",function (completedCount: number, totalCount: number, item: any) {
                ListenerManager.getInstance().trigger(ListenerType.LOADPROGRESS, completedCount, totalCount);
                if (totalCount && completedCount == totalCount) {
                    UIManager.getInstance().closeUI(LoadingView);
                    cc.director.loadScene("GameScene");
                }
            }.bind(this),null);
        }.bind(this));
    }

    /**
     * 初始化主界面场景
     */
    public initView(): void {
        AudioManager.getInstance().playBGM("open");
        let data = GameManager.getInstance().gameData;
        this.node.getChildByName("background").getChildByName("foot").active = true;
        this.swordNum.string = "等级：" + data.roleData.level;
        this.swordName.string = data.isUse.name;
        this.swordLevel.string = "LV." + data.isUse.level;
        this.diamond.string = data.diamond.toString();
        this.coin.string = GameUtil.numberShow(data.coin, 1).toString();
        this.year.string = GameManager.getInstance().gameData.level.toString();
        let image = data.isUse.image;
        cc.loader.loadRes(UIConst.SWORD_IMG_DIR + image, cc.SpriteFrame, function (err, res) {
            this.image.getComponent(cc.Sprite).spriteFrame = res;
            this.sword.spriteFrame = res;
        }.bind(this));
        // this.refreshView("");
    }

    public refreshView(image: string): void {
        let data = GameManager.getInstance().gameData;
        this.swordNum.string = "等级：" + data.roleData.level;
        this.swordName.string = data.isUse.name;
        this.swordLevel.string = "LV." + data.isUse.level;
        this.diamond.string = data.diamond.toString();
        this.coin.string = GameUtil.numberShow(data.coin, 1).toString();
        if (!image) return;
        cc.loader.loadRes(UIConst.SWORD_IMG_DIR + image, cc.SpriteFrame, function (err, res) {
            this.image.getComponent(cc.Sprite).spriteFrame = res;
            this.sword.spriteFrame = res;
        }.bind(this));
    }


    /**
     * 底部按钮
     * @param event
     * @param type  1:角色  2：剑  3：金币
     */
    btnOnHandler(event, type: any) {
        // let enemyData = ConfigManager.getInstance().getConfig(EnemyConfig).getConfigData();
        // cc.log(enemyData);
        AudioManager.getInstance().btnOnClick();
        let role = GameManager.getInstance().gameData.roleData;
        let swordList: any = GameManager.getInstance().gameData.swordData;
        let controlData: any = GameManager.getInstance().gameData.controlData;
        let skillList: any = GameManager.getInstance().gameData.skillList;
        let control = {};
        controlData.filter((data) => {
            if (data.num == role.swordNum + 1) {
                control = data;
            }
        });
        let sword = GameManager.getInstance().gameData.isUse;
        let node = this.level.children;

        type = parseInt(type);
        switch (type) {
            case 1:
                if (this.level.active) {
                    this.level.active = false;
                }
                this.swordList.active = false;
                this.roleUpdateView.active = true;

                break;
            case 2:
                if (!this.level.active) {
                    this.level.active = true;
                }
                for (let i = 0; i < node.length; i++) {
                    let item = node[i];
                    let roleItem: LevelUp = item.getComponent("LevelUp");
                    if (i == 1) {
                        item.active = false;
                    }
                    roleItem.init(2, sword);
                }
                this.swordList.active = true;
                this.roleUpdateView.active = false;
                if (this.content.childrenCount > 0) return;
                for (let i = 0; i < swordList.length; i++) {
                    let swordItem = cc.instantiate(this.swordItem);
                    let a: Item = swordItem.getComponent("Item");
                    let data = swordList[i];
                    a.init(data);
                    this.content.addChild(swordItem);
                }
                this.content.width = this.content.childrenCount * 140;
                break;
        }
        GameManager.getInstance().saveData();
    }


    btnOnClick() {
        this.node.getChildByName("change").active = true;
    }

    editBox() {
        let level = this.node.getChildByName("change").getChildByName("level").getChildByName("TEXT_LABEL").getComponent(cc.Label).string;
        let coin = this.node.getChildByName("change").getChildByName("coin").getChildByName("TEXT_LABEL").getComponent(cc.Label).string;
        this.node.getChildByName("change").active = false;
        cc.log(level, coin);
        if (!level || !coin) return;
        GameManager.getInstance().gameData.level = parseInt(level);
        GameManager.getInstance().gameData.coin = parseInt(coin);
        GameManager.getInstance().saveData();
        this.refreshView("");
    }


    rankBtn(event, className) {
        this.closeOther();
        this.node.getChildByName("WXSubContextView").active = true;

        // 上传排行榜数据
        let messageType1 = "show";
        let MAIN_MENU_NUM = "level";
        let powerNum = GameManager.getInstance().gameData.level;

        WXPlatform.postMessage(messageType1, MAIN_MENU_NUM, powerNum);
    }

    inviteBtn() {
        this.closeOther();
        UIManager.getInstance().openUI(InviteView);
    }

    coinBtn() {
        this.closeOther();
        UIManager.getInstance().openUI(CoinView);
    }

    dailyBtn() {
        this.closeOther();
        UIManager.getInstance().openUI(DailyView);
    }

    videoBtn() {
        this.closeOther();
        TipsManager.getInstance().showTip("暂未开放广告功能！");
        // TODO 接入广告
        // UIManager.getInstance().openUI(VideoView);
        // PlaformManager.getInstance().addRewardedVideoAd(function () {
        //
        // }.bind(this))
    }

    skillBtn() {
        this.closeOther();
        UIManager.getInstance().showUI(SkillView);
    }

    closeOther() {
        if (!this.level.active && !this.swordList.active && !this.roleUpdateView) return;
        this.level.active = false;
        this.swordList.active = false;
        this.roleUpdateView.active = false;
    }

    // update (dt) {}
}
