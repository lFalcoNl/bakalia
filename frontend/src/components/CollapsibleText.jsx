import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'

export default function CollapsibleText({
    text,
    maxChars = 80,
    className = '',
    moreLabel = '…докладніше',
    lessLabel = 'згорнути',
}) {
    const [expanded, setExpanded] = useState(false)
    const [rect, setRect] = useState(null)
    const containerRef = useRef(null)

    const isLong = text.length > maxChars
    const previewText = isLong ? text.slice(0, maxChars) + '…' : text

    const handleExpand = () => {
        if (containerRef.current) {
            const { top, left, width } = containerRef.current.getBoundingClientRect()
            setRect({ top, left, width })
        }
        setExpanded(true)
    }

    const handleCollapse = () => {
        setExpanded(false)
    }

    useEffect(() => {
        if (!expanded) return

        const onUpdate = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                setRect(rect)
            }
        }

        window.addEventListener('scroll', onUpdate)
        window.addEventListener('resize', onUpdate)

        // Initial call
        onUpdate()

        return () => {
            window.removeEventListener('scroll', onUpdate)
            window.removeEventListener('resize', onUpdate)
        }
    }, [expanded, containerRef])


    return (
        <>
            <div ref={containerRef} className={`relative overflow-visible ${className}`}>
                {!expanded && (
                    <>
                        <p className="whitespace-pre-wrap break-words">{previewText}</p>
                        {isLong && (
                            <button
                                onClick={handleExpand}
                                className="mt-1 text-sm text-primary hover:underline focus:outline-none"
                            >
                                {moreLabel}
                            </button>
                        )}
                    </>
                )}
            </div>

            {expanded && rect && ReactDOM.createPortal(
                <div
                    className="absolute bg-white p-4 shadow-lg z-49 overflow-auto max-h-[80vh]"
                    style={{ top: rect.top + window.scrollY, left: rect.left + window.scrollX, width: rect.width }}
                >
                    <p className="whitespace-pre-wrap break-words mb-4">{text}</p>
                    <button
                        onClick={handleCollapse}
                        className="text-sm text-primary hover:underline focus:outline-none"
                    >
                        {lessLabel}
                    </button>
                </div>,
                document.body
            )}
        </>
    )
}