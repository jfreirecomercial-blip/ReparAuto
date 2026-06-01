// Native camera/gallery access for the Capacitor app shell.
// Returns standard `File` objects so the existing pipeline (comprimirImagem +
// uploadFileToStorage) works unchanged. On the web these helpers are unused —
// the existing `<input type="file">` handles capture there.
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

async function webPathToFile(webPath: string): Promise<File> {
  const res = await fetch(webPath);
  const blob = await res.blob();
  const ext = blob.type.split('/')[1] || 'jpg';
  return new File([blob], `foto_${Date.now()}.${ext}`, { type: blob.type || 'image/jpeg' });
}

/** Capture a single photo with the device camera. Returns null if cancelled. */
export async function tirarFoto(): Promise<File | null> {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });
    if (!photo.webPath) return null;
    return await webPathToFile(photo.webPath);
  } catch {
    // User cancelled or permission denied.
    return null;
  }
}

/** Pick one or more photos from the device gallery (up to `limit`). */
export async function escolherFotos(limit: number): Promise<File[]> {
  try {
    const result = await Camera.pickImages({ quality: 90, limit });
    const files = await Promise.all(
      result.photos
        .map((p) => p.webPath)
        .filter((w): w is string => !!w)
        .map(webPathToFile),
    );
    return files;
  } catch {
    return [];
  }
}
