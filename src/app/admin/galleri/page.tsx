import Header from '@/components/Header'
import { getGalleryImages } from '@/lib/actions/galleryActions'
import GalleryAdmin from './GalleryAdmin'

export const revalidate = 0

export default async function AdminGalleriPage() {
  const images = await getGalleryImages()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <main className="container pt-4 pb-8">
        <h1 className="page-title mb-6">Galleri</h1>
        <GalleryAdmin initialImages={images} />
      </main>
    </div>
  )
}
