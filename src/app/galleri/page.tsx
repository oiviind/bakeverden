import Header from '@/components/Header'
import { getGalleryImages } from '@/lib/actions/galleryActions'
import GalleryClient from './GalleryClient'

export const revalidate = 0

export default async function GalleriPage() {
  const images = await getGalleryImages()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8">
        <h1 className="section-heading mb-6">Bildegalleri</h1>
        <GalleryClient images={images} />
      </main>
    </div>
  )
}
