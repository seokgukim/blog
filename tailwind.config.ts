import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography' // Import it

const config: Config = {
  darkMode: 'class',
  content: [
    // ... your content paths
  ],
  theme: {

  },
  plugins: [
    typography(), // Add the plugin here
    // ... other plugins
  ],
}
export default config