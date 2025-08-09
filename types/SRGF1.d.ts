/**
 * @file types/SRGF1.d.ts
 * @desc SRGF1数据结构
 * @see src/schema/srgf-1.0-schema.json
 * @since 2.0.0
 */

declare namespace SRGF1 {
  /**
   * @description SRGF1数据结构
   * @since 2.0.0
   * @interface Schema
   * @property {Info} info - 导出信息
   * @property {Array<Item>} list - 祈愿数据
   * @returns Schema
   */
  type Schema = { info: Info; list: Array<GachaItem> };

  /**
   * @description 导出信息
   * @since 2.0.0
   * @interface Info
   * @property {string} uid - 用户ID
   * @property {string} lang - 语言
   * @property {number} region_time_zone - 时区
   * @property {number} export_timestamp - 导出时间戳
   * @property {string} export_app - 导出应用
   * @property {string} export_app_version - 导出应用版本
   * @property {string} srgf_version - SRGF版本
   * @returns Info
   */
  type Info = {
    uid: string;
    lang: string;
    region_time_zone: number;
    export_timestamp?: number;
    export_app?: string;
    export_app_version?: string;
    srgf_version: string;
  };

  /**
   * @description 数据项
   * @since 2.0.0
   * @interface GachaItem
   * @property {string} gacha_id - 祈愿ID
   * @property {string} gacha_type - 祈愿类型
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
    gacha_id: string;
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
