import type { CSSProperties, ReactNode } from 'react';
import { Breadcrumb } from '@/components/ui';
import { MeshGradient } from '@/components/webgl';

/**
 * Kepala halaman dalam: mesh gradient design system di belakang, breadcrumb,
 * judul besar dengan baris kedua berwarna, deskripsi, dan slot aksi.
 * Sengaja pendek: isi halaman (yang dipakai) harus terlihat tanpa menggulir jauh.
 */
export default function PageHeader({
  crumbs,
  badge,
  title,
  emph,
  description,
  children,
  accent,
}: {
  crumbs: { label: string; href?: string }[];
  badge?: ReactNode;
  title: ReactNode;
  emph?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Warna baris kedua judul (default pink aksen). */
  accent?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden pb-8 pt-28 sm:pb-10 sm:pt-32">
      <MeshGradient className="-z-10 h-full max-h-[620px]" />
      <div className="shell">
        <Breadcrumb items={crumbs} />
        {badge && <div className="mt-5">{badge}</div>}
        <h1 className="mt-4 max-w-4xl text-[clamp(2.1rem,5.6vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink">
          {title}
          {emph && (
            <>
              <br />
              <span style={{ color: accent || 'var(--accent)' } as CSSProperties}>{emph}</span>
            </>
          )}
        </h1>
        {description && <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-secondary">{description}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
