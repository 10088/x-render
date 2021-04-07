import { get, cloneDeep } from 'lodash';

// 后面三个参数都是内部递归使用的，将schema的树形结构扁平化成一层, 每个item的结构
// {
//   parent: '#',
//   schema: ...,
//   children: []
// }

// TODO: 发布后去掉
window.log1 = value => {
  console.log('%ccommon:', 'color: #00A7F7; font-weight: 500;', value);
};

window.log2 = value => {
  console.log('%cwarning:', 'color: #f50; font-weight: 500;', value);
};

window.log3 = value => {
  console.log('%csuccess:', 'color: #87d068; font-weight: 500;', value);
};

window.log4 = value => {
  console.log('%cspecial:', 'color: #722ed1; font-weight: 500;', value);
};

export function isUrl(string) {
  const protocolRE = /^(?:\w+:)?\/\/(\S+)$/;
  // const domainRE = /^[^\s\.]+\.\S{2,}$/;
  if (typeof string !== 'string') return false;
  return protocolRE.test(string);
}

export function isCheckBoxType(schema) {
  return schema && schema.type === 'boolean' && schema['widget'] !== 'switch'; // TODO: 感觉有点不准
}

// a[].b.c => a.b.c
function removeBrackets(string) {
  if (typeof string === 'string') {
    return string.replace(/\[\]/g, '');
  } else {
    return string;
  }
}

export function getParentPath(path) {
  if (typeof path === 'string') {
    const pathArr = path.split('.');
    if (pathArr.length === 1) {
      return '#';
    }
    pathArr.pop();
    return pathArr.join('.');
  }
  return '#';
}

export function getValueByPath(formData, path) {
  if (path === '#') {
    return formData;
  } else if (typeof path === 'string') {
    return get(formData, path);
  }
}

//  path: 'a.b[1].c[0]' => { id: 'a.b[].c[]'  dataIndex: [1,0] }
export function destructDataPath(path) {
  let id;
  let dataIndex;
  if (path === '#') {
    return { id: '#', dataIndex: [] };
  }
  if (typeof path !== 'string') {
    throw Error(`path ${path} is not a string!!! Something wrong here`);
  }
  const pattern = /\[[0-9]+\]/g;
  const matchList = path.match(pattern);
  if (!matchList) {
    id = path;
  } else {
    id = path.replace(pattern, '[]');
    // 这个是match下来的结果，可安全处理
    dataIndex = matchList.map(item =>
      Number(item.substring(1, item.length - 1))
    );
  }
  return { id, dataIndex };
}

// id: 'a.b[].c[]'  dataIndex: [1,0] =>  'a.b[1].c[0]'
export function getDataPath(id, dataIndex) {
  if (id === '#') {
    return id;
  }
  if (typeof id !== 'string') {
    throw Error(`id ${id} is not a string!!! Something wrong here`);
  }
  let _id = id;
  if (Array.isArray(dataIndex)) {
    // const matches = id.match(/\[\]/g) || [];
    // const count = matches.length;
    dataIndex.forEach(item => {
      _id = _id.replace(/\[\]/, `[${item}]`);
    });
  }
  return removeBrackets(_id);
}

export function isListType(schema) {
  return schema.type === 'array' && schema.items && schema.enum === undefined;
}

export function isObjType(schema) {
  return schema.type === 'object' && schema.properties;
}

