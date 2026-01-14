export type ImageStatus = 'pending' | 'processing' | 'done' | 'error';

export interface GalleryImage {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  type: string;
  width: number;
  height: number;
  status: ImageStatus;
  isSelected: boolean;
  createdAt: number;
  // 将来的に処理パラメータを持たせるならここに追加
}

export type GalleryAction = 'remove-background' | 'split' | 'crop' | 'resize' | 'delete' | 'download';
