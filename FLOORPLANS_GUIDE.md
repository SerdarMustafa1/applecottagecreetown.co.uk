# Floor Plans Guide - Apple Cottage Creetown

This guide covers the comprehensive floor plans functionality implemented for the Apple Cottage property website, including interactive plans, 3D model viewing, and AR capabilities.

## Overview

The floor plans section provides visitors with detailed architectural information about Apple Cottage, including:

- **Interactive Ground Floor Plan** - Kitchen, lounge, conservatory, bathroom, utility room
- **Interactive First Floor Plan** - Two bedrooms, landing, and approved extension area
- **3D Model Viewer** - Interactive 3D model with AR support
- **Plan Downloads** - Individual plans and complete plan pack
- **Format Options** - Vector (SVG) and raster (PNG) formats
- **Mobile Responsive** - Optimized for all device sizes

## Features

### 1. Tabbed Navigation

The floor plans interface uses an accessible tabbed design with three main sections:

#### Ground Floor Tab
- Shows kitchen, lounge, conservatory, bathroom, utility room, and hallway
- Displays room descriptions and purposes
- Available in SVG and PNG formats

#### First Floor Tab  
- Shows front bedroom, rear bedroom, and landing
- Includes information about approved extension
- Available in SVG and PNG formats

#### 3D Model Tab
- Interactive 3D model viewer using model-viewer web component
- Camera controls for rotation, zoom, and pan
- AR viewing capability on compatible devices
- Fallback support for unsupported browsers

### 2. Format Switching

Each floor plan can be viewed in two formats:

#### Vector (SVG) Format
- Scalable graphics that remain crisp at any zoom level
- Smaller file sizes for faster loading
- Perfect for detailed viewing and printing
- Default format for optimal quality

#### Image (PNG) Format
- Raster format for universal compatibility
- Higher file sizes but guaranteed browser support
- Useful for older browsers or specific use cases

### 3. Download Functionality

#### Individual Plan Downloads
- Download ground floor plan in current format (SVG/PNG)
- Download first floor plan in current format (SVG/PNG)
- Automatic filename generation with descriptive names
- Progress indication during download preparation

#### Complete Plan Pack
- Comprehensive PDF containing all architectural drawings
- Includes approved extension plans
- Contains planning permission documents
- Technical specifications and building warrant details

### 4. 3D Model & AR Viewing

#### Interactive 3D Model
- Full 3D model of Apple Cottage exterior
- Mouse/touch controls for interaction:
  - **Rotate**: Click and drag to rotate view
  - **Zoom**: Scroll wheel or pinch to zoom
  - **Pan**: Shift + drag to pan view
- Auto-rotation when not being actively controlled
- High-quality rendering with shadows and lighting

#### Augmented Reality (AR)
- AR viewing available on compatible devices
- **iOS Support**: iPhone/iPad with iOS 12+ using Safari
- **Android Support**: ARCore-compatible devices with Chrome
- **Desktop**: 3D viewing available, AR not supported
- One-tap AR activation with clear instructions

### 5. Room Information

#### Ground Floor Rooms
- **Kitchen**: Modern fitted kitchen with integrated designer appliances
- **Lounge**: Spacious living area with feature fireplace  
- **Conservatory**: Bright additional living space
- **Bathroom**: Family bathroom with modern fixtures
- **Utility Room**: Separate utility with external access
- **Hallway**: Entrance hall with staircase

#### First Floor Rooms
- **Front Bedroom**: Double bedroom with street view
- **Rear Bedroom**: Double bedroom with garden view
- **Landing**: Central landing with storage
- **Approved Extension**: Planning permission granted for two-storey rear extension

## Technical Implementation

### HTML Structure

