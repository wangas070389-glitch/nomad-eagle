import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Nomad Eagle Systems',
        short_name: 'Nomad Eagle',
        description: 'Advanced financial architecture and forecasting.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        orientation: 'portrait',
        icons: [
            {
                src: '/globe.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    }
}
