
export function detectBackend() {
    const { protocol, hostname } = window.location;
    const port = 3000;
    const secure = protocol === 'https:';
    return {
      host: hostname,
      port,
      secure,
      peerPath: '/peerjs',
      socketNs: '/channelChat',
      socketUrl: `${secure ? 'https' : 'http'}://${hostname}:${port}`,
    };
  }
  