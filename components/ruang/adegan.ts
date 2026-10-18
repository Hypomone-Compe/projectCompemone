/* Bentuk bersama semua adegan ruang fokus 3D. */
import type * as THREE from 'three';

export type Kualitas = 'tinggi' | 'rendah';

export interface Adegan {
  scene: THREE.Scene;
  /** Posisi mata kita (duduk). */
  mata: THREE.Vector3;
  /** Jumlah teman belajar di adegan (untuk keterangan di layar). */
  teman: number;
  /** Eksposur tone mapping; adegan siang lebih terang dari ruang dalam. */
  paparan?: number;
  /** Arah pandang awal (radian, positif = mendongak). */
  pitchAwal?: number;
  update(t: number, dt: number, fokus: boolean): void;
  dispose(): void;
}
