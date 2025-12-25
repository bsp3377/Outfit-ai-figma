'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface MousePosition {
    x: number
    y: number
}

interface Trail {
    id: number
    x: number
    y: number
    opacity: number
}

interface MouseTrailBackgroundProps {
    isDark?: boolean
    dotCount?: number
    dotSize?: number
    trailLength?: number
    className?: string
}

export function MouseTrailBackground({
    isDark = false,
    dotCount = 50,
    dotSize = 4,
    trailLength = 15,
    className = ''
}: MouseTrailBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [mousePos, setMousePos] = useState<MousePosition>({ x: -100, y: -100 })
    const [trails, setTrails] = useState<Trail[]>([])
    const [isHovering, setIsHovering] = useState(false)
    const trailIdRef = useRef(0)
    const animationRef = useRef<number>()

    // Generate random dots
    const [dots] = useState(() =>
        Array.from({ length: dotCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: dotSize + Math.random() * 2,
            delay: Math.random() * 2
        }))
    )

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setMousePos({ x, y })

        // Add new trail point
        const newTrail: Trail = {
            id: trailIdRef.current++,
            x,
            y,
            opacity: 1
        }

        setTrails(prev => [...prev.slice(-trailLength), newTrail])
    }, [trailLength])

    const handleMouseEnter = useCallback(() => {
        setIsHovering(true)
    }, [])

    const handleMouseLeave = useCallback(() => {
        setIsHovering(false)
        setMousePos({ x: -100, y: -100 })
    }, [])

    // Animate trails fading out
    useEffect(() => {
        const animate = () => {
            setTrails(prev =>
                prev
                    .map(trail => ({ ...trail, opacity: trail.opacity - 0.03 }))
                    .filter(trail => trail.opacity > 0)
            )
            animationRef.current = requestAnimationFrame(animate)
        }

        animationRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [])

    const dotColor = isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.12)'
    const trailColor = isDark ? 'rgba(168, 85, 247, 0.7)' : 'rgba(139, 92, 246, 0.5)'
    const glowColor = isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(139, 92, 246, 0.3)'

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`absolute inset-0 overflow-hidden z-0 ${className}`}
            style={{ cursor: 'none' }}
        >
            {/* Static background dots */}
            {dots.map(dot => (
                <div
                    key={dot.id}
                    className="absolute rounded-full animate-pulse pointer-events-none"
                    style={{
                        left: `${dot.x}%`,
                        top: `${dot.y}%`,
                        width: dot.size,
                        height: dot.size,
                        backgroundColor: dotColor,
                        animationDelay: `${dot.delay}s`,
                        animationDuration: '3s'
                    }}
                />
            ))}

            {/* Mouse trail */}
            {trails.map((trail, index) => (
                <div
                    key={trail.id}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: trail.x,
                        top: trail.y,
                        width: 8 + (index / trails.length) * 16,
                        height: 8 + (index / trails.length) * 16,
                        backgroundColor: trailColor,
                        opacity: trail.opacity * (index / trails.length),
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 ${12 + index * 2}px ${glowColor}`,
                    }}
                />
            ))}

            {/* Mouse glow effect - cursor follower */}
            {isHovering && (
                <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: mousePos.x,
                        top: mousePos.y,
                        width: 80,
                        height: 80,
                        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            )}

            {/* Custom cursor */}
            {isHovering && (
                <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: mousePos.x,
                        top: mousePos.y,
                        width: 12,
                        height: 12,
                        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.9)' : 'rgba(139, 92, 246, 0.8)',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 20px ${glowColor}`,
                    }}
                />
            )}
        </div>
    )
}
