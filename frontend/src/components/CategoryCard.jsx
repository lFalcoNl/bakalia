import React, { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'

const MIN_DELAY = 200
const MAX_WAIT = 1500

export default function CategoryCard({ category, index = 0 }) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [imgError, setImgError] = useState(false)
    const [fallbackShown, setFallbackShown] = useState(false)

    const mountTime = useRef(Date.now())
    const timeoutRef = useRef(null)
    const unmounted = useRef(false)

    const to = `/category/${category.slug}`

    useEffect(() => {
        setIsLoaded(false)
        setImgError(false)
        setFallbackShown(false)
        unmounted.current = false
        mountTime.current = Date.now()

        // fallback if image never loads
        timeoutRef.current = setTimeout(() => {
            if (!unmounted.current && !isLoaded && !imgError) {
                setFallbackShown(true)
            }
        }, MAX_WAIT)

        return () => {
            clearTimeout(timeoutRef.current)
            unmounted.current = true
        }
    }, [category.image])

    const handleLoad = () => {
        clearTimeout(timeoutRef.current)
        const elapsed = Date.now() - mountTime.current
        const delay = Math.max(0, MIN_DELAY - elapsed)

        setTimeout(() => {
            if (!unmounted.current) {
                setIsLoaded(true)
            }
        }, delay)
    }

    const shouldShowNameOverlay = (imgError || fallbackShown) && !isLoaded

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
                <div className="w-full aspect-square overflow-hidden rounded-md relative bg-gray-100">
                    {/* shimmer while loading */}
                    {!isLoaded && !imgError && (
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer z-0" />
                    )}

                    {/* image */}
                    {!imgError && (
                        <img
                            src={category.image}
                            alt={category.name}
                            loading={index < 6 ? 'eager' : 'lazy'}
                            onLoad={handleLoad}
                            onError={() => setImgError(true)}
                            crossOrigin="anonymous"
                            className={`
                w-full h-full object-cover absolute inset-0
                transition-all duration-700 ease-out
                ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'}
              `}
                        />
                    )}

                    {/* fallback name in center */}
                    {shouldShowNameOverlay && (
                        <div className="absolute inset-0 flex items-center justify-center text-center p-2 z-10">
                            <span className="text-gray-600 text-sm font-medium">{category.name}</span>
                        </div>
                    )}

                    {/* glow on hover */}
                    <div className="
            pointer-events-none
            absolute inset-0 rounded-md
            opacity-0 group-hover:opacity-10
            bg-gradient-to-t from-transparent via-white to-transparent
            animate-pulse-slow
          " />
                </div>

                {/* show name below only if image failed */}
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
