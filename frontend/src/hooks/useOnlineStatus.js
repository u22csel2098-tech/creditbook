import { useState, useEffect } from 'react';
import { flushQueue, getQueue } from '../utils/offlineDB';
import axios from 'axios';

export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [queueLen, setQueueLen] = useState(getQueue().length);

  useEffect(() => {
    const goOnline = async () => {
      setOnline(true);
      // Flush queued operations
      await flushQueue(axios);
      setQueueLen(getQueue().length);
    };
    const goOffline = () => {
      setOnline(false);
      setQueueLen(getQueue().length);
    };

    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);

    // Refresh queue count periodically
    const interval = setInterval(() => setQueueLen(getQueue().length), 3000);

    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
      clearInterval(interval);
    };
  }, []);

  return { online, queueLen };
}
