# 전자소송 PDF OCR 서비스 - Product Requirements Document

## 🎯 Project Overview
**Product Name**: 전자소송 PDF OCR 변환기  
**Description**: 한국 전자소송 시스템의 PDF 파일을 Google Vision API를 사용하여 편집 가능한 텍스트로 변환하는 원페이지 웹 애플리케이션  
**Target Users**: 법률 전문가, 변호사, 법무팀  
**Main Problem**: 전자소송 PDF 파일의 텍스트를 복사하거나 편집할 수 없어 업무 효율성이 떨어지는 문제 해결

## 🛠 Technical Stack
- **Framework**: Ruby on Rails 8
- **Database**: SQLite3
- **Styling**: Tailwind CSS with shadcn UI components
- **Authentication**: Rails 8 Authentication (admin-only)
- **File Processing**: Active Storage + Google Vision API
- **Frontend**: Stimulus.js + pdf.js
- **Icons**: Tabler icons via rails_icons
- **Deployment**: Kamal (Rails 8 default)

## 🎨 Design Guidelines
- **Primary Color**: Navy Blue (#1e40af)
- **Style**: Professional, clean, trustworthy
- **Layout**: Single-page application with side-by-side PDF/text view
- **Mobile**: Responsive but optimized for desktop use
- **Language**: Korean interface

## 🚀 Phase 1: MVP Features

### 1. Google Vision API Configuration Section
- **Settings Button**: 톱니바퀴 아이콘으로 설정 모달 열기
- **Credential File Path Input**: JSON 파일 절대 경로 입력
- **Validation Button**: "연결 테스트" 버튼
- **Status Indicator**: API 연결 상태 표시 (녹색/빨간색)
- **Save Configuration**: 설정 저장 (암호화하여 저장)

### 2. File Upload Section
- **Drag & Drop Zone**: Large, prominent upload area
- **File Input Button**: Alternative upload method
- **File Validation**: Only accept PDF files, max 50MB
- **Progress Indicator**: Show upload progress
- **Error Messages**: Clear Korean error messages

### 3. PDF Preview Panel (Left Side)
- **PDF Viewer**: Using pdf.js for in-browser rendering
- **Page Navigation**: Previous/Next buttons
- **Page Counter**: "3 / 10 페이지" format
- **Zoom Controls**: Zoom in/out buttons
- **Full Screen**: Option to view PDF in full screen

### 4. OCR Text Panel (Right Side)
- **Text Editor**: Large textarea for each page
- **Page Separation**: Clear visual separation between pages
- **Page Headers**: "페이지 1", "페이지 2" etc.
- **Edit Capability**: Direct text editing
- **Copy Button**: Copy all text to clipboard
- **Save Progress**: Auto-save to localStorage

### 5. OCR Processing
- **Process Button**: "텍스트 추출 시작" button
- **Progress Bar**: Show processing progress per page
- **Status Messages**: "3/10 페이지 처리 중..."
- **Error Handling**: Retry failed pages
- **Cancel Option**: Stop processing mid-way

### 6. Download Options
- **Download Button**: "텍스트 다운로드"
- **Format Options**: TXT or DOCX format
- **Page Range**: Option to download specific pages
- **Filename**: Original filename + "_OCR.txt"

## 📊 Database Schema
```ruby
# For tracking usage and API configuration
class ApiConfiguration < ApplicationRecord
  # id: integer
  # credential_path: string (encrypted)
  # is_active: boolean
  # last_validated_at: datetime
  # created_at: datetime
  # updated_at: datetime
end

class OcrJob < ApplicationRecord
  # id: integer
  # session_id: string
  # filename: string
  # total_pages: integer
  # processed_pages: integer
  # status: string (pending, processing, completed, failed)
  # error_message: text
  # created_at: datetime
  # completed_at: datetime
end
```

## 🔧 Google Vision API Integration

### Configuration Management
```ruby
# app/models/api_configuration.rb
class ApiConfiguration < ApplicationRecord
  encrypts :credential_path
  
  def validate_credentials
    # Test API connection with provided credentials
    # Return true/false with error message
  end
end

# app/services/google_vision_service.rb
class GoogleVisionService
  def initialize
    @config = ApiConfiguration.find_by(is_active: true)
    raise "No active API configuration" unless @config
    
    ENV['GOOGLE_APPLICATION_CREDENTIALS'] = @config.credential_path
    @client = Google::Cloud::Vision.image_annotator
  end
  
  def process_image(image_path)
    response = @client.document_text_detection(
      image: image_path,
      language_hints: ['ko']  # Korean language hint
    )
    response.text_annotations.first&.description
  end
end
```

### OCR Processing Flow
1. Check if Google Vision API is configured
2. Upload PDF to Active Storage
3. Convert each PDF page to image (300 DPI)
4. Send image to Google Vision API with Korean language hint
5. Receive and format OCR text
6. Display text in editable format
7. Clean up temporary files

## 🎯 Frontend JavaScript (Stimulus Controllers)

### ConfigController
```javascript
// app/javascript/controllers/config_controller.js
// Handle API configuration modal
// Validate credential file path
// Test API connection
// Save configuration
```

### UploadController
```javascript
// app/javascript/controllers/upload_controller.js
// Handle drag & drop events
// Validate file type and size
// Show upload progress
// Initialize PDF preview
```

### PdfViewerController
```javascript
// app/javascript/controllers/pdf_viewer_controller.js
// Load PDF using pdf.js
// Handle page navigation
// Implement zoom functionality
// Sync with OCR progress
```

### OcrProcessController
```javascript
// app/javascript/controllers/ocr_process_controller.js
// Check API configuration before processing
// Send pages for OCR processing
// Update progress bar
// Handle errors and retries
// Display results in text panel
```

### TextEditorController
```javascript
// app/javascript/controllers/text_editor_controller.js
// Auto-save to localStorage
// Handle copy to clipboard
// Track text changes
// Export to file formats
```

## 💻 Development Commands
```bash
# Initial setup
rails new legal-pdf-ocr -d sqlite3
cd legal-pdf-ocr

# Add required gems to Gemfile
cat << 'EOF' >> Gemfile
gem "tailwindcss-rails"
gem "google-cloud-vision"
gem "rails_icons"
gem "image_processing"
gem "pdf-reader"
EOF

# Install gems
bundle install

# Setup
rails tailwindcss:install
rails active_storage:install
rails db:create
rails db:migrate

# Generate models and controllers
rails g model ApiConfiguration credential_path:string is_active:boolean last_validated_at:datetime
rails g model OcrJob session_id:string filename:string total_pages:integer processed_pages:integer status:string error_message:text completed_at:datetime
rails g controller Pages index
rails g controller Api::Configurations create validate
rails g controller Api::OcrJobs create status

# Generate Stimulus controllers
rails g stimulus config upload pdf-viewer ocr-process text-editor

# Run migrations
rails db:migrate

# Run development server
./bin/dev
```

## 🧪 Testing Requirements

### 1. Configuration Tests
- Valid credential file path
- Invalid credential file handling
- API connection validation
- Configuration persistence

### 2. File Upload Tests
- Valid PDF upload
- Invalid file type rejection
- Large file handling (>50MB)
- Multiple file prevention

### 3. OCR Tests
- Korean text recognition accuracy
- Multi-page processing
- Error recovery mechanisms
- API quota handling

### 4. UI Tests
- Responsive layout
- Progress indicators
- Download functionality
- Error message display

## 🚢 Deployment with Kamal

```yaml
# config/deploy.yml
service: legal-pdf-ocr
image: your-dockerhub-username/legal-pdf-ocr

servers:
  web:
    hosts:
      - your.server.ip
    options:
      network: "host"

env:
  clear:
    RAILS_ENV: production
    RAILS_SERVE_STATIC_FILES: true
  secret:
    - RAILS_MASTER_KEY

accessories:
  db:
    image: postgres:15
    roles:
      - web
    env:
      clear:
        POSTGRES_USER: legal_pdf_ocr
      secret:
        - POSTGRES_PASSWORD

# Ensure the server has access to Google credentials file
```

## 🇰🇷 Korean UI Text

```yaml
# config/locales/ko.yml
ko:
  config:
    title: "Google Vision API 설정"
    credential_path: "인증 파일 경로"
    placeholder: "/path/to/your-service-account-key.json"
    validate: "연결 테스트"
    save: "저장"
    success: "API 연결 성공!"
    error: "API 연결 실패: %{message}"
    
  upload:
    title: "PDF 파일 업로드"
    instruction: "전자소송 PDF 파일을 여기에 드래그하거나 클릭하여 선택하세요"
    button: "파일 선택"
    error:
      invalid_type: "PDF 파일만 업로드 가능합니다"
      too_large: "파일 크기는 50MB 이하여야 합니다"
      api_not_configured: "먼저 Google Vision API를 설정해주세요"
    
  ocr:
    start: "텍스트 추출 시작"
    processing: "처리 중... (%{current}/%{total} 페이지)"
    complete: "추출 완료!"
    error: "처리 중 오류 발생: %{message}"
    retry: "재시도"
    
  viewer:
    page: "페이지"
    zoom_in: "확대"
    zoom_out: "축소"
    fullscreen: "전체화면"
    
  editor:
    copy_all: "전체 복사"
    copied: "클립보드에 복사되었습니다"
    page_label: "페이지 %{number}"
    
  download:
    button: "텍스트 다운로드"
    format: "다운로드 형식"
    txt: "텍스트 파일 (.txt)"
    docx: "워드 문서 (.docx)"
    pages: "페이지 선택"
    all_pages: "전체 페이지"
    selected_pages: "선택한 페이지"
```

## 🔒 Security Considerations

### API Credential Security
- Encrypt credential file path in database
- Validate file existence and permissions
- Never expose credentials in logs or UI
- Implement access control for configuration

### General Security
- HTTPS only deployment
- CSRF protection enabled
- Rate limiting for API calls
- Session-based processing (no permanent storage)
- Input validation for all user inputs

## 📈 Success Metrics
- [ ] OCR accuracy > 95% for Korean text
- [ ] Processing speed < 3 seconds per page
- [ ] Zero data loss during processing
- [ ] Configuration setup < 2 minutes
- [ ] Intuitive UI requiring no training

## 🔍 Error Handling

### API Configuration Errors
- Missing credential file → Clear error message with setup guide
- Invalid credentials → Specific error from Google API
- API quota exceeded → Queue system with retry logic

### Processing Errors
- PDF corruption → Suggest PDF repair tools
- Unsupported PDF features → Process what's possible
- Network timeout → Automatic retry with exponential backoff

## 📝 Additional Notes

### Google Vision API Setup Guide
1. Google Cloud Console에서 프로젝트 생성
2. Vision API 활성화
3. 서비스 계정 생성 및 키 다운로드 (JSON)
4. 서버에 JSON 파일 업로드
5. 파일 경로를 애플리케이션에 입력

### Performance Optimization
- Cache processed pages in Redis (optional)
- Parallel processing for multi-page PDFs
- Lazy loading for large PDFs
- Client-side text editing to reduce server load

### Future Enhancements (Phase 2)
- Batch processing multiple PDFs
- OCR result confidence scoring
- Table detection and formatting
- Handwriting recognition mode
- Export to structured formats (JSON, XML)