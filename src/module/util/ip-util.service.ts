import { Request } from 'express';
import * as net from 'net';

export function getClientIp(request: Request): string {
  const possibleIps: string[] = [
    request.ip,
    getIpFromXForwardedFor(request),
    request.socket?.remoteAddress,
  ].filter((ip): ip is string => ip != null && ip !== '');

  for (const ip of possibleIps) {
    if (ip && isValidIp(ip)) {
      return normalizeIp(ip);
    }
  }

  return 'Unknown';
}

function getIpFromXForwardedFor(request: Request): string | undefined {
  const forwardedFor = request.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }
  return undefined;
}

function isValidIp(ip: string): boolean {
  return net.isIP(ip) !== 0;
}

function normalizeIp(ip: string): string {
  // IPv6 형식의 IPv4 주소 처리 (예: ::ffff:192.168.0.1)
  if (ip.startsWith('::ffff:') && ip.includes('.')) {
    return ip.substring(7);
  }
  return ip;
}
