import Cart from '@/components/Cart'
import Header from '@/components/Header'

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">🛒 Handlekurv</h1>
          <Cart />
        </div>
      </main>
    </div>
  )
}