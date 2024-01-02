import http from 'node:http';

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

export function makeMockData(v: any, params: any): any {
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
