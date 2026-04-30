import type { Preview } from '@storybook/react'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'midnight',
      values: [{ name: 'midnight', value: '#040810' }],
    },
  },
}

export default preview
