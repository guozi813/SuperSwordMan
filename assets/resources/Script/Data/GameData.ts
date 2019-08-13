import {ConfigManager} from "../Configs/ConfigManager";
import {RoleConfigContainer, RoleConfigData} from "../Configs/RoleConfigContainer";
import {ControlConfigContainer, ControlConfigData} from "../Configs/ControlConfigContainer";
import {SwordConfigContainer, SwordConfigData} from "../Configs/SwordConfigContainer";
import {SkillConfigContainer, SkillConfigData} from "../Configs/SkillConfigContainer";

export class GameData {

    public isAuthorize:boolean = false; // 微信授权

    public diamond:number = 0;
    public coin:number = 0;
    public level:number = 1;
    public num:number = 1;
    public roleData:any = [];// 角色
    public controlData:any = []; // 剑升级条件
    public skillList:any = []; // 技能配置表
    public swordData:any = []; // 总的剑数据
    public enemyData:any = {};
    public isUse:any = {
        id:1,
        name:"玄铁剑",
        image:"sword1",
        state:true,//是否解锁
        level:1,
        attack:5,
        attackFactor:0,
        cost:100,
        factor:0,
        remarks:2,
        skillFactor:0.3,
        unlockLevel:0
    };
    public skillID:number = 0; // 当前选中的技能id 默认无技能


    // 初始化
    public initData():void{
        this.diamond = 0;
        this.coin = 0;
        this.level = 1;
        this.initRoleConfig();
        this.initControlConfig();
        this.initSwordConfig();
        this.initSkillConfig();
        this.isUse = this.swordData[0];
        this.skillID = 0;
    }

    public initControlConfig():void{
        this.controlData = [];
        let arr:any = ConfigManager.getInstance().getConfig(ControlConfigContainer).getConfigData();
        arr = arr.filter((data)=>{
            return data;
        });
        for (let i = 0;i < arr.length;i++){
            let data:any = {};
            let obj:ControlConfigData = arr[i];
            data.level = obj.level;
            data.cost = obj.cost;
            data.num = obj.id;
            this.controlData.push(data);
        }
    }

    public initRoleConfig():void{
        this.roleData = {};
        let arr:any = ConfigManager.getInstance().getConfig(RoleConfigContainer).getConfigData();
        arr = arr.filter((data)=>{
            return data;
        });
        let data:any = {};
        let obj:RoleConfigData = arr[0];
        data.level = 1;
        data.cost = obj.gold;
        data.swordNum = 1;
        data.num = 1;
        data.hp = obj.hp;
        data.aggressivity = obj.aggressivity;
        this.roleData = data;
    }

    public initSwordConfig():void{
        this.swordData = [];
        let arr:any = ConfigManager.getInstance().getConfig(SwordConfigContainer).getConfigData();
        arr = arr.filter((data)=>{
            return data;
        });
        for (let i = 0;i < arr.length;i++){
            let data:any = {};
            let obj:SwordConfigData = arr[i];
            data.id = obj.id;
            data.name = obj.name;
            data.image = obj.image;
            data.attack = obj.attack;
            data.attackFactor = obj.attackFactor;
            data.cost = obj.cost;
            data.factor = obj.factor;
            data.unlockLevel = obj.unlock;
            data.level = 1;
            data.state = true;
            data.remarks = obj.remarks;
            data.skillFactor = obj.skillFactor;
            this.swordData.push(data);
        }
    }

    public initSkillConfig(){
        this.skillList = [];
        let arr:any = ConfigManager.getInstance().getConfig(SkillConfigContainer).getConfigData();
        arr = arr.filter((data)=>{
            return data;
        });
        for(let i=0;i<arr.length;i++){
            let data:any = {};
            let obj:SkillConfigData = arr[i];
            data.id = obj.id;
            data.name = obj.name;
            data.des = obj.des;
            data.image = obj.image;
            data.gold = obj.gold;
            data.goldFactor = obj.goldFactor;
            data.unlock = obj.unlock;
            data.num = obj.num;
            data.numFactor = obj.numFactor;
            data.skillExplain = obj.skillExplain;
            data.level = 1;
            this.skillList.push(data);
        }
    }
}
