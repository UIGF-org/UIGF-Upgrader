/**
 * @file utils/upgrade.ts
 * @description 数据升级工具
 * @since 2.0.0
 */

/**
 * @description 获取导出header
 * @since 2.0.0
 * @returns {UIGF4.Info}
 */
function getExportInfo(): UIGF4.Info {
    return {
        export_app: "UigfUpgrader",
        export_app_version: "2.0.0",
        export_timestamp: Math.floor(Date.now() / 1000).toString(),
        lang: "zh-cn",
        version: "v4.0"
    };
}

/**
 * @description 升级SRGF1数据
 * @since 2.0.0
 * @param {SRGF1.Schema} data - SRGF1数据
 * @returns {UIGF4.SchemaHkrpg}
 */
function upgradeSRGF1(data: SRGF1.Schema): UIGF4.SchemaHkrpg {
    const info = getExportInfo();
    const userData: UIGF4.Item<UIGF4.HkrpgItem> = {
        uid: data.info.uid,
        timezone: data.info.region_time_zone,
        lang: "zh-cn",
        list: [],
    };
    for (const item of data.list) {
        const userDataItem: UIGF4.HkrpgItem = {
            gacha_id: item.gacha_id,
            gacha_type: item.gacha_type,
            item_id: item.item_id,
            count: item.count,
            time: item.time,
            name: item.name,
            item_type: item.item_type,
            rank_type: item.rank_type,
            id: item.id,
        };
        userData.list.push(userDataItem);
    }
    return {info: info, hkrpg: [userData]};
}

const upgradeTool = {
    srgf: upgradeSRGF1,
};

export default upgradeTool;