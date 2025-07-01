import React, { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'

const MIN_DELAY = 200
const MAX_WAIT = 2000

export default function CategoryCard({ category, index = 0 }) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [imgError, setImgError] = useState(false)

    const mountedRef = useRef(true)
    const fallbackTimeout = useRef(null)

    useEffect(() => {
        mountedRef.current = true
        setIsLoaded(false)
        setImgError(false)

        const img = new Image()
        img.src = category.image

        const startTime = Date.now()

        img.onload = () => {
            const elapsed = Date.now() - startTime
            const delay = Math.max(0, MIN_DELAY - elapsed)
            setTimeout(() => {
                if (mountedRef.current) setIsLoaded(true)
            }, delay)
        }

        img.onerror = () => {
            if (mountedRef.current) setImgError(true)
        }

        // fallback in case onload doesn't fire
        fallbackTimeout.current = setTimeout(() => {
            if (mountedRef.current && !imgError) setIsLoaded(true)
        }, MAX_WAIT)

        return () => {
            mountedRef.current = false
            clearTimeout(fallbackTimeout.current)
        }
    }, [category.image])

    const to = `/category/${category.slug}`

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
                            className={`
                absolute inset-0 w-full h-full object-cover
                transition-all duration-500 ease-out
                ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'}
              `}
                        />
                    )}

                    {/* fallback name in center */}
                    {imgError && (
                        <div className="absolute inset-0 flex items-center justify-center text-center p-2 z-10">
                            <span className="text-gray-700 text-sm font-semibold">{category.name}</span>
                        </div>
                    )}
                </div>
            </div>
        </NavLink>
    )
}
