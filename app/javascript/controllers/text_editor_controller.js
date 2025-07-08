import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container", "currentPage", "totalPages"]
  
  connect() {
    this.extractedTexts = {}
    this.currentPage = 1
    this.totalPages = 0
    
    // Listen for OCR completion
    window.addEventListener('ocr:completed', this.handleOcrCompleted.bind(this))
    
    // Listen for page change events from PDF viewer
    window.addEventListener('pdfViewer:pageChanged', this.handlePdfViewerPageChange.bind(this))
    
    // Load from localStorage if available
    this.loadFromLocalStorage()
  }
  
  disconnect() {
    window.removeEventListener('ocr:completed', this.handleOcrCompleted.bind(this))
    window.removeEventListener('pdfViewer:pageChanged', this.handlePdfViewerPageChange.bind(this))
  }
  
  async handleOcrCompleted(event) {
    const jobId = event.detail.jobId
    console.log("Text Editor - OCR completed for job:", jobId)
    
    try {
      const response = await fetch(`/api/ocr_jobs/${jobId}/texts`)
      const data = await response.json()
      
      if (data.success) {
        this.extractedTexts = data.texts
        this.currentPage = 1
        this.renderTexts()
        this.saveToLocalStorage()
      } else {
        console.error("Failed to load OCR texts:", data.message)
      }
    } catch (error) {
      console.error("Error loading OCR texts:", error)
    }
  }
  
  renderTexts() {
    this.totalPages = Object.keys(this.extractedTexts).length
    
    if (this.totalPages === 0) {
      this.containerTarget.innerHTML = '<div class="text-center text-gray-500 py-8"><p>PDF 파일을 업로드하고 텍스트 추출을 시작하세요</p></div>'
      return
    }
    
    // Update page counts
    if (this.hasCurrentPageTarget) {
      this.currentPageTarget.textContent = this.currentPage
    }
    if (this.hasTotalPagesTarget) {
      this.totalPagesTarget.textContent = this.totalPages
    }
    
    // Clear container
    this.containerTarget.innerHTML = ''
    
    // Only render current page
    const currentPageText = this.extractedTexts[this.currentPage]
    if (currentPageText !== undefined) {
      const textarea = document.createElement('textarea')
      textarea.className = 'w-full h-full p-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto'
      textarea.value = currentPageText
      textarea.dataset.pageNumber = this.currentPage
      textarea.addEventListener('input', (e) => this.handleTextChange(e))
      
      this.containerTarget.appendChild(textarea)
    }
  }
  
  handleTextChange(event) {
    const pageNumber = event.target.dataset.pageNumber
    this.extractedTexts[pageNumber] = event.target.value
    this.saveToLocalStorage()
  }
  
  copyAll() {
    const allText = Object.values(this.extractedTexts).join('\n\n')
    
    navigator.clipboard.writeText(allText).then(() => {
      // Show success message
      const message = document.createElement('div')
      message.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        opacity: 0;
        transition: opacity 0.3s ease;
      `
      message.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>텍스트가 클립보드에 복사되었습니다</span>
      `
      document.body.appendChild(message)
      
      // Force browser to apply initial styles
      message.offsetHeight
      
      // Fade in
      message.style.opacity = '1'
      
      setTimeout(() => {
        message.style.opacity = '0'
        setTimeout(() => {
          message.remove()
        }, 300)
      }, 2500)
    }).catch(err => {
      console.error('Failed to copy text: ', err)
      // Show error message
      const message = document.createElement('div')
      message.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #ef4444;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        font-weight: 500;
      `
      message.textContent = '복사에 실패했습니다'
      document.body.appendChild(message)
      
      setTimeout(() => {
        message.remove()
      }, 2000)
    })
  }
  
  download() {
    const totalPages = Object.keys(this.extractedTexts).length
    const allText = Object.entries(this.extractedTexts)
      .map(([page, text]) => `=== ${page}/${totalPages} page ===\n\n${text}`)
      .join('\n\n\n')
    
    const blob = new Blob([allText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'extracted_text.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  saveToLocalStorage() {
    localStorage.setItem('extractedTexts', JSON.stringify(this.extractedTexts))
  }
  
  loadFromLocalStorage() {
    const saved = localStorage.getItem('extractedTexts')
    if (saved) {
      try {
        this.extractedTexts = JSON.parse(saved)
        if (Object.keys(this.extractedTexts).length > 0) {
          this.renderTexts()
        }
      } catch (e) {
        console.error('Failed to load from localStorage:', e)
      }
    }
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--
      this.renderTexts()
      this.dispatchPageChange()
    }
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++
      this.renderTexts()
      this.dispatchPageChange()
    }
  }
  
  dispatchPageChange() {
    window.dispatchEvent(new CustomEvent('textEditor:pageChanged', {
      detail: { page: this.currentPage }
    }))
  }
  
  handlePdfViewerPageChange(event) {
    const newPage = event.detail.page
    if (newPage !== this.currentPage && newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage
      this.renderTexts()
    }
  }
}