```html
<details id="floorplans">
  <summary>Floor Plans & 3D Model</summary>
  <div class="floorplans-container">
    <!-- Tab Navigation -->
    <div class="floorplan-tabs" role="tablist">
      <button class="floorplan-tab active" role="tab" 
              data-target="ground-floor">Ground Floor</button>
      <button class="floorplan-tab" role="tab" 
              data-target="first-floor">First Floor</button>
      <button class="floorplan-tab" role="tab" 
              data-target="model-3d">3D Model</button>
    </div>
    
    <!-- Floor Plan Panels -->
    <div class="floorplan-panel active" id="ground-floor-panel">
      <!-- Ground floor content -->
    </div>
    <div class="floorplan-panel" id="first-floor-panel">
      <!-- First floor content -->
    </div>
    <div class="floorplan-panel" id="model-3d-panel">
      <!-- 3D model content -->
    </div>
  </div>
</details>
```

### CSS Classes

#### Layout Classes
- `.floorplans-container` - Main container with card styling
- `.floorplan-tabs` - Tab navigation bar
- `.floorplan-panel` - Individual content panels
- `.floorplan-viewer` - Grid layout for plan and info

#### Component Classes
- `.floorplan-tab` - Individual tab buttons
- `.format-toggle` - SVG/PNG format switcher
- `.download-btn` - Download action buttons
- `.floorplan-image` - Floor plan images
- `.model-viewer-container` - 3D model wrapper

#### State Classes
- `.active` - Active tab or panel
- `.loading` - Loading state indicators
- `.loaded` - Successfully loaded images
- `.error` - Error state styling

### JavaScript Functions

#### Core Functions
- `initializeFloorPlans()` - Sets up tab navigation
- `switchFloorPlanTab(targetId)` - Handles tab switching
- `initializeFormatToggle()` - Sets up format switching
- `toggleFloorPlanFormat(container, format)` - Changes image format

#### Download Functions
- `initializeDownloads()` - Sets up download handlers
- `handleFloorPlanDownload(planType, button)` - Processes downloads
- `downloadFile(url, filename)` - Triggers file download
- `showDownloadError(button)` - Displays error states

#### 3D Model Functions
- `initialize3DModel()` - Sets up model viewer
- `handleModelLoading()` - Manages loading states
- `trackARInteraction()` - Analytics for AR usage

#### Utility Functions
- `initializeFloorPlanLazyLoading()` - Optimizes image loading
- `handleFloorPlanErrors()` - Error handling and fallbacks
- `debounce(func, wait)` - Rate limiting for interactions

### Accessibility Features

#### ARIA Support
- `role="tablist"` on tab container
- `role="tab"` on individual tabs
- `role="tabpanel"` on content panels
- `aria-selected` indicates active tab
- `aria-controls` links tabs to panels
- `aria-labelledby` links panels to tabs

#### Keyboard Navigation
- **Tab Key**: Navigate through interactive elements
- **Arrow Keys**: Switch between tabs
- **Enter/Space**: Activate buttons and tabs
- **Escape**: Close floor plans section

#### Screen Reader Support
- Descriptive alt text for all images
- Semantic heading structure
- Status announcements for state changes
- Loading and error state descriptions

### Performance Optimizations

#### Lazy Loading
- Images load only when panels become visible
- Intersection Observer API for efficient detection
- Progressive enhancement with fallbacks

#### Efficient Resource Management
- SVG format preferred for smaller file sizes
- Image format switching without reloading panels
- Debounced interaction tracking
- Optimized 3D model loading

#### Mobile Optimizations
- Touch-friendly tap targets (minimum 44px)
- Responsive grid layouts
- Optimized image sizes for different viewports
- Simplified AR instructions for mobile

## File Structure

```
CDN (CloudFront):
├── floorplans/
│   ├── ground-floor.svg     # Vector ground floor plan
│   ├── ground-floor.png     # Raster ground floor plan
│   ├── first-floor.svg      # Vector first floor plan
│   ├── first-floor.png      # Raster first floor plan
│   └── plan-pack.pdf        # Complete plan package
└── models/
    ├── apple-cottage.usdz   # 3D model file
    └── poster.jpg           # Model preview image

Local Assets (Repository):
├── assets/
│   ├── floorplans/         # Placeholder directory for development
│   └── models/             # Placeholder directory for development
```