// TODO: 检验是否丢进去各种schema都能兜底不会crash
export function flattenSchema(_schema = {}, name = '#', parent, result = {}) {
  const schema = clone(_schema); // TODO: 是否需要deepClone，这个花费是不是有点大
  let _name = name;
  if (!schema.$id) {
    schema.$id = _name; // 给生成的schema添加一个唯一标识，方便从schema中直接读取
  }
  const children = [];
  if (isObjType(schema)) {
    Object.entries(schema.properties).forEach(([key, value]) => {
      const _key = isListType(value) ? key + '[]' : key;
      const uniqueName = _name === '#' ? _key : _name + '.' + _key;
      children.push(uniqueName);
      flattenSchema(value, uniqueName, _name, result);
    });
    // schema.properties = {};
  }
  if (isListType(schema)) {
    Object.entries(schema.items.properties).forEach(([key, value]) => {
      const _key = isListType(value) ? key + '[]' : key;
      const uniqueName = _name === '#' ? _key : _name + '.' + _key;
      children.push(uniqueName);
      flattenSchema(value, uniqueName, _name, result);
    });
    // schema.items.properties = {};
  }

  const rules = Array.isArray(schema.rules) ? [...schema.rules] : [];
  if (['boolean', 'function', 'string'].indexOf(typeof schema.required) > -1) {
    rules.push({ required: schema.required }); // TODO: 万一内部已经用重复的required规则？
  }

  if (schema.type) {
    // Check: 为啥一定要有type？
    // TODO: 没有想好 validation 的部分
    result[_name] = { parent, schema: schema, children, rules };
  }
  return result;
}

//////////   old

function stringContains(str, text) {
  return str.indexOf(text) > -1;
}

export const isObject = a =>
  stringContains(Object.prototype.toString.call(a), 'Object');

// 克隆对象
// function clone1(data) {
//   // data = functionToString(data);
//   try {
//     return JSON.parse(JSON.stringify(data));
//   } catch (e) {
//     return data;
//   }
// }

export const clone = cloneDeep;
// export const clone = clone1;

// export const functionToString = data => {
//   let result;
//   if (isObject(data)) {
//     result = {};
//     Object.keys(data).forEach(key => {
//       result[key] = functionToString(data[key]);
//     });
//     return result;
//   } else if (typeof data === 'function') {
//     return result.toString();
//   }
//   return data;
// };

// '3' => true, 3 => true, undefined => false
export function isLooselyNumber(num) {
  if (typeof num === 'number') return true;
  if (typeof num === 'string') {
    return !Number.isNaN(Number(num));
  }
  return false;
}

export function isCssLength(str) {
  if (typeof str !== 'string') return false;
  return str.match(/^([0-9])*(%|px|rem|em)$/i);
}

// 深度对比
export function isDeepEqual(param1, param2) {
  if (param1 === undefined && param2 === undefined) return true;
  else if (param1 === undefined || param2 === undefined) return false;
  if (param1 === null && param2 === null) return true;
  else if (param1 === null || param2 === null) return false;
  else if (param1.constructor !== param2.constructor) return false;

  if (param1.constructor === Array) {
    if (param1.length !== param2.length) return false;
    for (let i = 0; i < param1.length; i++) {
      if (param1[i].constructor === Array || param1[i].constructor === Object) {
        if (!isDeepEqual(param1[i], param2[i])) return false;
      } else if (param1[i] !== param2[i]) return false;
    }
  } else if (param1.constructor === Object) {
    if (Object.keys(param1).length !== Object.keys(param2).length) return false;
    for (let i = 0; i < Object.keys(param1).length; i++) {
      const key = Object.keys(param1)[i];
      if (
        param1[key] &&
        typeof param1[key] !== 'number' &&
        (param1[key].constructor === Array ||
          param1[key].constructor === Object)
      ) {
        if (!isDeepEqual(param1[key], param2[key])) return false;
      } else if (param1[key] !== param2[key]) return false;
    }
  } else if (param1.constructor === String || param1.constructor === Number) {
    return param1 === param2;
  }
  return true;
}

// 时间组件
export function getFormat(format) {
  let dateFormat;
  switch (format) {
    case 'date':
      dateFormat = 'YYYY-MM-DD';
      break;
    case 'time':
      dateFormat = 'HH:mm:ss';
      break;
    default:
      // dateTime
      dateFormat = 'YYYY-MM-DD HH:mm:ss';
  }
  return dateFormat;
}

