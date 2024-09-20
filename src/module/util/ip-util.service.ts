import { Request } from 'express';
import * as net from 'net';

export function getClientIp(request: Request): string {
  const possibleIps: string[] = [
    getIpFromXForwardedFor(request),
    getIpFromXRealIp(request),
    request.ip,
    request.socket?.remoteAddress,
  ].filter((ip): ip is string => ip != null && ip !== '');

  for (const ip of possibleIps) {
    if (ip && isValidIp(ip)) {
      const normalizedIp = normalizeIp(ip);
      return normalizedIp;
    }
  }

  return 'Unknown';
}

function getIpFromXForwardedFor(request: Request): string | undefined {
  const forwardedFor = request.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    const ips = forwardedFor.split(',').map((ip) => ip.trim());

    return ips[0]; // 첫 번째 IP가 원래 클라이언트 IP
  }
  return undefined;
}

function getIpFromXRealIp(request: Request): string | undefined {
  const xRealIp = request.headers['x-real-ip'];
  if (typeof xRealIp === 'string') {
    return xRealIp.trim();
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
