/**
 * WebRTC Leak Detection
 *
 * Detects if WebRTC is leaking your real IP address,
 * which can happen even when using a VPN.
 */

export interface WebRTCLeakResult {
  leaking: boolean;
  localIPs: string[];
  publicIPs: string[];
  ipv6Detected: boolean;
  stunServers: string[];
  recommendations: string[];
}

export interface IPInfo {
  ip: string;
  type: 'local' | 'public' | 'ipv6';
  interface?: string;
}

// STUN servers to test against
const STUN_SERVERS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun.cloudflare.com:3478',
];

/**
 * Detect WebRTC IP leaks
 */
export async function detectWebRTCLeak(
  timeout: number = 5000
): Promise<WebRTCLeakResult> {
  const localIPs: string[] = [];
  const publicIPs: string[] = [];
  let ipv6Detected = false;

  // Check if WebRTC is available
  if (!isWebRTCSupported()) {
    return {
      leaking: false,
      localIPs: [],
      publicIPs: [],
      ipv6Detected: false,
      stunServers: [],
      recommendations: ['WebRTC is disabled or not supported in your browser'],
    };
  }

  try {
    const ips = await gatherICECandidates(timeout);

    for (const ip of ips) {
      if (isLocalIP(ip)) {
        if (!localIPs.includes(ip)) {
          localIPs.push(ip);
        }
      } else if (isIPv6(ip)) {
        ipv6Detected = true;
        if (!publicIPs.includes(ip)) {
          publicIPs.push(ip);
        }
      } else {
        if (!publicIPs.includes(ip)) {
          publicIPs.push(ip);
        }
      }
    }
  } catch (error) {
    // WebRTC blocked or error
    return {
      leaking: false,
      localIPs: [],
      publicIPs: [],
      ipv6Detected: false,
      stunServers: STUN_SERVERS,
      recommendations: ['WebRTC appears to be blocked. Good for privacy!'],
    };
  }

  const leaking = publicIPs.length > 0 || localIPs.length > 1;
  const recommendations = generateWebRTCRecommendations(leaking, localIPs, publicIPs, ipv6Detected);

  return {
    leaking,
    localIPs,
    publicIPs,
    ipv6Detected,
    stunServers: STUN_SERVERS,
    recommendations,
  };
}

/**
 * Check if WebRTC is supported
 */
export function isWebRTCSupported(): boolean {
  return !!(
    typeof RTCPeerConnection !== 'undefined' ||
    typeof (window as unknown as { webkitRTCPeerConnection?: unknown }).webkitRTCPeerConnection !== 'undefined' ||
    typeof (window as unknown as { mozRTCPeerConnection?: unknown }).mozRTCPeerConnection !== 'undefined'
  );
}

/**
 * Get RTCPeerConnection constructor
 */
function getRTCPeerConnection(): typeof RTCPeerConnection {
  return (
    RTCPeerConnection ||
    (window as unknown as { webkitRTCPeerConnection?: typeof RTCPeerConnection }).webkitRTCPeerConnection ||
    (window as unknown as { mozRTCPeerConnection?: typeof RTCPeerConnection }).mozRTCPeerConnection
  );
}

/**
 * Gather ICE candidates to find IP addresses
 */
async function gatherICECandidates(timeout: number): Promise<string[]> {
  return new Promise((resolve) => {
    const ips: string[] = [];
    const RTCPeer = getRTCPeerConnection();

    const pc = new RTCPeer({
      iceServers: STUN_SERVERS.map(url => ({ urls: url })),
    });

    const timeoutId = setTimeout(() => {
      pc.close();
      resolve(ips);
    }, timeout);

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        return;
      }

      const candidate = event.candidate.candidate;
      const ipMatch = candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}|([a-f0-9:]+:+)+[a-f0-9]+/gi);

      if (ipMatch) {
        for (const ip of ipMatch) {
          if (!ips.includes(ip)) {
            ips.push(ip);
          }
        }
      }
    };

    // Also try the local description
    pc.createDataChannel('leak-test');
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => {
        clearTimeout(timeoutId);
        pc.close();
        resolve(ips);
      });

    // Handle ICE gathering complete
    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === 'complete') {
        clearTimeout(timeoutId);
        pc.close();
        resolve(ips);
      }
    };
  });
}

