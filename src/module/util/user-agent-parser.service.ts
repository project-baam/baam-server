export interface DeviceInfo {
  os: string;
  browser: string;
  deviceType: string;
  model: string;
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();

  const getOS = (): string => {
    if (ua.includes('win')) return 'Windows';
    if (ua.includes('mac')) return 'MacOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad'))
      return 'iOS';
    return 'Unknown';
  };

  const getBrowser = (): string => {
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
    if (ua.includes('edge')) return 'Edge';
    if (ua.includes('trident') || ua.includes('msie'))
      return 'Internet Explorer';
    return 'Unknown';
  };

  const getDeviceType = (): string => {
    if (ua.includes('mobile')) return 'Mobile';
    if (ua.includes('tablet')) return 'Tablet';
    return 'Desktop';
  };

  const getModel = (): string => {
    const mobileDevices = [
      'iphone',
      'ipad',
      'android',
      'blackberry',
      'nokia',
      'opera mini',
      'windows mobile',
      'windows phone',
      'iemobile',
    ];
    for (const device of mobileDevices) {
      if (ua.includes(device))
        return device.charAt(0).toUpperCase() + device.slice(1);
    }
    return 'Unknown';
  };

  return {
    os: getOS(),
    browser: getBrowser(),
    deviceType: getDeviceType(),
    model: getModel(),
  };
}
