import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import { Card } from '@/components/ui'
import BatchForm from '@/components/admin/BatchForm'

export default async function NewBatchPage() {
  const supabase = await createClient()

  const { data: allIngredients } = await supabase
    .from('ingredients')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={true} />
      <main className="container pt-4 pb-6">
        <Card>
          <Card.Content>
            <BatchForm ingredients={allIngredients || []} />
          </Card.Content>
        </Card>
      </main>
    </div>
  )
}
