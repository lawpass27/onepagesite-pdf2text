import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["dropzone", "fileInput", "progressContainer", "progressBar", "progressText"]
  static values = { apiConfigured: Boolean }
  
  connect() {
    this.uploadInProgress = false
  }
  
  handleDragOver(event) {
    event.preventDefault()
    this.dropzoneTarget.classList.add("border-blue-500", "bg-blue-50")
  }
  
  handleDragLeave(event) {
    event.preventDefault()
    this.dropzoneTarget.classList.remove("border-blue-500", "bg-blue-50")
  }
  
  handleDrop(event) {
    event.preventDefault()
    this.dropzoneTarget.classList.remove("border-blue-500", "bg-blue-50")
    
    const files = event.dataTransfer.files
    if (files.length > 0) {
      this.processFile(files[0])
    }
  }
  
  triggerFileInput(event) {
    event.preventDefault()
    event.stopPropagation()
    
    // Add ripple effect
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
    
    console.log("Triggering file input...")
    this.fileInputTarget.click()
  }
  
  handleFileSelect(event) {
    const files = event.target.files
    if (files.length > 0) {
      this.processFile(files[0])
    }
  }
  
  async processFile(file) {
    // In development, allow upload without API configuration (will use mock processor)
    if (!this.apiConfiguredValue && !window.location.hostname.includes('localhost')) {
      alert("먼저 Google Vision API를 설정해주세요")
      return
    }
    
    if (file.type !== 'application/pdf') {
      alert("PDF 파일만 업로드 가능합니다")
      return
    }
    
    if (file.size > 50 * 1024 * 1024) {
      alert("파일 크기는 50MB 이하여야 합니다")
      return
    }
    
    if (this.uploadInProgress) {
      alert("업로드가 진행 중입니다")
      return
    }
    
    this.uploadFile(file)
  }
  
  async uploadFile(file) {
    this.uploadInProgress = true
    this.showProgress(0, `${file.name} 업로드 중...`)
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/api/ocr_jobs', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          this.showProgress(percentCompleted, `${file.name} 업로드 중... ${percentCompleted}%`)
        }
      })
      
      const data = await response.json()
      console.log("Upload response:", data)
      
      if (data.success) {
        this.showProgress(100, "업로드 완료!")
        console.log("Upload successful, job ID:", data.job_id)
        
        // Reload page to show the uploaded PDF
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        throw new Error(data.message || 'Upload failed')
      }
    } catch (error) {
      alert(`업로드 실패: ${error.message}`)
      this.hideProgress()
    } finally {
      this.uploadInProgress = false
    }
  }
  
  showProgress(percentage, text) {
    this.progressContainerTarget.classList.remove("hidden")
    this.progressBarTarget.style.width = `${percentage}%`
    this.progressTextTarget.textContent = text
  }
  
  hideProgress() {
    this.progressContainerTarget.classList.add("hidden")
  }
  
  handleDragOver(event) {
    event.preventDefault()
    event.stopPropagation()
    this.dropzoneTarget.classList.add('bg-blue-50', 'border-blue-400')
  }
  
  handleDragLeave(event) {
    event.preventDefault()
    event.stopPropagation()
    this.dropzoneTarget.classList.remove('bg-blue-50', 'border-blue-400')
  }
  
  handleDrop(event) {
    event.preventDefault()
    event.stopPropagation()
    this.dropzoneTarget.classList.remove('bg-blue-50', 'border-blue-400')
    
    const files = event.dataTransfer.files
    if (files.length > 0) {
      this.processFile(files[0])
    }
  }
}