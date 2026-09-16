import Header from '@/components/Header'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'
import { getButtonClassName } from '@/components/ui'
import { getGalleryImages } from '@/lib/actions/galleryActions'
import { getAvailableBatches } from '@/lib/actions/getBatches'

export default async function Home() {
  const [allGalleryImages, availableBatches] = await Promise.all([
    getGalleryImages(),
    getAvailableBatches(),
  ])

  const showcaseImages = allGalleryImages
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  const julebakstActive = availableBatches.length > 0

  const heroSection = (
    <section id="main-content" className={styles.hero}>
      <div className="container">
        <div className={styles.heroRow}>
          <div className={styles.heroCopy}>
            <span className={`${styles.tag} ${styles.tagAccent2}`}>Hjemmelaget av meg</span>
            <h1 className={styles.heroTitle}>Kaker til dagene som betyr noe</h1>
            <p className={styles.heroText}>
              Velg dato, send en forespørsel, og jeg følger opp bestillingen din personlig.
              Alt bakes av meg, på mitt eget kjøkken.
            </p>
          </div>
          <div className={styles.heroActions}>
            <Link href="/bestill" className={getButtonClassName('primary', 'lg')}>
              Bestill kake
            </Link>
            <Link href="/galleri" className={getButtonClassName('secondary', 'lg')}>
              Se galleriet
            </Link>
          </div>
        </div>
      </div>
    </section>
  )

  const aboutSection = (
    <section className={styles.aboutSection}>
      <div className="container">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 w-full flex justify-center">
            <div className="w-full max-w-sm aspect-square rounded-full overflow-hidden relative shadow-xl">
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
          <div className="flex-1">
            <h2 className={styles.sectionTitle}>Om meg</h2>
            <p className={`${styles.aboutText} text-lg mb-4`}>
              Jeg begynte med baking som terapi, og det har utviklet seg
              til en lidenskap for å lage gode kaker som bringer glede til andre.
            </p>
            <p className={`${styles.aboutText} text-lg`}>
              Hver kake er laget med omhu og de beste ingrediensene,
              og jeg liker å prøve meg på nye utfordringer. For meg handler baking
              om mer enn bare mat, det er en måte å spre kjærlighet og skape minner på ❤️
            </p>
            <p className={styles.aboutSignature}>– Kjersti</p>
          </div>
        </div>
      </div>
    </section>
  )

  const julebakstSection = julebakstActive && (
    <section id="julebakst" className={styles.julebakst}>
      <div className="container">
        <div className={styles.julebakstHeader}>
          <div>
            <span className={`${styles.tag} ${styles.tagAccent}`}>Julesalget er åpent</span>
            <h2 className={styles.sectionTitle}>Julebakst</h2>
            <p className={styles.julebakstIntro}>
              Julekakene bestilles direkte fra menyen – ingen forespørsel nødvendig.
              Legg i kurv, velg hentedato i kassen, så står de klare.
            </p>
          </div>
          <Link href="/julebakst" className={getButtonClassName('primary', 'lg')}>
            Se hele julemenyen
          </Link>
        </div>
      </div>
    </section>
  )

  return (
    <div className="min-h-screen">
      <Header />

      {julebakstSection}
      {heroSection}
      {aboutSection}

      {/* Slik bestiller du */}
      <section className={styles.steps}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Slik bestiller du</h2>
          <div className={styles.stepsGrid}>
            <div>
              <span className={`${styles.stepNumber} ${styles.stepAccent}`}>1</span>
              <h3 className={styles.stepTitle}>Velg dato</h3>
              <p className={styles.stepText}>
                Velg hvilken dato du ønsker å få kaken din. Jeg har begrenset kapasitet, så vær tidlig ute. 
              </p>
            </div>
            <div>
              <span className={`${styles.stepNumber} ${styles.stepAccent2}`}>2</span>
              <h3 className={styles.stepTitle}>Send forespørsel</h3>
              <p className={styles.stepText}>
                Fortell meg om anledningen, antall personer og eventuelle allergier.
              </p>
            </div>
            <div>
              <span className={`${styles.stepNumber} ${styles.stepAccent}`}>3</span>
              <h3 className={styles.stepTitle}>Jeg bekrefter og baker</h3>
              <p className={styles.stepText}>
                Du får svar fra meg med pris og avtale om henting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* En smakebit */}
      <section className={styles.gallerySection}>
        <div className="container">
          <div className={styles.galleryHeader}>
            <h2 className={styles.sectionTitle}>En smakebit 😋</h2>
            <Link href="/galleri" className={styles.galleryLink}>Se hele galleriet</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
            {showcaseImages.map((img, i) => (
              <figure
                key={img.id}
                className={`${styles.galleryItem} min-w-[75vw] md:min-w-0 snap-start flex-shrink-0 md:flex-shrink`}
              >
                <div className={styles.galleryImageWrap}>
                  <Image
                    src={img.image_url}
                    alt={img.title ?? img.category}
                    fill
                    sizes="(max-width: 768px) 75vw, 33vw"
                    className={styles.galleryImage}
                    priority={i === 0}
                  />
                </div>
                {img.title && (
                  <figcaption className={styles.galleryCaption}>{img.title}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
