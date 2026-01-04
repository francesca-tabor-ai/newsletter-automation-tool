'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { updateIssueIntro, updateIssueItem, reorderIssueItems } from '@/app/actions/issues'
import { useRouter } from 'next/navigation'

interface IssueItem {
  id: string
  position: number
  removed: boolean
  custom_title: string | null
  custom_summary: string | null
  items: {
    id: string
    title: string
    url: string
    canonical_url: string
    author: string | null
    published_at: string
    summary: string | null
    content_text: string | null
    content_html: string | null
    image_url: string | null
    sources: {
      id: string
      name: string
      url: string
    } | null
  }
}

interface EditorPanelProps {
  orgId: string
  newsletterId: string
  issueId: string
  items: IssueItem[]
  setItems: (items: IssueItem[]) => void
  introMd: string
  setIntroMd: (intro: string) => void
}

export default function EditorPanel({
  orgId,
  newsletterId,
  issueId,
  items,
  setItems,
  introMd,
  setIntroMd,
}: EditorPanelProps) {
  const router = useRouter()
  const [savingIntro, setSavingIntro] = useState(false)
  const [introSaved, setIntroSaved] = useState(false)

  // Auto-save intro after 1 second of no typing
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (introMd !== null) {
        setSavingIntro(true)
        await updateIssueIntro(orgId, newsletterId, issueId, introMd)
        setSavingIntro(false)
        setIntroSaved(true)
        setTimeout(() => setIntroSaved(false), 2000)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [introMd, orgId, newsletterId, issueId])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const reorderedItems = Array.from(items)
    const [removed] = reorderedItems.splice(result.source.index, 1)
    reorderedItems.splice(result.destination.index, 0, removed)

    setItems(reorderedItems)

    // Save new order to server
    const itemIds = reorderedItems.map((item) => item.id)
    await reorderIssueItems(orgId, newsletterId, issueId, itemIds)
    router.refresh()
  }

  const toggleRemoved = async (itemId: string, currentRemoved: boolean) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, removed: !currentRemoved } : item
    )
    setItems(updatedItems)

    await updateIssueItem(orgId, itemId, { removed: !currentRemoved })
    router.refresh()
  }

  const updateCustomField = async (
    itemId: string,
    field: 'custom_title' | 'custom_summary',
    value: string
  ) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, [field]: value } : item
    )
    setItems(updatedItems)

    await updateIssueItem(orgId, itemId, { [field]: value || null })
  }

  const activeItems = items.filter((item) => !item.removed)
  const removedItems = items.filter((item) => item.removed)

  return (
    <div className="p-6 space-y-8">
      {/* Intro Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Introduction</h2>
          <div className="text-xs text-gray-500">
            {savingIntro && 'Saving...'}
            {introSaved && '✓ Saved'}
          </div>
        </div>
        <textarea
          value={introMd}
          onChange={(e) => setIntroMd(e.target.value)}
          placeholder="Write an introduction for your newsletter (supports Markdown)..."
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          Supports Markdown: **bold**, *italic*, [links](url), etc.
        </p>
      </div>

      {/* Active Items */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Content Items ({activeItems.length})
        </h2>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="items">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {activeItems.map((issueItem, index) => {
                  const item = issueItem.items
                  return (
                    <Draggable
                      key={issueItem.id}
                      draggableId={issueItem.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white border rounded-lg p-4 ${
                            snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                          }`}
                        >
                          {/* Drag Handle & Remove Button */}
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              {...provided.dragHandleProps}
                              className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing"
                            >
                              <svg
                                className="w-5 h-5 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-500">
                                  #{index + 1}
                                </span>
                                {item.sources && (
                                  <span className="text-xs text-gray-500">
                                    {item.sources.name}
                                  </span>
                                )}
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">
                                  {new Date(item.published_at).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Custom Title */}
                              <div className="mb-2">
                                <input
                                  type="text"
                                  placeholder={item.title}
                                  value={issueItem.custom_title || ''}
                                  onChange={(e) =>
                                    updateCustomField(
                                      issueItem.id,
                                      'custom_title',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-1 text-sm font-medium border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                  Original: {item.title}
                                </p>
                              </div>

                              {/* Custom Summary */}
                              <div className="mb-2">
                                <textarea
                                  placeholder={item.summary || 'No summary'}
                                  value={issueItem.custom_summary || ''}
                                  onChange={(e) =>
                                    updateCustomField(
                                      issueItem.id,
                                      'custom_summary',
                                      e.target.value
                                    )
                                  }
                                  rows={2}
                                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                  Original: {item.summary || 'No summary'}
                                </p>
                              </div>

                              {/* Link */}
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline truncate block"
                              >
                                {item.url}
                              </a>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() =>
                                toggleRemoved(issueItem.id, issueItem.removed)
                              }
                              className="flex-shrink-0 px-2 py-1 text-xs font-medium text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {activeItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No active items. Restore removed items below.
          </div>
        )}
      </div>

      {/* Removed Items */}
      {removedItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Removed Items ({removedItems.length})
          </h2>
          <div className="space-y-3">
            {removedItems.map((issueItem) => {
              const item = issueItem.items
              return (
                <div
                  key={issueItem.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                        {issueItem.custom_title || item.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {issueItem.custom_summary || item.summary}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        toggleRemoved(issueItem.id, issueItem.removed)
                      }
                      className="flex-shrink-0 px-2 py-1 text-xs font-medium text-green-600 border border-green-300 rounded hover:bg-green-50 transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

