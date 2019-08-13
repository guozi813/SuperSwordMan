import {BaseConfigContainer} from "./BaseConfigContainer";
import {ConfigConst} from "../Data/Const";

export class SwordConfigData{
    id:number;//剑id
    name:string;//名字
    image:string;//图片
    attack:number;//初始攻击力
    attackFactor:number;//攻击力成长系数
    cost:number;//初始升级消耗
    factor:number;//升级消耗系数
    remarks:string;//备注
    skillFactor:string;//技能效果
    top:number;//峰值
    unlock:number;//解锁关卡

}
export class SwordConfigContainer extends BaseConfigContainer{
    private swordConfigData:SwordConfigData[] = [];
    constructor(callback:Function,caller:any,arg:any){
        super();
        cc.loader.loadRes(ConfigConst.CONFIG_FILE_DIR+ "sword",(err,object)=>{
            if(err){
                cc.log("load sword.json err");
            }else{
                object = object.json;
                for (let i in object){
                    this.swordConfigData[i] = object[i];
                    this.swordConfigData[i]["id"] = i;
                }
                if(callback){
                    callback.call(caller,arg);
                }
            }
        });
    }
    public getConfigData():SwordConfigData[] {
        return this.swordConfigData;
    }
}