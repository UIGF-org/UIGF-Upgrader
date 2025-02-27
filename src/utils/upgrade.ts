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
    version: "v4.0",
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
    list: [],
  };
  for (const item of data.list) {
    userData.list.push({
      gacha_id: item.gacha_id,
      gacha_type: item.gacha_type,
      item_id: item.item_id,
      time: item.time,
      id: item.id,
    });
  }
  return { info: info, hkrpg: [userData] };
}

/**
 * @description 通过UID获取时区
 * @since 2.0.0
 * @param {string} uid - 用户ID
 * @returns {number}
 */
function getTimeZoneByUid(uid: string): number {
  if (uid.startsWith("6")) return -5;
  if (uid.startsWith("7")) return 1;
  return 8;
}

/**
 * @description 升级Uigf3
 * @since 2.0.0
 * @param {UIGF3.Schema} data - UIGF3数据
 * @returns {UIGF4.SchemaHk4e}
 */
function upgradeUigf3(data: UIGF3.Schema): UIGF4.SchemaHk4e {
  const info = getExportInfo();
  const userData: UIGF4.Item<UIGF4.Hk4eItem> = {
    uid: data.info.uid,
    timezone: data.info.region_time_zone ?? getTimeZoneByUid(data.info.uid),
    list: [],
  };
  for (const item of data.list) {
    userData.list.push({
      uigf_gacha_type: item.uigf_gacha_type,
      gacha_type: item.gacha_type,
      id: item.id,
      item_id: item.item_id,
      time: item.time,
    });
  }
  return { info: info, hk4e: [userData] };
}

/**
 * @description 升级Uigf2.3+
 * @since 2.0.0
 * @param {UIGF2.Schema3|UIGF2.Schema4} data - UIGF2.3+数据
 * @returns {UIGF4.SchemaHk4e}
 */
function upgradeUigf2(data: UIGF2.Schema3 | UIGF2.Schema4): UIGF4.SchemaHk4e {
  const info = getExportInfo();
  let timeZone = getTimeZoneByUid(data.info.uid);
  if ("region_time_zone" in data.info && data.info.region_time_zone)
    timeZone = data.info.region_time_zone;
  const userData: UIGF4.Item<UIGF4.Hk4eItem> = {
    uid: data.info.uid,
    timezone: timeZone,
    list: [],
  };
  for (const item of data.list) {
    userData.list.push({
      uigf_gacha_type: item.uigf_gacha_type,
      gacha_type: item.gacha_type,
      id: item.id,
      item_id: item.item_id,
      time: item.time,
    });
  }
  return { info: info, hk4e: [userData] };
}

// 升级工具
const upgradeTool = {
  srgf: upgradeSRGF1,
  uigf3: upgradeUigf3,
  uigf2: upgradeUigf2,
};

export default upgradeTool;
