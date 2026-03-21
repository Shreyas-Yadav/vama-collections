import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="h-12 w-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center mx-auto mb-3">
          <span className="text-white font-bold text-xl">V</span>
        </div>
        <CardTitle>Vama Inventory</CardTitle>
        <CardDescription>Sign in to manage your store</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[var(--color-muted)] text-center">
          Authentication will be integrated with the Spring Boot backend.
        </p>
      </CardContent>
    </Card>
  )
}
