import Cart from '@/components/Cart'
import Header from '@/components/Header'

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="page-title">🛒 Handlekurv</h1>
          <Cart />
        </div>
      </main>
    </div>
  )
}
