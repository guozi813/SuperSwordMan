/**
 * creator: yisha
 */
import {BaseConfigContainer, ConfigContainerClass} from "./BaseConfigContainer";
import {EnemyConfigContainer} from "./EnemyConfigContainer";
import {ObstacleConfigContainer} from "./ObstacleConfigContainer";
import {LevelConfigContainer} from "./LevelConfigContainer";
import {RoleConfigContainer} from "./RoleConfigContainer";
import {ControlConfigContainer} from "./ControlConfigContainer";
import {SwordConfigContainer} from "./SwordConfigContainer";
import {SkillConfigContainer, SkillConfigData} from "./SkillConfigContainer";
import ConstConfigContainer from "./ConstConfigContainer";


export class ConfigManager
{
    private static instance: ConfigManager;

    private configContainerList: BaseConfigContainer[] = [];
    private curLoadedCount: number = 0;

    public static getInstance(): ConfigManager
    {
        if(this.instance == null)
        {
            this.instance = new ConfigManager();
        }
        return this.instance;
    }

    // 加载配置表
    public loadAllConfig(callback?: Function): void {
        this.loadConfig(EnemyConfigContainer, this.callback, callback);
        this.loadConfig(ObstacleConfigContainer, this.callback, callback);
        this.loadConfig(LevelConfigContainer, this.callback, callback);
        this.loadConfig(RoleConfigContainer, this.callback, callback);
        this.loadConfig(ControlConfigContainer,this.callback,callback);
        this.loadConfig(SwordConfigContainer,this.callback,callback);
        this.loadConfig(SkillConfigContainer,this.callback,callback);
        this.loadConfig(ConstConfigContainer,this.callback,callback);
    }

    public getConfig<T extends BaseConfigContainer>(configClass: ConfigContainerClass<T>): BaseConfigContainer
    {
        for(let i = 0; i < this.configContainerList.length; ++i)
        {
            if(this.configContainerList[i].tag == configClass)
            {
                return this.configContainerList[i];
            }
        }
        return null;
    }

    public getConfigById(configClass:ConfigContainerClass<BaseConfigContainer>,id:number):any{
        let config:BaseConfigContainer = this.getConfig(configClass);
        if (config) {
            return config.getConfigData()[id];
        }
    }

    public loadConfig<T extends BaseConfigContainer>(configClass: ConfigContainerClass<T>, callback: Function, arg: any)
    {
        let config = new configClass(callback, this, arg);
        config.tag = configClass;
        this.configContainerList.push(config);
    }

    private callback(callback: Function)
    {
        this.curLoadedCount += 1;
        if(this.configContainerList.length == this.curLoadedCount)
        {
            if(callback)
            {
                callback();
            }
        }
    }
}
window["ConfigManager "]= ConfigManager.getInstance();
