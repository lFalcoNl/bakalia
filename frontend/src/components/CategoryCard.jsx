import React, { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'

const MIN_DELAY = 200
const MAX_WAIT = 2000

export default function CategoryCard({ category, index = 0 }) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [imgError, setImgError] = useState(false)
    const [showName, setShowName] = useState(false)

    const mountedRef = useRef(true)
    const loadStartRef = useRef(Date.now())
    const imageRef = useRef(null)

    useEffect(() => {
        mountedRef.current = true
        setIsLoaded(false)
        setImgError(false)
        setShowName(false)
        loadStartRef.current = Date.now()

        const img = new Image()
        img.src = category.image
        img.onload = () => {
            const elapsed = Date.now() - loadStartRef.current
            const delay = Math.max(0, MIN_DELAY - elapsed)

            setTimeout(() => {
                if (mountedRef.current) setIsLoaded(true)
            }, delay)
        }
        img.onerror = () => {
            if (mountedRef.current) {
                setImgError(true)
                setTimeout(() => setShowName(true), 400)
            }
        }

        // max wait fallback
        const fallbackTimer = setTimeout(() => {
            if (mountedRef.current && !isLoaded && !imgError) {
                setIsLoaded(true)
            }
        }, MAX_WAIT)

        return () => {
            mountedRef.current = false
            clearTimeout(fallbackTimer)
        }
    }, [category.image])

    const to = `/category/${category.slug}`
    const showOverlayText = imgError || (!isLoaded && showName)

    return (
        <NavLink
            to={to}
            className={({ isActive }) => `
        relative group block h-full
        rounded-xl border bg-white shadow-sm
        transition-transform duration-300 ease-out
        hover:-translate-y-1 hover:shadow-lg active:scale-95
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50
        ${isActive ? 'border-primary ring-2 ring-primary' : 'border-gray-200'}
        p-4 text-center
      `}
        >
            <div className="flex flex-col h-full">
                {/* Image Container */}
                <div className="w-full aspect-square overflow-hidden rounded-md relative bg-gray-100">
                    {/* Shimmer */}
                    {!isLoaded && !imgError && (
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer z-0" />
                    )}

                    {/* Image */}
                    {!imgError && (
                        <img
                            ref={imageRef}
                            src={category.image}
                            alt={category.name}
                            loading={index < 6 ? 'eager' : 'lazy'}
                            className={`
                w-full h-full object-cover absolute top-0 left-0
                transition-all duration-500 ease-out
                ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'}
              `}
                        />
                    )}

                    {/* Fallback Text */}
                    {showOverlayText && (
                        <div className="absolute inset-0 flex items-center justify-center text-center p-2 z-10">
                            <span className="text-gray-600 text-sm font-medium">{category.name}</span>
                        </div>
                    )}
                </div>

                {/* Name Below for Error State */}
                {imgError && (
                    <div className="mt-3 flex-grow flex items-center justify-center min-h-[40px]">
                        <span className="block text-sm font-medium text-gray-600 group-hover:text-primary">
                            {category.name}
                        </span>
                    </div>
                )}
            </div>
        </NavLink>
    )
}
