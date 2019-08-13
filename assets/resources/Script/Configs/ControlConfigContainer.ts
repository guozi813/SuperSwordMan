
import {BaseConfigContainer} from "./BaseConfigContainer";
import {ConfigConst, UIConst} from "../Data/Const";

export class ControlConfigData{
    id:string;//控剑数
    level:number;//需要角色等级
    cost:number;//升级消耗
}
export class ControlConfigContainer extends BaseConfigContainer{
    private controlConfigData:ControlConfigData[] = [];
    constructor(callback:Function,caller:any,arg:any){
        super();
        cc.loader.loadRes(ConfigConst.CONFIG_FILE_DIR+ "control",(err,object)=>{
            if(err){
                cc.log("load control.json err");
            }else{
                object = object.json;
                for (let i in object){
                    this.controlConfigData[i] = object[i];
                    this.controlConfigData[i]["id"] = i;
                }
                if(callback){
                    callback.call(caller,arg);
                }
            }
        });
    }
    public getConfigData():ControlConfigData[] {
        return this.controlConfigData;
    }
}
