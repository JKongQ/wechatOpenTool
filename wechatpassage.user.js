// ==UserScript==
// @name         WeChatPassage 公众号转载工具
// @namespace    wechatpassage
// @version      0.1.0
// @description  粘贴公众号文章链接 → 还原原始排版 → 可视化编辑 → 一键生成公众号草稿。手机 Safari 单机可用，无需服务器。
// @author       WeChatPassage
// @match        https://mp.weixin.qq.com/*
// @run-at       document-idle
// @inject-into  page
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  'use strict';

/* ---------- src/core/errors.js ---------- */
/**
 * 微信公众平台接口错误码 → 可操作的中文提示。
 *
 * 错误码表移植自 Wechatsync 的 `packages/@wechatsync/drivers/src/weixin.js`
 * (https://github.com/wechatsync/Wechatsync, MIT License)。
 * 仅做了数据结构化与文案归一，未改变语义。
 */

/** @type {Record<number, string>} */
const WX_ERROR_MESSAGES = {
  '-8': '请输入验证码',
  '-6': '请输入验证码',
  '-99': '内容超出字数，请调整',
  '-5': '服务错误，请注意备份内容后重试',
  '-2': '参数错误，请注意备份内容后重试',
  '-1': '系统错误，请注意备份内容后重试',
  '-206': '目前服务负荷过大，请稍后重试',
  412: '图文中含非法外链',
  10801: '标题不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑',
  10802: '作者不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑',
  10803: '敏感链接，请重新添加',
  10804: '摘要不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑',
  10806: '正文不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑',
  10807: '内容不能违反公众平台协议、相关法律法规和政策，请重新编辑',
  10808: '推荐语不能有违反公众平台协议、相关法律法规和政策的内容，请重新编辑',
  13002: '该广告卡片已过期，删除后才可保存成功',
  13003: '已有文章插入过该广告卡片，一个广告卡片仅可插入一篇文章',
  13004: '该广告卡片与图文消息位置不一致',
  10700: '接收预览消息的微信尚未关注公众号，请先扫码关注',
  10701: '用户已被加入黑名单，无法向其发送消息',
  10703: '对方关闭了接收消息',
  10704: '该素材已被删除',
  10705: '该素材已被删除',
  153007: '原创声明不成功：文章内容未达到声明原创的要求',
  153008: '原创声明不成功：文章内容未达到声明原创的要求',
  153009: '原创声明不成功：文章内容未达到声明原创的要求',
  153010: '原创声明不成功：文章内容未达到声明原创的要求',
  153012: '请设置转载类型',
  153013: '文章内含有投票，不能设置为开放转载',
  153014: '文章内含有卡券，不能设置为开放转载',
  153015: '文章内含有小程序链接，不能设置为开放转载',
  153016: '文章内含有小程序链接，不能设置为开放转载',
  153017: '文章内含有小程序卡片，不能设置为开放转载',
  153018: '文章内含有商品，不能设置为开放转载',
  153019: '文章内含有广告卡片，不能设置为开放转载',
  153020: '文章内含有广告卡片，不能设置为开放转载',
  153021: '文章内含有广告卡片，不能设置为开放转载',
  153101: '含有原文已删除的转载文章，请删除后重试',
  153200: '无权限声明原创，取消声明后重试',
  1530503: '请勿添加其他公众号的主页链接',
  1530504: '请勿添加其他公众号的主页链接',
  1530510: '链接已失效，请在手机端重新复制链接',
  1530511: '链接已失效，请在手机端重新复制链接',
  15801: '所编辑的内容可能含有违反平台协议或法律法规的内容',
  15802: '所编辑的内容可能含有违反平台协议或法律法规的内容',
  15803: '所编辑的内容可能含有违反平台协议或法律法规的内容',
  15804: '所编辑的内容可能含有违反平台协议或法律法规的内容',
  15805: '所编辑的内容可能含有违反平台协议或法律法规的内容',
  15806: '所编辑的内容可能含有违反平台协议或法律法规的内容',
  200002: '参数错误，请注意备份内容后重试',
  200003: '登录态超时，请重新登录',
  200041: '此素材有文章存在违规，无法编辑',
  200042: '图文中包含的小程序素材不能多于 50 个、小程序帐号不能多于 10 个',
  200043: '图文中包含没有关联的小程序，请删除后再保存',
  220001: '「素材管理」中的存储数量已达到上限，请删除后再操作',
  220002: '你的图片库已达到存储上限，请进行清理',
  320001: '该素材已被删除，无法保存',
  353004: '不支持添加商品，请删除后重试',
  420001: '封面图不支持 GIF，请更换',
  442001: '帐号新建/编辑素材能力已被封禁，暂不可使用',
  62752: '可能含有具备安全风险的链接，请检查',
  64501: '你输入的帐号不存在，请重新输入',
  64502: '你输入的微信号不存在，请重新输入',
  64503: '接收预览消息的微信尚未关注公众号，请先扫码关注',
  64504: '保存图文消息发送错误，请稍后再试',
  64505: '发送预览失败，请稍后再试',
  64506: '保存失败，链接不合法',
  64507: '内容不能包含外部链接，请输入 http://或 https:// 开头的公众号相关链接',
  64508: '查看原文链接可能具备安全风险，请检查',
  64509: '正文中不能包含超过 3 个视频，请重新编辑正文后再保存',
  64510: '内容不能包含音频，请调整',
  64511: '内容不能包含多个音频，请调整',
  64512: '文章中音频错误，请使用音频添加按钮重新添加',
  64513: '请从正文中选择封面，再尝试保存',
  64515: '当前素材非最新内容，请重新打开并编辑',
  64518: '正文只能包含一个投票',
  64550: '请勿插入不合法的图文消息链接',
  64551: '请检查图文消息中的微视链接后重试',
  64552: '请检查阅读原文中的链接后重试',
  64553: '请不要在图文消息中插入超过 5 张卡券，请删减后重试',
  64554: '在当前情况下不允许在图文消息中插入卡券，请删除卡券后重试',
  64555: '请检查图文消息卡片跳转的链接后重试',
  64556: '卡券不属于该公众号，请删除后重试',
  64557: '卡券无效，请删除后重试',
  64558: '请勿插入图文消息临时链接，链接会在短期失效',
  64559: '请勿插入未群发的图文消息链接',
  64560: '请勿插入历史图文消息页链接',
  64561: '请勿插入 mp.weixin.qq.com 域名下的非图文消息链接',
  64562: '请勿插入非 mp.weixin.qq.com 域名的链接',
  64601: '一篇文章只能插入一个广告卡片',
  64602: '尚未开通文中广告位，但文章中有广告',
  64603: '文中广告前不足 300 字',
  64604: '文中广告后不足 300 字',
  64605: '文中不能同时插入文中广告和互选广告',
  64702: '标题超出 64 字长度限制',
  64703: '摘要超出 120 字长度限制',
  64704: '推荐语超出 300 字长度限制',
  64705: '内容超出字数，请调整',
  64707: '赞赏账户授权失效或者状态异常',
  64708: '推荐语超出 140 字长度限制',
  65101: '图文模版数量已达到上限，请删除后再操作',
};

/** 已明确需要「重新登录 / 无法继续」的错误码。 */
const WX_SESSION_ERROR_CODES = new Set([-6, -8, 200003]);

/** 与「正文/外链」相关的错误码，命中时应提示用户检查外链降级。 */
const WX_CONTENT_ERROR_CODES = new Set([412, 64506, 64507, 64561, 64562]);

/**
 * 把任意微信响应翻译成可展示的错误信息。
 * @param {any} response 微信接口返回体，或带 ret/base_resp 的对象
 * @returns {{code:number|string|null, message:string, isSessionError:boolean, isContentError:boolean}}
 */
function formatWxResponse(response) {
  let code = null;
  if (response && typeof response === 'object') {
    if (response.ret !== undefined && response.ret !== null && response.ret !== '') {
      code = Number(response.ret);
    } else if (response.errcode !== undefined && response.errcode !== null) {
      code = Number(response.errcode);
    } else if (response.base_resp && response.base_resp.ret !== undefined) {
      code = Number(response.base_resp.ret);
    }
  }

  const known = code !== null && Object.prototype.hasOwnProperty.call(WX_ERROR_MESSAGES, code);
  let message;
  if (known) {
    message = WX_ERROR_MESSAGES[code];
  } else if (response && response.base_resp && response.base_resp.err_msg) {
    message = String(response.base_resp.err_msg);
  } else if (response && response.errmsg) {
    message = String(response.errmsg);
  } else if (code === 0) {
    message = 'ok';
  } else {
    message = '系统繁忙，请稍后重试';
  }

  return {
    code,
    message,
    isSessionError: code !== null && WX_SESSION_ERROR_CODES.has(code),
    isContentError: code !== null && WX_CONTENT_ERROR_CODES.has(code),
  };
}

/**
 * 判断响应是否代表成功（ret / errcode 均为 0 或缺省）。
 * @param {any} response
 */
function isWxResponseOk(response) {
  if (!response || typeof response !== 'object') return false;
  if (typeof response.ret === 'number') return response.ret === 0;
  if (typeof response.errcode === 'number') return response.errcode === 0;
  if (response.base_resp && typeof response.base_resp.ret === 'number') {
    return response.base_resp.ret === 0;
  }
  return false;
}

/* ---------- src/core/url.js ---------- */
/**
 * 链接解析与规范化。
 *
 * 只接受 mp.weixin.qq.com，因为本工具依赖「与微信同源」这一前提：
 * 只有同源请求才能读文章、才能带上公众号登录态去建草稿。
 */

const WECHAT_HOSTS = new Set(['mp.weixin.qq.com']);

