/**
 * @file utils/parseJson.ts
 * @description 解析json文件
 * @since 2.0.0
 */

import srgf1Schema from "../schema/srgf-1.0-schema.json" with { type: "json" };
import uigf2Schema2 from "../schema/uigf-2.2-schema.json" with { type: "json" };
import uigf2Schema3 from "../schema/uigf-2.3-schema.json" with { type: "json" };
import uigf2Schema4 from "../schema/uigf-2.4-schema.json" with { type: "json" };
import uigf3Schema from "../schema/uigf-3.0-schema.json" with { type: "json" };
import uigf4Schema from "../schema/uigf-4.0-schema.json" with { type: "json" };
import Ajv, { type ErrorObject } from "ajv";

enum JsonParseType {
  Srgf,
  Uigf22,
  Uigf23,
  Uigf24,
  Uigf3,
  Uigf4,
  Unknown,
  Error,
  Invalid,
}

type JsonParseRes =
  | { type: JsonParseType.Srgf; data: SRGF1.Schema }
  | { type: JsonParseType.Uigf22; data: UIGF2.Schema2 }
  | { type: JsonParseType.Uigf23; data: UIGF2.Schema3 }
  | { type: JsonParseType.Uigf24; data: UIGF2.Schema4 }
  | { type: JsonParseType.Uigf3; data: UIGF3.Schema }
  | { type: JsonParseType.Uigf4; data: UIGF4.Schema }
  | { type: JsonParseType.Unknown; data: string }
  | { type: JsonParseType.Error; data: string }
  | { type: JsonParseType.Invalid; data: Array<ErrorObject> };

/**
 * @description 解析json文件
 * @since 2.0.0
 * @param {string} jsonStr - json字符串
 * @returns {JsonParseRes} 解析结果
 */
function parseJson(jsonStr: string): JsonParseRes {
  try {
    const json = JSON.parse(jsonStr);
    if (!("info" in json) || typeof json.info !== "object") {
      return { type: JsonParseType.Unknown, data: "Unknown schema" };
    }
    if ("srgf_version" in json.info) {
      return validateJson(jsonStr, JsonParseType.Srgf);
    }
    if ("uigf_version" in json.info) {
      switch (json.info.uigf_version) {
        case "v2.2":
          return validateJson(jsonStr, JsonParseType.Uigf22);
        case "v2.3":
          return validateJson(jsonStr, JsonParseType.Uigf23);
        case "v2.4":
          return validateJson(jsonStr, JsonParseType.Uigf24);
        case "v3.0":
          return validateJson(jsonStr, JsonParseType.Uigf3);
        default:
          return { type: JsonParseType.Unknown, data: "Unknown schema" };
      }
    }
    if ("version" in json.info) {
      if (json.info.version === "v4.0") {
        return validateJson(jsonStr, JsonParseType.Uigf4);
      }
    }
    return { type: JsonParseType.Unknown, data: "Unknown schema" };
  } catch (error) {
    return { type: JsonParseType.Error, data: JSON.stringify(error) };
  }
}

/**
 * @description ajv验证json
 * @since 2.0.0
 * @param {string} jsonStr - json字符串
 * @param {JsonParseType} type - json类型
 * @returns {JsonParseRes} 解析结果
 */
function validateJson(jsonStr: string, type: JsonParseType): JsonParseRes {
  const schema = (() => {
    switch (type) {
      case JsonParseType.Srgf:
        return srgf1Schema;
      case JsonParseType.Uigf22:
        return uigf2Schema2;
      case JsonParseType.Uigf23:
        return uigf2Schema3;
      case JsonParseType.Uigf24:
        return uigf2Schema4;
      case JsonParseType.Uigf3:
        return uigf3Schema;
      case JsonParseType.Uigf4:
        return uigf4Schema;
      default:
        throw new Error("Unknown schema");
    }
  })();
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(JSON.parse(jsonStr));
  if (!valid) {
    return { type: JsonParseType.Invalid, data: validate.errors ?? [] };
  }
  return { type, data: JSON.parse(jsonStr) };
}

export default parseJson;
