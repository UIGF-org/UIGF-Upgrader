/**
 * UIGF4数据结构
 * @see src/schema/uigf-4.2-schema.json
 * @since 2.1.0
 */

declare namespace UIGF4 {
  /**
   * @description UIGF4数据结构
   * @since 2.0.0
   * @interface Schema
   * @property {Info} info - 导出信息
   * @property {Array<Item>} hk4e - 原神数据
   * @property {Array<Item>} hkrpg - 星穹铁道数据
   * @property {Array<Item>} nap - 绝区零数据
   * @returns Schema
   */
  type Schema = {
    info: Info;
    hk4e?: Array<Item<Hk4eItem>>;
    hkrpg?: Array<Item<HkrpgItem>>;
    nap?: Array<Item<NapItem>>;
    hk4e_ugc?: Array<Item<Hk4eUgcItem>>;
  };

  /**
   * @description UIGF4.1数据结构
   * @since 2.0.0
   * @interface Schema1
   */
  type Schema1 = Schema;

  /**
   * UIGF 4.2 数据结构
   * @since 2.1.0
   */
  type Schema2 = Schema;

  /**
   * @description UIGF4数据-仅原神
   * @since 2.0.0
   * @interface SchemaHk4e
   * @property {Info} info - 导出信息
   * @property {Array<Item<Hk4eItem>>} hk4e - 原神数据
   * @returns SchemaHk4e
   */
  type SchemaHk4e = { info: Info; hk4e: Array<Item<Hk4eItem>> };

  /**
   * @description UIGF4数据-仅星穹铁道
   * @since 2.0.0
   * @interface SchemaHkrpg
   * @property {Info} info - 导出信息
   * @property {Array<Item<HkrpgItem>>} hkrpg - 星穹铁道数据
   * @returns SchemaHkrpg
   */
  type SchemaHkrpg = { info: Info; hkrpg: Array<Item<HkrpgItem>> };

  /**
   * @description 导出信息
   * @since 2.0.0
   * @interface Info
   * @property {string} export_timestamp - 导出时间戳
   * @property {string} export_app - 导出应用
   * @property {string} export_app_version - 导出应用版本
   * @property {string} version - UIGF4版本
   * @property {string} lang - 语言
   * @returns Info
   */
  type Info = {
    export_timestamp: string;
    export_app: string;
    export_app_version: string;
    version: string;
    lang?: string;
  };

  type ItemType = Hk4eItem | HkrpgItem | NapItem | Hk4eUgcItem;

  /**
   * @description 导出数据
   * @since 2.0.0
   * @interface Item
   * @template T
   * @property {string | number} uid - 用户ID
   * @property {number} timezone - 时区
   * @property {string} lang - 语言
   * @property {Array<T>} list - 数据列表
   * @returns Item
   */
  type Item<T extends ItemType> = {
    uid: string | number;
    timezone: number;
    lang?: string;
    list: Array<T>;
  };

  /**
   * @description 原神卡池数据
   * @since 2.0.0
   * @interface Hk4eItem
   * @property {string} uigf_gacha_type - UIGF祈愿类型
   * @property {string} gacha_type - 祈愿类型
   * @property {string} item_id - 物品ID
   * @property {string} count - 数量
   * @property {string} time - 时间
   * @property {string} name - 名称
   * @property {string} item_type - 物品类型
   * @property {string} rank_type - 等级类型
   * @property {string} id - ID
   * @returns Hk4eItem
   */
  type Hk4eItem = {
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

  /**
   * @description 星穹铁道卡池数据
   * @since 2.0.0
   * @interface HkrpgItem
   * @property {string} gacha_id - 祈愿ID
   * @property {string} gacha_type - 祈愿类型
   * @property {string} item_id - 物品ID
   * @property {string} count - 数量
   * @property {string} time - 时间
   * @property {string} name - 名称
   * @property {string} item_type - 物品类型
   * @property {string} rank_type - 等级类型
   * @property {string} id - ID
   * @returns HkrpgItem
   */
  type HkrpgItem = {
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

  /**
   * @description 绝区零卡池数据
   * @since 2.0.0
   * @interface NapItem
   * @property {string} gacha_id - 祈愿ID
   * @property {string} gacha_type - 祈愿类型
   * @property {string} item_id - 物品ID
   * @property {string} count - 数量
   * @property {string} time - 时间
   * @property {string} name - 名称
   * @property {string} item_type - 物品类型
   * @property {string} rank_type - 等级类型
   * @property {string} id - ID
   * @returns NapItem
   */
  type NapItem = {
    gacha_id?: string;
    gacha_type: string;
    item_id: string;
    count?: string;
    time: string;
    name?: string;
    item_type?: string;
    rank_type?: string;
    id: string;
  };

  /**
   * 千星奇域卡池数据
   * @since 2.1.0
   */
  type Hk4eUgcItem = {
    /** 祈愿 ID */
    id: string;
    /** 卡池排期 ID */
    schedule_id: string;
    /** 物品类型 */
    item_type: string;
    /** 物品ID */
    item_id: string;
    /** 物品名称 */
    item_name: string;
    /** 星级 */
    rank_type: string;
    /** 时间 */
    time: string;
    /** 卡池类型 */
    op_gacha_type: string;
  }
}