export function hasRepeat(list) {
  return list.find(
    (x, i, self) =>
      i !== self.findIndex(y => JSON.stringify(x) === JSON.stringify(y))
  );
}

// ----------------- schema 相关

// 合并propsSchema和UISchema。由于两者的逻辑相关性，合并为一个大schema能简化内部处理
export function combineSchema(propsSchema = {}, uiSchema = {}) {
  const propList = getChildren(propsSchema);
  const newList = propList.map(p => {
    const { name } = p;
    const { type, enum: options, properties, items } = p.schema;
    const isObj = type === 'object' && properties;
    const isArr = type === 'array' && items && !options; // enum + array 代表的多选框，没有sub
    const ui = name && uiSchema[p.name];
    if (!ui) {
      return p;
    }
    // 如果是list，递归合并items
    if (isArr) {
      const newItems = combineSchema(items, ui.items || {});
      return { ...p, schema: { ...p.schema, ...ui, items: newItems } };
    }
    // object递归合并整个schema
    if (isObj) {
      const newSchema = combineSchema(p.schema, ui);
      return { ...p, schema: newSchema };
    }
    return { ...p, schema: { ...p.schema, ...ui } };
  });

  const newObj = {};
  newList.forEach(s => {
    newObj[s.name] = s.schema;
  });

  const topLevelUi = {};
  Object.keys(uiSchema).forEach(key => {
    if (typeof key === 'string' && key.substring(0, 3) === 'ui:') {
      topLevelUi[key] = uiSchema[key];
    }
  });
  if (isEmpty(newObj)) {
    return { ...propsSchema, ...topLevelUi };
  }
  return { ...propsSchema, ...topLevelUi, properties: newObj };
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

// 获得propsSchema的children
function getChildren(schema) {
  if (!schema) return [];
  const {
    // object
    properties,
    // array
    items,
    type,
  } = schema;
  if (!properties && !items) {
    return [];
  }
  let schemaSubs = {};
  if (type === 'object') {
    schemaSubs = properties;
  }
  if (type === 'array') {
    schemaSubs = items;
  }
  return Object.keys(schemaSubs).map(name => ({
    schema: schemaSubs[name],
    name,
  }));
}

// 合并多个schema树，比如一个schema的树节点是另一个schema
export function combine() {}

// 代替eval的函数
export const parseString = string =>
  Function('"use strict";return (' + string + ')')();

// 解析函数字符串值
export const evaluateString = (string, formData, rootValue) =>
  Function(`"use strict";
    const rootValue = ${JSON.stringify(rootValue)};
    const formData = ${JSON.stringify(formData)};
    return (${string})`)();

// 判断schema的值是是否是“函数”
// JSON无法使用函数值的参数，所以使用"{{...}}"来标记为函数，也可使用@标记，不推荐。
export function isExpression(func) {
  // if (typeof func === 'function') {
  //   const funcString = func.toString();
  //   return (
  //     funcString.indexOf('formData') > -1 ||
  //     funcString.indexOf('rootValue') > -1
  //   );
  // }
  // 不再允许函数式的表达式了！
  if (typeof func !== 'string') return false;
  // 这样的pattern {{.....}}
  const pattern = /^{{(.+)}}$/;
  const reg1 = /^{{(function.+)}}$/;
  const reg2 = /^{{(.+=>.+)}}$/;
  if (
    typeof func === 'string' &&
    func.match(pattern) &&
    !func.match(reg1) &&
    !func.match(reg2)
  ) {
    return true;
  }
  return false;
}

// TODO: dataPath 是 array 的情况？
export function parseSingleExpression(func, formData = {}, dataPath) {
  const parentPath = getParentPath(dataPath);
  const parent = getValueByPath(formData, parentPath) || {};
  // if (typeof func === 'function') {
  //   try {
  //     return func(formData, parent);
  //   } catch (e) {
  //     console.error(`${dataPath}表达式解析错误`);
  //     return;
  //   }
  // } else
  if (typeof func === 'string') {
    const funcBody = func.substring(2, func.length - 2);
    const match1 = /formData.([a-zA-Z0-9.$_\[\]]+)/g;
    const match2 = /rootValue.([a-zA-Z0-9.$_\[\]]+)/g;
    const str = `
    return (${funcBody
      .replaceAll(match1, (v, m1) =>
        JSON.stringify(getValueByPath(formData, m1))
      )
      .replaceAll(match2, (v, m1) =>
        JSON.stringify(getValueByPath(parent, m1))
      )})`;
    console.log(str, parent, formData);
    try {
      return Function(str)();
    } catch (error) {
      return func;
    }
  } else return func;
}

export const schemaContainsExpression = schema => {
  return Object.keys(schema).some(key => {
    const value = schema[key];
    if (typeof value === 'string') {
      return isExpression(value);
    } else if (isObject(value)) {
      return schemaContainsExpression(value);
    }
    return false;
  });
};

// TODO: 两个优化，1. 可以通过表达式的path来判断，避免一些重复计算
export const parseAllExpression = (_schema, formData, dataPath) => {
  const schema = clone(_schema);
  Object.keys(schema).forEach(key => {
    const value = schema[key];
    if (isExpression(value)) {
      schema[key] = parseSingleExpression(value, formData, dataPath);
    }
    // 有可能叫 xxxProps
    if (typeof key === 'string' && key.toLowerCase().indexOf('props') > -1) {
      const propsObj = schema[key];
      if (isObject(propsObj)) {
        Object.keys(propsObj).forEach(k => {
          schema[key][k] = parseSingleExpression(
            propsObj[k],
            formData,
            dataPath
          );
        });
      }
    }
  });
  return schema;
};

// 判断schema中是否有属性值是函数表达式
export function isFunctionSchema(schema) {
  return Object.keys(schema).some(key => {
    if (typeof schema[key] === 'function') {
      return true;
    } else if (typeof schema[key] === 'string') {
      return isExpression(schema[key]);
    } else if (typeof schema[key] === 'object') {
      return isFunctionSchema(schema[key]);
    } else {
      return false;
    }
  });
}

// 例如当前item的id = '#/obj/input'  propName: 'ui:labelWidth' 往上一直找，直到找到第一个不是undefined的值 TODO: 看看是否ok
export const getParentProps = (propName, id, flatten) => {
  try {
    const item = flatten[id];
    if (item.schema[propName] !== undefined) return item.schema[propName];
    if (item && item.parent) {
      const parentSchema = flatten[item.parent].schema;
      if (parentSchema[propName] !== undefined) {
        return parentSchema[propName];
      } else {
        return getParentProps(propName, item.parent, flatten);
      }
    }
  } catch (error) {
    return undefined;
  }
};

export const getSaveNumber = () => {
  const searchStr = localStorage.getItem('SAVES');
  if (searchStr) {
    try {
      const saves = JSON.parse(searchStr);
      const length = saves.length;
      if (length) return length + 1;
    } catch (error) {
      return 1;
    }
  } else {
    return 1;
  }
};

export function looseJsonParse(obj) {
  return Function('"use strict";return (' + obj + ')')();
}

// 获得propsSchema的children
function getChildren2(schema) {
  if (!schema) return [];
  const {
    // object
    properties,
    // array
    items,
    type,
  } = schema;
  if (!properties && !items) {
    return [];
  }
  let schemaSubs = {};
  if (type === 'object') {
    schemaSubs = properties;
  }
  if (type === 'array') {
    schemaSubs = items.properties;
  }
  return Object.keys(schemaSubs).map(name => ({
    schema: schemaSubs[name],
    name,
  }));
}

export const oldSchemaToNew = schema => {
  if (schema && schema.propsSchema) {
    const { propsSchema, ...rest } = schema;
    return { schema: propsSchema, ...rest };
  }
  return schema;
};

export const newSchemaToOld = setting => {
  if (setting && setting.schema) {
    const { schema, ...rest } = setting;
    return { propsSchema: schema, ...rest };
  }
  return setting;
};

// from FR

export const getEnum = schema => {
  if (!schema) return undefined;
  const itemEnum = schema && schema.items && schema.items.enum;
  const schemaEnum = schema && schema.enum;
  return itemEnum ? itemEnum : schemaEnum;
};

export const getArray = (arr, defaultValue = []) => {
  if (Array.isArray(arr)) return arr;
  return defaultValue;
};

export const isEmail = value => {
  const regex = '^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$';
  if (value && new RegExp(regex).test(value)) {
    return true;
  }
  return false;
};

export function defaultGetValueFromEvent(valuePropName, ...args) {
  const event = args[0];
  if (event && event.target && valuePropName in event.target) {
    return event.target[valuePropName];
  }
  return event;
}

export const getKeyFromPath = path => {
  try {
    const keyList = path.split('.');
    const last = keyList.slice(-1)[0];
    return last;
  } catch (error) {
    console.error(error, 'getKeyFromPath');
    return '';
  }
};

// 更多的值获取
export const getDisplayValue = (value, schema) => {
  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }
  if (isObjType(schema) || isListType(schema)) {
    return '-';
  }
  if (Array.isArray(schema.enum) && Array.isArray(schema.enumNames)) {
    try {
      return schema.enumNames[schema.enum.indexOf(value)];
    } catch (error) {
      return value;
    }
  }
  return value;
};

