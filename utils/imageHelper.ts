// utils/imageHelper.ts
// Hàm lưu ảnh vĩnh viễn: Web → Base64, Mobile → documentDirectory

import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

export const saveImagePermanently = async (tempUri: string): Promise<string> => {
  // Nén ảnh trước khi lưu (theo yêu cầu đề bài)
  const compressed = await ImageManipulator.manipulateAsync(
    tempUri,
    [{ resize: { width: 800 } }], // Giảm chiều rộng xuống 800px
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  if (Platform.OS === 'web') {
    // Trên Web: Chuyển sang Base64 để lưu vào JSON (không bao giờ mất sau reload)
    const response = await fetch(compressed.uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    // Trên Mobile: dùng expo-file-system/legacy để copy vào documentDirectory
    const { documentDirectory, copyAsync } = await import('expo-file-system/legacy');
    const fileName = `photo_${Date.now()}.jpg`;
    const newPath = (documentDirectory ?? '') + fileName;
    await copyAsync({ from: compressed.uri, to: newPath });
    return newPath;
  }
};
