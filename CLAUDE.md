# KBR Editor - AI Assistant Guide

> **Comprehensive Guide for AI Assistants Working on KBR Editor**
> Last Updated: 2025-11-16
> Version: 1.0

---

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Codebase Structure](#codebase-structure)
4. [Data Model & Schema](#data-model--schema)
5. [Core Components](#core-components)
6. [Services & Utilities](#services--utilities)
7. [Development Workflows](#development-workflows)
8. [Coding Conventions](#coding-conventions)
9. [Common Tasks](#common-tasks)
10. [Testing & Quality](#testing--quality)
11. [Export Systems](#export-systems)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is KBR Editor?

**KBR Editor** (Kanbun Kaeriten Browser Editor) is a web-based application for creating and editing Chinese classical text (Kanbun/漢文) educational materials with vertical writing layout and annotation support.

### Key Features

- **Vertical Writing**: Right-to-left, top-to-bottom text layout
- **Kaeriten Marks** (返り点): Reading order markers (レ, 一二点, 上中下点, etc.)
- **Ruby Annotations** (ルビ): Pronunciation guides
- **Tate-chu-yoko** (縦中横): Horizontal text within vertical layout
- **Export Capabilities**: PDF and Word (.docx) output with proper formatting
- **Auto-save**: LocalStorage-based persistence
- **Keyboard Shortcuts**: Alt+1-9 for quick kaeriten insertion

### Project Phases

| Phase | Status | Features |
|-------|--------|----------|
| Phase 1 | ✅ Complete | Foundation, vertical editor, kaeriten palette |
| Phase 2 | ✅ Complete | UI improvements, Word export |
| Phase 3 | ✅ Complete | Ruby, TCY, localStorage, toolbar |
| Phase 4 | ✅ Complete | PDF export with high-resolution support |
| Phase 5 | 🔄 Planned | Google Docs export, AI assistance, advanced formatting |

---

## Architecture & Tech Stack

### Core Technologies

```json
{
  "Frontend Framework": "React 19.2.0",
  "Build Tool": "Vite 7.2.2",
  "Styling": "TailwindCSS 3.4.18",
  "PDF Generation": "html2canvas 1.4.1 + jsPDF 3.0.3",
  "Word Export": "docx 9.5.1",
  "File Operations": "file-saver 2.0.5"
}
```

### Development Tools

- **Linter**: ESLint 9.39.1 with React Hooks plugin
- **PostCSS**: Autoprefixer for TailwindCSS
- **Dev Server**: Vite with Hot Module Replacement (HMR)

### Browser Requirements

- Modern browsers with CSS Writing Mode support
- `writing-mode: vertical-rl` for vertical text
- `text-combine-upright` for TCY (Tate-chu-yoko)

---

## Codebase Structure

```
kanbun/
├── .claude/                    # Claude Code configuration
│   └── Claude.md              # Development rules (internal)
├── src/
│   ├── components/            # React UI components
│   │   ├── KanbunEditor.jsx   # Main editor (root component)
│   │   ├── VerticalText.jsx   # Vertical text renderer
│   │   ├── KaeritenPalette.jsx # Kaeriten insertion palette
│   │   ├── Toolbar.jsx        # Top toolbar (save, export, etc.)
│   │   ├── StatusBar.jsx      # Bottom status bar
│   │   ├── RubyDialog.jsx     # Ruby annotation dialog
│   │   └── TcyButton.jsx      # TCY auto-detection button
│   ├── hooks/                 # Custom React hooks
│   │   └── useLocalStorage.js # localStorage with auto-save
│   ├── models/                # Data models & schemas
│   │   └── kanbunSchema.js    # JSON schema & validators
│   ├── services/              # Export services
│   │   ├── pdfExport.js       # PDF generation
│   │   └── wordExport.js      # Word document export
│   ├── utils/                 # Utility functions
│   │   ├── textUtils.js       # Text processing utilities
│   │   └── tcyUtils.js        # TCY detection & handling
│   ├── App.jsx                # Root application component
│   └── main.jsx               # Entry point
├── docs/                      # Documentation & templates
│   ├── KanbunTemplate.bas     # Word VBA macro template
│   └── setup-word-template.md # Word template setup guide
├── public/                    # Static assets
├── dist/                      # Production build output
├── package.json               # Dependencies & scripts
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # TailwindCSS configuration
├── eslint.config.js           # ESLint rules
└── README.md                  # Project documentation
```

### File Naming Conventions

- **Components**: PascalCase `.jsx` files (e.g., `KanbunEditor.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useLocalStorage.js`)
- **Services**: camelCase `.js` files (e.g., `pdfExport.js`)
- **Utilities**: camelCase `.js` files (e.g., `textUtils.js`)

---

## Data Model & Schema

### Document Structure

The entire application state is represented as a JSON document following this schema:

```javascript
{
  "blocks": [                  // Array of text blocks
    {
      "id": "b1",              // Unique block identifier
      "vertical": true,        // Vertical writing flag
      "text": "故人之所為、皆當以禮。",  // Raw text content
      "annotations": [...]     // Annotations array
    }
  ],
  "meta": {                    // Document metadata
    "title": "新規ドキュメント",
    "paper": "B5",             // Paper size (B5/A4/B4)
    "font": "游明朝",           // Font family
    "author": "森川大地",
    "created": "2025-11-12T00:00:00.000Z",
    "modified": "2025-11-12T00:00:00.000Z"
  }
}
```

### Annotation Types

#### 1. Kaeriten (返り点)

Position-based reading order markers:

```javascript
{
  "pos": 2,                    // Character position (0-indexed)
  "type": "kaeriten",
  "value": "レ"                 // Mark value (レ, 一, 二, 上, etc.)
}
```

**Available Marks**:
- **Re** (レ): Basic return point
- **Number Points** (一二点): 一, 二, 三, ...
- **Direction Points** (上中下点): 上, 中, 下
- **Heavenly Stems** (甲乙丙丁): 甲, 乙, 丙, 丁
- **Heaven-Earth-Man** (天地人): 天, 地, 人

#### 2. Ruby (ルビ/振り仮名)

Pronunciation guides for characters:

```javascript
{
  "range": [1, 2],             // Character range [start, end)
  "type": "ruby",
  "rb": "人",                   // Base text (parent characters)
  "rt": "ひと"                  // Ruby text (reading)
}
```

#### 3. Tate-chu-yoko (縦中横)

Horizontal text within vertical layout (e.g., numbers, Latin words):

```javascript
{
  "range": [5, 7],             // Character range [start, end)
  "type": "tcy"
}
```

### Schema Validation

Defined in `src/models/kanbunSchema.js`:
- **Factory Functions**: `createDefaultDocument()`, `createKaeritenAnnotation()`, etc.
- **Constants**: `KAERITEN_TYPES` for available marks
- **JSON Schema**: `KANBUN_SCHEMA` for validation
- **Sample Data**: `SAMPLE_DOCUMENT` for testing

---

## Core Components

### 1. KanbunEditor.jsx

**Location**: `src/components/KanbunEditor.jsx`
**Purpose**: Main application component and state manager

**Key Responsibilities**:
- Document state management (via `useLocalStorage`)
- Auto-save functionality (2-second debounce)
- Event handling (keyboard shortcuts, text changes, cursor tracking)
- Coordination between editor, palette, and preview
- Export orchestration (PDF, Word)

**State Variables**:
```javascript
const [document, setDocument] = useLocalStorage('kanbun_current_doc', ...)
const [cursorPosition, setCursorPosition] = useState(0)
const [selection, setSelection] = useState({ start: 0, end: 0 })
const [showRubyDialog, setShowRubyDialog] = useState(false)
const [storageInfo, setStorageInfo] = useState(null)
```

**Key Methods**:
- `handleTextChange()`: Text input handler
- `handleAddKaeriten()`: Kaeriten insertion
- `handleAddRuby()`: Ruby annotation
- `handleApplyTcy()`: TCY annotation
- `handleSave()`, `handleLoad()`, `handleNew()`: Document operations
- `handleExportWord()`, `handleExportPdf()`: Export handlers

**Keyboard Shortcuts**:
- `Ctrl+S`: Save document
- `Alt+0`: Open ruby dialog (when text selected)
- `Alt+1-9`: Insert kaeriten marks

### 2. VerticalText.jsx

**Location**: `src/components/VerticalText.jsx`
**Purpose**: Vertical text rendering with annotations

**Features**:
- CSS `writing-mode: vertical-rl` for vertical layout
- Kaeriten positioning (left-bottom relative to characters)
- Ruby annotation rendering
- TCY (text-combine-upright) support
- Interactive character clicking

**Rendering Logic**:
```javascript
// Annotation maps created for efficient lookup
kaeritenMap: Map<pos, value>
rubyMap: Map<pos, rubyInfo>
tcySet: Set<pos>

// Characters rendered with:
- Base character styling
- Ruby overlays (<ruby> elements)
- Kaeriten marks (absolutely positioned spans)
- TCY blocks (text-combine-upright CSS)
```

**Styling Details**:
- Font: Yu Mincho (游明朝)
- Font Size: 1.5rem
- Line Height: 2.5
- Letter Spacing: 0.1em
- Kaeriten: 60% size, red color (#dc2626), positioned left-bottom

### 3. KaeritenPalette.jsx

**Location**: `src/components/KaeritenPalette.jsx`
**Purpose**: UI for selecting and inserting kaeriten marks

**Features**:
- Categorized mark groups (基本, 一二三点, 上中下点, etc.)
- Current position display
- Click-to-insert interaction
- Keyboard shortcut hints

**Mark Categories**:
```javascript
{
  基本: ['レ'],
  一二三点: ['一', '二', '三', '四'],
  上中下点: ['上', '中', '下'],
  甲乙丙丁点: ['甲', '乙', '丙', '丁'],
  天地人点: ['天', '地', '人']
}
```

### 4. Toolbar.jsx

**Location**: `src/components/Toolbar.jsx`
**Purpose**: Top toolbar with file and export operations

**Actions**:
- **New** (新規): Create new document
- **Open** (開く): Load JSON document
- **Save** (保存): Download JSON
- **Export Word**: Generate .docx file
- **Export PDF**: Generate PDF from preview

### 5. StatusBar.jsx

**Location**: `src/components/StatusBar.jsx`
**Purpose**: Bottom status bar with document info

**Displays**:
- Document title
- Character count
- Annotation count (kaeriten, ruby, TCY)
- Last modified timestamp
- LocalStorage usage info

### 6. RubyDialog.jsx

**Location**: `src/components/RubyDialog.jsx`
**Purpose**: Modal dialog for adding ruby annotations

**Features**:
- Shows selected text
- Ruby input field
- Preview of annotation
- Enter key submission

### 7. TcyButton.jsx

**Location**: `src/components/TcyButton.jsx`
**Purpose**: Auto-detect and apply TCY annotations

**Detection Logic**:
- Consecutive ASCII digits (e.g., "12", "100")
- Consecutive ASCII letters (e.g., "ABC", "UNIX")
- Auto-wraps detected sequences with TCY annotations

---

## Services & Utilities

### PDF Export Service

**Location**: `src/services/pdfExport.js`
**Technology**: html2canvas + jsPDF

**Process**:
1. Capture `VerticalText` DOM element as high-res canvas (scale: 3)
2. Convert canvas to PNG data URL
3. Create jsPDF document with specified paper size
4. Center and fit image to page (with margins)
5. Add metadata (title, author, keywords)
6. Trigger download

**Functions**:
- `exportToPdf(kanbunDoc, previewElement)`: Single-page export
- `exportToPdfMultiPage(kanbunDoc, previewElement)`: Multi-page support for long texts
- `generatePdfPreview(kanbunDoc, previewElement)`: Generate preview image

**Paper Sizes**:
```javascript
B5: { width: 182mm, height: 257mm }
A4: { width: 210mm, height: 297mm }
B4: { width: 257mm, height: 364mm }
```

### Word Export Service

**Location**: `src/services/wordExport.js`
**Technology**: docx library (dolanmiu/docx)

**Process**:
1. Create Word document with vertical text direction (`textDirection: 'tbRl'`)
2. Set paper size and margins
3. Convert kaeriten to token format `{KAI:レ}` for macro processing
4. Add title paragraph and text blocks
5. Apply font and spacing styles
6. Generate and download .docx file

**Token Format**:
```
故{KAI:レ}人之{KAI:二}所{KAI:一}為、皆當以禮。
```

**VBA Macro**:
- Located in `docs/KanbunTemplate.bas`
- Converts `{KAI:X}` tokens to properly formatted kaeriten
- Applies font sizing and positioning

**Functions**:
- `exportToWord(kanbunDoc)`: Full Word export
- `exportToWordTokenFormat(kanbunDoc)`: Token string generation
- `exportForMacro(kanbunDoc)`: Plain text for macro processing

### LocalStorage Hook

**Location**: `src/hooks/useLocalStorage.js`

**Features**:
- Persistent state management
- JSON serialization/deserialization
- Auto-save with debounce (customizable delay)
- Storage info retrieval (usage, quota)

**Usage**:
```javascript
const [value, setValue] = useLocalStorage('key', defaultValue);
useAutoSave('autosave_key', value, 2000); // 2-second debounce
const info = getStorageInfo(); // { used, quota, percentUsed }
```

### Text Utilities

**Location**: `src/utils/textUtils.js`

Common text processing functions for annotation manipulation.

### TCY Utilities

**Location**: `src/utils/tcyUtils.js`

Functions for detecting and handling Tate-chu-yoko sequences:
- ASCII digit detection
- Latin character detection
- Range conflict resolution

---

## Development Workflows

### Setup and Installation

```bash
# Clone repository
git clone <repo-url>
cd kanbun

# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:5173

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

### Git Workflow

**Branch Naming**:
- Feature branches: `claude/feature-description-sessionid`
- Current branch: `claude/claude-md-mi2d76qhzd99calm-01Ui4mtH4QZHL3RhVnNrTrGA`

**Commit Format**:
```
<type>: <subject>

<body with detailed changes>

<footer with DOD checklist>
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

**Push Protocol**:
```bash
# Always use -u flag for new branches
git push -u origin <branch-name>

# Retry on network failure (exponential backoff: 2s, 4s, 8s, 16s)
```

### Development Rules (from `.claude/Claude.md`)

**Key Principles**:
1. **Parallel Execution**: Use single message with multiple tool calls for independent tasks
2. **Task Tool Usage**: Use `subagent_type=Explore` for codebase exploration
3. **Definition of Done**: Lint + Build + Code Review + Documentation + Git Push

**DOD Checklist**:
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run build` succeeds
- [ ] Code review completed (automated via Task tool)
- [ ] README.md updated
- [ ] Git commit with proper format
- [ ] Git push with retry logic

---

## Coding Conventions

### React Component Structure

```javascript
/**
 * Component description
 * Additional details about purpose and usage
 */
function ComponentName({ prop1, prop2 }) {
  // 1. Hooks (useState, useEffect, useCallback, etc.)
  const [state, setState] = useState(initialValue);

  // 2. Event handlers
  const handleEvent = useCallback(() => {
    // Handler logic
  }, [dependencies]);

  // 3. Derived values
  const derivedValue = useMemo(() => {
    // Computation
  }, [dependencies]);

  // 4. Effects
  useEffect(() => {
    // Effect logic
    return () => cleanup();
  }, [dependencies]);

  // 5. JSX return
  return (
    <div>
      {/* Component markup */}
    </div>
  );
}

export default ComponentName;
```

### JSDoc Comments

**All exported functions must have JSDoc**:

```javascript
/**
 * Function description
 * @param {Type} paramName - Parameter description
 * @returns {ReturnType} Return value description
 */
export function functionName(paramName) {
  // Implementation
}
```

### ESLint Rules

**Key Rules** (from `eslint.config.js`):
- No unused variables (except `_` prefix for intentional unused)
- React Hooks rules enforced
- ES2020+ syntax
- Browser globals enabled

### TailwindCSS Usage

**Utility-First Approach**:
```jsx
<div className="flex flex-col h-screen bg-gray-50">
  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
    Click Me
  </button>
</div>
```

**Custom Font** (configured in `tailwind.config.js`):
```javascript
fontFamily: {
  'mincho': ['"Yu Mincho"', '游明朝', '"Hiragino Mincho ProN"', 'serif']
}
```

### Vertical Writing CSS

**Standard Pattern**:
```css
.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: 'Yu Mincho', '游明朝', serif;
  line-height: 2.5;
  letter-spacing: 0.1em;
}
```

**TCY (Tate-chu-yoko)**:
```css
.tcy-text {
  text-combine-upright: all;
  -webkit-text-combine-upright: all;
}
```

---

## Common Tasks

### Adding a New Kaeriten Mark

1. **Update Schema** (`src/models/kanbunSchema.js`):
```javascript
export const KAERITEN_TYPES = {
  // ... existing marks
  NEW_MARK: '新',
};
```

2. **Update Palette** (`src/components/KaeritenPalette.jsx`):
```javascript
const markGroups = {
  // ... existing groups
  新グループ: ['新', ...]
};
```

3. **Optional: Add Keyboard Shortcut** (`src/components/KanbunEditor.jsx`):
```javascript
const shortcuts = {
  // ... existing shortcuts
  'X': '新'  // Alt+X
};
```

### Adding a New Annotation Type

1. **Define Type** in `src/models/kanbunSchema.js`:
```javascript
export function createNewAnnotation(params) {
  return {
    range: [start, end],  // or pos for single character
    type: 'newtype',
    // ... custom fields
  };
}
```

2. **Update Schema Enum**:
```javascript
type: {
  type: 'string',
  enum: ['kaeriten', 'ruby', 'tcy', 'emphasis', 'newtype']
}
```

3. **Handle in VerticalText** (`src/components/VerticalText.jsx`):
```javascript
// Create annotation map
const newtypeMap = new Map();
annotations
  .filter(ann => ann.type === 'newtype')
  .forEach(ann => {
    // Process annotation
  });

// Render in character loop
if (newtypeMap.has(idx)) {
  // Custom rendering
}
```

4. **Add UI Controls** (palette, dialog, button, etc.)

### Adding an Export Format

1. **Create Service** (`src/services/newExport.js`):
```javascript
/**
 * Export to new format
 * @param {Object} kanbunDoc - KanbunDocument
 * @returns {Promise<{success: boolean, filename?: string, error?: string}>}
 */
export async function exportToNewFormat(kanbunDoc) {
  try {
    // Export logic
    return { success: true, filename };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

2. **Add to Toolbar** (`src/components/Toolbar.jsx`):
```javascript
<button onClick={onExportNew} className="...">
  新フォーマット出力
</button>
```

3. **Wire to Editor** (`src/components/KanbunEditor.jsx`):
```javascript
const handleExportNew = async () => {
  const result = await exportToNewFormat(document);
  if (result.success) {
    alert(`✅ 出力成功！\nファイル名: ${result.filename}`);
  } else {
    alert(`❌ 出力失敗\nエラー: ${result.error}`);
  }
};

// Pass to Toolbar
<Toolbar ... onExportNew={handleExportNew} />
```

### Modifying Vertical Text Rendering

**Key Files**:
- `src/components/VerticalText.jsx` - Main rendering logic
- `src/App.css` - Global styles (if needed)

**Kaeriten Positioning**:
```javascript
// In VerticalText.jsx, adjust these values:
style={{
  position: 'absolute',
  left: `${baseLeft + stackOffset}em`,  // Horizontal offset
  bottom: '-0.30em',                     // Vertical offset
  fontSize: '0.6em',                     // Size relative to character
  color: '#dc2626'                       // Color
}}
```

**Ruby Styling**:
```css
.vertical-text rt {
  font-size: 0.5em;      /* 50% of base text */
  color: #6b7280;        /* Gray color */
}
```

---

## Testing & Quality

### Linting

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

**Common Issues**:
- Unused variables (use `_` prefix if intentional)
- Missing React dependencies in hooks
- Incorrect hook usage

### Building

```bash
# Production build
npm run build
# Output: dist/

# Preview build
npm run preview
# Serves from dist/ folder
```

**Build Checks**:
- Vite optimization and minification
- Asset bundling and hashing
- TailwindCSS purging of unused styles
- No TypeScript errors (if `.ts`/`.tsx` files added)

### Manual Testing Checklist

**Editor Functionality**:
- [ ] Text input and editing
- [ ] Cursor position tracking
- [ ] Text selection
- [ ] Undo/Redo (browser default)

**Annotations**:
- [ ] Kaeriten insertion (click and keyboard)
- [ ] Multiple kaeriten on same character
- [ ] Ruby annotation dialog
- [ ] TCY auto-detection
- [ ] Annotation removal (manual editing of JSON)

**Preview**:
- [ ] Vertical text rendering
- [ ] Kaeriten positioning
- [ ] Ruby display
- [ ] TCY horizontal text
- [ ] Character click interaction

**Persistence**:
- [ ] Auto-save (verify in localStorage)
- [ ] Manual save (JSON download)
- [ ] Load document (JSON upload)
- [ ] New document (confirmation dialog)

**Export**:
- [ ] PDF generation (check quality, margins)
- [ ] Word export (check token format)
- [ ] Filename generation (title + date)

**UI/UX**:
- [ ] Toolbar buttons functional
- [ ] Status bar updates
- [ ] Responsive layout (not primary focus, but check)
- [ ] Scrollbar styling (vertical text area)

---

## Export Systems

### PDF Export Deep Dive

**Technology Stack**:
- `html2canvas`: Converts DOM to canvas
- `jsPDF`: Generates PDF from image data

**Process Flow**:
```
VerticalText DOM
    ↓ (html2canvas, scale: 3)
High-res Canvas
    ↓ (toDataURL('image/png'))
PNG Data URL
    ↓ (jsPDF.addImage)
PDF Document
    ↓ (pdf.save)
Downloaded .pdf File
```

**Scaling Strategy**:
- `scale: 3` for 3x resolution (balances quality and performance)
- Auto-fit to paper size with margins
- Center alignment for aesthetic presentation

**Limitations**:
- Single-page by default (use `exportToPdfMultiPage` for long texts)
- Image-based (not selectable text in PDF)
- Requires previewElement to be rendered in DOM

**Future Improvements**:
- Text-based PDF generation (preserve selectability)
- Multi-column layout for long documents
- Custom page breaks

### Word Export Deep Dive

**Technology Stack**:
- `docx`: Creates .docx files programmatically
- `file-saver`: Triggers browser download

**Process Flow**:
```
KanbunDocument JSON
    ↓ (convert annotations)
Token Format Text
    ↓ (create docx.Document)
Word Document Object
    ↓ (Packer.toBlob)
Binary .docx Blob
    ↓ (saveAs)
Downloaded .docx File
```

**Token Format**:
```
Original: 故人之所為
Kaeriten: pos=2 (レ), pos=7 (二), pos=8 (一)
Token:    故{KAI:レ}人之{KAI:二}所{KAI:一}為
```

**VBA Macro Processing**:
1. Open Word document with token text
2. Run macro from `docs/KanbunTemplate.bas`
3. Macro finds `{KAI:X}` patterns
4. Replaces with formatted kaeriten (superscript, color, size)
5. Adjusts character spacing

**Vertical Text in Word**:
```javascript
textDirection: 'tbRl'  // Top-to-Bottom, Right-to-Left
```

**Limitations**:
- Ruby not directly supported (requires complex nested fields)
- TCY not auto-applied (Word's vertical text handling differs)
- Macro step required for final formatting

**Future Improvements**:
- Direct ruby insertion via Word fields
- Auto-run macro (requires Word API or server-side processing)
- OOXML template-based approach

---

## Troubleshooting

### Common Issues

#### PDF Export Shows Blank Page

**Cause**: `previewRef.current` is null
**Solution**: Ensure `VerticalText` component is mounted and ref is attached

```javascript
// In KanbunEditor.jsx
<VerticalText ref={previewRef} ... />

// Check before export
if (!previewRef.current) {
  alert('プレビュー要素が見つかりません');
  return;
}
```

#### Kaeriten Not Displaying

**Cause**: Incorrect position value or missing annotation
**Debug Steps**:
1. Check browser DevTools → React Components → `document.blocks[0].annotations`
2. Verify `pos` value matches character index (0-based)
3. Inspect CSS positioning in VerticalText styles

#### LocalStorage Not Saving

**Cause**: Browser storage disabled or quota exceeded
**Solution**:
```javascript
// Check storage info
const info = getStorageInfo();
console.log('Storage:', info);

// Clear if needed
localStorage.removeItem('kanbun_current_doc');
localStorage.removeItem('kanbun_autosave');
```

#### Build Fails with TailwindCSS Error

**Cause**: Missing PostCSS configuration
**Solution**: Verify `postcss.config.js` exists:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### Vertical Text Not Rendering Vertically

**Cause**: Browser doesn't support `writing-mode`
**Solution**: Use modern browser (Chrome 48+, Firefox 41+, Safari 10.1+)

---

## Advanced Topics

### State Management Philosophy

**Current Approach**: Single document state with localStorage persistence

**Why Not Redux/Zustand?**:
- Simple single-editor use case
- No complex async workflows
- LocalStorage hook provides sufficient state management
- React's built-in state + useCallback/useMemo handle re-renders efficiently

**When to Upgrade**:
- Multiple simultaneous documents
- Collaborative editing
- Complex undo/redo with branching
- Server synchronization

### Performance Considerations

**Rendering Optimization**:
- `useCallback` for event handlers (prevents re-render cascades)
- `useMemo` for expensive computations (annotation maps)
- `forwardRef` on VerticalText (avoids re-rendering during parent updates)

**Current Bottlenecks**:
- PDF export: html2canvas can be slow for long texts
- Word export: Token string concatenation for large documents

**Optimization Strategies**:
- Virtual scrolling for very long texts (e.g., react-window)
- Web Workers for export processing
- Incremental rendering for annotations

### Accessibility (A11y)

**Current State**: Basic accessibility
**Improvements Needed**:
- [ ] ARIA labels for buttons (`aria-label="返り点を追加"`)
- [ ] Keyboard navigation for palette
- [ ] Screen reader support for vertical text
- [ ] Focus management for dialogs
- [ ] High contrast mode support

### Internationalization (i18n)

**Current State**: Japanese UI only
**Future i18n Plan**:
- Extract UI strings to `i18n/ja.json`, `i18n/en.json`
- Use library like `react-i18next`
- Support English UI for international educators
- Note: Content (Kanbun text) remains Japanese/Chinese

---

## Project Roadmap

### Phase 5 (Planned)

**Google Docs Export**:
- HTML output with vertical text CSS
- Clipboard API integration
- Direct paste into Google Docs

**Word Macro Template (.dotm)**:
- Pre-packaged template with embedded macro
- One-click formatting (no manual macro run)

**Advanced Typography**:
- 禁則処理 (Kinsoku shori): Line breaking rules for Japanese
- 約物回転 (Yakumono kaiten): Rotate punctuation in vertical text
- Multiple column layout

**AI Assistance**:
- Auto-suggest kaeriten based on grammar analysis
- Ruby auto-completion from dictionary
- Error detection (e.g., missing return points)

**Settings Panel**:
- Font selection (游明朝, MS明朝, etc.)
- Font size adjustment
- Color themes
- Export defaults (paper size, margins)

### Version 2.0+ (Future)

**Semi-Automatic Kaeriten**:
- Syntax parsing + dictionary lookup
- Suggest kaeriten positions
- User confirmation workflow

**Classroom Sharing**:
- Server sync for school/class
- Teacher review workflow
- Student submission

**Browser Extension**:
- Chrome/Firefox extension version
- Annotate text on any webpage
- Export selection

**AI Learning Assistant**:
- Interactive kaeriten learning
- Quiz generation
- Progress tracking

---

## Contributing Guidelines

### For AI Assistants

**When Making Changes**:

1. **Understand First**: Use Task tool with `subagent_type=Explore` to investigate codebase
2. **Plan**: Create TodoWrite list for multi-step tasks
3. **Execute in Parallel**: Use single message for independent changes
4. **Test Thoroughly**: Run `npm run lint && npm run build`
5. **Document**: Update README.md if user-facing features change
6. **Commit Properly**: Follow commit format conventions
7. **Push with Retry**: Use exponential backoff on network errors

**Code Review Checklist**:
- [ ] No security vulnerabilities (XSS, injection, etc.)
- [ ] No performance regressions (unnecessary re-renders)
- [ ] Accessibility maintained or improved
- [ ] JSDoc comments for exported functions
- [ ] No console.log in production code (use console.error for errors)
- [ ] Consistent code style with existing files

### For Human Developers

**Pull Request Template**:
```markdown
## Changes
- Brief description of changes

## Type
- [ ] feat (new feature)
- [ ] fix (bug fix)
- [ ] refactor (code restructure)
- [ ] docs (documentation)
- [ ] style (formatting)
- [ ] test (add tests)

## Testing
- [ ] Lint passed
- [ ] Build succeeded
- [ ] Manual testing completed

## Screenshots
(if UI changes)
```

---

## Resources

### Documentation

- **React 19 Docs**: https://react.dev/
- **Vite Guide**: https://vite.dev/guide/
- **TailwindCSS**: https://tailwindcss.com/docs
- **docx Library**: https://docx.js.org/
- **jsPDF**: https://github.com/parallax/jsPDF

### CSS Writing Mode

- **MDN**: https://developer.mozilla.org/en-US/docs/Web/CSS/writing-mode
- **W3C Spec**: https://www.w3.org/TR/css-writing-modes-3/

### Japanese Typography

- **Kanbun (漢文)**: https://en.wikipedia.org/wiki/Kanbun
- **Kaeriten (返り点)**: Historical reading marks for Chinese texts
- **Vertical Text in Web**: https://www.w3.org/International/articles/vertical-text/

---

## Contact & Support

**Project Maintainer**: 森川大地 (Morikawa Daichi)

**For Issues**:
- Check existing issues in repository
- Provide reproduction steps
- Include browser version and OS

**For Questions**:
- Check this CLAUDE.md first
- Review `.claude/Claude.md` for development rules
- Consult README.md for user-facing documentation

---

**Last Updated**: 2025-11-16
**Document Version**: 1.0
**Project Version**: Phase 4 Complete

---

_This document is intended for AI assistants (like Claude Code) to understand the KBR Editor codebase and contribute effectively. For user-facing documentation, see README.md._