// 去掉数组里的空元素 {a: [null, {x:1}]} => {a: [{x:1}]}
export const removeEmptyItemFromList = formData => {
  let result = {};
  if (isObject(formData)) {
    Object.keys(formData).forEach(key => {
      result[key] = removeEmptyItemFromList(formData[key]);
    });
  } else if (Array.isArray(formData)) {
    result = formData.filter(item => {
      if (item && JSON.stringify(item) !== '{}') {
        return true;
      }
      return false;
    });
  } else {
    result = formData;
  }
  return result;
};

export const getDscriptorFromSchema = ({ schema, isRequired = true }) => {
  let result = {};
  if (isObjType(schema)) {
    result.type = 'object';
    if (isRequired && schema.required) {
      result.required = true;
    }
    result.fields = {};
    Object.keys(schema.properties).forEach(key => {
      const item = schema.properties[key];
      result.fields[key] = getDscriptorFromSchema({ schema: item, isRequired });
    });
  } else if (isListType(schema)) {
    result.type = 'array';
    if (isRequired && schema.required) {
      result.required = true;
    }
    result.defaultField = { type: 'object', fields: {} }; // 目前就默认只有object类型的 TODO:
    Object.keys(schema.items.properties).forEach(key => {
      const item = schema.items.properties[key];
      result.defaultField.fields[key] = getDscriptorFromSchema({
        schema: item,
        isRequired,
      });
    });
  } else {
    // if (schema.type) {
    //   result.type = schema.type;
    // }
    const processRule = item => {
      if (schema.type) return { ...item, type: schema.type };
      if (item.pattern && typeof item.pattern === 'string') {
        return { ...item, pattern: new RegExp(item.pattern) };
      }
      return item;
    };
    const { required, ...rest } = schema;
    if (isRequired && schema.required) {
      rest.required = true;
    }
    if (schema.rules) {
      if (Array.isArray(schema.rules)) {
        const _rules = schema.rules.map(item => {
          return processRule(item);
        });
        result = [rest, ..._rules];
      } else if (isObject(schema.rules)) {
        result = [rest, processRule(schema.rules)];
      } else {
        result = rest;
      }
    } else {
      result = rest;
      // TODO1: 补齐
    }
    switch (schema.type) {
      case 'range':
        result.type = 'array';
        break;
      default:
        break;
    }
    switch (schema.format) {
      case 'email':
      case 'url':
        result.type = schema.format;
        break;
      case 'image':
        // TODO1: 补齐
        break;
      default:
        break;
    }
  }
  return result;
};

