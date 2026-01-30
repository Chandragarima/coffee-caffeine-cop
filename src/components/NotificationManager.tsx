import { useNotifications } from '@/hooks/useNotifications';

/**
 * Invisible component that manages notification scheduling
 * Place this in the app root to enable automatic notification checks
 */
const NotificationManager = () => {
  // This hook handles all notification logic:
  // - Checks for permission
  // - Triggers notifications at appropriate times
  // - Runs checks periodically when app is open
  useNotifications();
  
  // This component renders nothing - it just initializes the notification system
  return null;
};

export default NotificationManager;
