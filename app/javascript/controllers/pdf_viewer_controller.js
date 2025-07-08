import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["canvas", "currentPage", "totalPages"]
  
  connect() {
    this.currentPage = 1
    this.scale = 1.0
    this.pdfDoc = null
    
    // Listen for page change events from text editor
    window.addEventListener('textEditor:pageChanged', this.handleTextEditorPageChange.bind(this))
    
    // Load PDF.js
    this.loadPdfJs()
  }
  
  async loadPdfJs() {
    if (!window.pdfjsLib) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        this.checkForPdf()
      }
      document.head.appendChild(script)
    } else {
      this.checkForPdf()
    }
  }
  
  async checkForPdf() {
    // Check if there's a current job with a PDF
    // Look for the job ID in various places
    let jobId = null
    
    // First check the OCR process section
    const ocrProcessSection = document.querySelector('[data-controller="ocr-process"]')
    if (ocrProcessSection) {
      jobId = ocrProcessSection.dataset.ocrProcessJobIdValue
    }
    
    // If not found, check parent elements
    if (!jobId) {
      const ocrProcessElement = this.element.closest('[data-ocr-process-job-id-value]')
      jobId = ocrProcessElement ? ocrProcessElement.dataset.ocrProcessJobIdValue : null
    }
    
    console.log("PDF Viewer - Job ID:", jobId)
    
    if (jobId && jobId !== "null" && jobId !== "") {
      const pdfUrl = `/api/ocr_jobs/${jobId}/pdf`
      console.log("Loading PDF from:", pdfUrl)
      this.loadPdf(pdfUrl)
    } else {
      console.log("No job ID found, showing placeholder")
      this.showPlaceholder()
    }
  }
  
  async loadPdf(url) {
    try {
      const loadingTask = window.pdfjsLib.getDocument(url)
      this.pdfDoc = await loadingTask.promise
      
      this.totalPagesTarget.textContent = this.pdfDoc.numPages
      this.renderPage(this.currentPage)
    } catch (error) {
      console.error("Error loading PDF:", error)
    }
  }
  
  async renderPage(pageNumber) {
    if (!this.pdfDoc) return
    
    console.log(`Rendering page ${pageNumber} with scale ${this.scale}`)
    
    try {
      const page = await this.pdfDoc.getPage(pageNumber)
      const viewport = page.getViewport({ scale: this.scale })
      
      const canvas = this.canvasTarget
      const context = canvas.getContext('2d')
      
      // Get the device pixel ratio for high DPI displays
      const dpr = window.devicePixelRatio || 1
      
      // Set canvas dimensions
      canvas.width = viewport.width * dpr
      canvas.height = viewport.height * dpr
      
      // Set CSS dimensions
      canvas.style.width = viewport.width + 'px'
      canvas.style.height = viewport.height + 'px'
      
      // Scale the context to ensure correct drawing on high DPI displays
      context.scale(dpr, dpr)
      
      // Clear canvas before rendering
      context.clearRect(0, 0, canvas.width, canvas.height)
      
      console.log(`Canvas size: ${canvas.width}x${canvas.height}, CSS size: ${canvas.style.width}x${canvas.style.height}`)
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      await page.render(renderContext).promise
      this.currentPageTarget.textContent = pageNumber
      
      console.log("Page rendered successfully")
    } catch (error) {
      console.error("Error rendering page:", error)
    }
  }
  
  previousPage() {
    if (this.currentPage <= 1) return
    this.currentPage--
    this.renderPage(this.currentPage)
    this.dispatchPageChange()
  }
  
  nextPage() {
    if (!this.pdfDoc || this.currentPage >= this.pdfDoc.numPages) return
    this.currentPage++
    this.renderPage(this.currentPage)
    this.dispatchPageChange()
  }
  
  zoomIn() {
    console.log("Zoom in clicked, current scale:", this.scale)
    if (!this.pdfDoc) {
      console.log("No PDF loaded")
      return
    }
    this.scale *= 1.2
    console.log("New scale:", this.scale)
    this.renderPage(this.currentPage)
  }
  
  zoomOut() {
    console.log("Zoom out clicked, current scale:", this.scale)
    if (!this.pdfDoc) {
      console.log("No PDF loaded")
      return
    }
    this.scale /= 1.2
    console.log("New scale:", this.scale)
    this.renderPage(this.currentPage)
  }
  
  fullscreen() {
    // Get the PDF viewer container by ID
    const container = document.getElementById('pdf-viewer-container')
    
    if (container.requestFullscreen) {
      container.requestFullscreen()
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen()
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen()
    }
    
    // Store original scale
    this.originalScale = this.scale
    
    // Listen for fullscreen changes
    const fullscreenHandler = () => {
      if (document.fullscreenElement === container) {
        // Entering fullscreen - fit to screen
        this.fitToScreen()
      } else {
        // Exiting fullscreen - restore original scale
        this.scale = this.originalScale
        this.renderPage(this.currentPage)
        document.removeEventListener('fullscreenchange', fullscreenHandler)
        document.removeEventListener('webkitfullscreenchange', fullscreenHandler)
      }
    }
    
    document.addEventListener('fullscreenchange', fullscreenHandler)
    document.addEventListener('webkitfullscreenchange', fullscreenHandler)
  }
  
  async fitToScreen() {
    if (!this.pdfDoc) return
    
    const page = await this.pdfDoc.getPage(this.currentPage)
    const viewport = page.getViewport({ scale: 1.0 })
    
    // Get container dimensions
    const container = this.canvasTarget.parentElement
    const containerWidth = container.clientWidth - 80 // Subtract padding
    const containerHeight = container.clientHeight - 80
    
    // Calculate scale to fit
    const scaleX = containerWidth / viewport.width
    const scaleY = containerHeight / viewport.height
    this.scale = Math.min(scaleX, scaleY) * 0.95 // 95% to leave some margin
    
    console.log("Fitting to screen with scale:", this.scale)
    
    // Add a small delay to ensure proper centering
    setTimeout(() => {
      this.renderPage(this.currentPage)
    }, 100)
  }
  
  showPlaceholder() {
    const context = this.canvasTarget.getContext('2d')
    context.fillStyle = '#f3f4f6'
    context.fillRect(0, 0, this.canvasTarget.width, this.canvasTarget.height)
    context.fillStyle = '#6b7280'
    context.font = '20px sans-serif'
    context.textAlign = 'center'
    context.fillText('PDF가 로드되면 여기에 표시됩니다', this.canvasTarget.width / 2, this.canvasTarget.height / 2)
  }
  
  disconnect() {
    window.removeEventListener('textEditor:pageChanged', this.handleTextEditorPageChange.bind(this))
  }
  
  dispatchPageChange() {
    window.dispatchEvent(new CustomEvent('pdfViewer:pageChanged', {
      detail: { page: this.currentPage }
    }))
  }
  
  handleTextEditorPageChange(event) {
    const newPage = event.detail.page
    if (this.pdfDoc && newPage !== this.currentPage && newPage >= 1 && newPage <= this.pdfDoc.numPages) {
      this.currentPage = newPage
      this.renderPage(this.currentPage)
    }
  }
}