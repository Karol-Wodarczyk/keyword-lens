# Mock API System

This project includes a comprehensive mock API system that allows you to develop and test without connecting to the real backend.

## 🎛️ Quick Switch

**To switch between Mock and Real API, change ONE line in `src/services/apiConfig.ts`:**

```typescript
// Use Mock API (default for development)
const USE_MOCK_API = true;

// Use Real API  
const USE_MOCK_API = false;
```

**Or use environment variables in `.env.local`:**

```bash
# Use Mock API
VITE_USE_MOCK_API=true

# Use Real API
VITE_USE_MOCK_API=false
```

## 📊 Mock Data Includes

### Keywords (15 items)
- Various manufacturing-related keywords
- Different occurrence counts (1-156 frames per keyword)
- Includes: machine, automatic, production, plastic, manufacturing, factory, etc.

### Frames (100 items)
- Simulated metadata (1920x1080 resolution)
- Random timestamps within last 30 days
- SVG placeholder images
- Realistic frame-to-keyword relationships

### Frame Keywords
- Randomly assigned 1-5 keywords per frame
- Confidence scores between 0.6-1.0
- Bounding box coordinates

## 🚀 Features

### 1. **Realistic Network Delays**
```typescript
// Simulates real API response times
await delay(300); // 300ms for keywords
await delay(500); // 500ms for full images
```

### 2. **Error Simulation**
- Mock API can simulate network errors
- Proper error handling and user feedback

### 3. **Visual Indicators**
- API status indicator shows which mode you're in
- Console logging shows all API calls
- Orange badge = Mock API, Green badge = Real API

### 4. **Development Workflow**
```bash
# Start with mock data (fast development)
VITE_USE_MOCK_API=true npm run dev

# Switch to real API when ready
VITE_USE_MOCK_API=false npm run dev
```

## 🎨 Mock Data Structure

### Keywords with Different Occurrence Levels
```typescript
// High occurrence (50+ frames)
{ Id: 1, Name: "machine", Count: 156 }
{ Id: 5, Name: "manufacturing", Count: 89 }

// Medium occurrence (10-49 frames)  
{ Id: 2, Name: "automatic", Count: 34 }
{ Id: 4, Name: "plastic", Count: 25 }

// Low occurrence (1-9 frames)
{ Id: 6, Name: "factory", Count: 3 }
```

### Frame Relationships
- Each frame has 1-5 randomly assigned keywords
- Realistic confidence scores and bounding boxes
- Proper filtering by occurrence levels

## 🔧 Customization

### Adding More Mock Data
Edit `src/services/mockApi.ts`:

```typescript
// Add more keywords
const mockKeywords: KeywordDto[] = [
  // ... existing keywords
  { Id: 16, Name: "your-keyword", IsEntity: false, Count: 42 }
];

// Adjust frame count
const mockFrameMetadata = Array.from({ length: 200 }, (_, i) => ({
  // Generates 200 frames instead of 100
}));
```

### Changing Network Delays
```typescript
// In mockApi.ts
async getKeywords() {
  await delay(100); // Faster response
  // or
  await delay(1000); // Slower response for testing loading states
}
```

## 🐛 Debugging

### Console Output
Mock API calls are logged with 🎭 emoji:
```
🎭 Mock: Getting keywords
🎭 Mock: Getting frames for keywords {keyword_ids: [1,2,3], confidence_min: 0, confidence_max: 1}
🎭 Mock: Getting frame 42
```

### API Configuration Logging
Check browser console for:
```
🔧 API Configuration: {
  useMockApi: true,
  apiType: "Mock API", 
  baseUrl: "Mock Data",
  environment: "development"
}
```

This mock system provides a complete development environment without requiring backend connectivity! 🚀