/** 去除零宽字符、首尾空白与成对引号。 */
function cleanInput(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\u200b-\u200f\ufeff]/g, '')
    .trim()
    .replace(/^[<"'\u201c\u2018]+/, '')
    .replace(/[>"'\u201d\u2019]+$/, '')
    .trim();
}

/**
 * 从文本中抽出一个 http(s) 链接（支持用户直接粘贴整段分享文案）。
 * @param {string} raw
 * @returns {string}
 */
function extractFirstUrl(raw) {
  const text = cleanInput(raw);
  const match = text.match(/https?:\/\/[^\s"'<>\u4e00-\u9fa5]+/);
  return match ? match[0] : text;
}

/**
 * @param {string} url
 * @returns {boolean}
 */
function isWechatHost(url) {
  try {
    return WECHAT_HOSTS.has(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * 解析并规范化公众号文章链接。
 *
 * 支持形态：
 *  - https://mp.weixin.qq.com/s/<token>
 *  - https://mp.weixin.qq.com/s?__biz=..&mid=..&idx=..&sn=..
 *  - 上述形态附带 #rd / #wechat_redirect / 各种跟踪参数
 *
 * @param {string} raw 用户输入
 * @returns {{ok:boolean, canonicalUrl:string, form:'s-token'|'biz-mid-idx'|'unknown', articleId:string, error:string|null}}
 */
function parseArticleUrl(raw) {
  const candidate = extractFirstUrl(raw);
  const fail = (error) => ({ ok: false, canonicalUrl: '', form: 'unknown', articleId: '', error });

  if (!candidate) return fail('请粘贴公众号文章链接');

  let url;
  try {
    url = new URL(candidate);
  } catch {
    return fail('链接格式不正确，请粘贴完整的 https://mp.weixin.qq.com/s/... 链接');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return fail('只支持 http/https 链接');
  }
  if (!isWechatHost(url.href)) {
    return fail('只支持 mp.weixin.qq.com 的文章链接（本工具依赖与微信同源，无法处理其他站点）');
  }

  const path = url.pathname.replace(/\/+$/, '');
  const params = url.searchParams;

  // 形态一：/s/<token>
  const tokenMatch = path.match(/^\/s\/([A-Za-z0-9_-]{6,})$/);
  if (tokenMatch) {
    return {
      ok: true,
      canonicalUrl: `https://mp.weixin.qq.com/s/${tokenMatch[1]}`,
      form: 's-token',
      articleId: tokenMatch[1],
      error: null,
    };
  }

  // 形态二：/s?__biz=..&mid=..&idx=..
  if (path === '/s' || path === '/s/' || path === '') {
    const biz = params.get('__biz');
    const mid = params.get('mid');
    const idx = params.get('idx') || '1';
    const sn = params.get('sn');
    if (biz && mid) {
      const kept = new URLSearchParams();
      kept.set('__biz', biz);
      kept.set('mid', mid);
      kept.set('idx', idx);
      if (sn) kept.set('sn', sn);
      return {
        ok: true,
        canonicalUrl: `https://mp.weixin.qq.com/s?${kept.toString()}`,
        form: 'biz-mid-idx',
        articleId: sn || `${mid}-${idx}`,
        error: null,
      };
    }
    return fail('链接缺少文章标识（缺少 __biz / mid 参数），请在微信里点「复制链接」后重试');
  }

  return fail('这不是一篇公众号文章链接，请使用 mp.weixin.qq.com/s/... 形式的链接');
}

/**
 * 生成用于界面展示的短链接。
 * @param {string} url
 * @param {number} [max]
 */
function shortenUrl(url, max = 48) {
  if (!url) return '';
  if (url.length <= max) return url;
  return `${url.slice(0, max - 1)}…`;
}

/* ---------- src/core/images.js ---------- */
/**
 * 图片识别、收集与改写。
 *
 * 公众号文章使用懒加载：真实地址在 `data-src`，`src` 往往是 1x1 占位图。
 */

const WECHAT_CDN_HOSTS = new Set(['mmbiz.qpic.cn', 'mmbiz.qlogo.cn', 'wx.qlogo.cn']);

/** 是否为微信自有 CDN（这类图片可以直接在公众号正文中渲染）。 */
function isWechatCdn(src) {
  if (!src) return false;
  try {
    const host = new URL(src, 'https://mp.weixin.qq.com/').hostname.toLowerCase();
    return WECHAT_CDN_HOSTS.has(host) || host.endsWith('.qpic.cn') || host.endsWith('.qlogo.cn');
  } catch {
    return false;
  }
}

/**
 * 解析图片的真实地址：优先 `data-src`（懒加载）。
 * @param {HTMLImageElement} img
 * @returns {string}
 */
function resolveImageSrc(img) {
  if (!img || !img.getAttribute) return '';
  const dataSrc = img.getAttribute('data-src') || img.getAttribute('data-original') || '';
  const src = img.getAttribute('src') || '';
  const pick = dataSrc.trim() || src.trim();
  return pick;
}

/**
 * @param {string} src
 * @returns {'wechat-cdn'|'remote'|'data'|'relative'|'empty'}
 */
function classifyImage(src) {
  const value = (src || '').trim();
  if (!value) return 'empty';
  if (value.startsWith('data:')) return 'data';
  if (/^https?:\/\//i.test(value)) {
    return isWechatCdn(value) ? 'wechat-cdn' : 'remote';
  }
  if (value.startsWith('//')) {
    return isWechatCdn(`https:${value}`) ? 'wechat-cdn' : 'remote';
  }
  return 'relative';
}

/**
 * 收集正文中的所有图片。
 * @param {ParentNode} root
 * @returns {Array<{index:number, el:Element, src:string, kind:string}>}
 */
function collectImages(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return [];
  const nodes = Array.from(root.querySelectorAll('img'));
  return nodes.map((el, index) => {
    const src = resolveImageSrc(el);
    return { index, el, src, kind: classifyImage(src) };
  });
}

/**
 * 把 `data-src` 提升为 `src`，并清掉懒加载残留属性与占位样式。
 * @param {Element} img
 */
function promoteLazyImage(img) {
  if (!img || !img.getAttribute) return;
  const real = resolveImageSrc(img);
  if (real) img.setAttribute('src', real);
  img.removeAttribute('data-src');
  img.removeAttribute('data-original');
  img.removeAttribute('data-type');
  img.removeAttribute('data-w');
  img.removeAttribute('data-ratio');
  img.removeAttribute('data-fail');
  img.removeAttribute('_src');
}

/**
 * 按索引回写图片地址。
 * @param {Array<{el:Element}>} images collectImages 的结果
 * @param {Map<number,string>|Record<number,string>} srcMap
 */
function replaceImageSrc(images, srcMap) {
  const get = srcMap instanceof Map ? (i) => srcMap.get(i) : (i) => srcMap[i];
  let count = 0;
  images.forEach((item) => {
    const next = get(item.index);
    if (typeof next === 'string' && next) {
      item.el.setAttribute('src', next);
      item.src = next;
      item.kind = classifyImage(next);
      count += 1;
    }
  });
  return count;
}

/* ---------- src/core/store.js ---------- */
/**
 * 草稿存储。
 *
 * 生产环境用 localStorage（同源 mp.weixin.qq.com，无需任何 GM API）；
 * 测试环境传入内存实现。`storage` 只需实现 getItem/setItem/removeItem。
 */

const DEFAULT_PREFIX = 'wechatpassage:draft:';
const INDEX_KEY = 'wechatpassage:draft-index';

/**
 * 内存存储实现，便于单测与降级。
 * @returns {{getItem(k:string):string|null,setItem(k:string,v:string):void,removeItem(k:string):void}}
 */
function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

/**
 * 取得一个可用的 storage（localStorage 不可用时降级到内存）。
 */
function resolveStorage() {
  try {
    if (typeof localStorage !== 'undefined') {
      const probe = 'wechatpassage:probe';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return localStorage;
    }
  } catch {
    /* 隐私模式等场景下会抛错，降级到内存 */
  }
  return createMemoryStorage();
}

function safeParse(text, fallback) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

/**
 * @param {Storage|{getItem:Function,setItem:Function,removeItem:Function}} storage
 * @param {string} [prefix]
 */
function createDraftStore(storage, prefix = DEFAULT_PREFIX) {
  const readIndex = () => {
    const list = safeParse(storage.getItem(INDEX_KEY), []);
    return Array.isArray(list) ? list : [];
  };

  const writeIndex = (list) => {
    storage.setItem(INDEX_KEY, JSON.stringify(list.slice(0, 50)));
  };

  return {
    /** @returns {Array<{id:string,title:string,updatedAt:number,sourceUrl:string}>} */
    list() {
      return readIndex().sort((a, b) => b.updatedAt - a.updatedAt);
    },

    /** @param {string} id */
    get(id) {
      return safeParse(storage.getItem(prefix + id), null);
    },

    /**
     * @param {object} draft 必须包含 id
     * @returns {object} 实际保存的草稿
     */
    save(draft) {
      if (!draft || !draft.id) throw new Error('draft.id 必填');
      const record = { ...draft, updatedAt: Date.now() };
      try {
        storage.setItem(prefix + record.id, JSON.stringify(record));
      } catch (err) {
        // 多为配额超限（localStorage 通常 5MB，图文草稿可能很大）
        const e = new Error('本地存储空间不足，已保存的草稿可能过大，请先删除旧草稿');
        e.cause = err;
        throw e;
      }
      const index = readIndex().filter((item) => item.id !== record.id);
      index.unshift({
        id: record.id,
        title: record.title || '未命名草稿',
        updatedAt: record.updatedAt,
        sourceUrl: record.sourceUrl || '',
      });
      writeIndex(index);
      return record;
    },

    /** @param {string} id */
    remove(id) {
      storage.removeItem(prefix + id);
      writeIndex(readIndex().filter((item) => item.id !== id));
    },
  };
}

/** 生成草稿 id（不依赖 crypto，iOS Safari 可用）。 */
function newDraftId() {
  return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/* ---------- src/core/inline-style.js ---------- */
/**
 * 把文章自带的 `<style>` 规则内联到元素上。
 *
 * 为什么要自研而不直接复用 juice 之类的通用内联库：
 *   1) 公众号样式里 `::before` / `::after` 被大量用来画分隔线与序号，通用内联库
 *      只会跳过它们，导致排版塌掉；这里必须把它们「实体化」成真实节点。
 *   2) 公众号正文最终只能带行内样式，需要按微信白名单裁剪，通用库不做这件事。
 * 通用部分（选择器匹配 / 特异性排序）只占很小篇幅。
 */

const DYNAMIC_PSEUDO = /:(hover|active|focus|focus-within|focus-visible|visited|target|checked|disabled|enabled|link|any-link|placeholder-shown|autofill)\b/i;
const PSEUDO_ELEMENT = /::?(before|after|first-line|first-letter|marker|selection|placeholder)\b/i;

/** 去掉 CSS 注释。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * 解析一段 CSS 文本为规则数组（不依赖 DOM）。
 * @param {string} css
 * @returns {{rules: Array<{selector:string, declarations:string, order:number}>, skipped: Array<{atRule:string, reason:string}>}}
 */
function parseCssRules(css) {
  const rules = [];
  const skipped = [];
  const source = stripComments(css || '');
  let i = 0;
  let order = 0;

  while (i < source.length) {
    // 找到下一个 { 或 ;
    const braceAt = source.indexOf('{', i);
    if (braceAt === -1) break;
    const semiAt = source.indexOf(';', i);
    if (semiAt !== -1 && semiAt < braceAt) {
      // 形如 @import ...; / @charset ...;
      i = semiAt + 1;
      continue;
    }

    const prelude = source.slice(i, braceAt).trim();

    // 找到与之匹配的 }
    let depth = 1;
    let j = braceAt + 1;
    while (j < source.length && depth > 0) {
      const ch = source[j];
      if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
      if (depth === 0) break;
      j += 1;
    }
    const body = source.slice(braceAt + 1, j);

    if (prelude.startsWith('@')) {
      const atRule = prelude.split(/\s+/)[0].toLowerCase();
      if (atRule === '@media' || atRule === '@supports' || atRule === '@container') {
        // 媒体查询无法内联，但里面的基础规则在默认视口下通常仍然适用：
        // 这里选择「丢弃并告警」，避免把小屏样式错误地烤进正文。
        skipped.push({ atRule, reason: `${atRule} 条件样式无法内联，已丢弃` });
      } else if (atRule === '@keyframes' || atRule === '@-webkit-keyframes') {
        skipped.push({ atRule, reason: '动画关键帧无法内联，已丢弃' });
      }
      // @font-face / @import / @charset 静默忽略
      i = j + 1;
      continue;
    }

    if (prelude) {
      rules.push({ selector: prelude, declarations: body, order: order++ });
    }
    i = j + 1;
  }

  return { rules, skipped };
}

/**
 * 计算 CSS 选择器特异性 [id, class/attr/pseudo-class, element/pseudo-element]。
 * @param {string} selector
 * @returns {[number, number, number]}
 */
function computeSpecificity(selector) {
  const withoutPseudoElements = selector.replace(/::[a-z-]+/gi, ' ');
  const ids = (withoutPseudoElements.match(/#[\w-]+/g) || []).length;
  const classes =
    (withoutPseudoElements.match(/\.[\w-]+/g) || []).length +
    (withoutPseudoElements.match(/\[[^\]]+\]/g) || []).length +
    (withoutPseudoElements.match(/:(?!:)[a-z-]+/gi) || []).length;
  const elements =
    (withoutPseudoElements
      .replace(/#[\w-]+/g, ' ')
      .replace(/\.[\w-]+/g, ' ')
      .replace(/\[[^\]]+\]/g, ' ')
      .replace(/:(?!:)[a-z-]+(\([^)]*\))?/gi, ' ')
      .replace(/[>+~*,]/g, ' ')
      .trim()
      .match(/[a-z][\w-]*/gi) || []).length;
  return [ids, classes, elements];
}

function compareSpecificity(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if (a.spec[i] !== b.spec[i]) return a.spec[i] - b.spec[i];
  }
  return a.order - b.order;
}

/**
 * 解析声明块为 [{prop, value, important}]。
 * @param {string} declarations
 */
function parseDeclarations(declarations) {
  const out = [];
  (declarations || '').split(';').forEach((chunk) => {
    const idx = chunk.indexOf(':');
    if (idx === -1) return;
    const prop = chunk.slice(0, idx).trim().toLowerCase();
    let value = chunk.slice(idx + 1).trim();
    if (!prop || !value) return;
    let important = false;
    if (/!important$/i.test(value)) {
      important = true;
      value = value.replace(/!important$/i, '').trim();
    }
    out.push({ prop, value, important });
  });
  return out;
}

/** 从 `content` 声明里解出实际文本。 */
function decodeContentValue(value) {
  if (!value) return '';
  const raw = value.trim();
  if (/^(none|normal|initial|inherit|unset)$/i.test(raw)) return '';
  if (/^attr\(/i.test(raw)) return '';
  if (/^(url|linear-gradient|radial-gradient|image-set)\(/i.test(raw)) return '';
  let text = raw;
  const quoted = text.match(/^(['"])([\s\S]*)\1$/);
  if (quoted) text = quoted[2];
  return text
    .replace(/\\A\s?/gi, '\n')
    .replace(/\\22/g, '"')
    .replace(/\\27/g, "'")
    .replace(/\\5c/g, '\\')
    .replace(/^["']|["']$/g, '');
}

function snapshotInline(el) {
  const map = new Map();
  const styleAttr = el.getAttribute('style') || '';
  parseDeclarations(styleAttr.replace(/;\s*$/, '')).forEach((decl) => {
    map.set(decl.prop, { value: decl.value, important: decl.important });
  });
  return map;
}

/**
 * 把 CSS 内联到 root 子树。
 *
 * @param {Element} root 文章根元素（会被就地修改）
 * @param {string} css 文章自带样式
 * @param {{applyPseudoElements?:boolean, warn?:(msg:string)=>void}} [options]
 * @returns {{applied:number, pseudos:number, warnings:string[]}}
 */
function inlineStyles(root, css, options = {}) {
  const { applyPseudoElements = true } = options;
  const warnings = [];
  const warn = (msg) => warnings.push(msg);

  if (!root || typeof root.querySelectorAll !== 'function') {
    return { applied: 0, pseudos: 0, warnings };
  }

  const { rules, skipped } = parseCssRules(css);
  skipped.forEach((item) => warn(item.reason));

  // 预先记录每个元素原始的行内样式，行内样式优先级高于外部规则（除 !important）。
  const inlineSnapshots = new WeakMap();
  const elementsInScope = [root, ...Array.from(root.querySelectorAll('*'))];
  elementsInScope.forEach((el) => inlineSnapshots.set(el, snapshotInline(el)));

  const flat = [];
  rules.forEach((rule) => {
    rule.selector.split(',').forEach((rawSelector) => {
      const selector = rawSelector.trim();
      if (!selector) return;
      flat.push({
        selector,
        declarations: rule.declarations,
        order: rule.order,
        spec: computeSpecificity(selector),
      });
    });
  });
  flat.sort(compareSpecificity);

  let applied = 0;
  let pseudos = 0;

  const applyTo = (el, declarations, forPseudoOf) => {
    const snapshot = forPseudoOf ? null : inlineSnapshots.get(el);
    declarations.forEach((decl) => {
      if (decl.prop === 'content' && forPseudoOf) return;
      if (el.nodeType !== 1) return;
      if (snapshot) {
        const original = snapshot.get(decl.prop);
        if (original && (original.important || !decl.important)) return;
      }
      try {
        el.style.setProperty(decl.prop, decl.value, decl.important ? 'important' : '');
        if (!forPseudoOf) applied += 1;
      } catch {
        /* 无效声明，忽略 */
      }
    });
  };

  flat.forEach((rule) => {
    const { selector, declarations } = rule;
    const decls = parseDeclarations(declarations);
    if (!decls.length) return;

    const pseudoMatch = selector.match(PSEUDO_ELEMENT);
    if (pseudoMatch && DYNAMIC_PSEUDO.test(selector.replace(PSEUDO_ELEMENT, ''))) {
      warn(`选择器 ${selector} 含动态伪类，无法内联，已丢弃`);
      return;
    }

    if (pseudoMatch) {
      const which = pseudoMatch[1].toLowerCase();
      if (which !== 'before' && which !== 'after') {
        warn(`${selector} 使用了 ::${which}，无法内联，已丢弃`);
        return;
      }
      if (!applyPseudoElements) {
        warn(`${selector} 使用了伪元素，已跳过`);
        return;
      }
      const baseSelector = selector.replace(PSEUDO_ELEMENT, '').trim() || '*';
      let targets = [];
      try {
        if (baseSelector !== '*' && root.matches && root.matches(baseSelector)) targets.push(root);
        targets = targets.concat(Array.from(root.querySelectorAll(baseSelector)));
      } catch {
        warn(`选择器 ${selector} 无法解析，已丢弃`);
        return;
      }
      const contentDecl = decls.find((d) => d.prop === 'content');
      const text = decodeContentValue(contentDecl ? contentDecl.value : '');
      const visual = decls.filter((d) => d.prop !== 'content');
      const doc = root.ownerDocument;
      targets.forEach((el) => {
        const span = doc.createElement('span');
        applyTo(span, visual, true);
        if (text) span.textContent = text;
        if (!text && !visual.length) return;
        if (which === 'before') el.insertBefore(span, el.firstChild);
        else el.appendChild(span);
        pseudos += 1;
      });
      return;
    }

    if (DYNAMIC_PSEUDO.test(selector)) {
      warn(`选择器 ${selector} 含动态伪类，无法内联，已丢弃`);
      return;
    }

    let targets = [];
    try {
      if (root.matches && root.matches(selector)) targets.push(root);
      targets = targets.concat(Array.from(root.querySelectorAll(selector)));
    } catch {
      warn(`选择器 ${selector} 无法解析，已丢弃`);
      return;
    }
    targets.forEach((el) => applyTo(el, decls, false));
  });

  return { applied, pseudos, warnings };
}

/**
 * 从 HTML 字符串中抽出所有 `<style>` 内容并从 HTML 中移除这些标签。
 * @param {string} html
 * @returns {{html:string, css:string}}
 */
function extractStyleBlocks(html) {
  const chunks = [];
  const cleaned = String(html || '').replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_m, body) => {
    chunks.push(body);
    return '';
  });
  return { html: cleaned, css: chunks.join('\n') };
}

/* ---------- src/core/normalize.js ---------- */
/**
 * 正文清洗 —— 把公众号文章正文变成「可以安全提交给微信接口」的 HTML。
 *
 * 每一步都对应一条实测或已被验证的微信约束，不是拍脑袋的清洗：
 *  - 站外外链：微信错误码 412 / 64562 会直接拒绝建草稿，必须降级成文本 + 参考资料；
 *  - 音视频：64510 / 64511 / 64512 会因为音频报错，默认移除；
 *  - 懒加载：`data-src` 不提升会导致图片在草稿里全是 1x1 占位图；
 *  - 占位空段与尾随 `<br>` 会在正文里堆出多余空行。
 */


/** 整标签移除的黑名单（标签名，大写）。 */
const BLACKLIST_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'LINK',
  'IFRAME',
  'MPVOICE',
  'MPVIDEO',
  'QQMUSIC',
  'MP-COMMON-VIDEOSNAP',
  'MP-COMMON-MPAUDIO',
  'MP-COMMON-MPVIDEO',
  'WX-OPEN-SUBSCRIBE',
]);

/** 需要整节点移除的选择器。 */
const BLACKLIST_SELECTORS = [
  '#js_pc_qr_code',
  '.rich_media_area_extra',
  '.reward_area',
  '.js_ad_link',
  '.js_preview_tip',
  '.rich_media_tool',
  '.weapp_display_element',
  '.js_miniprogram_card',
  '.mp_profile_iframe_wrp',
  '.js_unread_message',
  '.js_article_comment',
  '[data-pluginname="insertad"]',
  '[data-pluginname="mpvoice"]',
];

const INLINE_WRAPPERS = new Set(['SPAN', 'A', 'EM', 'STRONG', 'B', 'I', 'U', 'FONT', 'LABEL']);
const SIZING_PROPS = /^(width|height|max-width|max-height|min-width|min-height|display|object-fit|border-radius)$/i;

function elementsOf(root) {
  return [root, ...Array.from(root.querySelectorAll('*'))];
}

function isBlankText(text) {
  return String(text || '').replace(/[\s\u00a0\u200b]+/g, '') === '';
}

/** 移除黑名单节点（脚本、音视频、广告、二维码等）。 */
function removeBlacklisted(root) {
  let removed = 0;
  elementsOf(root).forEach((el) => {
    if (el === root || el.nodeType !== 1) return;
    const tag = el.tagName ? el.tagName.toUpperCase() : '';
    if (BLACKLIST_TAGS.has(tag) || tag.startsWith('MP-COMMON')) {
      el.remove();
      removed += 1;
    }
  });
  BLACKLIST_SELECTORS.forEach((selector) => {
    try {
      Array.from(root.querySelectorAll(selector)).forEach((el) => {
        el.remove();
        removed += 1;
      });
    } catch {
      /* 选择器不支持则跳过 */
    }
  });
  return removed;
}

/** 提升懒加载图片，并整理图片样式。 */
function fixImages(root, options) {
  const images = collectImages(root);
  images.forEach(({ el }) => {
    promoteLazyImage(el);
    if (options.normalizeImageStyle !== false) {
      const decls = (el.getAttribute('style') || '')
        .split(';')
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .filter((chunk) => {
          const prop = chunk.split(':')[0].trim();
          return SIZING_PROPS.test(prop);
        });
      const hasWidth = decls.some((d) => /^(width|max-width)\s*:/i.test(d));
      if (!hasWidth) decls.push('max-width:100%');
      if (!decls.some((d) => /^height\s*:/i.test(d))) decls.push('height:auto');
      el.setAttribute('style', `${decls.join(';')};`);
    }
  });

  // 图片若被行内元素包裹（<span><img></span>），换成 <p> 容器，避免微信渲染异常
  images.forEach(({ el }) => {
    const parent = el.parentElement;
    if (!parent || parent === root) return;
    if (!INLINE_WRAPPERS.has(parent.tagName ? parent.tagName.toUpperCase() : '')) return;
    if (!isBlankText(parent.textContent)) return;
    if (parent.querySelectorAll('img').length !== 1) return;
    const doc = root.ownerDocument;
    const p = doc.createElement('p');
    p.appendChild(el);
    parent.replaceWith(p);
  });

  return collectImages(root);
}

/**
 * 站外外链降级：微信正文只允许 mp.weixin.qq.com 链接（错误码 64562 / 412）。
 * @returns {Array<{text:string, href:string, index:number}>}
 */
function demoteExternalLinks(root, options) {
  const doc = root.ownerDocument;
  const collected = [];
  const maxLinks = options.maxExternalLinks ?? 30;

  elementsOf(root).forEach((el) => {
    if (el === root || !el.tagName || el.tagName.toUpperCase() !== 'A') return;
    const href = (el.getAttribute('href') || '').trim();
    const text = (el.textContent || '').trim();

    let isAllowed = false;
    if (href && !/^(javascript:|#|mailto:|tel:)/i.test(href)) {
      try {
        const resolved = new URL(href, options.baseUrl || 'https://mp.weixin.qq.com/');
        isAllowed = resolved.hostname.toLowerCase() === 'mp.weixin.qq.com';
      } catch {
        isAllowed = false;
      }
    }

    if (isAllowed) return;

    const fragment = doc.createDocumentFragment();
    const inner = Array.from(el.childNodes);
    const isRealLink = Boolean(href) && !/^(javascript:|#)/i.test(href);
    const canRecord = isRealLink && collected.length < maxLinks;
    if (canRecord) {
      collected.push({ text: text || href, href, index: collected.length + 1 });
    }
    inner.forEach((node) => fragment.appendChild(node));
    if (canRecord) {
      const sup = doc.createElement('sup');
      sup.setAttribute('style', 'color:#888;font-size:12px;');
      sup.textContent = `[${collected.length}]`;
      fragment.appendChild(sup);
    }
    el.replaceWith(fragment);
  });

  return collected;
}

/** `<li>` 内容包一层 `<p>`，与公众号渲染保持一致。 */
function wrapListItems(root) {
  const doc = root.ownerDocument;
  Array.from(root.querySelectorAll('li')).forEach((li) => {
    let alreadyWrapped = false;
    try {
      alreadyWrapped = Boolean(li.querySelector(':scope > p'));
    } catch {
      // 个别 DOM 实现不支持 :scope，退回手动判断
      alreadyWrapped = Array.from(li.children).some((child) => child.tagName && child.tagName.toUpperCase() === 'P');
    }
    if (alreadyWrapped) return;
    const p = doc.createElement('p');
    while (li.firstChild) p.appendChild(li.firstChild);
    li.appendChild(p);
  });
}

/** 移除完全空的段落与正文末尾的多余换行。 */
function cleanupEmptyBlocks(root) {
  let removed = 0;
  // 仅移除「完全没有子节点」的段落，保留 <p><br></p> 这类用于分段的占位空行
  Array.from(root.querySelectorAll('p, section')).forEach((el) => {
    if (el.querySelector('img, video, audio, iframe, br')) return;
    if (isBlankText(el.textContent) && el.children.length === 0) {
      el.remove();
      removed += 1;
    }
  });

  let tail = root.lastElementChild;
  while (tail && tail.tagName && tail.tagName.toUpperCase() === 'BR') {
    const prev = tail.previousElementSibling;
    tail.remove();
    removed += 1;
    tail = prev;
  }
  return removed;
}

/** 去掉段首的空白字符与 text-indent（我们会用容器样式统一控制缩进）。 */
function stripLeadingWhitespace(root, options) {
  if (options.stripTextIndent === false) return 0;
  const props = ['text-indent', '-webkit-text-indent'];
  let touched = 0;
  Array.from(root.querySelectorAll('[style]')).forEach((el) => {
    const style = el.getAttribute('style') || '';
    let next = style;
    props.forEach((prop) => {
      next = next.replace(new RegExp(`${prop}\\s*:[^;]*;?`, 'gi'), '');
    });
    if (next !== style) {
      el.setAttribute('style', next.trim());
      touched += 1;
    }
  });
  return touched;
}

/**
 * 追加来源声明块（可编辑）。
 * @param {Element} root
 * @param {{title?:string, accountName?:string, sourceUrl?:string, template?:string}} meta
 */
function appendSourceBlock(root, meta = {}) {
  const account = (meta.accountName || '').trim();
  const title = (meta.title || '').trim();
  const url = (meta.sourceUrl || '').trim();
  if (!account && !title && !url) return null;

  const doc = root.ownerDocument;
  const box = doc.createElement('section');
  box.setAttribute('data-wechatpassage', 'source');
  box.setAttribute(
    'style',
    'margin-top:32px;padding-top:12px;border-top:1px solid #e5e5e5;color:#888;font-size:14px;line-height:1.8;'
  );

  const lines = [];
  if (account) lines.push(`本文转载自「${account}」`);
  if (title) lines.push(`原文标题：《${title}》`);
  if (url) lines.push(`原文链接：${url}`);

  const p = doc.createElement('p');
  p.setAttribute('style', 'margin:0;color:#888;font-size:14px;');
  p.textContent = lines.join('　');
  box.appendChild(p);
  root.appendChild(box);
  return box;
}

/**
 * 主入口：就地清洗文章根元素。
 *
 * @param {Element} root 文章根元素（通常是克隆后的 #js_content）
 * @param {object} [options]
 * @returns {{warnings:string[], externalLinks:Array, images:Array, removedNodes:number}}
 */
function normalizeArticle(root, options = {}) {
  const opts = {
    baseUrl: 'https://mp.weixin.qq.com/',
    stripTextIndent: true,
    normalizeImageStyle: true,
    stripMedia: true,
    ...options,
  };
  const warnings = [];

  if (!root || root.nodeType !== 1) {
    return { warnings: ['正文为空'], externalLinks: [], images: [], removedNodes: 0 };
  }

  // #js_content 默认带 visibility:hidden，等页面 JS 揭示后才可见；克隆体必须清掉
  const rootStyle = (root.getAttribute('style') || '')
    .replace(/visibility\s*:\s*hidden;?/gi, '')
    .replace(/opacity\s*:\s*0;?/gi, '');
  root.setAttribute('style', rootStyle.trim());
  root.removeAttribute('hidden');

  let removedNodes = 0;
  if (opts.stripMedia !== false) {
    const mediaCount = root.querySelectorAll('mpvoice, mpvideo, qqmusic, iframe, video, audio').length;
    if (mediaCount > 0) {
      warnings.push(`已移除 ${mediaCount} 个音视频/内嵌组件（微信接口会因为音频直接报错）`);
    }
  }
  removedNodes += removeBlacklisted(root);

  const images = fixImages(root, opts);
  const externalLinks = demoteExternalLinks(root, opts);
  if (externalLinks.length) {
    warnings.push(
      `已把 ${externalLinks.length} 个站外链接降级为文本 + 参考资料（微信正文不允许非 mp.weixin.qq.com 链接）`
    );
  }

  wrapListItems(root);
  stripLeadingWhitespace(root, opts);
  removedNodes += cleanupEmptyBlocks(root);

  if (externalLinks.length) {
    const doc = root.ownerDocument;
    const box = doc.createElement('section');
    box.setAttribute('data-wechatpassage', 'references');
    box.setAttribute('style', 'margin-top:24px;font-size:14px;color:#888;line-height:1.8;');
    const heading = doc.createElement('p');
    heading.setAttribute('style', 'margin:0 0 6px;font-weight:bold;color:#888;font-size:14px;');
    heading.textContent = '参考资料';
    box.appendChild(heading);
    externalLinks.forEach((link) => {
      const p = doc.createElement('p');
      p.setAttribute('style', 'margin:0;color:#888;font-size:14px;word-break:break-all;');
      p.textContent = `[${link.index}] ${link.text} — ${link.href}`;
      box.appendChild(p);
    });
    root.appendChild(box);
  }

  return { warnings, externalLinks, images: collectImages(root), removedNodes };
}

/* ---------- src/core/extract.js ---------- */
/**
 * 从**实时 DOM** 提取文章信息。
 *
 * 刻意不从 HTML 字符串解析：文章页的懒加载图片在页面 JS 执行后 `src` 才是真实地址，
 * 读实时 DOM 的还原保真度明显更高。
 */

const CONTENT_SELECTORS = ['#js_content', '.rich_media_content', '#js_article .rich_media_content'];

/** 从内联脚本里读取 `变量 = "字符串";` 形式的赋值。 */
function readScriptVars(doc) {
  const vars = {};
  const scripts = doc && typeof doc.querySelectorAll === 'function' ? doc.querySelectorAll('script') : [];
  // 不要求语句以 var 开头、也不要求以分号或换行分隔：
  // 微信把多个变量压缩在同一行，用分隔符锚定会漏掉第二个变量。
  const assignment = /([A-Za-z_$][\w$]*)\s*=\s*(['"])([\s\S]*?)\2\s*;/g;

  Array.from(scripts).forEach((script) => {
    const text = script.textContent || '';
    if (!text || text.length > 400000) return;
    assignment.lastIndex = 0;
    let match = assignment.exec(text);
    while (match) {
      if (vars[match[1]] === undefined) vars[match[1]] = match[3];
      match = assignment.exec(text);
    }
    assignment.lastIndex = 0;
  });
  return vars;
}

/** 读取 meta 标签，返回 property/name → content。 */
function readMeta(doc) {
  const out = {};
  if (!doc || typeof doc.querySelectorAll !== 'function') return out;
  Array.from(doc.querySelectorAll('meta')).forEach((meta) => {
    const key = meta.getAttribute('property') || meta.getAttribute('name');
    const content = meta.getAttribute('content');
    if (key && content && out[key] === undefined) out[key] = content;
  });
  return out;
}

/**
 * 找出正文根元素。
 * @param {Document} doc
 * @returns {Element|null}
 */
function findContentRoot(doc) {
  if (!doc || typeof doc.querySelector !== 'function') return null;
  for (const selector of CONTENT_SELECTORS) {
    const el = doc.querySelector(selector);
    if (el) return el;
  }
  return null;
}

/**
 * 探测页面是否为公众号报错页（参数错误 / 已删除 / 环境异常）。
 * @param {Document} doc
 * @returns {string|null} 错误文案
 */
function detectErrorPage(doc) {
  if (!doc || typeof doc.querySelectorAll !== 'function') return null;
  const nodes = Array.from(doc.querySelectorAll('.weui-msg__title, .weui-msg__desc, .weui-msg__desc-primary'));
  for (const node of nodes) {
    const text = (node.textContent || '').trim();
    if (!text) continue;
    if (/参数错误|已被发布者删除|该内容已被发布者删除|环境异常|无法查看|内容已被删除|该链接已过期/.test(text)) {
      return text;
    }
  }
  const bodyText = (doc.body && doc.body.textContent ? doc.body.textContent : '').slice(0, 400);
  if (/环境异常|完成验证后即可继续访问/.test(bodyText)) return '环境异常，请在当前浏览器中打开一次该文章完成验证';
  return null;
}

/**
 * 提取文章。
 *
 * @param {Document} doc 实时 document
 * @param {{sourceUrl?:string}} [options]
 * @returns {{
 *   ok:boolean, error:string|null,
 *   title:string, author:string, accountName:string, digest:string,
 *   coverUrl:string, sourceUrl:string, publishedAt:string,
 *   root:Element|null, warnings:string[]
 * }}
 */
function extractArticle(doc, options = {}) {
  const warnings = [];
  const fail = (error) => ({
    ok: false,
    error,
    title: '',
    author: '',
    accountName: '',
    digest: '',
    coverUrl: '',
    sourceUrl: options.sourceUrl || '',
    publishedAt: '',
    root: null,
    liveRoot: null,
    warnings,
  });

  if (!doc || !doc.querySelector) return fail('无法读取页面内容');

  const errorText = detectErrorPage(doc);
  if (errorText) return fail(errorText);

  const root = findContentRoot(doc);
  if (!root) return fail('当前页面不是公众号文章页，请先打开目标文章再使用');

  const meta = readMeta(doc);
  const vars = readScriptVars(doc);

  const pick = (...values) => {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return '';
  };

  const title = pick(meta['og:title'], vars.msg_title, doc.title);
  const digest = pick(meta['og:description'], vars.msg_desc, meta.description);
  const coverUrl = pick(meta['og:image'], vars.msg_cdn_url);
  const accountName = pick(vars.nickname, meta['og:article:author'], vars.nick_name);
  const author = pick(vars.author, meta.author, vars.msg_author);

  let sourceUrl = pick(meta['og:url'], options.sourceUrl);
  if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) sourceUrl = '';
  if (sourceUrl) {
    try {
      const parsed = new URL(sourceUrl);
      parsed.hash = '';
      // og:url 常带临时跟踪参数，保留核心标识即可
      const keep = new URLSearchParams();
      ['__biz', 'mid', 'idx', 'sn'].forEach((key) => {
        if (parsed.searchParams.get(key)) keep.set(key, parsed.searchParams.get(key));
      });
      const query = keep.toString();
      sourceUrl = query ? `${parsed.origin}${parsed.pathname}?${query}` : `${parsed.origin}${parsed.pathname}`;
    } catch {
      /* 保留原值 */
    }
  }

  let publishedAt = '';
  const ct = vars.ct;
  if (ct && /^\d{9,13}$/.test(String(ct))) {
    const ms = String(ct).length === 10 ? Number(ct) * 1000 : Number(ct);
    const date = new Date(ms);
    if (!Number.isNaN(date.getTime())) {
      const pad = (n) => String(n).padStart(2, '0');
      publishedAt = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
  }

  if (!title) warnings.push('未能读取到标题，请手动填写');

  return {
    ok: true,
    error: null,
    title,
    author,
    accountName,
    digest,
    coverUrl,
    sourceUrl,
    publishedAt,
    root: root.cloneNode(true),
    liveRoot: root,
    warnings,
  };
}

/* ---------- src/core/article.js ---------- */
/**
 * 「还原一篇文章」的完整流程编排。
 *
 *   extract（读实时 DOM）
 *     → captureComputed（把浏览器算出来的样式烤进行内，覆盖外链样式表）
 *     → inlineStyles（把页面 <style> 规则内联，含伪元素实体化）
 *     → normalize（按微信约束清洗）
 *     → appendSourceBlock（来源声明）
 *     → serialize
 */





/**
 * 抓取页面所有可读的 `<style>` 内容（跨域外链样式表读不到 `cssRules`，只能跳过）。
 * @param {Document} doc
 */
function collectPageCss(doc) {
  const chunks = [];
  let blocked = 0;
  if (!doc || typeof doc.querySelectorAll !== 'function') return { css: '', blocked };

  Array.from(doc.querySelectorAll('style')).forEach((style) => {
    const text = style.textContent || '';
    if (text.trim()) chunks.push(text);
  });

  Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).forEach((link) => {
    try {
      const sheet = link.sheet;
      if (!sheet) {
        blocked += 1;
        return;
      }
      const rules = Array.from(sheet.cssRules || []);
      if (!rules.length) blocked += 1;
      rules.forEach((rule) => chunks.push(rule.cssText));
    } catch {
      // 跨域样式表会抛 SecurityError
      blocked += 1;
    }
  });

  return { css: chunks.join('\n'), blocked };
}

/**
 * 针对正文元素需要「烤死」的样式属性。刻意收敛：
 * 只烤那些决定版面的属性，避免把整棵树的每个 CSS 属性都写进行内样式导致体积爆炸。
 */
const COMPUTED_PROPS = [
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'color',
  'background-color',
  'text-align',
  'text-decoration-line',
  'text-indent',
  'vertical-align',
  'white-space',
  'margin-top',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'padding-top',
  'padding-bottom',
  'padding-left',
  'padding-right',
];

const IMG_COMPUTED_PROPS = ['width', 'max-width', 'height'];

/**
 * 把浏览器计算出的样式写进克隆体的行内样式（仅填补空缺，不覆盖原有行内样式）。
 *
 * @param {Element|null} liveRoot
 * @param {Element} cloneRoot
 * @param {Window} [win]
 * @returns {number} 写入的属性个数
 */
function captureComputedStyles(liveRoot, cloneRoot, win) {
  if (!liveRoot || !cloneRoot || !win || typeof win.getComputedStyle !== 'function') return 0;

  let written = 0;
  const liveNodes = [liveRoot, ...Array.from(liveRoot.querySelectorAll('*'))];
  const cloneNodes = [cloneRoot, ...Array.from(cloneRoot.querySelectorAll('*'))];
  const count = Math.min(liveNodes.length, cloneNodes.length);

  for (let i = 0; i < count; i += 1) {
    const live = liveNodes[i];
    const clone = cloneNodes[i];
    if (!clone || clone.nodeType !== 1) continue;

    let computed;
    try {
      computed = win.getComputedStyle(live);
    } catch {
      continue;
    }
    if (!computed) continue;

    const isImg = clone.tagName && clone.tagName.toUpperCase() === 'IMG';
    const props = isImg ? IMG_COMPUTED_PROPS : COMPUTED_PROPS;
    const existing = new Set(
      (clone.getAttribute('style') || '')
        .split(';')
        .map((chunk) => chunk.split(':')[0].trim().toLowerCase())
        .filter(Boolean)
    );

    props.forEach((prop) => {
      if (existing.has(prop)) return;
      let value = computed.getPropertyValue(prop);
      if (!value) return;
      value = value.trim();
      if (!value || value === 'normal' || value === 'auto') return;
      if (prop === 'text-decoration-line' && value === 'none') return;
      if (/^rgba?\(\s*0,\s*0,\s*0,\s*0\s*\)$/.test(value)) return;
      if (isImg && (prop === 'width' || prop === 'height') && /px$/.test(value)) {
        const num = parseFloat(value);
        if (!Number.isFinite(num) || num <= 0) return;
      }
      try {
        clone.style.setProperty(prop, value);
        written += 1;
      } catch {
        /* 忽略无效值 */
      }
    });
  }
  return written;
}

/**
 * 用 `<section>` 包裹正文，提供稳定的排版上下文。
 *
 * 关键点：文章根元素（`#js_content.rich_media_content`）自身往往承载基础字号与颜色，
 * 而它会被这层包裹「吃掉」——所以必须先把它的行内样式合并到包裹层，否则整体字号会丢。
 */
function wrapInSection(root, doc) {
  const section = doc.createElement('section');
  section.setAttribute('data-wechatpassage', 'body');
  section.setAttribute(
    'style',
    'margin-left:6px;margin-right:6px;line-height:1.75;color:#333;font-size:16px;word-break:break-word;'
  );

  parseDeclarations(root.getAttribute('style') || '').forEach(({ prop, value, important }) => {
    try {
      section.style.setProperty(prop, value, important ? 'important' : '');
    } catch {
      /* 忽略无效声明 */
    }
  });

  while (root.firstChild) section.appendChild(root.firstChild);
  return section;
}

/** 粗略地把 HTML 转成纯文本（用于生成默认摘要与剪贴板 text/plain）。 */
function htmlToPlainText(html) {
  const text = String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|section|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&');
  return text
    .split('\n')
    .map((line) => line.replace(/[\s\u00a0\u200b]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * 还原一篇文章。
 *
 * @param {Document} doc 实时 document
 * @param {{sourceUrl?:string, win?:Window, attribution?:boolean, attributionTemplate?:string,
 *          stripTextIndent?:boolean, captureComputed?:boolean, wrapSection?:boolean}} [options]
 */
function restoreArticle(doc, options = {}) {
  const opts = {
    attribution: true,
    captureComputed: true,
    wrapSection: true,
    ...options,
  };

  const extracted = extractArticle(doc, { sourceUrl: opts.sourceUrl });
  if (!extracted.ok) {
    return { ...extracted, html: '', plainText: '', images: [], externalLinks: [] };
  }

  const warnings = [...extracted.warnings];
  const cloneRoot = extracted.root;
  const ownerDoc = cloneRoot.ownerDocument || doc;

  if (opts.captureComputed !== false) {
    const written = captureComputedStyles(extracted.liveRoot, cloneRoot, opts.win);
    if (written > 0) warnings.push(`已固定 ${written} 处计算样式，确保排版与原文一致`);
  }

  const pageCss = collectPageCss(doc);
  if (pageCss.blocked > 0) {
    warnings.push(`有 ${pageCss.blocked} 个外部样式表因跨域无法读取，这些样式将以浏览器计算结果替代`);
  }
  if (pageCss.css) {
    const inlineResult = inlineStyles(cloneRoot, pageCss.css, { applyPseudoElements: true });
    inlineResult.warnings.slice(0, 5).forEach((msg) => warnings.push(msg));
    if (inlineResult.warnings.length > 5) {
      warnings.push(`另有 ${inlineResult.warnings.length - 5} 条样式规则无法内联`);
    }
    if (inlineResult.pseudos > 0) {
      warnings.push(`已实体化 ${inlineResult.pseudos} 个伪元素（分隔线/序号等）`);
    }
  }

  const normalized = normalizeArticle(cloneRoot, {
    baseUrl: opts.sourceUrl || 'https://mp.weixin.qq.com/',
    stripTextIndent: opts.stripTextIndent,
  });
  warnings.push(...normalized.warnings);

  if (opts.attribution) {
    appendSourceBlock(cloneRoot, {
      title: extracted.title,
      accountName: extracted.accountName,
      sourceUrl: extracted.sourceUrl || opts.sourceUrl,
      template: opts.attributionTemplate,
    });
  }

  const container = opts.wrapSection ? wrapInSection(cloneRoot, ownerDoc) : cloneRoot;
  const holder = ownerDoc.createElement('div');
  holder.appendChild(container);
  const html = holder.innerHTML;

  const images = collectImages(container).map((item, index) => ({
    index,
    src: item.src,
    kind: classifyImage(item.src),
  }));

  return {
    ok: true,
    error: null,
    title: extracted.title,
    author: extracted.author,
    accountName: extracted.accountName,
    digest: extracted.digest || htmlToPlainText(html).slice(0, 120),
    coverUrl: extracted.coverUrl,
    sourceUrl: extracted.sourceUrl || opts.sourceUrl || '',
    publishedAt: extracted.publishedAt,
    html,
    plainText: htmlToPlainText(html),
    images,
    externalLinks: normalized.externalLinks,
    warnings,
  };
}

/* ---------- src/wx/token.js ---------- */
/**
 * 同源获取公众号后台上下文（token / ticket / 昵称）。
 *
 * 为什么可以这么简单：本脚本运行在 mp.weixin.qq.com 页面上，`fetch('/')` 是**同源请求**，
 * 浏览器自动带上公众号登录 Cookie —— 不需要 AppID、不需要扫码自建会话、不需要 GM API。
 */

/**
 * 用括号配对从源码里截出一个对象字面量（跳过字符串与注释），避免执行整段页面脚本。
 * @param {string} text
 * @param {number} startIdx
 * @returns {string|null}
 */
function extractObjectLiteral(text, startIdx) {
  const begin = text.indexOf('{', startIdx);
  if (begin === -1) return null;
  let depth = 0;
  let inString = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = begin; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (inString) {
      if (ch === '\\') {
        i += 1;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '/' && next === '/') {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(begin, i + 1);
    }
  }
  return null;
}

/**
 * 从页面 HTML 中解析 `window.wx.commonData`。
 * @param {string} html
 * @returns {object|null}
 */
function parseCommonData(html) {
  if (!html) return null;
  const anchors = ['window.wx.commonData', 'window.wx.commonData='];
  let idx = -1;
  for (const anchor of anchors) {
    idx = html.indexOf(anchor);
    if (idx !== -1) break;
  }
  if (idx === -1) return null;

  const literal = extractObjectLiteral(html, idx);
  if (!literal) return null;

  try {
    // 字面量来自微信自己页面的内联脚本，这里只做取值，不产生副作用
    const factory = new Function(`return (${literal});`);
    const data = factory();
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
}

function normalizeContext(commonData, fallbackToken) {
  const data = (commonData && commonData.data) || {};
  const token = data.t || fallbackToken || '';
  if (!token) return null;
  return {
    token,
    ticket: data.ticket || '',
    ticketId: data.user_name || '',
    svrTime: data.time || data.svr_time || '',
    nickname: data.nick_name || '',
    userName: data.user_name || '',
    avatar: data.headimgurl || '',
    raw: commonData,
  };
}

/**
 * 读取公众号后台上下文。
 *
 * @param {{fetchImpl?:Function, win?:Window, force?:boolean}} [options]
 * @returns {Promise<{ok:boolean, context:object|null, error:string|null}>}
 */
async function getWxContext(options = {}) {
  const win = options.win || (typeof window !== 'undefined' ? window : null);
  const fetchImpl =
    options.fetchImpl ||
    (win && typeof win.fetch === 'function' ? win.fetch.bind(win) : typeof fetch === 'function' ? fetch : null);

  if (!fetchImpl) return { ok: false, context: null, error: '当前环境不支持 fetch' };

  // 1) 后台页面本身已经加载好了 commonData，直接用
  if (win && win.wx && win.wx.commonData && win.wx.commonData.data && win.wx.commonData.data.t) {
    const context = normalizeContext(win.wx.commonData, '');
    if (context) return { ok: true, context, error: null };
  }

  // 2) 从 URL 上的 token 兜底（后台各页面 URL 一般带 token）
  let fallbackToken = '';
  try {
    if (win && win.location) fallbackToken = new URL(win.location.href).searchParams.get('token') || '';
  } catch {
    /* 忽略 */
  }

  try {
    const res = await fetchImpl('/', { credentials: 'include', redirect: 'follow' });
    if (!res.ok) {
      return { ok: false, context: null, error: `读取公众号首页失败（HTTP ${res.status}）` };
    }
    const html = await res.text();
    const commonData = parseCommonData(html);
    const context = normalizeContext(commonData, fallbackToken);
    if (!context) {
      return {
        ok: false,
        context: null,
        error: '未检测到公众号登录态，请先在当前浏览器登录 mp.weixin.qq.com',
      };
    }
    return { ok: true, context, error: null };
  } catch (err) {
    return { ok: false, context: null, error: `读取公众号信息失败：${err && err.message ? err.message : err}` };
  }
}

/* ---------- src/wx/upload.js ---------- */
/**
 * 图片入库：把正文里的图片变成微信公众号自有 CDN 地址。
 *
 * 两条通道（对应 Wechatsync `weixin.js` 中已被验证的两种做法）：
 *  1) `uploadimg2cdn`：只把**原图 URL** 交给微信，由微信服务端去拉图。
 *     省流量、天然绕过防盗链，是站外图片的首选。
 *  2) `filetransfer`：真的把字节流上传（WebUploader 字段格式）。
 *     用于 data:URL、以及通道 1 失败时的兜底。
 */



const WECHAT_EDITOR_SCENE = '8';

function resolveAbsolute(src, baseUrl) {
  try {
    return new URL(src, baseUrl || 'https://mp.weixin.qq.com/').href;
  } catch {
    return src;
  }
}

/**
 * 通道 1：让微信服务端去拉取原图。
 * @param {object} ctx getWxContext 的结果
 * @param {string} src 原图绝对地址
 * @param {Function} fetchImpl
 * @returns {Promise<string>} 微信 CDN 地址
 */
async function uploadImageByUrl(ctx, src, fetchImpl) {
  const query = new URLSearchParams({
    lang: 'zh_CN',
    token: ctx.token,
    t: String(Math.random()),
  });
  const body = new URLSearchParams({
    imgurl: src,
    t: 'ajax-editor-upload-img',
    token: ctx.token,
    lang: 'zh_CN',
    f: 'json',
    ajax: '1',
  });

  const res = await fetchImpl(`/cgi-bin/uploadimg2cdn?${query.toString()}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`图片转存失败：微信返回了非 JSON 响应（HTTP ${res.status}）`);
  }

  if (!isWxResponseOk(json)) {
    const info = formatWxResponse(json);
    throw new Error(`图片转存失败：${info.message}`);
  }
  if (!json.url) throw new Error('图片转存失败：微信未返回图片地址');
  return json.url;
}

/**
 * 通道 2：上传字节流。
 * @param {object} ctx
 * @param {Blob} blob
 * @param {string} [filename]
 * @param {Function} fetchImpl
 * @returns {Promise<{id:string, url:string}>}
 */
async function uploadImageBlob(ctx, blob, filename, fetchImpl) {
  const name = filename || `${Date.now()}.jpg`;
  const type = blob.type || 'image/jpeg';

  const form = new FormData();
  form.append('type', type);
  form.append('id', `WU_FILE_${Date.now()}`);
  form.append('name', name);
  form.append('lastModifiedDate', new Date().toString());
  form.append('size', String(blob.size));
  form.append('file', blob, name);

  const query = new URLSearchParams({
    action: 'upload_material',
    f: 'json',
    scene: WECHAT_EDITOR_SCENE,
    writetype: 'doublewrite',
    groupid: '1',
    ticket_id: ctx.ticketId || '',
    ticket: ctx.ticket || '',
    svr_time: String(ctx.svrTime || ''),
    token: ctx.token,
    lang: 'zh_CN',
    seq: String(Date.now()),
    t: String(Math.random()),
  });

  const res = await fetchImpl(`/cgi-bin/filetransfer?${query.toString()}`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`图片上传失败：微信返回了非 JSON 响应（HTTP ${res.status}）`);
  }

  if (!isWxResponseOk(json)) {
    const info = formatWxResponse(json);
    throw new Error(`图片上传失败：${info.message}`);
  }
  const url = json.cdn_url || json.url;
  if (!url) throw new Error('图片上传失败：微信未返回图片地址');
  return { id: String(json.content || ''), url };
}

/** data:URL → Blob。 */
async function dataUrlToBlob(dataUrl, fetchImpl) {
  const res = await fetchImpl(dataUrl);
  return res.blob();
}

function guessFilename(src, index) {
  const extMatch = String(src).match(/\.(jpe?g|png|gif|webp|bmp)(?:[?#]|$)/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
  return `wp-${Date.now()}-${index}.${ext}`;
}

/** 有限并发地执行任务。 */
async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = new Array(Math.min(limit, items.length)).fill(null).map(async () => {
    for (;;) {
      const current = cursor;
      cursor += 1;
      if (current >= items.length) return;
      results[current] = await worker(items[current], current);
    }
  });
  await Promise.all(runners);
  return results;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 上传正文中的全部图片，并就地改写 `src`。
 *
 * @param {Element} root 正文根元素
 * @param {Array<{index:number, el:Element, src:string, kind:string}>} images
 * @param {object} ctx
 * @param {{concurrency?:number, retries?:number, forceReupload?:boolean,
 *          baseUrl?:string, onProgress?:Function, fetchImpl?:Function}} [options]
 * @returns {Promise<{uploaded:Array, skipped:Array, failed:Array, cdnUrl:string}>}
 */
async function uploadArticleImages(root, images, ctx, options = {}) {
  const {
    concurrency = 3,
    retries = 2,
    forceReupload = false,
    baseUrl = 'https://mp.weixin.qq.com/',
    onProgress,
  } = options;
  const fetchImpl =
    options.fetchImpl ||
    (typeof fetch === 'function' ? fetch : null);
  if (!fetchImpl) throw new Error('当前环境不支持 fetch');

  const uploaded = [];
  const skipped = [];
  const failed = [];
  const total = images.length;

  const report = (phase, payload) => {
    if (typeof onProgress === 'function') onProgress({ phase, total, ...payload });
  };

  const tasks = images.filter((image) => {
    const kind = image.kind || classifyImage(image.src);
    if (kind === 'empty') {
      skipped.push({ index: image.index, reason: '空地址' });
      return false;
    }
    if (kind === 'wechat-cdn' && !forceReupload) {
      skipped.push({ index: image.index, reason: '已是微信 CDN，直接沿用', src: image.src });
      return false;
    }
    return true;
  });

  await runWithConcurrency(tasks, concurrency, async (image) => {
    const src = resolveImageSrc(image.el) || image.src;
    const kind = image.kind || classifyImage(src);
    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        let url = '';
        if (kind === 'data') {
          const blob = await dataUrlToBlob(src, fetchImpl);
          const result = await uploadImageBlob(ctx, blob, guessFilename('png', image.index), fetchImpl);
          url = result.url;
        } else {
          const absolute = resolveAbsolute(src, baseUrl);
          try {
            url = await uploadImageByUrl(ctx, absolute, fetchImpl);
          } catch (primaryError) {
            lastError = primaryError;
            // 通道 1 失败（有些站点会拒绝微信的抓取）→ 尝试自己取字节再上传
            const res = await fetchImpl(absolute, { credentials: 'omit', mode: 'cors' });
            if (!res.ok) throw primaryError;
            const blob = await res.blob();
            const result = await uploadImageBlob(ctx, blob, guessFilename(absolute, image.index), fetchImpl);
            url = result.url;
          }
        }

        image.el.setAttribute('src', url);
        image.el.removeAttribute('data-src');
        image.src = url;
        image.kind = 'wechat-cdn';
        uploaded.push({ index: image.index, from: src, to: url });
        report('uploaded', { uploaded, skipped, failed, current: { index: image.index, to: url } });
        return;
      } catch (err) {
        lastError = err;
        if (attempt < retries) await sleep(400 * 2 ** attempt);
      }
    }

    failed.push({
      index: image.index,
      src,
      reason: lastError && lastError.message ? lastError.message : String(lastError),
    });
    report('failed', { uploaded, skipped, failed, current: { index: image.index, error: lastError } });
  });

  report('done', { uploaded, skipped, failed });
  return { uploaded, skipped, failed, cdnUrl: baseUrl };
}

/* ---------- src/wx/draft.js ---------- */
/**
 * 在公众号后台创建图文草稿。
 *
 * 接口：`POST /cgi-bin/operate_appmsg?t=ajax-response&sub=create&type=77`
 * 字段集移植自 Wechatsync 的 `weixin.js`（MIT）。`type=77` 对应新版图文。
 *
 * 注意：这是公众号后台的**内部接口**，不属于公开开发接口，字段可能随版本变化。
 * `tools/publish-check.mjs` 用于自检该接口是否仍然可用。
 */


const DRAFT_TYPE = '77';

/**
 * 组装建草稿所需的表单字段。
 *
 * @param {object} ctx getWxContext 的结果
 * @param {{title:string, author?:string, digest?:string, html:string,
 *          coverFileId?:string, sourceUrl?:string, comment?:boolean}} article
 * @returns {Record<string,string>}
 */
function buildDraftFields(ctx, article) {
  const digest = (article.digest || '').trim();
  return {
    token: ctx.token,
    lang: 'zh_CN',
    f: 'json',
    ajax: '1',
    random: String(Math.random()),
    AppMsgId: '',
    count: '1',
    data_seq: '0',
    operate_from: 'Chrome',
    isnew: '0',

    // 第一篇文章（下标 0）
    ad_video_transition0: '',
    can_reward0: '0',
    related_video0: '',
    is_video_recommend0: '-1',
    title0: article.title || '',
    author0: article.author || '',
    writerid0: '0',
    fileid0: article.coverFileId || '',
    digest0: digest,
    auto_gen_digest0: digest ? '0' : '1',
    content0: article.html || '',
    sourceurl0: article.sourceUrl || '',
    need_open_comment0: article.comment === false ? '0' : '1',
    only_fans_can_comment0: '0',
    cdn_url0: '',
    cdn_235_1_url0: '',
    cdn_1_1_url0: '',
    cdn_url_back0: '',
    crop_list0: '',
    music_id0: '',
    video_id0: '',
    voteid0: '',
    voteismlt0: '',
    supervoteid0: '',
    cardid0: '',
    cardquantity0: '',
    cardlimit0: '',
    vid_type0: '',
    show_cover_pic0: '0',
    shortvideofileid0: '',
    copyright_type0: '0',
    releasefirst0: '',
    platform0: '',
    reprint_permit_type0: '',
    allow_reprint0: '',
    allow_reprint_modify0: '',
    original_article_type0: '',
    ori_white_list0: '',
    free_content0: '',
    fee0: '0',
    ad_id0: '',
    guide_words0: '',
    is_share_copyright0: '0',
    share_copyright_url0: '',
    source_article_type0: '',
    reprint_recommend_title0: '',
    reprint_recommend_content0: '',
    share_page_type0: '0',
    share_imageinfo0: '{"list":[]}',
    share_video_id0: '',
    dot0: '{}',
    share_voice_id0: '',
    insert_ad_mode0: '',
    categories_list0: '[]',
    sections0: '[]',
    compose_info0: '{"list":[]}',
  };
}

/** 构造草稿编辑页地址。 */
function draftUrlFor(appMsgId, token) {
  const query = new URLSearchParams({
    t: 'media/appmsg_edit',
    action: 'edit',
    type: DRAFT_TYPE,
    appmsgid: String(appMsgId),
    token: token || '',
    lang: 'zh_CN',
  });
  return `https://mp.weixin.qq.com/cgi-bin/appmsg?${query.toString()}`;
}

/**
 * 创建草稿。
 *
 * @param {object} ctx
 * @param {object} article 见 buildDraftFields
 * @param {{fetchImpl?:Function}} [options]
 * @returns {Promise<{ok:boolean, appMsgId:string, draftUrl:string, error:string|null, raw:any}>}
 */
async function createDraft(ctx, article, options = {}) {
  const fetchImpl = options.fetchImpl || (typeof fetch === 'function' ? fetch : null);
  if (!fetchImpl) throw new Error('当前环境不支持 fetch');

  const query = new URLSearchParams({
    t: 'ajax-response',
    sub: 'create',
    type: DRAFT_TYPE,
    token: ctx.token,
    lang: 'zh_CN',
  });

  const body = new URLSearchParams(buildDraftFields(ctx, article));

  const res = await fetchImpl(`/cgi-bin/operate_appmsg?${query.toString()}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  let json;
  try {
    json = await res.json();
  } catch {
    return {
      ok: false,
      appMsgId: '',
      draftUrl: '',
      error: `创建草稿失败：微信返回了非 JSON 响应（HTTP ${res.status}）`,
      raw: null,
    };
  }

  if (json && json.appMsgId) {
    return {
      ok: true,
      appMsgId: String(json.appMsgId),
      draftUrl: draftUrlFor(json.appMsgId, ctx.token),
      error: null,
      raw: json,
    };
  }

  const info = formatWxResponse(json);
  return {
    ok: false,
    appMsgId: '',
    draftUrl: '',
    error: `创建草稿失败：${info.message}`,
    raw: json,
  };
}

/* ---------- src/wx/publish.js ---------- */
/**
 * 发布编排：图片入库 → 封面素材 → 建草稿。
 *
 * 最终止于「草稿已在后台就位」。群发/发表是不可逆且消耗当日额度的操作，
 * 交给用户在后台亲自点击。
 */




/**
 * 把 HTML 片段变成惰性 DOM 树（不会触发图片网络加载）。
 * @param {string} html
 * @param {Document} doc
 * @returns {Element}
 */
function htmlToInertElement(html, doc) {
  const document = doc || (typeof document !== 'undefined' ? document : null);
  if (!document) throw new Error('当前环境没有 document');

  const template = document.createElement('template');
  if (template.content && typeof template.innerHTML === 'string') {
    template.innerHTML = html;
    const wrapper = document.createElement('div');
    wrapper.appendChild(template.content.cloneNode(true));
    return wrapper;
  }
  const div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

/**
 * 尝试把封面图变成微信素材 id（`fileid0`）。
 *
 * 微信要求「封面必须存在于正文中」（错误码 64513），且 fileid 只能通过
 * `filetransfer` 上传字节流得到；拿不到时返回空串，由用户在后台点一下选封面。
 *
 * @returns {Promise<{fileId:string, warning:string|null}>}
 */
async function resolveCoverFileId(ctx, coverUrl, fetchImpl) {
  if (!coverUrl) return { fileId: '', warning: null };
  try {
    const res = await fetchImpl(coverUrl, { credentials: 'omit', mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const result = await uploadImageBlob(ctx, blob, 'cover.jpg', fetchImpl);
    return { fileId: result.id || '', warning: result.id ? null : '封面已上传但未拿到素材 id，请在后台手动选择封面' };
  } catch (err) {
    return {
      fileId: '',
      warning: `封面未能自动设置（${err && err.message ? err.message : err}），请在后台草稿里手动选择封面`,
    };
  }
}

/**
 * 发布一篇图文到草稿箱。
 *
 * @param {object} ctx getWxContext 的结果
 * @param {{title:string, author?:string, digest?:string, html:string,
 *          coverUrl?:string, sourceUrl?:string, comment?:boolean}} article
 * @param {{uploadImages?:boolean, forceReupload?:boolean, setCover?:boolean,
 *          baseUrl?:string, onProgress?:Function, fetchImpl?:Function, doc?:Document}} [options]
 */
async function publishArticle(ctx, article, options = {}) {
  const {
    uploadImages = true,
    forceReupload = false,
    setCover = true,
    baseUrl = 'https://mp.weixin.qq.com/',
    onProgress,
  } = options;
  const fetchImpl = options.fetchImpl || (typeof fetch === 'function' ? fetch : null);
  if (!fetchImpl) throw new Error('当前环境不支持 fetch');

  const warnings = [];
  const doc = options.doc || (typeof document !== 'undefined' ? document : null);
  if (!doc) throw new Error('当前环境没有 document');

  const holder = htmlToInertElement(article.html || '', doc);
  const images = collectImages(holder);

  let uploadReport = { uploaded: [], skipped: [], failed: [] };
  if (uploadImages && images.length) {
    uploadReport = await uploadArticleImages(holder, images, ctx, {
      forceReupload,
      baseUrl,
      fetchImpl,
      onProgress,
    });
    if (uploadReport.failed.length) {
      warnings.push(
        `${uploadReport.failed.length} 张图片未能转存到微信（草稿仍会创建，但这些图片在正文中可能不显示）`
      );
    }
  }

  let coverFileId = '';
  if (setCover && article.coverUrl) {
    const cover = await resolveCoverFileId(ctx, article.coverUrl, fetchImpl);
    coverFileId = cover.fileId;
    if (cover.warning) warnings.push(cover.warning);
  }

  const renderedHtml = holder.innerHTML;

  const draft = await createDraft(
    ctx,
    {
      title: article.title,
      author: article.author,
      digest: article.digest,
      html: renderedHtml,
      coverFileId,
      sourceUrl: article.sourceUrl,
      comment: article.comment,
    },
    { fetchImpl }
  );

  if (!draft.ok) {
    return { ...draft, renderedHtml, uploadReport, warnings };
  }

  return {
    ok: true,
    appMsgId: draft.appMsgId,
    draftUrl: draft.draftUrl,
    error: null,
    raw: draft.raw,
    renderedHtml,
    uploadReport,
    warnings,
  };
}

/* ---------- src/wx/login.js ---------- */
/**
 * 公众号后台扫码登录（可选路径）。
 *
 * 协议已对本机直连实测通过：
 *   POST /cgi-bin/bizlogin?action=startlogin              → {"base_resp":{"ret":0},"uuid":"..."}
 *   GET  /cgi-bin/scanloginqrcode?action=getqrcode&random=<ts> → image/jpg
 *   GET  /cgi-bin/scanloginqrcode?action=ask              → {"status":0,...}
 *
 * 在手机上更推荐直接用官方登录页（账号密码 + 手机确认），因此本模块主要用于桌面端。
 */

/** `ask` 的 status 语义。 */
const QR_STATUS_TEXT = {
  0: '等待扫码',
  1: '已扫码，请在微信中确认',
  2: '二维码已失效，请刷新',
  3: '二维码已失效，请刷新',
  4: '已确认，正在登录',
};

function jsonpBody(extra) {
  return new URLSearchParams({
    userlang: 'zh_CN',
    redirect_url: '',
    login_type: '3',
    token: '',
    lang: 'zh_CN',
    f: 'json',
    ajax: '1',
    ...extra,
  }).toString();
}

function defaultFetch(fetchImpl) {
  const impl = fetchImpl || (typeof fetch === 'function' ? fetch : null);
  if (!impl) throw new Error('当前环境不支持 fetch');
  return impl;
}

/** 第一步：初始化登录会话。 */
async function startQrLogin(fetchImpl) {
  const impl = defaultFetch(fetchImpl);
  const sessionid = Date.now();
  const res = await impl('/cgi-bin/bizlogin?action=startlogin', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: jsonpBody({ sessionid: String(sessionid) }),
  });
  const json = await res.json();
  if (!json || !json.base_resp || json.base_resp.ret !== 0) {
    throw new Error('初始化登录会话失败，请刷新页面重试');
  }
  return { uuid: json.uuid || '', sessionid };
}

/** 第二步：取二维码图片（返回可直接塞进 `<img src>` 的 blob URL）。 */
async function fetchQrImageUrl(fetchImpl) {
  const impl = defaultFetch(fetchImpl);
  const res = await impl(`/cgi-bin/scanloginqrcode?action=getqrcode&random=${Date.now()}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`获取二维码失败（HTTP ${res.status}）`);
  const blob = await res.blob();
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return null;
  return URL.createObjectURL(blob);
}

/** 第三步：轮询扫码状态。 */
async function pollQrStatus(fetchImpl) {
  const impl = defaultFetch(fetchImpl);
  const res = await impl('/cgi-bin/scanloginqrcode?action=ask&token=&lang=zh_CN&f=json&ajax=1', {
    method: 'GET',
    credentials: 'include',
  });
  const json = await res.json();
  const status = Number(json && json.status);
  return {
    status: Number.isFinite(status) ? status : -1,
    text: QR_STATUS_TEXT[status] || '未知状态',
    raw: json,
  };
}

/** 第四步：确认登录，拿到跳转地址（其中含 token）。 */
async function finishQrLogin(fetchImpl) {
  const impl = defaultFetch(fetchImpl);
  const res = await impl('/cgi-bin/bizlogin?action=login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: jsonpBody({ cookie_forbidden: '0', cookie_cleaned: '1', plugin_used: '0' }),
  });
  const json = await res.json();
  if (!json || !json.redirect_url) {
    return { ok: false, redirectUrl: '', error: '登录确认失败，请重新扫码' };
  }
  return { ok: true, redirectUrl: json.redirect_url, error: null };
}

/**
 * 走完整个扫码流程（把轮询与确认串起来），供 UI 调用。
 *
 * @param {{fetchImpl?:Function, intervalMs?:number, timeoutMs?:number,
 *          onQr?:(url:string)=>void, onStatus?:(s:object)=>void}} [options]
 */
async function runQrLogin(options = {}) {
  const { intervalMs = 1500, timeoutMs = 180000, onQr, onStatus } = options;
  const impl = defaultFetch(options.fetchImpl);

  await startQrLogin(impl);
  const qrUrl = await fetchQrImageUrl(impl);
  if (typeof onQr === 'function') onQr(qrUrl);

  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (Date.now() > deadline) throw new Error('二维码已超时，请刷新重试');
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    const state = await pollQrStatus(impl);
    if (typeof onStatus === 'function') onStatus(state);
    if (state.status === 4) break;
  }

  return finishQrLogin(impl);
}

/* ---------- src/wx/fetcher.js ---------- */
/**
 * 抓取并「渲染」目标文章。
 *
 * 为什么不是简单地把 HTML 当字符串处理：
 *  - 公众号的排版有相当一部分来自外链样式表（res.wx.qq.com），字符串里看不到；
 *  - 把 HTML 放进同源 iframe 后，浏览器会把样式表应用好，`getComputedStyle` 就能
 *    拿到真实的字号/行高/颜色，还原度显著高于纯文本解析。
 *
 * 安全：iframe 带 `sandbox="allow-same-origin"`（不给 `allow-scripts`），
 * 因此文章页里的脚本不会执行，而父页面仍可读取其 DOM。
 */

const SCRIPT_BLOCK = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const SCRIPT_INLINE = /<script\b[^>]*\/?>/gi;

/** 去掉所有 `<script>`，避免在 iframe 里执行第三方页面逻辑。 */
function stripScripts(html) {
  return String(html || '').replace(SCRIPT_BLOCK, '').replace(SCRIPT_INLINE, '');
}

/** 同源抓取文章 HTML。 */
async function fetchArticleHtml(url, fetchImpl) {
  const impl = fetchImpl || (typeof fetch === 'function' ? fetch : null);
  if (!impl) throw new Error('当前环境不支持 fetch');

  let res;
  try {
    res = await impl(url, { credentials: 'include', redirect: 'follow' });
  } catch (err) {
    throw new Error(`抓取失败：${err && err.message ? err.message : err}`);
  }
  if (!res.ok) throw new Error(`抓取失败（HTTP ${res.status}）`);
  const html = await res.text();
  if (!html || html.length < 200) throw new Error('抓取到的页面内容为空，请确认链接有效');
  return { html, finalUrl: res.url || url };
}

/**
 * 把 HTML 放进隐藏的同源 iframe 渲染，返回其 document。
 * @returns {Promise<{frame:HTMLIFrameElement, doc:Document, win:Window, destroy:Function}>}
 */
function loadDocumentViaIframe(html, win, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const document = win.document;
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-same-origin');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText =
      'position:fixed;left:-100000px;top:0;width:390px;height:4000px;border:0;visibility:hidden;';
    document.body.appendChild(frame);

    let settled = false;
    const cleanup = () => {
      clearTimeout(timer);
      frame.removeEventListener('load', onLoad);
    };
    const onLoad = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        frame,
        doc: frame.contentDocument,
        win: frame.contentWindow,
        destroy: () => frame.remove(),
      });
    };
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      frame.remove();
      reject(new Error('文章页渲染超时'));
    }, timeoutMs);

    frame.addEventListener('load', onLoad);
    frame.srcdoc = html;
  });
}

/** 判断两个地址是否指向同一篇文章。 */
function isSameArticleUrl(a, b) {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    if (ua.hostname !== ub.hostname) return false;
    if (ua.pathname !== ub.pathname) return false;
    if (ua.pathname.startsWith('/s/')) return true;
    const keys = ['__biz', 'mid', 'idx'];
    return keys.every((key) => (ua.searchParams.get(key) || '') === (ub.searchParams.get(key) || ''));
  } catch {
    return false;
  }
}

/**
 * 拿到「可用于还原」的 document。
 *
 * @param {string} url 规范化后的文章地址
 * @param {{win?:Window, fetchImpl?:Function, preferLive?:boolean}} [options]
 * @returns {Promise<{doc:Document, win:Window, live:boolean, destroy:Function, finalUrl:string}>}
 */
async function loadArticleDocument(url, options = {}) {
  const win = options.win || (typeof window !== 'undefined' ? window : null);
  const fetchImpl =
    options.fetchImpl ||
    (win && typeof win.fetch === 'function' ? win.fetch.bind(win) : typeof fetch === 'function' ? fetch : null);
  if (!win) throw new Error('当前环境没有 window');

  if (options.preferLive !== false && win.location && isSameArticleUrl(url, win.location.href)) {
    return {
      doc: win.document,
      win,
      live: true,
      finalUrl: win.location.href,
      destroy: () => {},
    };
  }

  const { html, finalUrl } = await fetchArticleHtml(url, fetchImpl);
  const rendered = await loadDocumentViaIframe(stripScripts(html), win);
  return { ...rendered, live: false, finalUrl };
}

/* ---------- src/ui/styles.js ---------- */
/**
 * 面板样式。全部挂在 Shadow DOM 内，与宿主页面样式完全隔离。
 * 移动优先：底部固定操作条 + safe-area 适配 + 16px 起的基础字号（避免 iOS 聚焦缩放）。
 */

const PANEL_CSS = `
:host { all: initial; }
*, *::before, *::after { box-sizing: border-box; }

.wp-root {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  flex-direction: column;
  background: #f2f3f5;
  color: #1f1f1f;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  font-size: 16px;
  line-height: 1.6;
  -webkit-text-size-adjust: 100%;
}
.wp-root[hidden] { display: none; }

.wp-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: calc(env(safe-area-inset-top, 0px) + 10px) 12px 10px;
  background: #07c160;
  color: #fff;
  flex: 0 0 auto;
}
.wp-header h1 { flex: 1 1 auto; margin: 0; font-size: 17px; font-weight: 600; }
.wp-header .wp-sub { font-size: 12px; opacity: .85; font-weight: 400; }

.wp-body { flex: 1 1 auto; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 12px; }
.wp-body.wp-body--flush { padding: 0; }

.wp-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,.05);
}
.wp-card h2 { margin: 0 0 8px; font-size: 15px; font-weight: 600; }

.wp-label { display: block; font-size: 13px; color: #666; margin: 10px 0 4px; }
.wp-input, .wp-textarea {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 16px;
  font-family: inherit;
  background: #fafafa;
  color: #1f1f1f;
}
.wp-textarea { min-height: 120px; resize: vertical; line-height: 1.5; }
.wp-textarea--source { min-height: 45vh; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
.wp-input:focus, .wp-textarea:focus { outline: 2px solid #07c160; outline-offset: -1px; background: #fff; }

.wp-btn {
  appearance: none;
  border: 0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  font-family: inherit;
  font-weight: 500;
  background: #07c160;
  color: #fff;
  cursor: pointer;
  min-height: 44px;
}
.wp-btn[disabled] { opacity: .5; }
.wp-btn--ghost { background: #fff; color: #07c160; border: 1px solid #07c160; }
.wp-btn--plain { background: #f2f3f5; color: #333; }
.wp-btn--danger { background: #fa5151; }
.wp-btn--block { display: block; width: 100%; }
.wp-row { display: flex; gap: 8px; flex-wrap: wrap; }
.wp-row > .wp-btn { flex: 1 1 auto; }

.wp-hint { font-size: 13px; color: #888; margin: 6px 0 0; }
.wp-warn {
  background: #fff8e6; border: 1px solid #ffe0a3; color: #8a6100;
  border-radius: 8px; padding: 10px 12px; font-size: 13px; margin-bottom: 8px;
}
.wp-error {
  background: #fff1f0; border: 1px solid #ffccc7; color: #cf1322;
  border-radius: 8px; padding: 10px 12px; font-size: 14px; margin-bottom: 8px;
}
.wp-ok { background: #f0fff4; border: 1px solid #b7ebc6; color: #0a7d33;
  border-radius: 8px; padding: 10px 12px; font-size: 14px; margin-bottom: 8px; }

.wp-toolbar {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 8px 10px;
  background: #fff;
  border-bottom: 1px solid #ececec;
  flex: 0 0 auto;
  scrollbar-width: none;
}
.wp-toolbar::-webkit-scrollbar { display: none; }
.wp-tool {
  flex: 0 0 auto;
  min-width: 44px;
  height: 40px;
  padding: 0 10px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: #fff;
  font-size: 15px;
  font-family: inherit;
  color: #333;
  cursor: pointer;
}
.wp-tool:active { background: #f0f0f0; }
.wp-sep { flex: 0 0 auto; width: 1px; background: #e5e5e5; margin: 4px 2px; }

.wp-canvas { flex: 1 1 auto; overflow-y: auto; -webkit-overflow-scrolling: touch; background: #fff; padding: 14px; }
.wp-canvas .wp-article { outline: none; min-height: 60vh; font-size: 16px; line-height: 1.75; color: #333; word-break: break-word; }
.wp-canvas .wp-article img { max-width: 100%; height: auto; }
.wp-canvas .wp-article a { color: #576b95; }

.wp-tabs {
  display: flex; gap: 4px; padding: 8px 10px; background: #fff; border-top: 1px solid #ececec;
  overflow-x: auto; flex: 0 0 auto;
}
.wp-tab {
  flex: 1 1 auto; min-height: 40px; border: 0; border-radius: 8px; background: #f2f3f5;
  font-size: 14px; font-family: inherit; color: #555; cursor: pointer; white-space: nowrap; padding: 0 10px;
}
.wp-tab.is-active { background: #07c160; color: #fff; }

.wp-footer {
  flex: 0 0 auto;
  display: flex; gap: 8px;
  padding: 10px 12px calc(env(safe-area-inset-bottom, 0px) + 10px);
  background: #fff; border-top: 1px solid #ececec;
}
.wp-footer .wp-btn { flex: 1 1 auto; }

.wp-list { margin: 0; padding: 0; list-style: none; }
.wp-list li {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;
}
.wp-list li:last-child { border-bottom: 0; }
.wp-thumb { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; background: #f2f3f5; flex: 0 0 auto; }
.wp-tag { font-size: 12px; padding: 1px 6px; border-radius: 4px; background: #f2f3f5; color: #666; }
.wp-tag--ok { background: #e8fff0; color: #0a7d33; }
.wp-tag--bad { background: #fff1f0; color: #cf1322; }
.wp-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.wp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 8px; }
.wp-grid img { width: 100%; height: 72px; object-fit: cover; border-radius: 8px; background: #f2f3f5; }

.wp-progress { height: 6px; border-radius: 3px; background: #eee; overflow: hidden; margin: 8px 0; }
.wp-progress > i { display: block; height: 100%; width: 0; background: #07c160; transition: width .2s; }

.wp-float {
  position: fixed;
  right: 16px;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
  z-index: 2147482999;
  min-width: 56px; height: 56px; border-radius: 28px; border: 0;
  background: #07c160; color: #fff; font-size: 14px; font-weight: 600;
  box-shadow: 0 4px 14px rgba(0,0,0,.22); cursor: pointer; padding: 0 18px;
}

.wp-qr { text-align: center; }
.wp-qr img { width: 200px; height: 200px; border: 1px solid #eee; border-radius: 8px; background: #fff; }

.wp-kv { display: flex; gap: 8px; font-size: 13px; color: #666; }
.wp-kv b { color: #1f1f1f; font-weight: 500; }
.wp-scroll-x { overflow-x: auto; -webkit-overflow-scrolling: touch; }

@media (min-width: 900px) {
  .wp-root { font-size: 15px; }
  .wp-body { max-width: 820px; margin: 0 auto; width: 100%; }
  .wp-canvas { max-width: 677px; margin: 0 auto; width: 100%; border-left: 1px solid #ececec; border-right: 1px solid #ececec; }
  .wp-toolbar, .wp-tabs, .wp-footer { max-width: 100%; }
}
`;

/** 浮起按钮的文案。 */
const FLOATING_BUTTON_TEXT = '转载';

/* ---------- src/ui/toolbar.js ---------- */
/**
 * 工具栏：按钮定义 + 选区格式化。
 *
 * 优先用 `document.execCommand`（iOS Safari 对常用命令支持良好），
 * 对微信正文更友好的「行内样式」类操作则用 Range 自己包 `<span>`，
 * 因为 execCommand('fontSize') 产出的是 `<font size="1-7">`，公众号不友好。
 */

const FONT_SIZE_CHOICES = [14, 15, 16, 17, 18, 20, 22, 24];

const TEXT_COLOR_CHOICES = [
  '#000000', '#333333', '#666666', '#888888', '#ffffff',
  '#07c160', '#576b95', '#fa5151', '#ffc300', '#10aeff',
];

const BG_COLOR_CHOICES = ['#ffffff', '#f7f7f7', '#fff8e6', '#e8fff0', '#eaf4ff', '#fff1f0'];

const LINE_HEIGHT_CHOICES = ['1.4', '1.5', '1.6', '1.75', '1.8', '2'];

/** 工具栏按钮定义。`kind` 决定执行方式。 */
const TOOLBAR_ITEMS = [
  { id: 'bold', label: 'B', title: '加粗', kind: 'exec', cmd: 'bold', style: 'font-weight:700' },
  { id: 'italic', label: 'I', title: '斜体', kind: 'exec', cmd: 'italic', style: 'font-style:italic' },
  { id: 'underline', label: 'U', title: '下划线', kind: 'exec', cmd: 'underline', style: 'text-decoration:underline' },
  { id: 'strike', label: 'S', title: '删除线', kind: 'exec', cmd: 'strikeThrough', style: 'text-decoration:line-through' },
  { id: 'sep1', kind: 'sep' },
  { id: 'h2', label: '大标题', title: '大标题', kind: 'block', tag: 'h2' },
  { id: 'h3', label: '小标题', title: '小标题', kind: 'block', tag: 'h3' },
  { id: 'p', label: '正文', title: '正文段落', kind: 'block', tag: 'p' },
  { id: 'blockquote', label: '引用', title: '引用', kind: 'block', tag: 'blockquote' },
  { id: 'sep2', kind: 'sep' },
  { id: 'alignLeft', label: '左', title: '左对齐', kind: 'exec', cmd: 'justifyLeft' },
  { id: 'alignCenter', label: '中', title: '居中', kind: 'exec', cmd: 'justifyCenter' },
  { id: 'alignRight', label: '右', title: '右对齐', kind: 'exec', cmd: 'justifyRight' },
  { id: 'ordered', label: '1.', title: '有序列表', kind: 'exec', cmd: 'insertOrderedList' },
  { id: 'unordered', label: '•', title: '无序列表', kind: 'exec', cmd: 'insertUnorderedList' },
  { id: 'sep3', kind: 'sep' },
  { id: 'hr', label: '—', title: '分割线', kind: 'hr' },
  { id: 'link', label: '链接', title: '插入链接', kind: 'link' },
  { id: 'clear', label: '清格式', title: '清除格式', kind: 'exec', cmd: 'removeFormat' },
];

/** 执行 execCommand（会先打开 styleWithCSS，让产出是 span 行内样式）。 */
function execEditorCommand(win, cmd, value) {
  const doc = win && win.document;
  if (!doc || typeof doc.execCommand !== 'function') return false;
  try {
    if (cmd !== 'styleWithCSS') doc.execCommand('styleWithCSS', false, true);
    return doc.execCommand(cmd, false, value === undefined ? null : value);
  } catch {
    return false;
  }
}

/**
 * 用 Range 给选区套一个带行内样式的 `<span>`。
 * 选区跨越多个块级元素时 `surroundContents` 会抛错，此时返回 false 由调用方降级。
 */
function applyInlineStyle(win, prop, value) {
  const doc = win && win.document;
  const sel = win && win.getSelection ? win.getSelection() : null;
  if (!doc || !sel || sel.rangeCount === 0) return false;

  const range = sel.getRangeAt(0);
  if (range.collapsed) return false;

  const span = doc.createElement('span');
  span.setAttribute('style', `${prop}:${value};`);
  try {
    range.surroundContents(span);
  } catch {
    return false;
  }
  sel.removeAllRanges();
  const next = doc.createRange();
  next.selectNodeContents(span);
  sel.addRange(next);
  return true;
}

/** 把选中的块级元素整体套上一个样式（用于行高 / 段后距这类段落属性）。 */
function applyBlockStyle(win, prop, value) {
  const doc = win && win.document;
  const sel = win && win.getSelection ? win.getSelection() : null;
  if (!doc || !sel || sel.rangeCount === 0) return false;

  let node = sel.getRangeAt(0).startContainer;
  if (node && node.nodeType === 3) node = node.parentNode;
  let depth = 0;
  while (node && node.nodeType === 1 && depth < 40) {
    const tag = node.tagName ? node.tagName.toUpperCase() : '';
    if (['P', 'SECTION', 'DIV', 'LI', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4'].includes(tag)) {
      node.style.setProperty(prop, value);
      return true;
    }
    node = node.parentNode;
    depth += 1;
  }
  return false;
}

/** 在当前选区插入一段 HTML。 */
function insertHtmlAtSelection(win, html) {
  const doc = win && win.document;
  const sel = win && win.getSelection ? win.getSelection() : null;
  if (!doc || !sel || sel.rangeCount === 0) return false;

  try {
    if (execEditorCommand(win, 'insertHTML', html)) return true;
  } catch {
    /* 继续降级 */
  }

  const range = sel.getRangeAt(0);
  range.deleteContents();
  const template = doc.createElement('template');
  template.innerHTML = html;
  const fragment = template.content.cloneNode(true);
  const lastNode = fragment.lastChild;
  range.insertNode(fragment);
  if (lastNode) {
    sel.removeAllRanges();
    const next = doc.createRange();
    next.setStartAfter(lastNode);
    next.collapse(true);
    sel.addRange(next);
  }
  return true;
}

/* ---------- src/ui/editor.js ---------- */
/**
 * 编辑画布：contenteditable 正文 + 源码模式。
 *
 * iOS 注意点：
 *  - `autocorrect/autocapitalize/spellcheck` 必须关掉，否则英文会被自动改写；
 *  - 基础字号 ≥16px，避免聚焦时 Safari 自动放大页面；
 *  - 每次内容变化都回调（面板去做节流后的自动保存），防止换页时内存回收丢内容。
 */

const FORBIDDEN_PASTE_TAGS = /<(script|style|link|iframe|object|embed|meta)\b[\s\S]*?(<\/\1>|>)/gi;

/** 清洗粘贴进来的 HTML。 */
function sanitizePastedHtml(html) {
  return String(html || '')
    .replace(FORBIDDEN_PASTE_TAGS, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '');
}

/** 粗略统计中文字数 / 英文单词数。 */
function countWords(text) {
  const value = String(text || '');
  const cjk = (value.match(/[\u4e00-\u9fa5]/g) || []).length;
  const words = (value.match(/[A-Za-z0-9]+/g) || []).length;
  return cjk + words;
}

/**
 * @param {HTMLElement} host 挂载容器（面板内的 canvas 区域）
 * @param {{onChange?:Function, win?:Window}} [options]
 */
function createEditor(host, options = {}) {
  const win = options.win || (typeof window !== 'undefined' ? window : null);
  const doc = host.ownerDocument;

  const articleEl = doc.createElement('div');
  articleEl.className = 'wp-article';
  articleEl.setAttribute('contenteditable', 'true');
  articleEl.setAttribute('autocorrect', 'off');
  articleEl.setAttribute('autocapitalize', 'off');
  articleEl.setAttribute('spellcheck', 'false');
  articleEl.setAttribute('translate', 'no');

  const sourceEl = doc.createElement('textarea');
  sourceEl.className = 'wp-textarea wp-textarea--source';
  sourceEl.spellcheck = false;
  sourceEl.hidden = true;

  host.appendChild(articleEl);
  host.appendChild(sourceEl);

  let sourceMode = false;
  let changeTimer = null;
  let destroyed = false;

  const emit = (immediate) => {
    if (destroyed || typeof options.onChange !== 'function') return;
    if (changeTimer) clearTimeout(changeTimer);
    if (immediate) {
      options.onChange();
      return;
    }
    changeTimer = setTimeout(() => {
      changeTimer = null;
      options.onChange();
    }, 500);
  };

  articleEl.addEventListener('input', () => emit(false));

  // 粘贴：拦截富文本，清洗后再插入，避免把 <style>/<script> 带进正文
  articleEl.addEventListener('paste', (event) => {
    const data = event.clipboardData;
    if (!data) return;
    const html = data.getData('text/html');
    if (!html) return;
    event.preventDefault();
    const clean = sanitizePastedHtml(html);
    try {
      if (!doc.execCommand('insertHTML', false, clean)) throw new Error('fallback');
    } catch {
      const sel = win.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const template = doc.createElement('template');
        template.innerHTML = clean;
        range.insertNode(template.content.cloneNode(true));
      }
    }
    emit(false);
  });

  sourceEl.addEventListener('input', () => emit(false));

  return {
    articleEl,
    sourceEl,

    /** @param {string} html */
    setHtml(html) {
      articleEl.innerHTML = html || '';
      sourceEl.value = articleEl.innerHTML;
    },

    /** @returns {string} */
    getHtml() {
      return sourceMode ? sourceEl.value : articleEl.innerHTML;
    },

    /** 源码模式下把 textarea 的内容同步回可视区（用于切换回预览）。 */
    commitSource() {
      if (!sourceMode) return;
      const next = sanitizePastedHtml(sourceEl.value);
      articleEl.innerHTML = next;
      sourceEl.value = next;
    },

    /** @param {boolean} next */
    setSourceMode(next) {
      if (next === sourceMode) return;
      if (!next) this.commitSource();
      else sourceEl.value = articleEl.innerHTML;
      sourceMode = next;
      articleEl.hidden = next;
      sourceEl.hidden = !next;
      emit(true);
    },

    isSourceMode() {
      return sourceMode;
    },

    focus() {
      if (sourceMode) sourceEl.focus();
      else articleEl.focus();
    },

    /** @returns {{words:number, images:number, links:number, chars:number}} */
    getStats() {
      const html = this.getHtml();
      const holder = doc.createElement('div');
      holder.innerHTML = html;
      return {
        words: countWords(holder.textContent || ''),
        images: holder.querySelectorAll('img').length,
        links: holder.querySelectorAll('a').length,
        chars: html.length,
      };
    },

    destroy() {
      destroyed = true;
      if (changeTimer) clearTimeout(changeTimer);
      articleEl.remove();
      sourceEl.remove();
    },
  };
}

/* ---------- src/ui/panel.js ---------- */
/**
 * 悬浮面板：抓取 → 编辑 → 发布 的完整交互。
 *
 * 全部挂在 Shadow DOM 内，与宿主页面样式互不干扰，同时保持「同源」这一前提
 * （同源才有公众号登录 Cookie，才能建草稿）。
 *
 * 渲染策略：编辑页的 DOM 只构建一次并复用，切换标签/点工具栏不会重建可编辑区，
 * 否则 iOS 上会丢焦点、丢光标位置，甚至清空已编辑内容。
 */











/** 极简 DOM 构建器。 */
function el(doc, tag, props = {}, children = []) {
  const node = doc.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else node.setAttribute(key, value === true ? '' : String(value));
  });
  (Array.isArray(children) ? children : [children]).forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    node.appendChild(typeof child === 'string' ? doc.createTextNode(child) : child);
  });
  return node;
}

function formatTime(ts) {
  const date = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getMonth() + 1}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * @param {{win?:Window, store?:object}} [options]
 */
function createPanel(options = {}) {
  const win = options.win || (typeof window !== 'undefined' ? window : null);
  if (!win) throw new Error('createPanel 需要 window');
  const doc = win.document;

  const host = el(doc, 'div', { id: 'wechatpassage-root' });
  doc.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.appendChild(el(doc, 'style', { text: PANEL_CSS }));

  const root = el(doc, 'div', { class: 'wp-root', hidden: true });
  shadow.appendChild(root);

  const store = options.store || createDraftStore(resolveStorage());

  const state = {
    screen: 'home',
    url: '',
    article: null,
    articleKey: 0,
    ctx: null,
    ctxError: '',
    busy: '',
    progress: 0,
    error: '',
    warnings: [],
    tab: 'meta',
    drafts: [],
    result: null,
    autoSaved: 0,
    forceReupload: false,
    attribution: true,
    qrUrl: '',
    qrStatus: '',
    currentDraftId: null,
  };

  let editorRefs = null;
  let renderedTab = null;
  let renderedArticleKey = -1;

  /* -------------------------------------------------------------- 工具 */

  const render = () => renderScreen();

  const setState = (patch) => {
    Object.assign(state, patch);
    render();
  };

  const loadContext = async () => {
    const result = await getWxContext({ win });
    if (result.ok) setState({ ctx: result.context, ctxError: '' });
    else setState({ ctx: null, ctxError: result.error || '未登录' });
    return result;
  };

  let persistTimer = null;

  const persistDraft = () => {
    if (!editorRefs || !state.article) return;
    try {
      const record = {
        id: state.currentDraftId || newDraftId(),
        title: editorRefs.titleInput.value || state.article.title || '未命名草稿',
        author: editorRefs.authorInput.value || '',
        digest: editorRefs.digestInput.value || '',
        html: editorRefs.editor.getHtml(),
        coverUrl: state.article.coverUrl || '',
        sourceUrl: state.article.sourceUrl || state.url || '',
        accountName: state.article.accountName || '',
      };
      store.save(record);
      state.currentDraftId = record.id;
      state.autoSaved = Date.now();
    } catch (err) {
      state.warnings = [...state.warnings, err.message];
    }
  };

  /**
   * 输入过程中节流保存。
   * 每敲一个字就把整篇 HTML 写一遍 localStorage，在手机上会明显卡顿，
   * 这里统一延迟 400ms，并在切页/发布前强制落盘。
   */
  const schedulePersist = () => {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      persistTimer = null;
      persistDraft();
    }, 400);
  };

  const flushPersist = () => {
    if (persistTimer) {
      clearTimeout(persistTimer);
      persistTimer = null;
    }
    persistDraft();
  };

  const collectArticlePayload = () => {
    const article = state.article || {};
    return {
      title: (editorRefs ? editorRefs.titleInput.value : article.title) || '',
      author: (editorRefs ? editorRefs.authorInput.value : article.author) || '',
      digest: (editorRefs ? editorRefs.digestInput.value : article.digest) || '',
      html: editorRefs ? editorRefs.editor.getHtml() : article.html || '',
      coverUrl: article.coverUrl || '',
      sourceUrl: article.sourceUrl || state.url || '',
      accountName: article.accountName || '',
    };
  };

  /* ----------------------------------------------------------- 主流程 */

  const doFetch = async () => {
    const parsed = parseArticleUrl(state.url);
    if (!parsed.ok) {
      setState({ error: parsed.error, warnings: [] });
      return;
    }
    setState({ busy: '正在抓取文章…', error: '', warnings: [], progress: 0, url: parsed.canonicalUrl });

    let loaded = null;
    try {
      loaded = await loadArticleDocument(parsed.canonicalUrl, { win, preferLive: true });
    } catch (err) {
      setState({ busy: '', error: err.message });
      return;
    }

    try {
      const restored = restoreArticle(loaded.doc, {
        sourceUrl: loaded.finalUrl || parsed.canonicalUrl,
        win: loaded.win,
        attribution: state.attribution,
        captureComputed: true,
      });
      if (!restored.ok) {
        setState({ busy: '', error: restored.error || '无法还原这篇文章' });
        return;
      }
      setState({
        busy: '',
        article: restored,
        articleKey: state.articleKey + 1,
        warnings: restored.warnings.slice(),
        error: '',
        screen: 'editor',
        tab: 'meta',
        currentDraftId: null,
        drafts: store.list(),
      });
    } finally {
      if (loaded && typeof loaded.destroy === 'function') loaded.destroy();
    }
  };

  const doPublish = async () => {
    if (!state.ctx) {
      const result = await loadContext();
      if (!result.ok) {
        setState({ error: result.error, screen: 'home' });
        return;
      }
    }
    const payload = collectArticlePayload();
    const titleLen = [...payload.title].length;
    if (!titleLen) {
      setState({ error: '标题不能为空' });
      return;
    }
    if (titleLen > 64) {
      setState({ error: `标题超长（${titleLen}/64 字），请精简后再发布` });
      return;
    }
    const digestLen = [...(payload.digest || '')].length;
    if (digestLen > 120) {
      setState({ error: `摘要超长（${digestLen}/120 字），请精简后再发布` });
      return;
    }

    flushPersist();
    setState({ screen: 'publish', busy: '正在转存图片…', progress: 0, error: '', warnings: [], result: null });

    try {
      const result = await publishArticle(state.ctx, payload, {
        forceReupload: state.forceReupload,
        baseUrl: 'https://mp.weixin.qq.com/',
        doc,
        onProgress: (event) => {
          const total = Math.max(event.total || 1, 1);
          const done = (event.uploaded || []).length + (event.failed || []).length;
          state.progress = Math.round((done / total) * 100);
          state.busy = `正在转存图片…（${done}/${total}）`;
          render();
        },
      });

      setState({
        result,
        busy: '',
        progress: 100,
        warnings: result.warnings || [],
        error: result.ok ? '' : result.error,
      });
    } catch (err) {
      setState({ result: null, busy: '', error: err.message || String(err) });
    }
  };

  const doQrLogin = async () => {
    setState({ screen: 'login', qrUrl: '', qrStatus: '正在获取二维码…', error: '' });
    try {
      await runQrLogin({
        fetchImpl: win.fetch.bind(win),
        onQr: (url) => {
          state.qrUrl = url;
          state.qrStatus = '请用微信扫码并确认';
          render();
        },
        onStatus: (statusState) => {
          state.qrStatus = statusState.text;
          render();
        },
      });
      await loadContext();
      setState({ screen: 'home', qrUrl: '', qrStatus: '' });
    } catch (err) {
      setState({ error: err.message || String(err), qrStatus: '' });
    }
  };

  /* ------------------------------------------------------------- 渲染 */

  function renderHeader() {
    const titles = {
      home: ['公众号转载工具', state.ctx ? state.ctx.nickname : '未登录'],
      editor: ['编辑正文', state.article ? shortenUrl(state.article.title || '', 16) : ''],
      publish: ['发布结果', ''],
      login: ['扫码登录', ''],
    };
    const [title, subtitle] = titles[state.screen] || titles.home;
    return el(doc, 'div', { class: 'wp-header' }, [
      el(doc, 'h1', { text: title }, subtitle ? [el(doc, 'span', { class: 'wp-sub', text: `  ${subtitle}` })] : []),
      el(doc, 'button', {
        class: 'wp-btn',
        'data-act': 'close',
        text: '关闭',
        style: 'background:rgba(255,255,255,.2);color:#fff;min-height:36px;padding:8px 14px',
      }),
    ]);
  }

  function renderWarnings(limit = 6) {
    const list = (state.warnings || []).slice(0, limit);
    if (!list.length) return null;
    return el(doc, 'div', {}, list.map((msg) => el(doc, 'div', { class: 'wp-warn', text: msg })));
  }

  function renderErrorBanner() {
    return state.error ? el(doc, 'div', { class: 'wp-error', text: state.error }) : null;
  }

  function renderLoginActions() {
    return el(doc, 'div', { class: 'wp-row', style: 'margin-top:10px' }, [
      el(doc, 'button', { class: 'wp-btn wp-btn--ghost', 'data-act': 'open-login-page', text: '打开登录页' }),
      el(doc, 'button', { class: 'wp-btn wp-btn--plain', 'data-act': 'qr-login', text: '扫码登录' }),
      el(doc, 'button', { class: 'wp-btn wp-btn--plain', 'data-act': 'recheck-login', text: '重新检测' }),
    ]);
  }

  function renderHome() {
    const body = el(doc, 'div', { class: 'wp-body' });
    const loginLine = state.ctx
      ? el(doc, 'div', { class: 'wp-ok', text: `已登录：${state.ctx.nickname || state.ctx.userName || '公众号'}` })
      : el(doc, 'div', { class: 'wp-warn', text: state.ctxError || '尚未检测到公众号登录态' });

    body.appendChild(
      el(doc, 'div', { class: 'wp-card' }, [
        el(doc, 'h2', { text: '粘贴公众号文章链接' }),
        el(doc, 'input', {
          class: 'wp-input',
          type: 'url',
          inputmode: 'url',
          autocomplete: 'off',
          autocorrect: 'off',
          autocapitalize: 'off',
          spellcheck: 'false',
          placeholder: 'https://mp.weixin.qq.com/s/...',
          value: state.url || '',
          'data-role': 'url-input',
        }),
        el(doc, 'p', { class: 'wp-hint', text: '也可以先打开目标文章，再点右下角「转载」，会自动抓取当前文章。' }),
        el(doc, 'div', { class: 'wp-row', style: 'margin-top:10px' }, [
          el(doc, 'button', { class: 'wp-btn', 'data-act': 'fetch', disabled: Boolean(state.busy), text: state.busy || '抓取并还原' }),
        ]),
      ])
    );

    body.appendChild(el(doc, 'div', { class: 'wp-card' }, [loginLine, renderLoginActions()]));
    const warn = renderWarnings();
    if (warn) body.appendChild(warn);

    if (state.drafts.length) {
      body.appendChild(
        el(doc, 'div', { class: 'wp-card' }, [
          el(doc, 'h2', { text: '本地草稿' }),
          el(
            doc,
            'ul',
            { class: 'wp-list' },
            state.drafts.slice(0, 8).map((draft) =>
              el(doc, 'li', {}, [
                el(doc, 'span', {
                  class: 'wp-ellipsis',
                  style: 'flex:1 1 auto',
                  text: `${draft.title}  ·  ${formatTime(draft.updatedAt)}`,
                }),
                el(doc, 'button', { class: 'wp-btn wp-btn--plain', 'data-act': `open-draft:${draft.id}`, text: '打开' }),
                el(doc, 'button', { class: 'wp-btn wp-btn--plain', 'data-act': `del-draft:${draft.id}`, text: '删' }),
              ])
            )
          ),
        ])
      );
    }

    body.appendChild(
      el(doc, 'div', { class: 'wp-card' }, [
        el(doc, 'h2', { text: '发布选项' }),
        el(doc, 'label', { class: 'wp-kv', style: 'display:flex;align-items:center;gap:8px;margin-top:8px' }, [
          el(doc, 'input', { type: 'checkbox', 'data-role': 'force-reupload', checked: state.forceReupload }),
          el(doc, 'span', { text: '强制把所有图片转存到自己的素材库' }),
        ]),
        el(doc, 'label', { class: 'wp-kv', style: 'display:flex;align-items:center;gap:8px;margin-top:8px' }, [
          el(doc, 'input', { type: 'checkbox', 'data-role': 'attribution', checked: state.attribution }),
          el(doc, 'span', { text: '自动追加「本文转载自 …」来源声明' }),
        ]),
      ])
    );

    return body;
  }

  function renderLogin() {
    const body = el(doc, 'div', { class: 'wp-body' });
    body.appendChild(
      el(doc, 'div', { class: 'wp-card wp-qr' }, [
        el(doc, 'h2', { text: '扫码登录公众号' }),
        state.qrUrl
          ? el(doc, 'img', { src: state.qrUrl, alt: '登录二维码' })
          : el(doc, 'p', { class: 'wp-hint', text: '正在获取二维码…' }),
        el(doc, 'p', { class: 'wp-hint', text: state.qrStatus }),
        el(doc, 'p', {
          class: 'wp-hint',
          text: '二维码和手机是同一台设备时：长按二维码 → 存储到照片 → 微信「扫一扫」→ 右下角「相册」→ 选该二维码。',
        }),
        el(doc, 'div', { class: 'wp-row', style: 'margin-top:10px' }, [
          el(doc, 'button', { class: 'wp-btn wp-btn--plain', 'data-act': 'qr-login', text: '重新获取' }),
          el(doc, 'button', { class: 'wp-btn wp-btn--ghost', 'data-act': 'recheck-login', text: '我已确认，检测登录' }),
        ]),
      ])
    );
    const warn = renderWarnings();
    if (warn) body.appendChild(warn);
    return body;
  }

  function renderPublish() {
    const body = el(doc, 'div', { class: 'wp-body' });

    if (state.busy) {
      body.appendChild(
        el(doc, 'div', { class: 'wp-card' }, [
          el(doc, 'h2', { text: state.busy }),
          el(doc, 'div', { class: 'wp-progress' }, [el(doc, 'i', { style: `width:${state.progress}%` })]),
        ])
      );
    }

    const result = state.result;
    if (result) {
      if (result.ok) {
        body.appendChild(
          el(doc, 'div', { class: 'wp-card' }, [
            el(doc, 'div', { class: 'wp-ok', text: '草稿已创建，请到公众号后台核对后发表。' }),
            el(doc, 'p', { class: 'wp-hint', text: `素材 ID：${result.appMsgId}` }),
            el(doc, 'p', {
              class: 'wp-hint',
              text: `图片：成功 ${result.uploadReport.uploaded.length} · 沿用 ${result.uploadReport.skipped.length} · 失败 ${result.uploadReport.failed.length}`,
            }),
            el(doc, 'div', { class: 'wp-row', style: 'margin-top:10px' }, [
              el(doc, 'a', {
                class: 'wp-btn',
                href: result.draftUrl,
                target: '_blank',
                rel: 'noreferrer',
                text: '打开后台草稿',
                style: 'text-align:center;text-decoration:none;line-height:44px',
              }),
            ]),
          ])
        );
        if (result.uploadReport.failed.length) {
          body.appendChild(
            el(doc, 'div', { class: 'wp-card' }, [
              el(doc, 'h2', { text: '未转存的图片' }),
              el(
                doc,
                'ul',
                { class: 'wp-list' },
                result.uploadReport.failed.map((item) =>
                  el(doc, 'li', {}, [
                    el(doc, 'span', { class: 'wp-ellipsis', style: 'flex:1 1 auto', text: `#${item.index} ${item.reason}` }),
                  ])
                )
              ),
            ])
          );
        }
      } else {
        body.appendChild(el(doc, 'div', { class: 'wp-card' }, [el(doc, 'div', { class: 'wp-error', text: result.error || '发布失败' })]));
      }
    }

    const banner = renderErrorBanner();
    if (banner) body.appendChild(el(doc, 'div', { class: 'wp-card' }, [banner]));
    const warn = renderWarnings();
    if (warn) body.appendChild(warn);

    return body;
  }

  /* -------------------------------------------------------- 编辑页 DOM */

  function currentImageSources() {
    if (!editorRefs) return [];
    const holder = doc.createElement('div');
    holder.innerHTML = editorRefs.editor.getHtml();
    return Array.from(holder.querySelectorAll('img'))
      .map((img) => img.getAttribute('src') || img.getAttribute('data-src') || '')
      .filter(Boolean);
  }

  function buildEditorScreen() {
    if (editorRefs) return editorRefs.wrapper;

    const wrapper = el(doc, 'div', { style: 'display:flex;flex-direction:column;flex:1 1 auto;min-height:0' });

    const titleInput = el(doc, 'input', {
      class: 'wp-input',
      'data-role': 'title',
      placeholder: '标题',
      autocorrect: 'off',
      autocapitalize: 'off',
      spellcheck: 'false',
    });

    const toolbar = el(
      doc,
      'div',
      { class: 'wp-toolbar' },
      TOOLBAR_ITEMS.map((item) =>
        item.kind === 'sep'
          ? el(doc, 'span', { class: 'wp-sep' })
          : el(doc, 'button', {
              class: 'wp-tool',
              'data-act': `tool:${item.id}`,
              title: item.title,
              text: item.label,
              style: item.style || '',
            })
      )
    );

    // 字号 / 行高两个下拉放在工具栏末尾，避免占用过多横向空间
    const sizeSelect = el(
      doc,
      'select',
      { class: 'wp-tool', 'data-role': 'font-size', title: '字号' },
      FONT_SIZE_CHOICES.map((size) => el(doc, 'option', { value: String(size), text: `${size}px` }))
    );
    sizeSelect.value = '16';
    toolbar.appendChild(el(doc, 'span', { class: 'wp-sep' }));
    toolbar.appendChild(sizeSelect);

    const lineSelect = el(
      doc,
      'select',
      { class: 'wp-tool', 'data-role': 'line-height', title: '行高' },
      LINE_HEIGHT_CHOICES.map((value) => el(doc, 'option', { value, text: `行高${value}` }))
    );
    lineSelect.value = '1.75';
    toolbar.appendChild(lineSelect);

    const canvasHost = el(doc, 'div', { class: 'wp-canvas' });
    const editor = createEditor(canvasHost, {
      win,
      onChange: () => {
        schedulePersist();
        refreshStats();
      },
    });

    const stats = el(doc, 'p', {
      class: 'wp-hint',
      style: 'padding:4px 12px;margin:0;background:#fff',
      'data-role': 'stats',
    });

    // 元数据面板只构建一次，避免输入过程中重建导致 iOS 丢焦点
    const authorInput = el(doc, 'input', { class: 'wp-input', 'data-role': 'author', placeholder: '作者' });
    const digestInput = el(doc, 'textarea', {
      class: 'wp-textarea',
      'data-role': 'digest',
      style: 'min-height:80px',
      placeholder: '摘要（≤120 字）',
    });
    const digestCount = el(doc, 'p', { class: 'wp-hint', 'data-role': 'digest-count' });
    const metaInfo = el(doc, 'div', { class: 'wp-kv', style: 'margin-top:10px;flex-direction:column;gap:4px' });

    const metaPane = el(doc, 'div', { class: 'wp-body' }, [
      el(doc, 'div', { class: 'wp-card' }, [
        el(doc, 'label', { class: 'wp-label', text: '作者' }),
        authorInput,
        el(doc, 'label', { class: 'wp-label', text: '摘要（≤120 字）' }),
        digestInput,
        digestCount,
        metaInfo,
      ]),
    ]);

    const paneHost = el(doc, 'div', { style: 'flex:0 0 auto' });
    const tabsHost = el(doc, 'div', { style: 'flex:0 0 auto' });

    wrapper.appendChild(
      el(doc, 'div', {
        class: 'wp-body wp-body--flush',
        style: 'flex:0 0 auto;padding:10px 12px 0;background:#fff',
      }, [titleInput])
    );
    wrapper.appendChild(toolbar);
    wrapper.appendChild(canvasHost);
    wrapper.appendChild(stats);
    wrapper.appendChild(tabsHost);
    wrapper.appendChild(paneHost);

    editorRefs = {
      wrapper,
      toolbar,
      canvasHost,
      editor,
      tabsHost,
      paneHost,
      stats,
      titleInput,
      authorInput,
      digestInput,
      digestCount,
      metaInfo,
      metaPane,
      sizeSelect,
      lineSelect,
    };

    titleInput.addEventListener('input', () => {
      schedulePersist();
      refreshStats();
    });
    authorInput.addEventListener('input', () => schedulePersist());
    digestInput.addEventListener('input', () => {
      schedulePersist();
      refreshStats();
    });

    sizeSelect.addEventListener('change', () => {
      if (editor.isSourceMode()) return;
      editor.articleEl.focus();
      if (!applyInlineStyle(win, 'font-size', `${sizeSelect.value}px`)) {
        execEditorCommand(win, 'fontSize', sizeSelect.value);
      }
      flushPersist();
      refreshStats();
    });
    lineSelect.addEventListener('change', () => {
      if (editor.isSourceMode()) return;
      editor.articleEl.focus();
      applyBlockStyle(win, 'line-height', lineSelect.value);
      flushPersist();
      refreshStats();
    });

    return wrapper;
  }

  function refreshStats() {
    if (!editorRefs) return;
    const stats = editorRefs.editor.getStats();
    const titleLen = [...(editorRefs.titleInput.value || '')].length;
    const digestLen = [...(editorRefs.digestInput.value || '')].length;
    editorRefs.digestCount.textContent = `${digestLen}/120`;
    editorRefs.stats.textContent =
      `标题 ${titleLen}/64 · 正文 ${stats.words} 字 · 图片 ${stats.images} 张` +
      (state.autoSaved ? ` · 已自动保存 ${formatTime(state.autoSaved)}` : '');
  }

  function renderTabs() {
    const tabs = [
      ['meta', '元数据'],
      ['images', '图片'],
      ['warn', `提示${state.warnings.length ? ` ${state.warnings.length}` : ''}`],
      ['source', '源码'],
    ];
    editorRefs.tabsHost.replaceChildren(
      el(
        doc,
        'div',
        { class: 'wp-tabs' },
        tabs.map(([id, label]) =>
          el(doc, 'button', {
            class: `wp-tab${state.tab === id ? ' is-active' : ''}`,
            'data-act': `tab:${id}`,
            text: label,
          })
        )
      )
    );
  }

  function renderPane() {
    const article = state.article || {};

    if (state.tab === 'meta') {
      editorRefs.metaInfo.replaceChildren(
        el(doc, 'span', {}, [el(doc, 'b', { text: '来源：' }), article.accountName || '未知']),
        el(doc, 'span', {}, [el(doc, 'b', { text: '原文：' }), shortenUrl(article.sourceUrl || state.url || '', 56)]),
        el(doc, 'span', {}, [el(doc, 'b', { text: '封面：' }), article.coverUrl ? '已获取' : '未获取（可在后台手动选择）'])
      );
      editorRefs.paneHost.replaceChildren(editorRefs.metaPane);
      return;
    }

    const pane = el(doc, 'div', { class: 'wp-body' });

    if (state.tab === 'images') {
      const sources = currentImageSources();
      if (!sources.length) pane.appendChild(el(doc, 'div', { class: 'wp-card', text: '正文中没有图片。' }));
      else {
        pane.appendChild(
          el(doc, 'div', { class: 'wp-card' }, [
            el(doc, 'h2', { text: `共 ${sources.length} 张图片` }),
            el(
              doc,
              'div',
              { class: 'wp-grid' },
              sources.map((src) => el(doc, 'img', { src, loading: 'lazy', alt: '' }))
            ),
            el(doc, 'p', { class: 'wp-hint', text: '发布时会自动把站外图片转存到你的公众号素材库。' }),
          ])
        );
      }
    }

    if (state.tab === 'warn') {
      const list = state.warnings.length ? state.warnings : ['没有需要注意的问题。'];
      pane.appendChild(el(doc, 'div', { class: 'wp-card' }, list.map((msg) => el(doc, 'p', { class: 'wp-hint', text: `· ${msg}` }))));
      if (article.externalLinks && article.externalLinks.length) {
        pane.appendChild(
          el(doc, 'div', { class: 'wp-card' }, [
            el(doc, 'h2', { text: `已降级的站外链接（${article.externalLinks.length}）` }),
            el(
              doc,
              'ul',
              { class: 'wp-list' },
              article.externalLinks.map((link) =>
                el(doc, 'li', {}, [
                  el(doc, 'span', { class: 'wp-ellipsis', style: 'flex:1 1 auto', text: `[${link.index}] ${link.text} — ${link.href}` }),
                ])
              )
            ),
          ])
        );
      }
    }

    if (state.tab === 'source') {
      pane.appendChild(
        el(doc, 'div', { class: 'wp-card' }, [
          el(doc, 'h2', { text: 'HTML 源码' }),
          el(doc, 'p', { class: 'wp-hint', text: '点底部「源码」在可编辑文本域里直接改 HTML，改完再点「预览」生效。' }),
          el(doc, 'button', { class: 'wp-btn wp-btn--plain wp-btn--block', 'data-act': 'copy-html', text: '复制富文本到剪贴板' }),
        ])
      );
    }

    editorRefs.paneHost.replaceChildren(pane);
  }

  function syncEditorFromArticle() {
    if (!editorRefs || !state.article) return;
    editorRefs.editor.setSourceMode(false);
    editorRefs.editor.setHtml(state.article.html || '');
    editorRefs.titleInput.value = state.article.title || '';
    editorRefs.authorInput.value = state.article.author || '';
    editorRefs.digestInput.value = state.article.digest || '';
    refreshStats();
  }

  function renderFooter() {
    if (state.screen === 'editor') {
      return el(doc, 'div', { class: 'wp-footer' }, [
        el(doc, 'button', { class: 'wp-btn wp-btn--plain', 'data-act': 'home', text: '返回' }),
        el(doc, 'button', {
          class: 'wp-btn wp-btn--plain',
          'data-act': 'toggle-source',
          text: editorRefs && editorRefs.editor.isSourceMode() ? '预览' : '源码',
        }),
        el(doc, 'button', { class: 'wp-btn', 'data-act': 'publish', text: '生成草稿' }),
      ]);
    }
    if (state.screen === 'home') {
      return el(doc, 'div', { class: 'wp-footer' }, [
        el(doc, 'button', { class: 'wp-btn', 'data-act': 'fetch', disabled: Boolean(state.busy), text: state.busy || '抓取并还原' }),
      ]);
    }
    if (state.screen === 'publish') {
      return el(doc, 'div', { class: 'wp-footer' }, [
        el(doc, 'button', { class: 'wp-btn wp-btn--plain', 'data-act': 'back-editor', text: '返回编辑' }),
        el(doc, 'button', { class: 'wp-btn', 'data-act': 'close', text: '完成' }),
      ]);
    }
    return el(doc, 'div', { class: 'wp-footer' }, [
      el(doc, 'button', { class: 'wp-btn wp-btn--plain', 'data-act': 'home', text: '返回' }),
    ]);
  }

  function renderScreen() {
    if (root.hidden) return;

    if (state.screen === 'editor') {
      const wrapper = buildEditorScreen();
      if (renderedArticleKey !== state.articleKey) {
        syncEditorFromArticle();
        renderedArticleKey = state.articleKey;
        renderedTab = null;
      }
      renderTabs();
      if (renderedTab !== state.tab || state.tab !== 'meta') {
        renderPane();
        renderedTab = state.tab;
      }
      const banner = renderErrorBanner();
      root.replaceChildren(renderHeader());
      if (banner) root.appendChild(el(doc, 'div', { class: 'wp-body wp-body--flush' }, [banner]));
      root.appendChild(wrapper);
      root.appendChild(renderFooter());
      // 切回编辑页时清掉一次性错误提示
      return;
    }

    const banner = renderErrorBanner();
    const body =
      state.screen === 'publish' ? renderPublish() : state.screen === 'login' ? renderLogin() : renderHome();
    root.replaceChildren(renderHeader());
    if (banner) root.appendChild(el(doc, 'div', { class: 'wp-body wp-body--flush' }, [banner]));
    root.appendChild(body);
    root.appendChild(renderFooter());
  }

  /* ------------------------------------------------------------- 事件 */

  async function handleAction(act) {
    if (act === 'close') {
      flushPersist();
      close();
      return;
    }
    if (act === 'home') {
      flushPersist();
      setState({ screen: 'home', error: '', drafts: store.list(), tab: 'meta' });
      return;
    }
    if (act === 'back-editor') {
      setState({ screen: 'editor', error: '' });
      return;
    }
    if (act === 'fetch') return doFetch();
    if (act === 'publish') return doPublish();
    if (act === 'toggle-source') {
      if (!editorRefs) return;
      editorRefs.editor.setSourceMode(!editorRefs.editor.isSourceMode());
      renderScreen();
      return;
    }
    if (act === 'copy-html') return copyHtml();
    if (act === 'open-login-page') {
      win.open('https://mp.weixin.qq.com/', '_blank');
      return;
    }
    if (act === 'qr-login') return doQrLogin();
    if (act === 'recheck-login') {
      const result = await loadContext();
      setState({ screen: result.ok ? 'home' : 'login' });
      return;
    }
    if (act.startsWith('tab:')) {
      flushPersist();
      state.error = '';
      state.tab = act.slice(4);
      renderScreen();
      return;
    }
    if (act.startsWith('open-draft:')) {
      const draft = store.get(act.slice(11));
      if (!draft) {
        setState({ error: '草稿不存在' });
        return;
      }
      setState({
        screen: 'editor',
        currentDraftId: draft.id,
        articleKey: state.articleKey + 1,
        article: {
          title: draft.title,
          author: draft.author,
          digest: draft.digest,
          coverUrl: draft.coverUrl,
          sourceUrl: draft.sourceUrl,
          accountName: draft.accountName,
          html: draft.html,
          images: [],
          externalLinks: [],
        },
        warnings: [],
        error: '',
        tab: 'meta',
      });
      return;
    }
    if (act.startsWith('del-draft:')) {
      store.remove(act.slice(10));
      setState({ drafts: store.list() });
      return;
    }
    if (act.startsWith('tool:')) runTool(act.slice(5));
  }

  function runTool(id) {
    const item = TOOLBAR_ITEMS.find((entry) => entry.id === id);
    if (!item || !editorRefs) return;
    const editor = editorRefs.editor;
    if (editor.isSourceMode()) {
      setState({ error: '源码模式下无法使用工具栏，请先点「预览」' });
      return;
    }
    editor.articleEl.focus();

    if (item.kind === 'exec') execEditorCommand(win, item.cmd);
    else if (item.kind === 'block') execEditorCommand(win, 'formatBlock', `<${item.tag}>`);
    else if (item.kind === 'hr') {
      insertHtmlAtSelection(win, '<hr style="border:0;border-top:1px solid #e5e5e5;margin:24px 0;">');
    } else if (item.kind === 'link') {
      const url = win.prompt('请输入链接地址（微信正文只允许 mp.weixin.qq.com 链接）', 'https://mp.weixin.qq.com/');
      if (url) {
        const sel = win.getSelection();
        const hasSelection = sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed;
        if (hasSelection) execEditorCommand(win, 'createLink', url);
        else insertHtmlAtSelection(win, `<a href="${url}">${url}</a>`);
      }
    }
    flushPersist();
    refreshStats();
  }

  async function copyHtml() {
    const html = editorRefs ? editorRefs.editor.getHtml() : '';
    const text = htmlToPlainText(html);
    try {
      if (win.navigator && win.navigator.clipboard && typeof win.ClipboardItem === 'function') {
        await win.navigator.clipboard.write([
          new win.ClipboardItem({
            'text/html': new win.Blob([html], { type: 'text/html' }),
            'text/plain': new win.Blob([text], { type: 'text/plain' }),
          }),
        ]);
        win.alert('已复制富文本，可直接粘贴到公众号编辑器。');
        return;
      }
      throw new Error('当前环境不支持富文本剪贴板');
    } catch (err) {
      setState({ error: `${err.message}。可切到「源码」页手动全选复制 HTML。` });
    }
  }

  root.addEventListener('click', (event) => {
    const target = event.target && event.target.closest ? event.target.closest('[data-act]') : null;
    if (!target || target.disabled) return;
    event.preventDefault();
    handleAction(target.getAttribute('data-act'));
  });

  root.addEventListener('input', (event) => {
    const target = event.target;
    if (!target || !target.getAttribute) return;
    if (target.getAttribute('data-role') === 'url-input') state.url = target.value;
  });

  root.addEventListener('change', (event) => {
    const target = event.target;
    if (!target || !target.getAttribute) return;
    const role = target.getAttribute('data-role');
    if (role === 'force-reupload') state.forceReupload = Boolean(target.checked);
    if (role === 'attribution') state.attribution = Boolean(target.checked);
  });

  /* ------------------------------------------------------- 生命周期 */

  function open() {
    root.hidden = false;
    state.drafts = store.list();
    renderScreen();
    loadContext();
  }

  function close() {
    root.hidden = true;
  }

  function destroy() {
    if (editorRefs) editorRefs.editor.destroy();
    host.remove();
  }

  /** 从文章页进入：自动抓取当前页面。 */
  function openWithCurrentArticle() {
    root.hidden = false;
    state.url = win.location && win.location.href ? win.location.href.split('#')[0] : state.url;
    state.drafts = store.list();
    state.screen = 'home';
    renderScreen();
    loadContext();
    doFetch();
  }

  return {
    open,
    close,
    destroy,
    openWithCurrentArticle,
    isOpen: () => !root.hidden,
    get host() {
      return host;
    },
    get state() {
      return state;
    },
  };
}

/** 在页面上挂一个悬浮入口按钮（light DOM，需自带样式）。 */
function createFloatingButton(win, onClick) {
  const doc = win.document;
  const button = el(doc, 'button', {
    id: 'wechatpassage-float',
    type: 'button',
    text: FLOATING_BUTTON_TEXT,
    title: '用 WeChatPassage 转载这篇文章',
  });
  button.style.cssText = [
    'position:fixed',
    'right:16px',
    'bottom:calc(env(safe-area-inset-bottom, 0px) + 24px)',
    'z-index:2147482998',
    'height:48px',
    'padding:0 18px',
    'border-radius:24px',
    'border:0',
    'background:#07c160',
    'color:#fff',
    'font-size:14px',
    'font-weight:600',
    'font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif',
    'box-shadow:0 4px 14px rgba(0,0,0,.22)',
    'cursor:pointer',
  ].join(';');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });
  doc.body.appendChild(button);
  return button;
}

/* ---------- src/main.js ---------- */
/**
 * 入口。
 *
 * 只做三件事：挂一个悬浮按钮、按需创建面板、在 SPA 路由切换后把按钮补回来。
 * 面板 DOM 是惰性创建的 —— 打开普通文章页时不会给页面增加任何可见负担。
 */


const GLOBAL_FLAG = '__wechatPassageLoaded__';
const BUTTON_ID = 'wechatpassage-float';

/**
 * @param {Window} [win]
 * @returns {{getPanel:Function, ensureButton:Function, destroy:Function}|null}
 */
function bootWechatPassage(win) {
  const host = win || (typeof window !== 'undefined' ? window : null);
  if (!host || !host.document) return null;

  // 只在顶层窗口运行，避免文章页内嵌 iframe 重复注入
  try {
    if (host.top !== host.self) return null;
  } catch {
    return null;
  }

  const doc = host.document;
  if (!doc.body) return null;
  if (host[GLOBAL_FLAG]) return host[GLOBAL_FLAG];

  let panel = null;
  let button = null;
  let observer = null;
  let intervalId = null;

  const syncButtonVisibility = () => {
    if (!button) return;
    button.style.display = panel && panel.isOpen() ? 'none' : '';
  };

  const openPanel = () => {
    if (!panel) panel = createPanel({ win: host });
    panel.open();
    syncButtonVisibility();
  };

  const ensureButton = () => {
    if (button && button.isConnected) return;
    if (!doc.body) return;
    button = createFloatingButton(host, openPanel);
    button.id = BUTTON_ID;
    syncButtonVisibility();
  };

  ensureButton();
  intervalId = host.setInterval(() => {
    ensureButton();
    syncButtonVisibility();
  }, 800);

  // 公众号后台是 Vue SPA，路由切换会重绘 body 子树，这里把按钮补回去
  if (typeof host.MutationObserver === 'function') {
    let scheduled = false;
    observer = new host.MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      host.setTimeout(() => {
        scheduled = false;
        ensureButton();
      }, 300);
    });
    observer.observe(doc.body, { childList: true, subtree: true });
  }

  const api = {
    getPanel: () => panel,
    ensureButton,
    destroy() {
      if (observer) observer.disconnect();
      if (intervalId !== null) host.clearInterval(intervalId);
      if (button) button.remove();
      if (panel) panel.destroy();
      delete host[GLOBAL_FLAG];
    },
  };

  host[GLOBAL_FLAG] = api;
  return api;
}

  /* ---------- 启动 ---------- */
  try {
    bootWechatPassage(typeof window !== 'undefined' ? window : undefined);
  } catch (error) {
    if (typeof console !== 'undefined') console.error('[WeChatPassage] 启动失败', error);
  }
})();
