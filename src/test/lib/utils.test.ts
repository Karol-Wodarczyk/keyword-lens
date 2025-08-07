import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('utils', () => {
    describe('cn (className utility)', () => {
        it('should merge class names correctly', () => {
            const result = cn('bg-red-500', 'text-white', 'p-4')
            expect(result).toBe('bg-red-500 text-white p-4')
        })

        it('should handle conditional classes', () => {
            const isActive = true
            const isInactive = false
            const result = cn('base-class', isActive && 'active-class', isInactive && 'inactive-class')
            expect(result).toBe('base-class active-class')
        })

        it('should handle Tailwind conflicts correctly', () => {
            // twMerge should resolve conflicting Tailwind classes
            const result = cn('p-4', 'p-8')
            expect(result).toBe('p-8') // Later class wins
        })

        it('should handle empty inputs', () => {
            expect(cn()).toBe('')
            expect(cn('', null, undefined)).toBe('')
        })

        it('should handle arrays and objects', () => {
            const result = cn(['class1', 'class2'], { 'class3': true, 'class4': false })
            expect(result).toBe('class1 class2 class3')
        })

        it('should handle complex Tailwind merging', () => {
            // Test that overlapping Tailwind utilities are properly merged
            const result = cn('bg-red-500 bg-blue-500')
            expect(result).toBe('bg-blue-500')
        })
    })
})