// async-validator 产出的path没法用，转一下
// "list.1.userName" => "list[1].userName"
export const formatPathFromValidator = err => {
  const errArr = err.split('.');
  return errArr
    .map(item => {
      if (isNaN(Number(item))) {
        return item;
      } else {
        return `[${item}]`;
      }
    })
    .reduce((a, b) => {
      if (b[0] === '[' || a === '') {
        return a + b;
      } else {
        return a + '.' + b;
      }
    }, '');
};

// schema = {
//   type: 'object',
//   properties: {
//     x: {
//       type: 'object',
//       properties: {
//         y: {
//           type: 'string',
//           required: true,
//         },
//       },
//     },
//   },
// };
// path = 'x.y'
// return true
export const isPathRequired = (path, schema) => {
  let pathArr = path.split('.');
  while (pathArr.length > 0) {
    let [_path, ...rest] = pathArr;
    _path = _path.split('[')[0];
    let childSchema;
    if (isObjType(schema)) {
      childSchema = schema.properties[_path];
    } else if (isListType(schema)) {
      childSchema = schema.items.properties[_path];
    }
    pathArr = rest;
    if (childSchema) {
      return isPathRequired(rest.join('.'), childSchema);
    }
    return !!schema.required; // 是否要这么干 TODO1: 意味着已经处理过了
  }
};

