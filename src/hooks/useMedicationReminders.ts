import { useEffect, useRef } from 'react';
import { api, User } from '../api';
import { useArduinoContext } from '../ArduinoContext';

export const useMedicationReminders = (user: User | null) => {
  const { triggerAlarm } = useArduinoContext();
  const lastCheckedRef = useRef<string | null>(null);

  const lastNotificationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const checkReminders = async () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      // Medications Check
      if (lastCheckedRef.current !== currentTime) {
        lastCheckedRef.current = currentTime;
        try {
          const meds = await api.medications.list();
          const dueMeds = meds.filter((m: any) => 
            m.remindersEnabled && 
            m.time === currentTime && 
            !m.takenToday
          );

          if (dueMeds.length > 0) {
            await triggerAlarm('medication');
            const names = dueMeds.map((m: any) => m.name).join(', ');
            
            // Trigger server-side multi-channel alert (Email, WhatsApp, Arduino Relay)
            await api.alerts.triggerMedicationAlarm(names, currentTime);
            
            const message = `REMEDIAL ALERT: Time for your medication: ${names}. Please take your dosage now.`;
            await api.alerts.sendSms(message, undefined, undefined, user.phone);
            await api.alerts.makeCall(message, undefined, undefined, user.phone);
          }
        } catch (err) {
          console.error('[REMINDERS] Medication check failed:', err);
        }
      }

      // Notifications / Confidential Messaging Check
      try {
        const notificationsResponse = await api.notifications.list();
        const latestNotif = notificationsResponse[0];
        
        if (latestNotif && latestNotif.id !== lastNotificationIdRef.current) {
          lastNotificationIdRef.current = latestNotif.id;
          
          if (latestNotif.type === 'confidential' || latestNotif.title?.toLowerCase().includes('confidential')) {
            console.log(`[ALERTS] New confidential message: ${latestNotif.title}`);
            await triggerAlarm('test'); // Use 'test' or generic alarm for messages
            const alertMsg = `CONFIDENTIAL ALERT: You have a new clinical message: ${latestNotif.title}`;
            await api.alerts.sendSms(alertMsg, undefined, undefined, user.phone);
          }
        }
      } catch (err) {
        console.error('[ALERTS] Notification check failed:', err);
      }
    };

    const interval = setInterval(checkReminders, 30000);
    checkReminders();

    return () => clearInterval(interval);
  }, [user, triggerAlarm]);
};
