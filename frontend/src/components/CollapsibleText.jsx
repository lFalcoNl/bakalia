// frontend/src/components/CollapsibleText.jsx
import React, { useState } from 'react'

export default function CollapsibleText({
    text,
    maxChars = 80,
    className = '',
    moreLabel = '…докладніше',
    lessLabel = 'згорнути',
}) {
    const [expanded, setExpanded] = useState(false)
    const isLong = text.length > maxChars
    const display = !isLong
        ? text
        : expanded
            ? text
            : text.slice(0, maxChars) + '…'

    return (
        <div className={className}>
            <p className="whitespace-pre-wrap break-words">{display}</p>
            {isLong && (
                <button
                    onClick={() => setExpanded(prev => !prev)}
                    className="mt-1 text-sm text-primary hover:underline focus:outline-none"
                >
                    {expanded ? lessLabel : moreLabel}
                </button>
            )}
        </div>
    )
}