export const generateDataSkeleton = schema => {
  let result = {};
  if (isObjType(schema)) {
    Object.keys(schema.properties).forEach(key => {
      const childSchema = schema.properties[key];
      const childResult = generateDataSkeleton(childSchema);
      result[key] = childResult;
    });
  } else {
    result = undefined;
  }
  return result;
};

export const translateMessage = (msg, schema) => {
  if (typeof msg !== 'string') {
    return '';
  }
  if (!schema) return msg;
  msg = msg.replace('${title}', schema.title);
  msg = msg.replace('${type}', schema.format || schema.type);
  // 兼容代码
  if (schema.min) {
    msg = msg.replace('${min}', schema.min);
  }
  if (schema.max) {
    msg = msg.replace('${max}', schema.max);
  }
  if (schema.rules) {
    const minRule = schema.rules.find(r => r.min !== undefined);
    if (minRule) {
      msg = msg.replace('${min}', minRule.min);
    }
    const maxRule = schema.rules.find(r => r.max !== undefined);
    if (maxRule) {
      msg = msg.replace('${max}', maxRule.max);
    }
    const lenRule = schema.rules.find(r => r.len !== undefined);
    if (lenRule) {
      msg = msg.replace('${len}', lenRule.len);
    }
    const patternRule = schema.rules.find(r => r.pattern !== undefined);
    if (patternRule) {
      msg = msg.replace('${pattern}', patternRule.pattern);
    }
  }
  return msg;
};

// "objectName": {
//   "title": "对象",
//   "description": "这是一个对象类型",
//   "type": "object",
//   "properties": {

//   }
// }

// "listName": {
//   "title": "对象数组",
//   "description": "对象数组嵌套功能",
//   "type": "array",
//   "items": {
//     "type": "object",
//     "properties": {

//     }
//   }
// }

const changeSchema = (_schema, singleChange) => {
  let schema = clone(_schema);
  schema = singleChange(schema);
  if (isObjType(schema)) {
    let requiredKeys = [];
    if (Array.isArray(schema.required)) {
      requiredKeys = schema.required;
      delete schema.required;
    }
    Object.keys(schema.properties).forEach(key => {
      const item = schema.properties[key];
      if (requiredKeys.indexOf(key) > -1) {
        item.required = true;
      }
      schema.properties[key] = changeSchema(item, singleChange);
    });
  } else if (isListType(schema)) {
    Object.keys(schema.items.properties).forEach(key => {
      const item = schema.items.properties[key];
      schema.items.properties[key] = changeSchema(item, singleChange);
    });
  }
  return schema;
};

