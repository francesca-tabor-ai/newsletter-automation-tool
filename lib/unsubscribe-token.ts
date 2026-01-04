/**
 * Unsubscribe Token Utilities
 * Generate and verify signed tokens for secure unsubscribe links
 */

import jwt from 'jsonwebtoken'

const SECRET = process.env.UNSUBSCRIBE_SECRET || 'change-this-in-production'

interface UnsubscribePayload {
  subscriberId: string
  email: string
  newsletterId: string
}

/**
 * Generate a signed unsubscribe token
 */
export function generateUnsubscribeToken(payload: UnsubscribePayload): string {
  return jwt.sign(payload, SECRET, {
    expiresIn: '90d', // Token valid for 90 days
  })
}

/**
 * Verify and decode an unsubscribe token
 */
export function verifyUnsubscribeToken(token: string): UnsubscribePayload | null {
  try {
    const decoded = jwt.verify(token, SECRET) as UnsubscribePayload
    return decoded
  } catch (error) {
    console.error('Invalid unsubscribe token:', error)
    return null
  }
}

/**
 * Generate full unsubscribe URL
 */
export function generateUnsubscribeUrl(
  subscriberId: string,
  email: string,
  newsletterId: string,
  baseUrl: string
): string {
  const token = generateUnsubscribeToken({ subscriberId, email, newsletterId })
  return `${baseUrl}/unsubscribe?token=${token}`
}

