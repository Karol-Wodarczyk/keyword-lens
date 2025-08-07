import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { TestProviders } from './test-providers'

// Custom render function that includes providers
export const render = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => rtlRender(ui, { wrapper: TestProviders, ...options })

// Re-export specific testing utilities
export {
    act,
    cleanup,
    renderHook,
} from '@testing-library/react'

export {
    screen,
    fireEvent,
    waitFor,
    within,
} from '@testing-library/dom'

export { default as userEvent } from '@testing-library/user-event'