/**
 * Check if IP is a local/private address
 */
function isLocalIP(ip: string): boolean {
  // IPv4 private ranges
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('172.')) {
    const second = parseInt(ip.split('.')[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('169.254.')) return true; // Link-local

  // IPv6 private ranges
  if (ip.toLowerCase().startsWith('fe80:')) return true; // Link-local
  if (ip.toLowerCase().startsWith('fc') || ip.toLowerCase().startsWith('fd')) return true; // Unique local

  return false;
}

/**
 * Check if IP is IPv6
 */
function isIPv6(ip: string): boolean {
  return ip.includes(':');
}

/**
 * Generate recommendations based on WebRTC leak results
 */
function generateWebRTCRecommendations(
  leaking: boolean,
  localIPs: string[],
  publicIPs: string[],
  ipv6Detected: boolean
): string[] {
  const recommendations: string[] = [];

  if (!leaking) {
    recommendations.push('No WebRTC IP leak detected. Good!');
    return recommendations;
  }

  if (publicIPs.length > 0) {
    recommendations.push(
      'Your real public IP address is exposed via WebRTC. ' +
      'This can reveal your identity even when using a VPN.'
    );
  }

  if (localIPs.length > 1) {
    recommendations.push(
      'Multiple local IP addresses detected. ' +
      'This can reveal information about your network configuration.'
    );
  }

  if (ipv6Detected) {
    recommendations.push(
      'IPv6 address detected via WebRTC. ' +
      'IPv6 addresses can be more unique and trackable than IPv4.'
    );
  }

  // Browser-specific recommendations
  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('firefox')) {
    recommendations.push(
      'In Firefox, go to about:config and set media.peerconnection.enabled to false to disable WebRTC'
    );
  } else if (ua.includes('chrome')) {
    recommendations.push(
      'Install a WebRTC leak prevention extension like "WebRTC Leak Prevent" or use a VPN with WebRTC protection'
    );
  } else if (ua.includes('brave')) {
    recommendations.push(
      'In Brave, go to Settings > Privacy > WebRTC IP Handling Policy and select "Disable non-proxied UDP"'
    );
  }

  recommendations.push(
    'Use a VPN that has WebRTC leak protection, or disable WebRTC entirely if you don\'t need it'
  );

  return recommendations;
}

/**
 * Check WebRTC status without gathering IPs (faster)
 */
export function checkWebRTCStatus(): {
  enabled: boolean;
  mediaDevicesEnabled: boolean;
  getUserMediaEnabled: boolean;
} {
  const enabled = isWebRTCSupported();

  let mediaDevicesEnabled = false;
  let getUserMediaEnabled = false;

  if (typeof navigator !== 'undefined') {
    mediaDevicesEnabled = 'mediaDevices' in navigator;
    getUserMediaEnabled = mediaDevicesEnabled && 'getUserMedia' in navigator.mediaDevices;
  }

  return {
    enabled,
    mediaDevicesEnabled,
    getUserMediaEnabled,
  };
}

/**
 * Get WebRTC configuration info
 */
export function getWebRTCInfo(): {
  supported: boolean;
  implementation: string;
  features: string[];
} {
  if (!isWebRTCSupported()) {
    return {
      supported: false,
      implementation: 'none',
      features: [],
    };
  }

  let implementation = 'standard';
  if ((window as unknown as { webkitRTCPeerConnection?: unknown }).webkitRTCPeerConnection) {
    implementation = 'webkit';
  } else if ((window as unknown as { mozRTCPeerConnection?: unknown }).mozRTCPeerConnection) {
    implementation = 'moz';
  }

  const features: string[] = [];

  // Check for various WebRTC features
  if (typeof RTCPeerConnection !== 'undefined') {
    features.push('RTCPeerConnection');
  }
  if (typeof RTCDataChannel !== 'undefined') {
    features.push('RTCDataChannel');
  }
  if ('mediaDevices' in navigator) {
    features.push('MediaDevices');
  }
  if ('getDisplayMedia' in (navigator.mediaDevices || {})) {
    features.push('Screen Sharing');
  }

  return {
    supported: true,
    implementation,
    features,
  };
}
