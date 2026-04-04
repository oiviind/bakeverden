import Header from '@/components/Header'
import Image from 'next/image'
import styles from './page.module.css'

const cakes = [
  { src: '/specialcakes/bursdag1.png', title: 'Bursdagskake', description: 'Bestillingskake' },
  { src: '/specialcakes/lioncake.png', title: 'Løvekake', description: 'Bestillingskake' },
  { src: '/specialcakes/rabbitcake.png', title: 'Kaninkake', description: 'Bestillingskake' },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero — same gradient as header for seamless visual blend */}
      <section className={`${styles.hero} py-6 md:py-24`}>
        <div className="container">
          <div className="flex flex-row items-center gap-4 md:gap-10">
            <div className="flex-1 text-white">
              <h1 className="text-xl md:text-5xl font-bold mb-2 md:mb-4 leading-snug">
                Hjemmelaget med kjærlighet og de beste ingrediensene
              </h1>
              <p className={`${styles.heroSubtext} text-sm md:text-lg md:mb-8`}>
                Små og store kaker bakt fra bunnen — klare for bestilling
              </p>
            </div>
            {/* Logo */}
            <div className="w-32 h-32 flex-shrink-0 md:flex-1 md:w-full md:h-auto md:flex md:justify-center">
              <div className="w-full h-full md:h-auto md:max-w-sm md:aspect-square rounded-2xl overflow-hidden relative">
                <Image
                  src="/logo.png"
                  alt="Kjerstis Bakeverden"
                  fill
                  sizes="(max-width: 768px) 128px, 384px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About section */}
      <section className={`${styles.aboutSection} py-16`}>
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h2 className="section-heading mb-4">Om bakeren</h2>
              <p className={`${styles.aboutText} text-lg mb-6`}>
                Begynte med baking som terapi, og det har utviklet seg
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
                  alt="Kjerstis Bakeverden"
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

      {/* Cake showcase */}
      <section className="bg-white py-16">
        <div className="container">
          <h2 className="section-heading text-center mb-10">En smakebit</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
            {cakes.map((cake) => (
              <div key={cake.src} className={`${styles.cakeCard} min-w-[75vw] md:min-w-0 snap-start rounded-xl overflow-hidden flex-shrink-0 md:flex-shrink`}>
                <div className="aspect-square relative">
                  <Image
                    src={cake.src}
                    alt={cake.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{cake.title}</h3>
                  <p className="text-sm text-gray-500">{cake.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