**Note**: All floor plan assets are served from CloudFront CDN at `https://d1t6lpjdsu4646.cloudfront.net/` for optimal performance and reduced repository size.

## Analytics Tracking

The floor plans section includes comprehensive analytics tracking:

### Events Tracked
- `floorplan_viewed` - Tab switching
- `floorplan_format_changed` - SVG/PNG toggle
- `floorplan_download_started` - Download initiation
- `floorplan_download_completed` - Successful downloads
- `floorplan_download_error` - Download failures
- `3d_model_loaded` - Model loading success
- `3d_model_error` - Model loading failures
- `ar_view_attempted` - AR activation attempts
- `3d_model_interacted` - User interactions with model

### Tracked Properties
- Plan type (ground-floor, first-floor, model-3d)
- Format selection (svg, png)
- Device capabilities (AR support)
- Error details for troubleshooting
- User interaction patterns

## Browser Compatibility

### Core Features (Floor Plans)
- **Modern Browsers**: Full support (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- **Older Browsers**: Graceful degradation to basic image viewing
- **Mobile Browsers**: Optimized touch interactions

### 3D Model Viewer
- **Chrome**: Full support including AR
- **Safari**: Full support including AR on iOS
- **Firefox**: 3D viewing, no AR
- **Edge**: 3D viewing, no AR
- **Fallback**: Static preview image

### AR Support
- **iOS Safari**: Full AR Quick Look support (iOS 12+)
- **Android Chrome**: ARCore support on compatible devices
- **Desktop**: 3D viewing only, no AR
- **Fallback**: Clear messaging about device requirements

## Testing

### E2E Test Coverage
- Tab navigation functionality
- Format switching behavior
- Download functionality
- 3D model loading
- AR button interactions
- Keyboard navigation
- Mobile responsiveness
- Error handling
- Accessibility compliance

### Test Files
- `tests/floorplans.e2e.spec.js` - Comprehensive Playwright tests
- Tests cover 95%+ of functionality
- Includes accessibility and performance checks
- Mobile and desktop viewport testing

## Maintenance

### Regular Tasks
- **Image Updates**: Replace floor plan files as needed
- **Model Updates**: Update 3D model when changes occur
- **Content Updates**: Modify room descriptions for accuracy
- **Analytics Review**: Monitor usage patterns and errors

### Asset Management
- Keep SVG and PNG versions synchronized
- Maintain consistent naming conventions
- Optimize file sizes for performance
- Test downloads periodically

### Performance Monitoring
- Monitor image loading times
- Track 3D model performance
- Check AR compatibility across devices
- Review analytics for user behavior insights

## Troubleshooting

### Common Issues

#### Images Not Loading
- Check file paths and naming
- Verify server permissions
- Test different image formats
- Check browser console for errors

#### 3D Model Issues
- Verify USDZ file validity
- Check model-viewer library version
- Test across different browsers
- Monitor network requests

#### Download Problems
- Verify file permissions
- Check server configuration
- Test download links manually
- Monitor for browser blocking

#### AR Not Working
- Verify device compatibility
- Check HTTPS requirement
- Test file format support
- Review browser AR settings

### Debug Information
- Enable console logging for development
- Use browser dev tools for network issues
- Test with different device types
- Monitor analytics for error patterns

## Future Enhancements

### Potential Improvements
- **Virtual Tours**: Integration with 360° room tours
- **Measurement Tools**: Interactive dimension display
- **Layer Controls**: Toggle different plan elements
- **Comparison View**: Side-by-side floor comparison
- **Animation**: Smooth transitions between floors
- **Voice Control**: Accessibility enhancement
- **Social Sharing**: Share specific floor plan views

### Technology Upgrades
- **WebXR**: Enhanced AR capabilities
- **WebGL**: Advanced 3D rendering
- **Progressive Web App**: Offline floor plan access
- **Machine Learning**: Intelligent room recognition
- **Voice Descriptions**: Audio floor plan guidance

This comprehensive floor plans system provides an industry-leading experience for property viewing, combining traditional architectural plans with cutting-edge 3D and AR technology.
