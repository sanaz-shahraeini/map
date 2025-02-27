# Product Location & EPD Visualization Map Platform

nextjs react leaflet mapping epd environmental-product-declaration mui typescript tailwindcss geospatial product-visualization interactive-map data-viz sustainability

A modern web application built with Next.js that provides an interactive mapping interface for visualizing product locations and Environmental Product Declarations (EPDs) worldwide.

## 🚀 Features

### Interactive Map Visualization

- Global product location visualization using Leaflet.js
- Interactive markers with detailed product information
- Smart marker clustering to prevent overlap
- Custom popup information for each location
- Dynamic zoom controls and responsive design

### EPD Explorer Mode

- Dedicated mode for Environmental Product Declaration (EPD) data
- Year-based filtering for EPD markers
- Visual distinction between EPD and non-EPD markers
- Real-time statistics for filtered EPD counts
- Comprehensive EPD information display

### Advanced Filtering

- Country-based filtering
- Year range selection
- Product category filtering
- Intelligent search functionality with product name support
- Real-time marker count updates

## 🛠️ Technical Stack

- **Frontend Framework:** Next.js 14 with React 18
- **Mapping:** Leaflet.js and React-Leaflet
- **UI Components:** Material-UI (MUI)
- **Form Handling:** React Hook Form and Formik with Yup validation
- **Styling:** TailwindCSS and Styled Components
- **Authentication:** NextAuth.js
- **Language:** TypeScript

## 📦 Installation

1. Clone the repository:

```bash
git clone [repository-url]
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add necessary environment variables:

```env
NEXT_PUBLIC_API_URL=your_api_url
# Add other required environment variables
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🔧 Configuration

The application can be configured through various environment variables and configuration files:

- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - TailwindCSS customization
- `tsconfig.json` - TypeScript configuration

## 🌟 Performance Optimizations

- Dynamic imports for map components
- Efficient marker clustering
- Optimized handling of large datasets
- Debounced search functionality
- SSR-friendly implementation

## 🔍 Code Structure

```
src/
├── components/
│   └── (Map)/
│       └── Map.jsx         # Main mapping component
├── useContexts/
│   ├── ProductsContext.js  # Product data management
│   └── SearchContext.js    # Search functionality
├── public/
│   └── data/
│       └── countryCoordinates.js
└── ...
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Leaflet](https://leafletjs.com/) - JavaScript library for interactive maps
- [Material-UI](https://mui.com/) - React UI framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📫 Support

For support, please open an issue in the repository or contact the development team.
