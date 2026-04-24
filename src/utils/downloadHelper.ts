// Capacitor plugins are accessed via the global window object injected by the native runtime.
// No static imports — this avoids bundler errors when the npm packages are not installed
// in the web-only dev environment.

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const window: Window & {
  Capacitor?: {
    isNativePlatform: () => boolean;
    Plugins?: {
      Filesystem?: any;
      Share?: any;
    };
  };
};

function isCapacitorNative(): boolean {
  return typeof window !== 'undefined' &&
    typeof window.Capacitor !== 'undefined' &&
    window.Capacitor.isNativePlatform();
}

function getPlugin(name: 'Filesystem' | 'Share'): any {
  return window.Capacitor?.Plugins?.[name];
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Saves a file to the device.
 * - On Android/iOS (Capacitor native): writes to cache then opens native share/save dialog.
 * - On web: uses <a download> with a Blob URL.
 */
export async function saveFile(blob: Blob, filename: string): Promise<void> {
  if (isCapacitorNative()) {
    const Filesystem = getPlugin('Filesystem');
    const Share = getPlugin('Share');

    if (!Filesystem || !Share) {
      throw new Error('Plugin Capacitor non disponibile. Assicurati che @capacitor/filesystem e @capacitor/share siano installati.');
    }

    const base64 = await blobToBase64(blob);

    await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: 'CACHE',
    });

    const { uri } = await Filesystem.getUri({
      path: filename,
      directory: 'CACHE',
    });

    await Share.share({
      title: filename,
      url: uri,
      dialogTitle: 'Salva o condividi il file',
    });

    return;
  }

  // Web fallback
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
}
