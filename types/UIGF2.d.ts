/**
 * @file types/UIGF2.d.ts
 * @desc UIGF2数据结构
 * @see src/schema/uigf-2.x-schema.json
 * @since 2.0.0
 */

declare namespace UIGF2 {
    /**
     * @description UIGF2.3数据
     * @since 2.0.0
     * @interface Schema3
     * @property {Info3} info - 导出信息
     * @property {Array<GachaItem>} list - 卡池数据
     * @returns Schema3
     */
    type Schema3 = { info: Info3; list: Array<GachaItem> };

    /**
     * @description UIGF2.4数据
     * @since 2.0.0
     * @interface Schema4
     * @property {Info4} info - 导出信息
     * @property {Array<GachaItem>} list - 卡池数据
     * @returns Schema4
     */
    type Schema4 = { info: Info4; list: Array<GachaItem> };

    /**
     * @description UIGF2.3 导出信息
     * @since 2.0.0
     * @interface Info3
     * @property {string} uid - 用户ID
     * @property {string} lang - 语言
     * @property {string} export_timestamp - 导出时间戳
     * @property {string} export_time - 导出时间
     * @property {string} export_app - 导出应用
     * @property {string} export_app_version - 导出应用版本
     * @property {string} uigf_version - UIGF版本
     * @returns Info3
     */
    type Info3 = {
        uid: string;
        lang?: string;
        export_timestamp?: string;
        export_time?: string;
        export_app?: string;
        export_app_version?: string;
        uigf_version: string;
    };

    /**
     * @description UIGF2.4 导出信息
     * @since 2.0.0
     * @interface Info4
     * @extends Info3
     * @property {number} region_time_zone - 时区
     * @returns Info4
     */
    type Info4 = Info3 & { region_time_zone?: number };

    /**
     * @description UIGF2.3 卡池数据
     * @since 2.0.0
     * @interface GachaItem
     * @property {string} uigf_gacha_type - UIGF卡池类型
     * @property {string} gacha_type - 卡池类型
     * @property {string} item_id - 物品ID
     * @property {string} count - 数量
     * @property {string} time - 时间
     * @property {string} name - 名称
     * @property {string} item_type - 物品类型
     * @property {string} rank_type - 稀有度类型
     * @property {string} id - ID
     * @returns GachaItem
     */
    type GachaItem = {
        uigf_gacha_type: string;
        gacha_type: string;
        item_id: string;
        count?: string;
        time: string;
        name?: string;
        item_type?: string;
        rank_type?: string;
        id: string;
    };
}
