import { notFound, redirect } from 'next/navigation'
import { getOrganization } from '@/app/actions/organizations'
import { getNewsletter } from '@/app/actions/newsletters'
import { getIssueWithItems, freezeIssue } from '@/app/actions/issues'
import IssueEditorClient from './IssueEditorClient'

export default async function IssueEditorPage({
  params,
}: {
  params: { orgId: string; newsletterId: string; issueId: string }
}) {
  const { orgId, newsletterId, issueId } = await params

  const [org, newsletter, issueData] = await Promise.all([
    getOrganization(orgId),
    getNewsletter(newsletterId),
    getIssueWithItems(orgId, newsletterId, issueId),
  ])

  if (!org || !newsletter || !issueData) {
    notFound()
  }

  // Freeze the issue when opening editor (if it's draft)
  if (issueData.status === 'draft') {
    await freezeIssue(orgId, newsletterId, issueId)
    issueData.status = 'frozen' // Update local state
  }

  return (
    <IssueEditorClient
      orgId={orgId}
      newsletterId={newsletterId}
      newsletter={newsletter}
      issue={issueData}
    />
  )
}
