import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["startButton", "progressContainer", "progressBar", "progressText"]
  static values = { jobId: Number }
  
  connect() {
    this.pollInterval = null
    
    if (this.hasJobIdValue && this.jobIdValue) {
      this.checkJobStatus()
    }
  }
  
  disconnect() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }
  }
  
  async startProcessing(event) {
    // Add ripple effect
    if (event && event.currentTarget) {
      const button = event.currentTarget
      const ripple = document.createElement('span')
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2
      
      ripple.style.width = ripple.style.height = size + 'px'
      ripple.style.left = x + 'px'
      ripple.style.top = y + 'px'
      ripple.classList.add('ripple')
      
      button.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }
    
    if (!this.hasJobIdValue || !this.jobIdValue) {
      alert("먼저 PDF 파일을 업로드해주세요")
      return
    }
    
    this.startButtonTarget.disabled = true
    this.showProgress(0, "OCR 처리 시작...")
    
    // Start polling for status
    this.pollInterval = setInterval(() => {
      this.checkJobStatus()
    }, 1000)
  }
  
  async checkJobStatus() {
    try {
      const response = await fetch(`/api/ocr_jobs/${this.jobIdValue}/status`)
      const data = await response.json()
      
      if (data.status === 'processing') {
        this.showProgress(data.progress, `처리 중... (${data.processed_pages}/${data.total_pages} 페이지)`)
      } else if (data.status === 'completed') {
        this.showProgress(100, "추출 완료!")
        this.stopPolling()
        this.loadExtractedText()
      } else if (data.status === 'failed') {
        this.showProgress(0, `처리 실패: ${data.error_message}`)
        this.stopPolling()
        this.startButtonTarget.disabled = false
      }
    } catch (error) {
      console.error("Status check failed:", error)
    }
  }
  
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }
  
  showProgress(percentage, text) {
    this.progressContainerTarget.classList.remove("hidden")
    this.progressBarTarget.style.width = `${percentage}%`
    this.progressTextTarget.textContent = text
  }
  
  async loadExtractedText() {
    // In real app, we would fetch the extracted text from the server
    // and update the text editor
    const event = new CustomEvent('ocr:completed', {
      detail: { jobId: this.jobIdValue }
    })
    window.dispatchEvent(event)
  }
}