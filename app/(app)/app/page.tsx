import { redirect } from 'next/navigation'
import { getUserOrganizations } from '@/app/actions/organizations'

export default async function AppPage() {
  // Check if user has any organizations
  const orgs = await getUserOrganizations()

  if (orgs.length === 0) {
    // No orgs, redirect to onboarding
    redirect('/app/onboarding')
  } else {
    // Has orgs, redirect to the first one
    redirect(`/app/org/${orgs[0].id}`)
  }
}