export const updateSchemaToNewVersion = schema => {
  return changeSchema(schema, updateSingleSchema);
};

const updateSingleSchema = schema => {
  try {
    let _schema = clone(schema);
    _schema.rules = [];
    _schema.props = _schema.props || {};
    if (_schema['ui:options']) {
      _schema.props = _schema['ui:options'];
      delete _schema['ui:options'];
    }
    if (_schema.pattern) {
      const validItem = { pattern: _schema.pattern };
      if (_schema.message && _schema.message.pattern) {
        validItem.message = _schema.message.pattern;
      }
      _schema.rules.push(validItem);
      delete _schema.pattern;
      delete _schema.message;
    }
    if (_schema.minLength) {
      _schema.rules.push({ min: _schema.minLength });
      delete _schema.minLength;
    }
    if (_schema.maxLength) {
      _schema.rules.push({ max: _schema.maxLength });
      _schema.props.maxLength = _schema.maxLength;
      delete _schema.maxLength;
    }
    if (_schema.min) {
      _schema.rules.push({ min: _schema.min });
      _schema.props.min = _schema.min;
      delete _schema.min;
    }
    if (_schema.max) {
      _schema.rules.push({ max: _schema.max });
      _schema.props.max = _schema.max;
      delete _schema.max;
    }
    if (_schema.step) {
      _schema.props.step = _schema.step;
      delete _schema.step;
    }
    if (_schema.minItems) {
      _schema.props.minItems = _schema.minItems;
      delete _schema.minItems;
    }
    if (_schema.maxItems) {
      _schema.props.maxItems = _schema.maxItems;
      delete _schema.maxItems;
    }

    //
    if (_schema['ui:className']) {
      _schema.className = _schema['ui:className'];
      delete _schema['ui:className'];
    }
    if (_schema['ui:hidden']) {
      _schema.hidden = _schema['ui:hidden'];
      delete _schema['ui:hidden'];
    }
    if (_schema['ui:readonly']) {
      _schema.readOnly = _schema['ui:readonly']; // 改成驼峰了
      delete _schema['ui:readonly'];
    }
    if (_schema['ui:disabled']) {
      _schema.disabled = _schema['ui:disabled'];
      delete _schema['ui:disabled'];
    }
    if (_schema['ui:width']) {
      _schema.width = _schema['ui:width'];
      delete _schema['ui:width'];
    }
    if (_schema['ui:labelWidth']) {
      _schema.labelWidth = _schema['ui:labelWidth'];
      delete _schema['ui:labelWidth'];
    }
    if (_schema.rules && _schema.rules.length === 0) {
      delete _schema.rules;
    }
    return _schema;
  } catch (error) {
    console.error('旧schema转换失败！', error);
    return schema;
  }
};

// 旧版schema转新版schema
export const parseExpression = (schema, formData) => {
  let schema1 = parseRootValue(schema);
  let schema2 = replaceParseValue(schema1);
};

// 检验一个string是 function（传统活箭头函数）
export const parseFunctionString = string => {
  if (typeof string !== 'string') return false;
  const reg1 = /^{{(function.+)}}$/;
  const reg2 = /^{{(.+=>.+)}}$/;
  if (string.match(reg1)) {
    return string.match(reg1)[1];
  }
  if (string.match(reg2)) {
    return string.match(reg2)[1];
  }
  return false;
};

export const completeSchemaWithTheme = (schema = {}, theme = {}) => {
  let result = {};
  if (isObject(schema)) {
    if (schema.theme && theme[schema.theme]) {
      result = { ...schema, ...theme[schema.theme] };
    }
    Object.keys(schema).forEach(key => {
      result[key] = completeSchemaWithTheme(schema[key], theme);
    });
  } else {
    result = schema;
  }
  return result;
};
