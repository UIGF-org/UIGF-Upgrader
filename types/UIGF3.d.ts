/**
 * @file types/UIGF3.d.ts
 * @desc UIGF3数据结构
 * @see src/schema/uigf-3.0-schema.json
 * @since 2.0.0
 */

declare namespace UIGF3 {
  /**
   * @description UIGF3数据
   * @since 2.0.0
   * @interface Schema
   * @property {Info} info - 导出信息
   * @property {Array<GachaItem>} list - 卡池数据
   * @returns Schema
   */
  type Schema = { info: Info; list: Array<GachaItem> };

  /**
   * @description 导出信息
   * @since 2.0.0
   * @interface Info
   * @property {string} uid - 用户ID
   * @property {string} lang - 语言
   * @property {string} export_timestamp - 导出时间戳
   * @property {string} export_app - 导出应用
   * @property {string} export_time - 导出时间
   * @property {string} export_app_version - 导出应用版本
   * @property {string} uigf_version - UIGF版本
   * @property {number} region_time_zone - 时区
   * @returns Info
   */
  type Info = {
    uid: string;
    lang?: string;
    export_timestamp?: string;
    export_app?: string;
    export_time?: string;
    export_app_version?: string;
    uigf_version: string;
    region_time_zone?: number;
  };

  /**
   * @description 卡池数据
   * @since 2.0.0
   * @interface GachaItem
   * @property {string} uigf_gacha_type - 卡池类型
   * @property {string} gacha_type - 卡池类型
   * @property {string} item_id - 物品ID
   * @property {string} count - 数量
   * @property {string} time - 时间
   * @property {string} name - 名称
   * @property {string} item_type - 物品类型
   * @property {string} rank_type - 稀有度
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
