import http from 'node:http';
import { parse } from 'regexparam';
import queryString from 'query-string';
import type { Router, RouterParams } from '../types';

export function isAjax(req: http.IncomingMessage) {
  if (req.method?.toLowerCase() === 'post') {
    return true;
  }
  if (req.headers.accept?.includes('application/json')) {
    return true;
  }
  if (req.headers.accept?.includes('application/x-www-form-urlencoded')) {
    return true;
  }
  return false;
}

export function makeMockData(v: any, params: any) {
  if (typeof v === 'function') {
    return v(params);
  }

  if (v === null || typeof v !== 'object') {
    return v;
  }

  let res: any = Array.isArray(v) ? [] : {};
  for (const key in v) {
    res[key] = makeMockData(v[key], params);
  }
  return res;
}

function exec(
  path: string,
  result: {
    keys: string[];
    pattern: RegExp;
  }
): Object {
  const out: RouterParams = {};
  let i = 0;
  let matches = result.pattern.exec(path) as RegExpExecArray;
  while (i < result.keys.length) {
    out[result.keys[i]] = matches[++i] || null;
  }
  return out;
}

export function parseRestUrl(url: string, path: string) {
  const parser = parse(path);
  if (!parser.pattern.test(url)) {
    return null;
  }
  return exec(url, parser);
}

function getRestUrlInfo(list: Router[], url: string): [string?, Object?] {
  for (let i = 0; i < list.length; i++) {
    const res = parseRestUrl(url, list[i].url);
    if (res) {
      return [list[i].path, res];
    }
  }
  return [];
}

export function getMockPathInfo(
  url: http.IncomingMessage['url'],
  routers: Router[]
) {
  const [reqPath, reqSearch] = url?.split('?') || [];
  let filePath = reqPath;
  let restParams: Object | undefined = {};
  const queryParams = reqSearch ? queryString.parse(reqSearch) : {};

  if (routers?.length) {
    const [rPath, rParams] = getRestUrlInfo(routers, reqPath);
    if (rPath) {
      filePath = rPath;
      restParams = rParams;
    }
  }
  return [filePath, { ...queryParams, ...restParams }];
}
