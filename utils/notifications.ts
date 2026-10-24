// utils/notifications.ts
// Quản lý Local Notifications bằng expo-notifications
// Lên lịch nhắc trước hạn 1 tiếng, xử lý deep link tới assignment/[id]

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { subHours, parseISO } from 'date-fns';

// Cấu hình handler hiển thị thông báo khi ứng dụng đang mở (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPresentAlert: true,
    shouldPresentBadge: true,
    shouldPresentSound: true,
  }),
});

/**
 * Yêu cầu quyền gửi thông báo từ người dùng
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Lỗi xin quyền thông báo:', error);
    return false;
  }
}

/**
 * Lên lịch thông báo trước hạn 1 tiếng
 * Khi nhấn vào thông báo -> Deep link tới /assignment/{id}
 */
export async function scheduleAssignmentNotification(
  assignmentId: string,
  title: string,
  dueAt: string
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return null;

    const dueDate = parseISO(dueAt);
    const triggerDate = subHours(dueDate, 1);
    const now = new Date();

    // Nếu thời điểm nhắc trước 1h đã qua thì nhắc ngay sau 5 giây (nếu deadline còn trong tương lai)
    let trigger: Notifications.NotificationTriggerInput;
    if (triggerDate.getTime() <= now.getTime()) {
      if (dueDate.getTime() > now.getTime()) {
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
        };
      } else {
        return null; // Đã quá hạn, không lên lịch
      }
    } else {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      };
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Nhắc nhở bài tập sắp đến hạn!',
        body: `Bài tập "${title}" sẽ hết hạn trong 1 giờ tới.`,
        data: {
          url: `/assignment/${assignmentId}`,
          assignmentId,
        },
        sound: true,
      },
      trigger,
    });

    return identifier;
  } catch (error) {
    console.warn('Lỗi lên lịch thông báo:', error);
    return null;
  }
}
