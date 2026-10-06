import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export type PickResult =
  { status: 'picked'; uri: string } | { status: 'canceled' } | { status: 'denied'; canAskAgain: boolean };

/** Opens the camera or library, handling permission state explicitly so the UI can explain it. */
export const pickPhoto = async (source: 'camera' | 'library'): Promise<PickResult> => {
  // Android's photo picker needs no permission; asking for one there fails on devices that
  // don't declare READ_MEDIA_IMAGES. Only the camera (and the library on iOS/web) is asked for.
  const needsPermission = source === 'camera' || Platform.OS !== 'android';
  if (needsPermission) {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return { status: 'denied', canAskAgain: permission.canAskAgain };
  }

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8, exif: false };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.assets?.[0];
  if (result.canceled || !asset) return { status: 'canceled' };
  return { status: 'picked', uri: asset.uri };
};

const resizeJpeg = async (uri: string, width: number, compress: number, base64 = false) => {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width, height: null });
  const image = await context.renderAsync();
  return image.saveAsync({ format: SaveFormat.JPEG, compress, base64 });
};

/**
 * Phone cameras produce 3–8 MB photos; ~1280 px is plenty for recognising food and
 * uploads in a second on mobile data. Also normalises HEIC and EXIF rotation to JPEG.
 */
export const prepareForAnalysis = async (uri: string) => (await resizeJpeg(uri, 1280, 0.75)).uri;

/** Lab reports have small print, so they keep more pixels than a food photo. */
export const prepareDocumentPhoto = async (uri: string) => (await resizeJpeg(uri, 2000, 0.85)).uri;

/** Small thumbnail stored with the meal (~30–50 KB). */
export const makeThumbnail = async (uri: string) => (await resizeJpeg(uri, 480, 0.6, true)).base64 ?? undefined;
