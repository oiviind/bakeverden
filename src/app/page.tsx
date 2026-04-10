import Header from '@/components/Header'
import Image from 'next/image'
import styles from './page.module.css'
import JulebakstBanner from '@/components/JulebakstBanner'
import Link from 'next/link'
import { Card } from '@/components/ui'
import { getPopularBatches } from '@/lib/actions/getPopularBatches'
import { getGalleryImages } from '@/lib/actions/galleryActions'
import { getAvailableBatches } from '@/lib/actions/getBatches'

export default async function Home() {
  const [popularBatches, allGalleryImages, availableBatches] = await Promise.all([
    getPopularBatches(),
    getGalleryImages(),
    getAvailableBatches(),
  ])

  const showcaseImages = allGalleryImages
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  return (
    <div className="min-h-screen">
      <Header />

      {/* Welcome info */}
      <section id="main-content" className={styles.welcomeSection}>
        <div className="container">
          <h2 className={styles.welcomeTitle}>Velkommen til min nye nettbutikk 💛</h2>
          <p className={styles.welcomeText}>
            Dette er et stort og spennende steg for meg, og en måte å gjøre det enklere for deg å bestille kaker på. Med denne løsningen får du bedre oversikt, samtidig som jeg kan følge opp hver bestilling på en trygg og god måte.
          </p>
          <ul className={styles.welcomeList}>
            <li>Bestill kake ved å velge dato og sende inn en forespørsel</li>
            <li>Julekaker kan bestilles direkte fra menyen</li>
            <li>Se galleriet for inspirasjon og eksempler på kaker jeg har laget</li>
          </ul>
          <p className={styles.welcomeText}>
            Jeg gleder meg til å bake for deg! 🎂
          </p>
        </div>
      </section>

      {availableBatches.length > 0 && <JulebakstBanner />}

      {/* About section */}
      <section className={`${styles.aboutSection} py-16`}>
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h2 className="section-heading mb-4">Om meg</h2>
              <p className={`${styles.aboutText} text-lg mb-6`}>
                Jeg begynte med baking som terapi, og det har utviklet seg
                til en lidenskap for å lage gode kaker som bringer glede til andre.
                Hver kake er laget med omhu og de beste ingrediensene,
                og jeg liker å prøve meg på nye utfordringer.
                For meg handler baking om mer enn bare mat,
                det er en måte å spre kjærlighet og skape minner på ❤️
              </p>
            </div>
            {/* Bakeren */}
            <div className="flex-1 w-full flex justify-center">
              <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden relative shadow-xl">
                <Image
                  src="/Bakeren.JPG"
                  alt="Kjersti ved markedsstanden med hjemmelagde kaker"
                  fill
                  sizes="(max-width: 768px) 100vw, 384px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Most popular */}
      {availableBatches.length > 0 && popularBatches.length > 0 && (
        <section className={`${styles.aboutSection} py-16`}>
          <div className="container">
            <h2 className="section-heading mb-10">Populære kaker nå 🔥</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
              {popularBatches.map(batch => (
                <Link key={batch.id} href={`/reserve/${batch.id}`} className={styles.popularCardWrapper}>
                  <Card className={styles.popularCard}>
                    {batch.image_url && (
                      <Card.Image src={batch.image_url} alt={batch.title} />
                    )}
                    <Card.Content className={styles.popularCardContent}>
                      <Card.Title className={styles.popularCardTitle}>{batch.title}</Card.Title>
                      <Card.Description className={styles.popularCardDescription}>{batch.description ?? '\u00A0'}</Card.Description>
                    </Card.Content>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cake showcase */}
      <section className="bg-white py-16">
        <div className="container">
          <h2 className="section-heading text-center mb-10">En smakebit 😋</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
            {showcaseImages.map((img, i) => (
              <div key={img.id} className={`${styles.cakeCard} min-w-[75vw] md:min-w-0 snap-start rounded-xl overflow-hidden flex-shrink-0 md:flex-shrink`}>
                <div className="aspect-square relative">
                  <Image
                    src={img.image_url}
                    alt={img.title ?? img.category}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
                {img.title && (
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{img.title}</h3>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
