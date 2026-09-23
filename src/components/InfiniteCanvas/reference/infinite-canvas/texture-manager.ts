import * as THREE from "three";
import type { MediaItem } from "./types";

const textureCache = new Map<string, THREE.Texture>();
const loadCallbacks = new Map<string, Set<(tex: THREE.Texture) => void>>();
const loader = new THREE.TextureLoader();

const REDUCED_QUALITY_CONCURRENCY = 3;

let reducedQualityCache: boolean | null = null;
let inFlight = 0;
const loadQueue: Array<() => void> = [];

const isReducedQualityDevice = (): boolean => {
  if (reducedQualityCache !== null) return reducedQualityCache;
  if (typeof window === "undefined") {
    reducedQualityCache = false;
    return false;
  }

  reducedQualityCache =
    window.matchMedia("(pointer: coarse)").matches ||
    (navigator.hardwareConcurrency || 8) <= 4;
  return reducedQualityCache;
};

const pumpQueue = () => {
  const maxConcurrent = isReducedQualityDevice() ? REDUCED_QUALITY_CONCURRENCY : Number.POSITIVE_INFINITY;
  while (loadQueue.length > 0 && inFlight < maxConcurrent) {
    const nextLoad = loadQueue.shift();
    nextLoad?.();
  }
};

const applyTextureQuality = (tex: THREE.Texture) => {
  const reducedQuality = isReducedQualityDevice();
  tex.minFilter = reducedQuality ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = !reducedQuality;
  tex.anisotropy = reducedQuality ? 1 : 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
};

const notifyLoaded = (key: string, tex: THREE.Texture) => {
  loadCallbacks.get(key)?.forEach((cb) => {
    try {
      cb(tex);
    } catch (err) {
      console.error(`Callback failed: ${JSON.stringify(err)}`);
    }
  });
  loadCallbacks.delete(key);
};

const isTextureLoaded = (tex: THREE.Texture): boolean => {
  const img = tex.image as HTMLImageElement | undefined;
  return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
};

export const getTexture = (item: MediaItem, onLoad?: (texture: THREE.Texture) => void): THREE.Texture => {
  const key = item.url;
  const existing = textureCache.get(key);

  if (existing) {
    if (onLoad) {
      if (isTextureLoaded(existing)) {
        onLoad(existing);
      } else {
        loadCallbacks.get(key)?.add(onLoad);
      }
    }
    return existing;
  }

  const callbacks = new Set<(tex: THREE.Texture) => void>();
  if (onLoad) callbacks.add(onLoad);
  loadCallbacks.set(key, callbacks);

  const texture = new THREE.Texture();
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);

  const startLoad = () => {
    inFlight += 1;
    loader.load(
      key,
      (tex) => {
        texture.image = tex.image;
        applyTextureQuality(texture);
        tex.dispose();
        notifyLoaded(key, texture);
        inFlight -= 1;
        pumpQueue();
      },
      undefined,
      (err) => {
        console.error("Texture load failed:", key, err);
        inFlight -= 1;
        pumpQueue();
      },
    );
  };

  if (isReducedQualityDevice() && inFlight >= REDUCED_QUALITY_CONCURRENCY) {
    loadQueue.push(startLoad);
  } else {
    startLoad();
  }

  return texture;
};
