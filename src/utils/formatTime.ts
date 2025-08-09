/**
 * @file formatTime.ts
 * @description 时间戳格式化工具
 * @since 2.0.0
 */

/**
 * 根据UID和region_time_zone格式化时间戳
 * @param timestamp 时间戳（秒或毫秒）
 * @param uid 用户ID
 * @param regionTimeZone 区域时区偏移（可选）
 * @returns 格式化后的日期时间字符串
 */
export function formatTimestamp(timestamp: number | string, uid: string, regionTimeZone?: number): string {
    let ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;

    if (ts >= 10000000000) {
        // sb 小助手
        ts = Math.floor(ts / 1000);
    }

    let timezoneOffset: number;

    if (regionTimeZone !== undefined) {
        timezoneOffset = regionTimeZone;
    } else {
        const uidStr = uid.toString();
        let serverDigit: string;

        if (uidStr.length === 9) {
            serverDigit = uidStr[0];
        } else if (uidStr.length === 10) {
            serverDigit = uidStr[1];
        } else {
            serverDigit = '1';
        }

        switch (serverDigit) {
            case '6':
                timezoneOffset = -5; // 美服
                break;
            case '7':
                timezoneOffset = 1;  // 欧服
                break;
            default:
                timezoneOffset = 8;
                break;
        }
    }

    const date = new Date(ts * 1000);
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const targetTime = new Date(utcTime + (timezoneOffset * 3600000));

    const year = targetTime.getFullYear();
    const month = String(targetTime.getMonth() + 1).padStart(2, '0');
    const day = String(targetTime.getDate()).padStart(2, '0');
    const hours = String(targetTime.getHours()).padStart(2, '0');
    const minutes = String(targetTime.getMinutes()).padStart(2, '0');
    const seconds = String(targetTime.getSeconds()).padStart(2, '0');

    const timezoneStr = timezoneOffset >= 0 ? `+${timezoneOffset}` : `${timezoneOffset}`;

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} (UTC${timezoneStr})`;
}
